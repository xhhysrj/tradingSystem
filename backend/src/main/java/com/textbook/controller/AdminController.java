package com.textbook.controller;

import com.textbook.annotation.RequireAdmin;
import com.textbook.dto.Result;
import com.textbook.model.Textbook;
import com.textbook.model.User;
import com.textbook.service.LoginLogService;
import com.textbook.service.TextbookService;
import com.textbook.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.textbook.model.UserChangeRequestView;
import com.textbook.service.UserChangeRequestService;

import java.util.List;
import java.util.Map;

/**
 * 管理员控制器
 */
@RestController
@RequestMapping("/api/admin")
@RequireAdmin
public class AdminController {

    @Autowired
    private UserService userService;

    @Autowired
    private TextbookService textbookService;

    @Autowired
    private UserChangeRequestService userChangeRequestService;

    @Autowired
    private LoginLogService loginLogService;

    /**
     * 获取待审核用户列表
     */
    @GetMapping("/users/pending")
    public Result<?> getPendingUsers() {
        List<User> users = userService.getPendingUsers();
        return Result.success(users);
    }

    /**
     * 审核用户
     */
    @PostMapping("/users/approve")
    public Result<?> approveUser(@RequestBody Map<String, Object> params) {
        String userId = (String) params.get("userId");
        Boolean approved = (Boolean) params.get("approved");
        String rejectionReason = (String) params.get("rejectionReason");

        if (userId == null || approved == null) {
            return Result.error("参数不完整");
        }

        boolean success = userService.approveUser(userId, approved, rejectionReason);
        if (success) {
            return Result.success(approved ? "审核通过" : "已拒绝", null);
        } else {
            return Result.error("操作失败");
        }
    }

    /**
     * 获取待审核的用户信息变更申请列表
     */
    @GetMapping("/users/change/pending")
    public Result<?> getPendingUserChangeRequests() {
        List<UserChangeRequestView> list = userChangeRequestService.getPendingChangeRequests();
        return Result.success(list);
    }

    /**
     * 审核用户信息变更申请
     */
    @PostMapping("/users/change/review")
    public Result<?> reviewUserChangeRequest(@RequestBody Map<String, Object> request) {
        String requestId = (String) request.get("requestId");
        Boolean approved = (Boolean) request.get("approved");
        String rejectionReason = (String) request.get("rejectionReason");

        if (requestId == null || approved == null) {
            return Result.error("参数不完整");
        }

        boolean success = userChangeRequestService.reviewChangeRequest(requestId, approved, rejectionReason);
        if (success) {
            return Result.success(approved ? "审核通过" : "已拒绝", null);
        } else {
            return Result.error("操作失败");
        }
    }

    /**
     * 获取用户列表
     */
    @GetMapping("/users/list")
    public Result<?> getUserList(@RequestParam(defaultValue = "1") int page,
                                 @RequestParam(defaultValue = "10") int pageSize) {
        Map<String, Object> result = userService.getUserList(page, pageSize);
        return Result.success(result);
    }

    /**
     * 获取已审核通过的学生列表
     */
    @GetMapping("/users/students")
    public Result<?> getApprovedStudents(@RequestParam(defaultValue = "1") int page,
                                         @RequestParam(defaultValue = "10") int pageSize,
                                         @RequestAttribute("userId") String currentUserId) {
        Map<String, Object> result = userService.getApprovedStudentAccounts(currentUserId, page, pageSize);
        return Result.success(result);
    }

    /**
     * 冻结/解冻用户
     */
    @PostMapping("/users/status")
    public Result<?> updateUserStatus(@RequestBody Map<String, String> params) {
        String userId = params.get("userId");
        String status = params.get("status");

        if (userId == null || status == null) {
            return Result.error("参数不完整");
        }

        if (!"normal".equals(status) && !"frozen".equals(status)) {
            return Result.error("状态参数错误");
        }

        boolean success = userService.updateUserStatus(userId, status);
        if (success) {
            return Result.success("操作成功", null);
        } else {
            return Result.error("操作失败");
        }
    }

    /**
     * 注销用户
     */
    @DeleteMapping("/users/{id}")
    public Result<?> deleteUser(@PathVariable String id,
                                @RequestAttribute("userId") String currentUserId) {
        if (id == null) {
            return Result.error("参数不完整");
        }
        if (id.equals(currentUserId)) {
            return Result.error("不能注销自己");
        }

        boolean success = userService.deleteUserByAdmin(id);
        if (success) {
            return Result.success("注销成功", null);
        } else {
            return Result.error("注销失败");
        }
    }

    /**
     * 获取待审核教材列表
     */
    @GetMapping("/textbooks/pending")
    public Result<?> getPendingTextbooks() {
        List<Textbook> textbooks = textbookService.getPendingTextbooks();
        return Result.success(textbooks);
    }

    /**
     * 审核教材
     */
    @PostMapping("/textbooks/approve")
    public Result<?> approveTextbook(@RequestBody Map<String, Object> params) {
        String textbookId = (String) params.get("textbookId");
        Boolean approved = (Boolean) params.get("approved");
        String approvalReason = (String) params.get("approvalReason");

        if (textbookId == null || approved == null) {
            return Result.error("参数不完整");
        }

        boolean success = textbookService.approveTextbook(textbookId, approved, approvalReason);
        if (success) {
            return Result.success(approved ? "审核通过" : "已拒绝", null);
        } else {
            return Result.error("操作失败");
        }
    }

    /**
     * 管理员查询登录日志
     */
    @GetMapping("/logs/login")
    public Result<?> getLoginLogs(
            @RequestParam(required = false) String studentId,
            @RequestParam(required = false) String userName,
            @RequestParam(required = false) String loginStatus,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int pageSize
    ) {
        Map<String, Object> result = loginLogService.getLoginLogs(
                page, pageSize, studentId, userName, loginStatus, startDate, endDate
        );
        return Result.success(result);
    }

    /**
     * 管理员删除登录日志
     */
    @DeleteMapping("/logs/login/{id}")
    public Result<?> deleteLoginLog(@PathVariable String id) {
        boolean success = loginLogService.deleteLoginLog(id);
        if (success) {
            return Result.success("删除成功");
        }
        return Result.error(500, "删除失败");
    }

    /**
     * 批量删除登录日志
     */
    @PostMapping("/logs/login/batchDelete")
    public Result<?> batchDeleteLoginLogs(@RequestBody Map<String, Object> params) {
        Object idsObj = params.get("ids");
        if (!(idsObj instanceof List)) {
            return Result.error("参数格式错误");
        }

        @SuppressWarnings("unchecked")
        List<String> ids = (List<String>) idsObj;

        int rows = loginLogService.batchDeleteLoginLogs(ids);
        return Result.success("删除成功", rows);
    }
}