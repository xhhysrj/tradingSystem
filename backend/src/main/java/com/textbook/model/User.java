package com.textbook.model;

import lombok.Data;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.util.Date;

/**
 * 用户实体类
 */
@Data
@TableName("users")
public class User {
    @TableId(value = "id", type = IdType.INPUT)
    private String id;
    private String studentId;
    private String password;
    private String name;
    private String phone;
    private String major;
    private String grade;
    private String role;
    private String status;
    private String approvalStatus;
    private String rejectionReason;
    private Date createdAt;
    private Date updatedAt;
}
