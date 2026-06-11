package com.textbook.model;

import lombok.Data;

import java.util.Date;

/**
 * 用户信息变更申请视图对象
 */
@Data
public class UserChangeRequestView {

    private String requestId;
    private String userId;

    private String studentId;
    private String name;

    private String currentPhone;
    private String currentMajor;
    private String currentGrade;

    private String newPhone;
    private String newMajor;
    private String newGrade;

    private Boolean passwordChanged;

    private String status;
    private String rejectionReason;

    private Date createdAt;
    private Date updatedAt;
}