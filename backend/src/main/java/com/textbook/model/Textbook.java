package com.textbook.model;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.math.BigDecimal;
import java.util.Date;
import java.util.List;

/**
 * 教材实体类
 */
@Data
@TableName("textbooks")
public class Textbook {
    @TableId
    private String id;
    private String title;
    private String author;
    private String courseName;
    private String courseCode;
    private String applicableMajor;
    private BigDecimal price;
    private String bookCondition;
    private String notes;
    private String sellerId;
    private String sellerName;
    private String sellerMajor;
    private String sellerGrade;
    private String status;
    private String approvalReason;
    private Date publishTime;
    private Date createdAt;
    private Date updatedAt;

    // 图片列表，非数据库字段
    @com.baomidou.mybatisplus.annotation.TableField(exist = false)
    private List<String> images;
}