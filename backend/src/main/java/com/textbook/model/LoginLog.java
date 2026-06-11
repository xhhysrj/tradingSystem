package com.textbook.model;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.util.Date;

/**
 * 登录日志实体类
 */
@Data
@TableName("login_logs")
public class LoginLog {

    @TableId(value = "id", type = IdType.INPUT)
    private String id;

    @TableField("user_id")
    private String userId;

    @TableField("student_id")
    private String studentId;

    @TableField("user_name")
    private String userName;

    @TableField("user_role")
    private String userRole;

    @TableField("login_ip")
    private String loginIp;



    @TableField("login_time")
    private Date loginTime;

    @TableField("user_agent")
    private String userAgent;

    @TableField("login_status")
    private String loginStatus;

    @TableField("failure_reason")
    private String failureReason;
}