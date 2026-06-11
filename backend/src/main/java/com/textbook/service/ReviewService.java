package com.textbook.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.textbook.dao.OrderDao;
import com.textbook.dao.ReviewDao;
import com.textbook.dao.UserDao;
import com.textbook.model.Order;
import com.textbook.model.Review;
import com.textbook.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * 评价服务层
 */
@Service
public class ReviewService {

    @Autowired
    private ReviewDao reviewDao;

    @Autowired
    private OrderDao orderDao;

    @Autowired
    private UserDao userDao;

    /**
     * 创建评价
     */
    @Transactional
    public Map<String, Object> createReview(String orderId, String reviewerId, String revieweeId,
                                            String reviewType, Integer rating, String content, Boolean isAnonymous) {
        Map<String, Object> result = new HashMap<>();

        // 验证订单
        Order order = orderDao.selectById(orderId);
        if (order == null) {
            result.put("success", false);
            result.put("message", "订单不存在");
            return result;
        }

        // 验证订单是否完成
        if (!"completed".equals(order.getStatus())) {
            result.put("success", false);
            result.put("message", "订单未完成，无法评价");
            return result;
        }

        // 检查是否已评价
        if (hasReviewed(orderId, reviewerId, reviewType)) {
            result.put("success", false);
            result.put("message", "您已评价过此订单");
            return result;
        }

        // 创建评价
        Review review = new Review();
        review.setId(UUID.randomUUID().toString().replace("-", ""));
        review.setOrderId(orderId);

        String textbookId = order.getTextbookId();
        if (textbookId == null || textbookId.trim().isEmpty()) {
            result.put("success", false);
            result.put("message", "订单教材信息缺失，无法评价");
            return result;
        }
        review.setTextbookId(textbookId);

        User reviewer = userDao.selectById(reviewerId);
        User reviewee = userDao.selectById(revieweeId);
        if (reviewer == null || reviewee == null) {
            result.put("success", false);
            result.put("message", "用户信息不存在，无法评价");
            return result;
        }
        review.setReviewerName(reviewer.getName());
        review.setRevieweeName(reviewee.getName());

        review.setReviewerId(reviewerId);
        review.setRevieweeId(revieweeId);
        review.setReviewType(reviewType);
        review.setRating(rating);
        review.setContent(content);
        review.setIsAnonymous(isAnonymous != null ? isAnonymous : false);

        int rows = reviewDao.insert(review);
        if (rows > 0) {
            result.put("success", true);
            result.put("message", "评价成功");

            // 订单表不存储评价状态
        } else {
            result.put("success", false);
            result.put("message", "评价失败");
        }

        return result;
    }


    /**
     * 获取订单的评价列表
     */
    public List<Review> getOrderReviews(String orderId) {
        QueryWrapper<Review> wrapper = new QueryWrapper<>();
        wrapper.eq("order_id", orderId)
                .orderByDesc("created_at");
        return reviewDao.selectList(wrapper);
    }

    /**
     * 获取用户收到的评价列表
     */
    public List<Review> getUserReviews(String userId) {
        QueryWrapper<Review> wrapper = new QueryWrapper<>();
        wrapper.eq("reviewee_id", userId)
                .orderByDesc("created_at");
        return reviewDao.selectList(wrapper);
    }

    /**
     * 获取用户收到的评价列表
     */
    public List<Review> getUserReviewsWithLimit(String userId, int limit) {
        int pageSize = limit <= 0 ? 10 : limit;

        QueryWrapper<Review> wrapper = new QueryWrapper<>();
        wrapper.eq("reviewee_id", userId)
                .orderByDesc("created_at");

        Page<Review> page = new Page<>(1, pageSize);
        Page<Review> pageResult = reviewDao.selectPage(page, wrapper);
        return pageResult.getRecords();
    }

    /**
     * 获取用户的评价统计信息
     */
    public Map<String, Object> getUserReviewStats(String userId) {
        Map<String, Object> stats = new HashMap<>();

        // 平均评分
        QueryWrapper<Review> avgWrapper = new QueryWrapper<>();
        avgWrapper.select("AVG(rating)")
                .eq("reviewee_id", userId);
        List<Object> avgObjs = reviewDao.selectObjs(avgWrapper);

        Double avgRating = null;
        if (avgObjs != null && !avgObjs.isEmpty() && avgObjs.get(0) != null) {
            avgRating = Double.valueOf(avgObjs.get(0).toString());
        }

        // 评价数量
        QueryWrapper<Review> countWrapper = new QueryWrapper<>();
        countWrapper.eq("reviewee_id", userId);
        Long reviewCount = reviewDao.selectCount(countWrapper);

        stats.put("averageRating", avgRating != null ? Math.round(avgRating * 10) / 10.0 : 0.0);
        stats.put("reviewCount", reviewCount != null ? reviewCount : 0L);

        return stats;
    }

    /**
     * 检查用户是否已评价某订单
     */
    public boolean hasReviewed(String orderId, String reviewerId) {
        QueryWrapper<Review> wrapper = new QueryWrapper<>();
        wrapper.eq("order_id", orderId)
                .eq("reviewer_id", reviewerId);
        Long count = reviewDao.selectCount(wrapper);
        return count != null && count > 0;
    }

    /**
     * 检查用户是否已评价某订单，按评价类型区分
     */
    public boolean hasReviewed(String orderId, String reviewerId, String reviewType) {
        QueryWrapper<Review> wrapper = new QueryWrapper<>();
        wrapper.eq("order_id", orderId)
                .eq("reviewer_id", reviewerId)
                .eq("review_type", reviewType);
        Long count = reviewDao.selectCount(wrapper);
        return count != null && count > 0;
    }

    /**
     * 根据教材ID获取卖家的评价
     */
    public List<Review> getTextbookReviews(String textbookId) {
        QueryWrapper<Review> wrapper = new QueryWrapper<>();
        wrapper.eq("textbook_id", textbookId)
                .orderByDesc("created_at");
        return reviewDao.selectList(wrapper);
    }
}