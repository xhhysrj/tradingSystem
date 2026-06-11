package com.textbook.service;

import com.textbook.dao.UserChangeRequestDao;
import com.textbook.dao.UserDao;
import com.textbook.model.User;
import com.textbook.model.UserChangeRequest;
import com.textbook.model.UserChangeRequestView;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.UpdateWrapper;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * 用户信息变更申请服务层
 */
@Service
public class UserChangeRequestService {

    @Autowired
    private UserChangeRequestDao userChangeRequestDao;

    @Autowired
    private UserDao userDao;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * 学生提交信息变更申请
     */
    public Map<String, Object> submitChangeRequest(String userId,
                                                   String phone,
                                                   String major,
                                                   String grade,
                                                   String newPassword,
                                                   String confirmPassword) {
        Map<String, Object> result = new HashMap<>();

        User user = userDao.selectById(userId);
        if (user == null) {
            result.put("success", false);
            result.put("message", "用户不存在");
            return result;
        }

        String encodedPassword = null;
        if (newPassword != null && !newPassword.trim().isEmpty()) {
            if (confirmPassword == null || !newPassword.equals(confirmPassword)) {
                result.put("success", false);
                result.put("message", "两次输入的密码不一致");
                return result;
            }
            encodedPassword = passwordEncoder.encode(newPassword);
        }

        String newPhone = (phone != null && !phone.trim().isEmpty() && !phone.equals(user.getPhone())) ? phone : null;
        String newMajor = (major != null && !major.trim().isEmpty() && !major.equals(user.getMajor())) ? major : null;
        String newGrade = (grade != null && !grade.trim().isEmpty() && !grade.equals(user.getGrade())) ? grade : null;

        if (newPhone == null && newMajor == null && newGrade == null && encodedPassword == null) {
            result.put("success", false);
            result.put("message", "没有任何需要修改的内容");
            return result;
        }

        // 覆盖更新
        QueryWrapper<UserChangeRequest> latestWrapper = new QueryWrapper<>();
        latestWrapper.eq("user_id", userId)
                .orderByDesc("created_at")
                .last("LIMIT 1");
        UserChangeRequest latest = userChangeRequestDao.selectOne(latestWrapper);

        if (latest != null && "pending".equals(latest.getStatus())) {
            latest.setPhone(newPhone);
            latest.setMajor(newMajor);
            latest.setGrade(newGrade);
            latest.setPassword(encodedPassword);
            latest.setStatus("pending");
            latest.setRejectionReason(null);

            int rows = userChangeRequestDao.updateById(latest);
            if (rows > 0) {
                result.put("success", true);
                result.put("message", "变更申请已更新，请等待管理员审核");
            } else {
                result.put("success", false);
                result.put("message", "提交失败，请稍后再试");
            }
            return result;
        }

        UserChangeRequest request = new UserChangeRequest();
        request.setId(UUID.randomUUID().toString().replace("-", ""));
        request.setUserId(userId);
        request.setPhone(newPhone);
        request.setMajor(newMajor);
        request.setGrade(newGrade);
        request.setPassword(encodedPassword);
        request.setStatus("pending");
        request.setRejectionReason(null);

        int rows = userChangeRequestDao.insert(request);
        if (rows > 0) {
            result.put("success", true);
            result.put("message", "变更申请已提交，请等待管理员审核");
        } else {
            result.put("success", false);
            result.put("message", "提交失败，请稍后再试");
        }

        return result;
    }

    /**
     * 获取最新一条变更申请
     */
    public UserChangeRequest getMyLatestRequest(String userId) {
        QueryWrapper<UserChangeRequest> latestWrapper = new QueryWrapper<>();
        latestWrapper.eq("user_id", userId)
                .orderByDesc("created_at")
                .last("LIMIT 1");
        UserChangeRequest latest = userChangeRequestDao.selectOne(latestWrapper);

        if (latest != null) {
            latest.setPassword(null);
        }
        return latest;
    }

    /**
     * 管理员：获取待审核的变更申请列表
     */
    public List<UserChangeRequestView> getPendingChangeRequests() {
        return userChangeRequestDao.findPendingViews();
    }

    /**
     * 管理员：审核变更申请
     */
    @Transactional
    public boolean reviewChangeRequest(String requestId, boolean approved, String rejectionReason) {
        UserChangeRequest request = userChangeRequestDao.selectById(requestId);
        if (request == null) {
            return false;
        }

        // 只处理待审核
        if (!"pending".equals(request.getStatus())) {
            return false;
        }

        if (approved) {
            UpdateWrapper<User> updateWrapper = new UpdateWrapper<>();
            updateWrapper.eq("id", request.getUserId());

            boolean hasUpdate = false;

            if (request.getPhone() != null && !request.getPhone().trim().isEmpty()) {
                updateWrapper.set("phone", request.getPhone());
                hasUpdate = true;
            }

            if (request.getMajor() != null && !request.getMajor().trim().isEmpty()) {
                updateWrapper.set("major", request.getMajor());
                hasUpdate = true;
            }

            if (request.getGrade() != null && !request.getGrade().trim().isEmpty()) {
                updateWrapper.set("grade", request.getGrade());
                hasUpdate = true;
            }

            if (request.getPassword() != null && !request.getPassword().trim().isEmpty()) {
                updateWrapper.set("password", request.getPassword());
                hasUpdate = true;
            }

            int rowsUser = hasUpdate ? userDao.update(null, updateWrapper) : 1;
            if (rowsUser == 0) {
                return false;
            }

            // 更新申请状态
            UpdateWrapper<UserChangeRequest> reqWrapper = new UpdateWrapper<>();
            reqWrapper.eq("id", requestId)
                    .set("status", "approved")
                    .set("rejection_reason", null);
            int rowsReq = userChangeRequestDao.update(null, reqWrapper);
            return rowsReq > 0;
        } else {
            String reason = (rejectionReason == null || rejectionReason.trim().isEmpty())
                    ? "未通过审核"
                    : rejectionReason.trim();

            UpdateWrapper<UserChangeRequest> reqWrapper = new UpdateWrapper<>();
            reqWrapper.eq("id", requestId)
                    .set("status", "rejected")
                    .set("rejection_reason", reason);
            int rowsReq = userChangeRequestDao.update(null, reqWrapper);
            return rowsReq > 0;
        }
    }
}