package com.textbook.service;

import com.textbook.dao.OrderDao;
import com.textbook.dao.TextbookDao;
import com.textbook.dao.UserDao;
import com.textbook.model.Order;
import com.textbook.model.Textbook;
import com.textbook.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.data.redis.core.RedisTemplate;


import org.springframework.transaction.annotation.Transactional;
import org.springframework.scheduling.annotation.Scheduled;

import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

/**
 * 订单服务层
 */
@Service
public class OrderService {

    @Autowired
    private OrderDao orderDao;

    @Autowired
    private TextbookDao textbookDao;

    @Autowired
    private UserDao userDao;

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    /**
     * 发起交易（创建订单）
     */
    @Transactional
    public Map<String, Object> createOrder(String buyerId, String textbookId,
                                           String meetingTime, String meetingLocation,
                                           String contactPhone) {
        Map<String, Object> result = new HashMap<>();
        // 分布式锁，避免同一教材重复下单
        String lockKey = "ORDER_LOCK:" + textbookId;
        Boolean acquired = redisTemplate.opsForValue()
                .setIfAbsent(lockKey, "locked", 10, TimeUnit.SECONDS);
        if (Boolean.FALSE.equals(acquired)) {
            // 获取锁失败，已有并发的下单操作
            result.put("success", false);
            result.put("message", "该教材正在处理中，请勿重复下单");
            return result;
        }
        try {
            // 开始下单
            // 禁止管理员发起交易
            User buyer = userDao.selectById(buyerId);
            if (buyer == null) {
                result.put("success", false);
                result.put("message", "买家信息不存在");
                return result;
            }

            if ("admin".equals(buyer.getRole())) {
                result.put("success", false);
                result.put("message", "管理员暂时无法发起交易");
                return result;
            }
            // 检查教材是否存在
            Textbook textbook = textbookDao.findById(textbookId);
            if (textbook == null) {
                result.put("success", false);
                result.put("message", "教材不存在");
                return result;
            }
            // 检查教材状态
            if (!"approved".equals(textbook.getStatus())) {
                result.put("success", false);
                result.put("message", "该教材暂不可购买");
                return result;
            }
            // 检查是否是自己的教材
            if (textbook.getSellerId().equals(buyerId)) {
                result.put("success", false);
                result.put("message", "不能购买自己的教材");
                return result;
            }
            // 检查是否已有待处理的订单
            if (orderDao.hasPendingOrder(textbookId)) {
                result.put("success", false);
                result.put("message", "该教材已有其他买家正在交易中");
                return result;
            }
            // 买家信息为空
            if (buyer == null) {
                result.put("success", false);
                result.put("message", "买家信息不存在");
                return result;
            }

            // 获取卖家信息
            String sellerId = textbook.getSellerId();
            User seller = userDao.selectById(sellerId);

            if (seller == null) {
                result.put("success", false);
                result.put("message", "卖家信息不存在");
                return result;
            }

            // 创建订单对象并保存数据库
            Order order = new Order();
            order.setId(UUID.randomUUID().toString().replace("-", ""));
            order.setTextbookId(textbookId);
            order.setTextbookTitle(textbook.getTitle());
            order.setBuyerId(buyerId);
            order.setBuyerName(buyer.getName());
            order.setBuyerPhone(contactPhone); // 使用买家填写的联系电话
            order.setBuyerMajor(buyer.getMajor());
            order.setBuyerGrade(buyer.getGrade());
            order.setSellerId(textbook.getSellerId());
            order.setSellerName(textbook.getSellerName());
            order.setSellerPhone(seller.getPhone());
            order.setSellerMajor(textbook.getSellerMajor());
            order.setSellerGrade(textbook.getSellerGrade());
            order.setPrice(textbook.getPrice());
            order.setMeetingTime(meetingTime);
            order.setMeetingLocation(meetingLocation);
            order.setStatus("waiting_seller_confirm");


            int rows = orderDao.insert(order);
            if (rows > 0) {
                result.put("success", true);
                result.put("message", "交易申请已发送");
                result.put("orderId", order.getId());
            } else {
                result.put("success", false);
                result.put("message", "创建订单失败");
            }
        } finally {
            // 释放分布式锁
            redisTemplate.delete(lockKey);
        }
        return result;
    }

    /**
     * 卖家确认订单
     */
    @Transactional
    public Map<String, Object> confirmOrder(String orderId, String sellerId, boolean accept, String rejectReason) {
        Map<String, Object> result = new HashMap<>();

        // 查询订单
        Order order = orderDao.findById(orderId);
        if (order == null) {
            result.put("success", false);
            result.put("message", "订单不存在");
            return result;
        }

        // 验证卖家身份
        if (!order.getSellerId().equals(sellerId)) {
            result.put("success", false);
            result.put("message", "无权操作此订单");
            return result;
        }

        // 检查订单状态
        if (!"waiting_seller_confirm".equals(order.getStatus())) {
            result.put("success", false);
            result.put("message", "订单状态不正确");
            return result;
        }

        // 更新订单状态
        String newStatus = accept ? "waiting_meeting" : "cancelled";
        int rows = orderDao.updateStatus(orderId, newStatus, rejectReason);

        if (rows > 0) {
            result.put("success", true);
            result.put("message", accept ? "已同意交易" : "已拒绝交易");
        } else {
            result.put("success", false);
            result.put("message", "操作失败");
        }

        return result;
    }

