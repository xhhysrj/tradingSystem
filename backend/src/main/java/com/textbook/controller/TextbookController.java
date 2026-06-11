package com.textbook.controller;

import com.textbook.dto.Result;
import com.textbook.model.Textbook;
import com.textbook.model.User;
import com.textbook.service.TextbookService;
import com.textbook.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 教材控制器
 */
@RestController
@RequestMapping("/api/textbooks")
public class TextbookController {

    @Autowired
    private TextbookService textbookService;

    @Autowired
    private UserService userService;

    /**
     * 发布教材
     */
    @PostMapping("/publish")
    public Result<?> publishTextbook(@RequestBody Map<String, Object> params,
                                     @RequestAttribute("userId") String userId,
                                     @RequestAttribute("userRole") String role) {

        // 管理员暂时不可以发布教材
        if ("admin".equals(role)) {
            return Result.error(403, "管理员暂时不支持发布教材");
        }

        // 获取用户信息
        User user = userService.getUserById(userId);
        if (user == null) {
            return Result.error("用户不存在");
        }

        // 构建教材对象
        Textbook textbook = new Textbook();
        textbook.setTitle((String) params.get("title"));
        textbook.setAuthor((String) params.get("author"));
        textbook.setCourseName((String) params.get("courseName"));
        textbook.setCourseCode((String) params.get("courseCode"));
        textbook.setApplicableMajor((String) params.get("applicableMajor"));
        textbook.setPrice(new java.math.BigDecimal(params.get("price").toString()));
        textbook.setBookCondition((String) params.get("condition"));
        textbook.setNotes((String) params.get("notes"));
        textbook.setSellerId(user.getId());
        textbook.setSellerName(user.getName());
        textbook.setSellerMajor(user.getMajor());
        textbook.setSellerGrade(user.getGrade());

        // 图片列表
        List<String> images;
        Object imagesObj = params.get("images");
        if (imagesObj instanceof List) {
            @SuppressWarnings("unchecked")
            List<String> imgList = (List<String>) imagesObj;
            images = imgList;
        } else if (imagesObj instanceof String) {
            images = java.util.Arrays.asList(((String) imagesObj).split(","));
        } else {
            images = new java.util.ArrayList<>();
        }

        Map<String, Object> result = textbookService.publishTextbook(textbook, images);
        if ((boolean) result.get("success")) {
            return Result.success(result);
        } else {
            return Result.error((String) result.get("message"));
        }
    }

    /**
     * 获取我发布的教材列表
     */
    @GetMapping("/my")
    public Result<?> getMyTextbooks(@RequestAttribute("userId") String userId,
                                    @RequestAttribute("userRole") String role) {

        // 管理员不展示
        if ("admin".equals(role)) {
            return Result.error(403, "管理员暂时不支持");
        }

        List<Textbook> textbooks = textbookService.getTextbooksBySellerId(userId);
        return Result.success(textbooks);
    }

    /**
     * 获取教材详情
     */
    @GetMapping("/detail/{id}")
    public Result<?> getTextbookDetail(@PathVariable String id) {
        Textbook textbook = textbookService.getTextbookById(id);
        if (textbook == null) {
            return Result.error("教材不存在");
        }
        return Result.success(textbook);
    }

    /**
     * 搜索教材
     */
    @GetMapping("/list")
    public Result<?> searchTextbooks(@RequestParam(required = false) String keyword,
                                     @RequestParam(required = false) String major,
                                     @RequestParam(required = false) String grade,
                                     @RequestParam(required = false) String priceRange,
                                     @RequestParam(required = false) String condition,
                                     @RequestParam(defaultValue = "publishTime") String sortBy,
                                     @RequestParam(defaultValue = "1") int page,
                                     @RequestParam(defaultValue = "10") int pageSize) {
        Map<String, Object> result = textbookService.searchTextbooks(keyword, major, grade,
                                                                      priceRange, condition, sortBy,
                                                                      page, pageSize);
        return Result.success(result);
    }

    /**
     * 根据课程推荐教材
     */
    @GetMapping("/recommend")
    public Result<?> recommendTextbooks(@RequestParam String courseCode,
                                        @RequestParam String major) {
        List<Textbook> textbooks = textbookService.recommendTextbooks(courseCode, major);
        return Result.success(textbooks);
    }

    /**
     * 获取免费教材列表
     */
    @GetMapping("/free")
    public Result<?> getFreeTextbooks(@RequestParam(defaultValue = "10") int limit) {
        List<Textbook> textbooks = textbookService.getFreeTextbooks(limit);
        return Result.success(textbooks);
    }

    /**
     * 删除教材
     */
    @RequestMapping(value = "/delete/{id}", method = {RequestMethod.POST, RequestMethod.DELETE})
    public Result<?> deleteTextbook(@PathVariable String id,
                                    @RequestAttribute("userId") String userId,
                                    @RequestAttribute("userRole") String role) {
        Map<String, Object> result = textbookService.deleteTextbook(id, userId, role);
        if (Boolean.TRUE.equals(result.get("success"))) {
            return Result.success("删除成功", null);
        }
        return Result.error(400, (String) result.get("message"));
    }
}
