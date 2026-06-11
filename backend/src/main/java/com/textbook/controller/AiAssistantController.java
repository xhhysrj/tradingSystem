package com.textbook.controller;

import com.textbook.dto.AiChatRequest;
import com.textbook.dto.AiChatResponse;
import com.textbook.dto.Result;
import com.textbook.service.AiAssistantService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

/**
 * 智能教材助手接口。
 */
@RestController
@RequestMapping("/api/ai")
public class AiAssistantController {

    @Autowired
    private AiAssistantService aiAssistantService;

    @PostMapping("/chat")
    public Result<AiChatResponse> chat(@RequestBody AiChatRequest request,
                                       @RequestAttribute("userId") String userId,
                                       @RequestAttribute("userRole") String role) {
        if (request == null || request.getMessage() == null || request.getMessage().trim().isEmpty()) {
            return Result.error(400, "请输入要咨询的问题");
        }
        AiChatResponse response = aiAssistantService.chat(request, userId, role);
        return Result.success(response);
    }

    @GetMapping("/capabilities")
    public Result<Map<String, Object>> capabilities() {
        Map<String, Object> data = new HashMap<>();
        data.put("title", "AI 智能教材助手");
        data.put("capabilities", Arrays.asList(
                "根据课程、专业、价格和新旧程度推荐教材",
                "列出当前登录用户发布过的教材",
                "通过自然语言删除/下架本人发布的教材",
                "生成教材发布文案、定价建议和交易提醒",
                "调用千问大模型进行教材咨询；未配置密钥时自动降级为本地规则助手"
        ));
        return Result.success(data);
    }
}
