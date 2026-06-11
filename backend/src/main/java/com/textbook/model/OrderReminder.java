package com.textbook.model;

import lombok.Data;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;

import java.util.Date;

/**
 * 订单提醒实体类
 */
@Data
@TableName("order_reminders")
public class OrderReminder {
    @TableId(value = "id", type = IdType.INPUT)
    private String id;
    private String orderId;
    private String senderId;
    private String receiverId;
    private String content;
    private Boolean isRead;
    private Date createdAt;

    // 查询时附带的信息，非必须字段
    @TableField(exist = false)
    private String textbookTitle;
    @TableField(exist = false)
    private String senderName;
}