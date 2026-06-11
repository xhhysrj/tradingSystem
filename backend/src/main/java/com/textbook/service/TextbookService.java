package com.textbook.service;

import com.textbook.dao.TextbookDao;
import com.textbook.dao.UserDao;
import com.textbook.model.Textbook;
import com.textbook.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;
import java.util.HashMap;

/**
 * 教材服务层
 */
@Service
public class TextbookService {

    @Autowired
    private TextbookDao textbookDao;

    @Autowired
    private UserDao userDao;

    @Autowired
    private com.textbook.dao.OrderDao orderDao;

    /**
     * 发布教材
     */
    @Transactional
    public Map<String, Object> publishTextbook(Textbook textbook, List<String> imageUrls) {
        Map<String, Object> result = new HashMap<>();

        // 生成教材 ID
        String textbookId = UUID.randomUUID().toString().replace("-", "");
        textbook.setId(textbookId);
        textbook.setStatus("pending");

        // 插入教材
        int rows = textbookDao.insert(textbook);
        if (rows <= 0) {
            result.put("success", false);
            result.put("message", "发布失败");
            return result;
        }

        // 插入图片
        if (imageUrls != null && !imageUrls.isEmpty()) {
            for (int i = 0; i < imageUrls.size(); i++) {
                String imageId = UUID.randomUUID().toString().replace("-", "");
                String imageType = i == 0 ? "cover" : "page";
                textbookDao.insertImage(imageId, textbookId, imageUrls.get(i), imageType);
            }
        }

        result.put("success", true);
        result.put("message", "发布成功，请等待审核");
        result.put("textbookId", textbookId);

        return result;
    }

    /**
     * 获取教材详情
     */
    public Textbook getTextbookById(String id) {
        return textbookDao.findById(id);
    }

    /**
     * 搜索教材
     */
    public Map<String, Object> searchTextbooks(String keyword, String major, String grade,
                                                String priceRange, String condition, String sortBy,
                                                int page, int pageSize) {
        int offset = (page - 1) * pageSize;
        List<Textbook> textbooks = textbookDao.search(keyword, major, grade, priceRange, condition, sortBy, offset, pageSize);
        int total = textbookDao.count(keyword, major, grade, priceRange, condition);

        Map<String, Object> result = new HashMap<>();
        result.put("list", textbooks);
        result.put("total", total);
        result.put("page", page);
        result.put("pageSize", pageSize);

        return result;
    }

    /**
     * 获取待审核教材列表
     */
    public List<Textbook> getPendingTextbooks() {
        return textbookDao.findPendingTextbooks();
    }

    /**
     * 审核教材
     */
    public boolean approveTextbook(String textbookId, boolean approved, String approvalReason) {
        String status = approved ? "approved" : "rejected";
        int rows = textbookDao.updateApprovalStatus(textbookId, status, approvalReason);
        return rows > 0;
    }

    /**
     * 根据课程推荐教材1
     */
    public List<Textbook> recommendTextbooks(String courseCode, String major) {
        return textbookDao.findByCourseCode(courseCode, major);
    }

    /**
     * 根据课程推荐教材2
     *排除自己发布的教材,专业不作为硬过滤条件，只作为排序优先级,专业更匹配的排在前面
     */
    public List<Textbook> recommendTextbooksForUser(String courseCode, String major, String userId) {
        if (major == null || major.trim().isEmpty()) {
            return textbookDao.findRecommendedByCourseCodeNoMajor(courseCode, userId);
        }

        return textbookDao.findRecommendedByCourseCode(courseCode, major, userId);
    }


    /**
     * 获取我发布的教材（
     */
    public List<Textbook> getTextbooksBySellerId(String sellerId) {
        List<Textbook> textbooks = textbookDao.findBySellerId(sellerId);

        for (Textbook textbook : textbooks) {
            if (textbook.getPublishTime() == null) {
                textbook.setPublishTime(textbook.getCreatedAt());
            }
        }

        return textbooks;
    }

    /**
     * 获取免费教材列表，结果缓存至 Redis
     */
    @Cacheable(value = "freeTextbooks", key = "#limit")
    public List<Textbook> getFreeTextbooks(int limit) {

        return textbookDao.findFreeTextbooks(limit);
    }
    /**
     * 删除教材
     */
    @Transactional
    public Map<String, Object> deleteTextbook(String textbookId, String userId, String role) {
        Map<String, Object> result = new HashMap<>();

        Textbook textbook = textbookDao.findById(textbookId);
        if (textbook == null) {
            result.put("success", false);
            result.put("message", "教材不存在或已被删除");
            return result;
        }

        // 只能删除自己的教材
        if (!userId.equals(textbook.getSellerId())) {
            result.put("success", false);
            result.put("message", "无权限删除他人教材");
            return result;
        }

        // 有未完成交易不允许删除
        if (orderDao.hasPendingOrder(textbookId)) {
            result.put("success", false);
            result.put("message", "该教材存在未完成的交易，无法删除");
            return result;
        }

        // 先删图片，再做逻辑删除（下架教材）
        textbookDao.deleteImagesByTextbookId(textbookId);
        int rows = textbookDao.deleteById(textbookId);

        result.put("success", rows > 0);
        result.put("message", rows > 0 ? "删除成功" : "删除失败");
        return result;
    }


}

