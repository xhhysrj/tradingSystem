package com.textbook.model;

import lombok.Data;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;

import java.util.Date;

/**
 * 评价实体类
 */
@Data
@TableName("reviews")
public class Review {
    @TableId(value = "id", type = IdType.INPUT)
    private String id;
    private String orderId;
    private String textbookId;
    private String reviewerId;
    private String reviewerName;
    private String revieweeId;
    private String revieweeName;
    private String reviewType;
    private Integer rating;
    private String content;
    private Boolean isAnonymous;
    private Date createdAt;
}