    /**
     * 确认收货（完成订单）
     */
    @Transactional
    public Map<String, Object> completeOrder(String orderId, String buyerId) {
        Map<String, Object> result = new HashMap<>();

        // 查询订单
        Order order = orderDao.findById(orderId);
        if (order == null) {
            result.put("success", false);
            result.put("message", "订单不存在");
            return result;
        }

        // 验证买家身份
        if (!order.getBuyerId().equals(buyerId)) {
            result.put("success", false);
            result.put("message", "无权操作此订单");
            return result;
        }

        // 检查订单状态
        if (!"waiting_meeting".equals(order.getStatus())) {
            result.put("success", false);
            result.put("message", "订单状态不正确");
            return result;
        }

        // 更新订单状态
        int rows = orderDao.updateStatus(orderId, "completed", null);

        // 更新教材状态为已售出
        if (rows > 0) {
            textbookDao.updateStatusToSold(order.getTextbookId());
            result.put("success", true);
            result.put("message", "交易已完成");
        } else {
            result.put("success", false);
            result.put("message", "操作失败");
        }

        return result;
    }

    /**
     * 取消订单
     */
    @Transactional
    public Map<String, Object> cancelOrder(String orderId, String userId, String cancelReason) {
        Map<String, Object> result = new HashMap<>();

        // 查询订单
        Order order = orderDao.findById(orderId);
        if (order == null) {
            result.put("success", false);
            result.put("message", "订单不存在");
            return result;
        }

        // 验证用户身份（买家或卖家都可以取消）
        if (!order.getBuyerId().equals(userId) && !order.getSellerId().equals(userId)) {
            result.put("success", false);
            result.put("message", "无权操作此订单");
            return result;
        }

        // 检查订单状态（已完成的订单不能取消）
        if ("completed".equals(order.getStatus()) || "cancelled".equals(order.getStatus())) {
            result.put("success", false);
            result.put("message", "订单已完成或已取消，无法操作");
            return result;
        }

        // 更新订单状态
        int rows = orderDao.updateStatus(orderId, "cancelled", cancelReason);

        if (rows > 0) {
            result.put("success", true);
            result.put("message", "订单已取消");
        } else {
            result.put("success", false);
            result.put("message", "操作失败");
        }

        return result;
    }

    /**
     * 删除订单（软删除：买家、卖家各自删除自己的；两边都删了再物理删除）
     */
    @Transactional
    public Map<String, Object> deleteOrder(String orderId, String userId) {
        Map<String, Object> result = new HashMap<>();

        Order order = orderDao.findById(orderId);
        if (order == null) {
            result.put("success", false);
            result.put("message", "订单不存在");
            return result;
        }

        boolean isBuyer = userId.equals(order.getBuyerId());
        boolean isSeller = userId.equals(order.getSellerId());
        if (!isBuyer && !isSeller) {
            result.put("success", false);
            result.put("message", "无权操作此订单");
            return result;
        }

        // 只允许删除已完成/已取消订单
        if (!"completed".equals(order.getStatus()) && !"cancelled".equals(order.getStatus())) {
            result.put("success", false);
            result.put("message", "当前订单状态不允许删除");
            return result;
        }

        int rows = isBuyer ? orderDao.markBuyerDeleted(orderId) : orderDao.markSellerDeleted(orderId);
        if (rows <= 0) {
            result.put("success", false);
            result.put("message", "删除失败");
            return result;
        }

        // 如果两边都删除了，则物理删除
        Order updated = orderDao.findById(orderId);
        if (updated != null
                && Boolean.TRUE.equals(updated.getBuyerDeleted())
                && Boolean.TRUE.equals(updated.getSellerDeleted())) {
            orderDao.deleteById(orderId);
        }

        result.put("success", true);
        result.put("message", "删除成功");
        return result;
    }


    /**
     * 获取买家订单列表
     */
    public List<Order> getBuyerOrders(String buyerId) {
        return orderDao.findByBuyerId(buyerId);
    }

    /**
     * 获取卖家订单列表
     */
    public List<Order> getSellerOrders(String sellerId) {
        return orderDao.findBySellerId(sellerId);
    }

    /**
     * 根据状态获取买家订单
     */
    public List<Order> getBuyerOrdersByStatus(String buyerId, String status) {
        if (status == null || status.equals("all")) {
            return orderDao.findByBuyerId(buyerId);
        }
        return orderDao.findByBuyerIdAndStatus(buyerId, status);
    }

    /**
     * 根据状态获取卖家订单
     */
    public List<Order> getSellerOrdersByStatus(String sellerId, String status) {
        if (status == null || status.equals("all")) {
            return orderDao.findBySellerId(sellerId);
        }
        return orderDao.findBySellerIdAndStatus(sellerId, status);
    }

    /**
     * 获取订单详情
     */
    public Order getOrderById(String orderId) {
        return orderDao.findById(orderId);
    }

    /**
     * 定期清理三年前的订单记录
     */
    @Scheduled(cron = "0 0 2 * * ?")
    public void cleanOldOrders() {
        Calendar cal = Calendar.getInstance();
        cal.add(Calendar.YEAR, -3);
        Date threeYearsAgo = cal.getTime();
        orderDao.deleteOlderThan(threeYearsAgo);
    }

}
