package com.textbook.controller;

import com.textbook.dto.Result;
import com.textbook.model.UserChangeRequest;
import com.textbook.service.UserChangeRequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 用户相关控制器（学生端）
 */
@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserChangeRequestService userChangeRequestService;

    /**
     * 学生提交信息变更申请
     */
    @PostMapping("/change-request")
    public Result<?> submitChangeRequest(@RequestAttribute("userId") String userId,
                                         @RequestBody Map<String, String> request) {
        String phone = request.get("phone");
        String major = request.get("major");
        String grade = request.get("grade");
        String newPassword = request.get("newPassword");
        String confirmPassword = request.get("confirmPassword");

        Map<String, Object> result = userChangeRequestService.submitChangeRequest(
                userId, phone, major, grade, newPassword, confirmPassword
        );

        if ((boolean) result.get("success")) {
            return Result.success((String) result.get("message"), null);
        } else {
            return Result.error((String) result.get("message"));
        }
    }

    /**
     * 获取我的最新一条变更申请
     */
    @GetMapping("/change-request/latest")
    public Result<UserChangeRequest> getMyLatestRequest(@RequestAttribute("userId") String userId) {
        UserChangeRequest request = userChangeRequestService.getMyLatestRequest(userId);
        return Result.success(request);
    }
}