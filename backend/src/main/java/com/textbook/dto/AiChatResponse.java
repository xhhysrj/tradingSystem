package com.textbook.dto;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

/**
 * AI 助手响应结果。
 */
@Data
public class AiChatResponse {
    private String conversationId;
    private String intent;
    private String reply;
    private String actionStatus;
    private boolean remoteModelUsed;
    private List<AiTextbookCard> textbooks = new ArrayList<>();
    private List<String> suggestions = new ArrayList<>();
}
