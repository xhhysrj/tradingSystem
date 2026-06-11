package com.textbook.controller;

import com.textbook.dto.Result;
import com.textbook.model.Course;
import com.textbook.model.Textbook;
import com.textbook.model.User;
import com.textbook.service.CourseService;
import com.textbook.service.TextbookService;
import com.textbook.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 课程控制器
 */
@RestController
@RequestMapping("/api/courses")
public class CourseController {

    @Autowired
    private CourseService courseService;

    @Autowired
    private TextbookService textbookService;

    @Autowired
    private UserService userService;

    /**
     * 添加课程
     */
    @PostMapping("/add")
    public Result<?> addCourse(@RequestBody Map<String, String> params,
                               @RequestAttribute("userId") String userId) {
        String courseName = params.get("courseName");
        String courseCode = params.get("courseCode");
        if (courseName == null || courseCode == null) {
            return Result.error("参数不完整");
        }

        Map<String, Object> result = courseService.addCourse(userId, courseName, courseCode);
        if ((boolean) result.get("success")) {
            return Result.success(result);
        } else {
            return Result.error((String) result.get("message"));
        }
    }

    /**
     * 获取用户的课程列表
     */
    @GetMapping("/list")
    public Result<?> getUserCourses(@RequestAttribute("userId") String userId) {
        List<Course> courses = courseService.getUserCourses(userId);
        return Result.success(courses);
    }

    /**
     * 删除课程
     */
    @DeleteMapping("/{id}")
    public Result<Void> deleteCourse(@PathVariable String id, @RequestAttribute("userId") String userId) {
        boolean success = courseService.deleteCourse(id, userId);
        if (success) {
            return Result.success(null);
        } else {
            return Result.error("删除失败");
        }
    }

    /**
     * 根据课程获取推荐教材
     */
    @GetMapping("/recommendations")
    public Result<?> getRecommendations(@RequestAttribute("userId") String userId) {
        // 获取用户信息
        User user = userService.getUserById(userId);
        if (user == null) {
            return Result.error("用户不存在");
        }

        // 获取用户的课程
        List<Course> courses = courseService.getUserCourses(userId);

        // 为每个课程推荐教材
        Map<String, List<Textbook>> recommendations = new HashMap<>();
        for (Course course : courses) {
            List<Textbook> textbooks = textbookService.recommendTextbooksForUser(
                    course.getCourseCode(),
                    user.getMajor(),
                    userId
            );
            if (!textbooks.isEmpty()) {
                recommendations.put(course.getCourseCode(), textbooks);
            }
        }

        return Result.success(recommendations);
    }
}
