package com.textbook.service;

import com.textbook.dao.CourseDao;
import com.textbook.model.Course;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * 课程服务层
 */
@Service
public class CourseService {

    @Autowired
    private CourseDao courseDao;

    /**
     * 添加课程
     */
    public Map<String, Object> addCourse(String userId, String courseName, String courseCode) {
        Map<String, Object> result = new HashMap<>();

        // 检查课程是否已存在
        QueryWrapper<Course> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("user_id", userId).eq("course_code", courseCode);
        if (courseDao.selectCount(queryWrapper) > 0) {
            result.put("success", false);
            result.put("message", "课程已存在");
            return result;
        }

        // 创建课程
        Course course = new Course();
        course.setId(UUID.randomUUID().toString().replace("-", ""));
        course.setUserId(userId);
        course.setCourseName(courseName);
        course.setCourseCode(courseCode);

        int rows = courseDao.insert(course);
        if (rows > 0) {
            result.put("success", true);
            result.put("message", "添加成功");
            result.put("courseId", course.getId());
        } else {
            result.put("success", false);
            result.put("message", "添加失败");
        }

        return result;
    }

    /**
     * 获取用户的课程列表
     */
    public List<Course> getUserCourses(String userId) {
        QueryWrapper<Course> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("user_id", userId).orderByDesc("created_at");
        return courseDao.selectList(queryWrapper);
    }

    /**
     * 删除课程
     */
    public boolean deleteCourse(String courseId, String userId) {
        QueryWrapper<Course> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("id", courseId).eq("user_id", userId);
        int rows = courseDao.delete(queryWrapper);
        return rows > 0;
    }
}