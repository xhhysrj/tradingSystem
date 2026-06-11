package com.textbook.dto;

import lombok.Data;

/**
 * 前端传入的简化对话历史。
 */
@Data
public class AiChatMessage {
    private String role;
    private String content;
}
