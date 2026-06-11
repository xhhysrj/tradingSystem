package com.textbook.model;

import lombok.Data;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;

import java.util.Date;

/**
 * 用户信息变更申请实体类
 */
@Data
@TableName("user_change_requests")
public class UserChangeRequest {

    @TableId(value = "id", type = IdType.INPUT)
    private String id;
    private String userId;

    private String phone;
    private String major;
    private String grade;

    /**
     * 密码已加密
     */
    private String password;

    /**
     * pending / approved / rejected
     */
    private String status;

    private String rejectionReason;

    private Date createdAt;
    private Date updatedAt;
}