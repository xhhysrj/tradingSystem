package com.textbook.controller;

import com.textbook.dto.Result;
import com.textbook.model.User;
import com.textbook.service.LoginLogService;
import com.textbook.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.util.Map;

/**
 * 认证控制器
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private LoginLogService loginLogService;

    /**
     * 用户注册
     */
    @PostMapping("/register")
    public Result<?> register(@RequestBody Map<String, String> params) {
        String studentId = params.get("studentId");
        String password = params.get("password");
        String name = params.get("name");
        String phone = params.get("phone");
        String major = params.get("major");
        String grade = params.get("grade");

        // 参数验证
        if (studentId == null || password == null || name == null || phone == null || major == null || grade == null) {
            return Result.error("参数不完整");
        }

        Map<String, Object> result = userService.register(studentId, password, name, phone, major, grade);
        if ((boolean) result.get("success")) {
            return Result.success((String) result.get("message"), null);
        } else {
            return Result.error((String) result.get("message"));
        }
    }

    /**
     * 用户登录
     */
    @PostMapping("/login")
    public Result<?> login(@RequestBody Map<String, String> params, HttpServletRequest request) {
        String studentId = params.get("studentId");
        String password = params.get("password");

        // 参数验证
        if (studentId == null || password == null) {
            return Result.error("学号和密码不能为空");
        }

        String loginIp = getClientIp(request);
        String userAgent = request.getHeader("User-Agent");

        // 先获取用户信息（用于日志记录）
        User user = userService.getUserByStudentId(studentId);

        Map<String, Object> result = userService.login(studentId, password);

        if ((boolean) result.get("success")) {
            // 记录成功的登录日志
            loginLogService.recordLoginLog(user, loginIp, userAgent, true, null);
            return Result.success(result);
        } else {
            String failureReason = (String) result.get("message");
            // 记录失败的登录日志（如果用户存在的话）
            loginLogService.recordLoginLog(user, loginIp, userAgent, false, failureReason);
            return Result.error(failureReason);
        }
    }

    /**
     * 获取客户端真实IP地址
     */
    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        // 处理多个IP的情况（取第一个）
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        return ip;
    }

    /**
     * 获取当前用户信息
     */
    @GetMapping("/current")
    public Result<?> getCurrentUser(@RequestAttribute("userId") String userId) {
        return Result.success(userService.getUserById(userId));
    }
}
