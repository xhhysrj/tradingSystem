package com.textbook.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

/**
 * AI 回复中用于前端展示和跳转的教材卡片。
 */
@Data
public class AiTextbookCard {
    private String id;
    private String title;
    private String author;
    private String courseName;
    private String courseCode;
    private String applicableMajor;
    private BigDecimal price;
    private String bookCondition;
    private String status;
    private String sellerName;
    private List<String> images;
    private String reason;
    private String detailUrl;
}
