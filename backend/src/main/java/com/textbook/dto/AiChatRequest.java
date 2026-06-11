package com.textbook.dto;

import lombok.Data;

import java.util.List;

/**
 * AI 助手请求参数。
 */
@Data
public class AiChatRequest {
    /** 用户本轮输入。 */
    private String message;

    /** 前端生成的会话 ID，用于演示连续对话。 */
    private String conversationId;

    /** 最近几轮历史消息，后端会做长度控制。 */
    private List<AiChatMessage> history;
}
