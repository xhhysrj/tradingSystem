package com.textbook.service;

import com.textbook.dao.UserDao;
import com.textbook.model.User;
import com.textbook.utils.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.data.redis.core.RedisTemplate;
import java.util.concurrent.TimeUnit;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.UpdateWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;

import com.textbook.dao.OrderDao;
import com.textbook.model.Order;
import org.springframework.transaction.annotation.Transactional;
/**
 * 用户服务层
 */
@Service
public class UserService {

    @Autowired
    private UserDao userDao;

    @Autowired
    private OrderDao orderDao;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    /**
     * 用户注册
     */
    public Map<String, Object> register(String studentId,
                                        String password,
                                        String name,
                                        String phone,
                                        String major,
                                        String grade) {
        Map<String, Object> result = new HashMap<>();

        // 检查学号是否已注册
        QueryWrapper<User> existWrapper = new QueryWrapper<>();
        existWrapper.eq("student_id", studentId);
        User existUser = userDao.selectOne(existWrapper);

        // 密码加密（BCrypt）
        String encodedPassword = passwordEncoder.encode(password);

        if (existUser != null) {
            // 已注册且通过审核
            if ("approved".equals(existUser.getApprovalStatus())) {
                result.put("success", false);
                result.put("message", "该学号已注册");
                return result;
            }
            // 之前审核被拒绝，复用原用户记录
            if ("rejected".equals(existUser.getApprovalStatus())) {
                existUser.setPassword(encodedPassword);
                existUser.setName(name);
                existUser.setPhone(phone);
                existUser.setMajor(major);
                existUser.setGrade(grade);
                existUser.setStatus("normal");
                existUser.setApprovalStatus("pending");
                existUser.setRejectionReason(null);

                int rows = userDao.updateById(existUser);
                if (rows > 0) {
                    result.put("success", true);
                    result.put("message", "重新提交审核成功");
                    result.put("userId", existUser.getId());
                } else {
                    result.put("success", false);
                    result.put("message", "重新提交审核失败");
                }
                return result;
            }

            // 已经存在且不是被拒绝（pending / approved）
            result.put("success", false);
            result.put("message", "该学号已提交申请，请等待审核");
            return result;
        }

        // 数据库中不存在该学号，新建用户
        User user = new User();
        user.setId(UUID.randomUUID().toString().replace("-", ""));
        user.setStudentId(studentId);
        user.setPassword(passwordEncoder.encode(password));
        user.setName(name);
        user.setPhone(phone);
        user.setMajor(major);
        user.setGrade(grade);
        user.setRole("student");
        user.setStatus("normal");
        user.setApprovalStatus("pending");

        int rows = userDao.insert(user);
        if (rows > 0) {
            result.put("success", true);
            result.put("message", "注册成功，请等待审核");
        } else {
            result.put("success", false);
            result.put("message", "注册失败");
        }

        return result;
    }

    /**
     * 用户登录
     */
    public Map<String, Object> login(String studentId, String password) {
        Map<String, Object> result = new HashMap<>();

        // 根据学号查询用户
        QueryWrapper<User> userWrapper = new QueryWrapper<>();
        userWrapper.eq("student_id", studentId);
        User user = userDao.selectOne(userWrapper);

        if (user == null) {
            result.put("success", false);
            result.put("message", "用户不存在");
            return result;
        }

        // 检查审核状态
        if (!"approved".equals(user.getApprovalStatus())) {
            result.put("success", false);
            result.put("message", "账号尚未通过审核");
            return result;
        }

        // 检查账号状态
        if (!"normal".equals(user.getStatus())) {
            result.put("success", false);
            result.put("message", "账号状态异常");
            return result;
        }

        String dbPassword = user.getPassword();

        boolean isBcrypt = dbPassword != null
                && (dbPassword.startsWith("$2a$") || dbPassword.startsWith("$2b$") || dbPassword.startsWith("$2y$"));

        if (isBcrypt) {
            if (!passwordEncoder.matches(password, dbPassword)) {
                result.put("success", false);
                result.put("message", "密码错误");
                return result;
            }
        }
        // 生成 token
        String token = jwtUtil.generateToken(user.getId(), user.getRole());

        result.put("success", true);
        result.put("message", "登录成功");
        result.put("token", token);
        result.put("user", user);
        return result;
    }

