package com.textbook.controller;

import com.textbook.dto.Result;
import com.textbook.model.Review;
import com.textbook.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 评价控制器
 */
@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    /**
     * 创建评价
     */
    @PostMapping("/create")
    public Result<?> createReview(@RequestBody Map<String, Object> params,
                                  @RequestAttribute("userId") String userId) {
        String orderId = (String) params.get("orderId");
        String revieweeId = (String) params.get("revieweeId");
        String reviewType = (String) params.get("reviewType");
        Integer rating = (Integer) params.get("rating");
        String content = (String) params.get("content");
        Boolean isAnonymous = (Boolean) params.get("isAnonymous");

        if (orderId == null || revieweeId == null || reviewType == null || rating == null) {
            return Result.error("参数不完整");
        }

        Map<String, Object> result = reviewService.createReview(
                orderId, userId, revieweeId, reviewType, rating, content, isAnonymous);

        if ((boolean) result.get("success")) {
            return Result.success((String) result.get("message"), result);
        } else {
            return Result.error((String) result.get("message"));
        }
    }

    /**
     * 获取订单的评价列表
     */
    @GetMapping("/order/{orderId}")
    public Result<List<Review>> getOrderReviews(@PathVariable String orderId) {
        List<Review> reviews = reviewService.getOrderReviews(orderId);
        return Result.success("获取成功", reviews);
    }

    /**
     * 获取用户收到的评价列表
     */
    @GetMapping("/user/{userId}")
    public Result<List<Review>> getUserReviews(@PathVariable String userId,
                                                @RequestParam(required = false) Integer limit) {
        List<Review> reviews;
        if (limit != null && limit > 0) {
            reviews = reviewService.getUserReviewsWithLimit(userId, limit);
        } else {
            reviews = reviewService.getUserReviews(userId);
        }
        return Result.success("获取成功", reviews);
    }

    /**
     * 获取用户的评价统计信息
     */
    @GetMapping("/user/{userId}/stats")
    public Result<Map<String, Object>> getUserReviewStats(@PathVariable String userId) {
        Map<String, Object> stats = reviewService.getUserReviewStats(userId);
        return Result.success("获取成功", stats);
    }

    /**
     * 检查用户是否已评价某订单
     */
    @GetMapping("/check")
    public Result<Boolean> hasReviewed(@RequestParam String orderId,
                                       @RequestAttribute("userId") String userId) {
        if (orderId == null) {
            return Result.error("订单ID不能为空");
        }
        boolean hasReviewed = reviewService.hasReviewed(orderId, userId);
        return Result.success("查询成功", hasReviewed);
    }

    /**
     * 根据教材ID获取卖家的评价（用于教材详情页展示）
     */
    @GetMapping("/textbook/{textbookId}")
    public Result<List<Review>> getTextbookReviews(@PathVariable String textbookId) {
        List<Review> reviews = reviewService.getTextbookReviews(textbookId);
        return Result.success("获取成功", reviews);
    }
}
