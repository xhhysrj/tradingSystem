package com.textbook.model;

import lombok.Data;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;

import java.util.Date;

/**
 * 课程实体类
 */
@Data
@TableName("courses")
public class Course {
    @TableId(value = "id", type = IdType.INPUT)
    private String id;
    private String userId;
    private String courseName;
    private String courseCode;
    private Date createdAt;
}