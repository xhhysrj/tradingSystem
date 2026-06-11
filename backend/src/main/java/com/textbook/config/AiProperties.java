package com.textbook.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * 千问大模型配置。
 *
 * 说明：不要把真实 API Key 写入代码仓库，部署时通过环境变量 DASHSCOPE_API_KEY 注入。
 */
@Component
@ConfigurationProperties(prefix = "ai.qwen")
public class AiProperties {

    /** 是否启用远程大模型调用；未配置 key 时会自动降级为本地规则回复。 */
    private boolean enabled = true;

    /** DashScope / 千问 OpenAI 兼容接口地址。 */
    private String endpoint = "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions";

    /** 千问模型名称，课堂演示建议 qwen-plus 或 qwen-turbo。 */
    private String model = "qwen-plus";

    /** API Key，从环境变量 DASHSCOPE_API_KEY 读取。 */
    private String apiKey;

    /** HTTP 连接和读取超时时间。 */
    private int timeoutMillis = 15000;

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public String getEndpoint() {
        return endpoint;
    }

    public void setEndpoint(String endpoint) {
        this.endpoint = endpoint;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public String getApiKey() {
        return apiKey;
    }

    public void setApiKey(String apiKey) {
        this.apiKey = apiKey;
    }

    public int getTimeoutMillis() {
        return timeoutMillis;
    }

    public void setTimeoutMillis(int timeoutMillis) {
        this.timeoutMillis = timeoutMillis;
    }
}
