package com.textbook.service;

import com.baomidou.mybatisplus.core.conditions.update.UpdateWrapper;
import com.textbook.dao.OrderDao;
import com.textbook.dao.OrderReminderDao;
import com.textbook.model.Order;
import com.textbook.model.OrderReminder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * 订单提醒服务层
 */
@Service
public class OrderReminderService {

    @Autowired
    private OrderDao orderDao;

    @Autowired
    private OrderReminderDao orderReminderDao;

    /**
     * 发送提醒
     */
    public Map<String, Object> sendReminder(String orderId, String senderId, String content) {
        Map<String, Object> result = new HashMap<>();

        Order order = orderDao.findById(orderId);
        if (order == null) {
            result.put("success", false);
            result.put("message", "订单不存在");
            return result;
        }

        // 只有待见面状态才允许提醒
        String status = order.getStatus();
        if (!"waiting_meeting".equals(status) && !"meeting".equals(status)) {
            result.put("success", false);
            result.put("message", "当前订单状态不允许发送提醒");
            return result;
        }

        // 确定接收者
        String receiverId;
        if (order.getBuyerId().equals(senderId)) {
            receiverId = order.getSellerId();
        } else if (order.getSellerId().equals(senderId)) {
            receiverId = order.getBuyerId();
        } else {
            result.put("success", false);
            result.put("message", "无权操作此订单");
            return result;
        }

        if (content == null || content.trim().isEmpty()) {
            StringBuilder sb = new StringBuilder();
            sb.append("订单见面提醒：");
            if (order.getMeetingTime() != null && !order.getMeetingTime().trim().isEmpty()) {
                sb.append("时间：").append(order.getMeetingTime()).append("；");
            }
            if (order.getMeetingLocation() != null && !order.getMeetingLocation().trim().isEmpty()) {
                sb.append("地点：").append(order.getMeetingLocation()).append("；");
            }
            sb.append("请及时联系并按约定完成交易。");
            content = sb.toString();
        }

        OrderReminder reminder = new OrderReminder();
        reminder.setId(UUID.randomUUID().toString().replace("-", ""));
        reminder.setOrderId(orderId);
        reminder.setSenderId(senderId);
        reminder.setReceiverId(receiverId);
        reminder.setContent(content);
        reminder.setIsRead(false);

        int rows = orderReminderDao.insert(reminder);
        if (rows > 0) {
            result.put("success", true);
            result.put("message", "发送成功");
        } else {
            result.put("success", false);
            result.put("message", "发送失败");
        }

        return result;
    }

    /**
     * 获取未读提醒
     */
    public List<OrderReminder> getUnreadReminders(String receiverId) {
        return orderReminderDao.findUnreadByReceiverId(receiverId);
    }

    /**
     * 标记已读
     */
    public int markRead(String receiverId, List<String> ids) {
        if (receiverId == null || receiverId.trim().isEmpty()) {
            return 0;
        }
        if (ids == null || ids.isEmpty()) {
            return 0;
        }

        UpdateWrapper<OrderReminder> wrapper = new UpdateWrapper<>();
        wrapper.eq("receiver_id", receiverId)
                .in("id", ids)
                .set("is_read", 1);

        return orderReminderDao.update(null, wrapper);
    }
}