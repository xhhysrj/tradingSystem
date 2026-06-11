package com.textbook.service;

import com.textbook.dao.LoginLogDao;
import com.textbook.model.LoginLog;
import com.textbook.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;

import java.util.*;

/**
 * 登录日志服务层
 */
@Service
public class LoginLogService {

    @Autowired
    private LoginLogDao loginLogDao;

    /**
     * 定期清理一个月以前的登录日志
     */
    @Scheduled(cron = "0 0 2 * * ?")
    public void cleanOldLoginLogs() {
        Calendar cal = Calendar.getInstance();
        cal.add(Calendar.MONTH, -1);
        Date oneMonthAgo = cal.getTime();
        loginLogDao.deleteOlderThan(oneMonthAgo);
    }

    /**
     * 记录登录日志
     */
    public void recordLoginLog(User user, String loginIp, String userAgent,
                               boolean success, String failureReason) {
        // 如果用户不存在且登录失败，不记录日志（避免被恶意扫描学号）
        if (user == null && !success) {
            return;
        }

        // 如果用户不存在但登录成功（理论上不应该发生），也不记录
        if (user == null) {
            return;
        }

        LoginLog loginLog = new LoginLog();
        loginLog.setId(UUID.randomUUID().toString().replace("-", ""));
        loginLog.setUserId(user.getId());
        loginLog.setStudentId(user.getStudentId());
        loginLog.setUserName(user.getName());
        loginLog.setUserRole(user.getRole());
        loginLog.setLoginIp(loginIp);
        loginLog.setLoginTime(new Date());
        loginLog.setUserAgent(userAgent);
        loginLog.setLoginStatus(success ? "success" : "failed");
        loginLog.setFailureReason(failureReason);

        loginLogDao.insert(loginLog);
    }

    /**
     * 查询登录日志（分页）
     */
    public Map<String, Object> getLoginLogs(
            int page, int pageSize,
            String studentId,
            String userName,
            String loginStatus,
            String startDate,
            String endDate
    ) {
        QueryWrapper<LoginLog> queryWrapper = new QueryWrapper<>();

        if (studentId != null && !studentId.trim().isEmpty()) {
            queryWrapper.like("student_id", studentId.trim());
        }
        if (userName != null && !userName.trim().isEmpty()) {
            queryWrapper.like("user_name", userName.trim());
        }
        if (loginStatus != null && !loginStatus.trim().isEmpty()) {
            queryWrapper.eq("login_status", loginStatus.trim());
        }
        if (startDate != null && !startDate.trim().isEmpty()) {
            queryWrapper.ge("login_time", startDate.trim());
        }
        if (endDate != null && !endDate.trim().isEmpty()) {
            queryWrapper.le("login_time", endDate.trim());
        }

        queryWrapper.orderByDesc("login_time");

        Page<LoginLog> pageObj = new Page<>(page, pageSize);
        IPage<LoginLog> logPage = loginLogDao.selectPage(pageObj, queryWrapper);

        Map<String, Object> result = new HashMap<>();
        result.put("list", logPage.getRecords());
        result.put("total", logPage.getTotal());
        result.put("page", page);
        result.put("pageSize", pageSize);

        return result;
    }

    /**
     * 根据用户ID查询登录日志
     */
    public List<LoginLog> getUserLoginLogs(String userId, int limit) {
        return loginLogDao.findByUserId(userId, limit);
    }

    /**
     * 删除单条日志
     */
    public boolean deleteLoginLog(String id) {
        int rows = loginLogDao.deleteById(id);
        return rows > 0;
    }

    /**
     * 批量删除日志
     */
    public int batchDeleteLoginLogs(List<String> ids) {
        return loginLogDao.deleteByIds(ids);
    }
}
