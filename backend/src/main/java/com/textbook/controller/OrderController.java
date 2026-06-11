package com.textbook.controller;

import com.textbook.dto.Result;
import com.textbook.model.Order;
import com.textbook.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 订单控制器
 */
@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;
    @Autowired
    private com.textbook.service.OrderReminderService orderReminderService;

    /**
     * 发起交易（创建订单）
     */
    @PostMapping("/create")
    public Result<?> createOrder(@RequestBody Map<String, String> params,
                                 @RequestAttribute("userId") String userId) {
        String textbookId = params.get("textbookId");
        String meetingTime = params.get("meetingTime");
        String meetingLocation = params.get("meetingLocation");
        String contactPhone = params.get("contactPhone");

        if (textbookId == null || meetingTime == null || meetingLocation == null || contactPhone == null) {
            return Result.error("参数不完整");
        }

        Map<String, Object> result = orderService.createOrder(userId, textbookId, meetingTime, meetingLocation, contactPhone);
        if ((boolean) result.get("success")) {
            return Result.success(result);
        } else {
            return Result.error((String) result.get("message"));
        }
    }

    /**
     * 卖家确认订单
     */
    @PostMapping("/confirm")
    public Result<?> confirmOrder(@RequestBody Map<String, Object> params,
                                  @RequestAttribute("userId") String userId) {
        String orderId = (String) params.get("orderId");
        Boolean accept = (Boolean) params.get("accept");
        String rejectReason = (String) params.get("rejectReason");

        if (orderId == null || accept == null) {
            return Result.error("参数不完整");
        }

        Map<String, Object> result = orderService.confirmOrder(orderId, userId, accept, rejectReason);
        if ((boolean) result.get("success")) {
            return Result.success((String) result.get("message"), null);
        } else {
            return Result.error((String) result.get("message"));
        }
    }

    /**
     * 确认收货（完成订单）
     */
    @PostMapping("/complete")
    public Result<?> completeOrder(@RequestBody Map<String, String> params,
                                   @RequestAttribute("userId") String userId) {
        String orderId = params.get("orderId");

        if (orderId == null) {
            return Result.error("订单ID不能为空");
        }

        Map<String, Object> result = orderService.completeOrder(orderId, userId);
        if ((boolean) result.get("success")) {
            return Result.success((String) result.get("message"), null);
        } else {
            return Result.error((String) result.get("message"));
        }
    }

    /**
     * 取消订单
     */
    @PostMapping("/cancel")
    public Result<?> cancelOrder(@RequestBody Map<String, String> params,
                                 @RequestAttribute("userId") String userId) {
        String orderId = params.get("orderId");
        String cancelReason = params.get("cancelReason");

        if (orderId == null) {
            return Result.error("订单ID不能为空");
        }

        Map<String, Object> result = orderService.cancelOrder(orderId, userId, cancelReason);
        if ((boolean) result.get("success")) {
            return Result.success((String) result.get("message"), null);
        } else {
            return Result.error((String) result.get("message"));
        }
    }

    /**
     * 获取买家订单列表
     */
    @GetMapping("/buyer")
    public Result<?> getBuyerOrders(@RequestAttribute("userId") String userId,
                                    @RequestParam(required = false) String status) {
        List<Order> orders = orderService.getBuyerOrdersByStatus(userId, status);
        return Result.success(orders);
    }

    /**
     * 获取卖家订单列表
     */
    @GetMapping("/seller")
    public Result<?> getSellerOrders(@RequestAttribute("userId") String userId,
                                     @RequestParam(required = false) String status) {
        List<Order> orders = orderService.getSellerOrdersByStatus(userId, status);
        return Result.success(orders);
    }

    /**
     * 获取订单详情
     */
    @GetMapping("/{id}")
    public Result<?> getOrderDetail(@PathVariable String id) {
        Order order = orderService.getOrderById(id);
        if (order == null) {
            return Result.error("订单不存在");
        }
        return Result.success(order);
    }

    /**
     * 删除订单
     */
    @DeleteMapping("/{id}")
    public Result<?> deleteOrder(@PathVariable String id,
                                 @RequestAttribute("userId") String userId) {
        Map<String, Object> result = orderService.deleteOrder(id, userId);
        if ((boolean) result.get("success")) {
            return Result.success((String) result.get("message"), null);
        } else {
            return Result.error((String) result.get("message"));
        }
    }

    /**
     * 发送订单提醒
     */
    @PostMapping("/reminders/send")
    public Result<?> sendReminder(@RequestBody Map<String, String> params,
                                  @RequestAttribute("userId") String userId) {
        String orderId = params.get("orderId");
        String content = params.get("content");

        if (orderId == null) {
            return Result.error("订单ID不能为空");
        }

        Map<String, Object> result = orderReminderService.sendReminder(orderId, userId, content);
        if ((boolean) result.get("success")) {
            return Result.success((String) result.get("message"), null);
        } else {
            return Result.error((String) result.get("message"));
        }
    }

    /**
     * 获取当前用户未读提醒
     */
    @GetMapping("/reminders/unread")
    public Result<?> getUnreadReminders(@RequestAttribute("userId") String userId) {
        return Result.success(orderReminderService.getUnreadReminders(userId));
    }

    /**
     * 标记提醒已读
     */
    @PostMapping("/reminders/read")
    public Result<?> markRemindersRead(@RequestBody Map<String, Object> params,
                                       @RequestAttribute("userId") String userId) {
        Object idsObj = params.get("ids");
        if (!(idsObj instanceof List)) {
            return Result.error("参数格式错误");
        }

        @SuppressWarnings("unchecked")
        List<String> ids = (List<String>) idsObj;

        int rows = orderReminderService.markRead(userId, ids);
        return Result.success("已标记为已读", rows);
    }
}
