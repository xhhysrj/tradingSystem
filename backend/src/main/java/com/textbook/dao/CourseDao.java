package com.textbook.dao;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.textbook.model.Course;
import org.apache.ibatis.annotations.Mapper;

/**
 * 课程数据访问层
 */
@Mapper
public interface CourseDao extends BaseMapper<Course> {
}