    /**
     * 获取用户信息
     */
    private Map<String, Object> getUserInfo(User user) {
        Map<String, Object> userInfo = new HashMap<>();
        userInfo.put("id", user.getId());
        userInfo.put("studentId", user.getStudentId());
        userInfo.put("name", user.getName());
        userInfo.put("phone", user.getPhone());
        userInfo.put("major", user.getMajor());
        userInfo.put("grade", user.getGrade());
        userInfo.put("role", user.getRole());
        userInfo.put("status", user.getStatus());
        userInfo.put("approvalStatus", user.getApprovalStatus());
        return userInfo;
    }

    /**
     * 获取用户详情
     */
    public User getUserById(String id) {
        return userDao.selectById(id);
    }
    /**
     * 根据学号获取用户
     */
    public User getUserByStudentId(String studentId) {
        QueryWrapper<User> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("student_id", studentId);
        return userDao.selectOne(queryWrapper);
    }

    /**
     * 获取待审核用户列表
     */
    public List<User> getPendingUsers() {
        QueryWrapper<User> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("approval_status", "pending");
        queryWrapper.orderByDesc("created_at");
        return userDao.selectList(queryWrapper);
    }

    /**
     * 审核用户
     */
    public boolean approveUser(String userId, boolean approved, String rejectionReason) {
        String approvalStatus = approved ? "approved" : "rejected";
        UpdateWrapper<User> updateWrapper = new UpdateWrapper<>();
        updateWrapper.eq("id", userId)
                .set("approval_status", approvalStatus)
                .set("rejection_reason", approved ? null : rejectionReason);

        int rows = userDao.update(null, updateWrapper);
        return rows > 0;
    }

    /**
     * 更新用户状态（冻结/解冻）
     */
    public boolean updateUserStatus(String userId, String status) {
        UpdateWrapper<User> updateWrapper = new UpdateWrapper<>();
        updateWrapper.eq("id", userId).set("status", status);
        int rows = userDao.update(null, updateWrapper);
        return rows > 0;
    }

    /**
     * 获取已审核通过的学生列表
     */
    public Map<String, Object> getApprovedStudentAccounts(String currentUserId, int page, int pageSize) {
        Map<String, Object> result = new HashMap<>();

        Page<User> pageObj = new Page<>(page, pageSize);
        QueryWrapper<User> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("role", "student")
                .eq("approval_status", "approved")
                .ne("id", currentUserId)
                .orderByDesc("created_at");

        IPage<User> userPage = userDao.selectPage(pageObj, queryWrapper);

        List<Map<String, Object>> safeList = new java.util.ArrayList<>();
        for (User u : userPage.getRecords()) {
            Map<String, Object> item = new HashMap<>();
            item.put("id", u.getId());
            item.put("name", u.getName());
            item.put("studentId", u.getStudentId());
            item.put("phone", u.getPhone());
            item.put("major", u.getMajor());
            item.put("grade", u.getGrade());
            item.put("role", u.getRole());
            item.put("status", u.getStatus());
            safeList.add(item);
        }

        result.put("list", safeList);
        result.put("total", userPage.getTotal());
        result.put("page", page);
        result.put("pageSize", pageSize);
        return result;
    }

    /**
     * 注销用户
     */
    @Transactional
    public boolean deleteUserByAdmin(String targetUserId) {
        User target = userDao.selectById(targetUserId);
        if (target == null) {
            return false;
        }

        // 仅允许注销学生账号
        if (!"student".equals(target.getRole())) {
            return false;
        }

        // 先删除与该用户关联的订单
        QueryWrapper<Order> orderWrapper = new QueryWrapper<>();
        orderWrapper.eq("buyer_id", targetUserId).or().eq("seller_id", targetUserId);
        orderDao.delete(orderWrapper);

        int rows = userDao.deleteById(targetUserId);
        return rows > 0;
    }

    /**
     * 获取用户列表（分页）
     */
    public Map<String, Object> getUserList(int page, int pageSize) {
        Page<User> pageObj = new Page<>(page, pageSize);
        QueryWrapper<User> queryWrapper = new QueryWrapper<>();
        queryWrapper.orderByDesc("created_at");

        IPage<User> userPage = userDao.selectPage(pageObj, queryWrapper);

        Map<String, Object> result = new HashMap<>();
        result.put("list", userPage.getRecords());
        result.put("total", userPage.getTotal());
        result.put("page", page);
        result.put("pageSize", pageSize);

        return result;
    }
}
