package com.textbook.model;

import lombok.Data;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;

import java.math.BigDecimal;
import java.util.Date;

/**
 * 订单实体类
 */
@Data
@TableName("orders")
public class Order {
    @TableId(value = "id", type = IdType.INPUT)
    private String id;
    private String textbookId;
    private String textbookTitle;
    private String buyerId;
    private String buyerName;
    private String buyerPhone;
    private String buyerMajor;
    private String buyerGrade;
    private String sellerId;
    private String sellerName;
    private String sellerPhone;
    private String sellerMajor;
    private String sellerGrade;
    private BigDecimal price;
    private String meetingTime;
    private String meetingLocation;
    private String status;
    private String cancelReason;

    private Boolean buyerDeleted;
    private Boolean sellerDeleted;

    private Date createdAt;
    private Date updatedAt;
}