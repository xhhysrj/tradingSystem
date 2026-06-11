package com.textbook.service;

import com.textbook.config.AiProperties;
import com.textbook.dto.AiChatMessage;
import com.textbook.dto.AiChatRequest;
import com.textbook.dto.AiChatResponse;
import com.textbook.dto.AiTextbookCard;
import com.textbook.model.Course;
import com.textbook.model.Textbook;
import com.textbook.model.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * AI 智能教材助手。
 *
 * 设计思路：
 * 1. 先用本地规则识别“推荐教材 / 我的发布 / 删除教材 / 发布建议”等高确定性意图，保证课堂演示稳定。
 * 2. 再把系统中真实教材数据作为上下文交给千问生成自然语言解释，体现大模型能力。
 * 3. 如果密钥、网络或第三方接口不可用，则自动降级为本地回复，保证系统仍可运行。
 */
@Service
public class AiAssistantService {

    private static final Logger log = LoggerFactory.getLogger(AiAssistantService.class);

    private static final String INTENT_RECOMMEND = "recommend_textbook";
    private static final String INTENT_MY_TEXTBOOKS = "list_my_textbooks";
    private static final String INTENT_DELETE = "delete_my_textbook";
    private static final String INTENT_POSTING_ADVICE = "posting_advice";
    private static final String INTENT_HELP = "help";
    private static final String INTENT_GENERAL = "general_chat";

    @Autowired
    private AiProperties aiProperties;

    @Autowired
    private TextbookService textbookService;

    @Autowired
    private UserService userService;

    @Autowired
    private CourseService courseService;

    public AiChatResponse chat(AiChatRequest request, String userId, String role) {
        String message = safeTrim(request.getMessage());
        User user = userService.getUserById(userId);
        String intent = detectIntent(message);

        AiChatResponse response = new AiChatResponse();
        response.setConversationId(resolveConversationId(request));
        response.setIntent(intent);
        response.setActionStatus("ok");
        response.setSuggestions(defaultSuggestions());

        if (INTENT_HELP.equals(intent)) {
            fillHelpResponse(response);
            return response;
        }

        if (INTENT_MY_TEXTBOOKS.equals(intent)) {
            fillMyTextbooksResponse(response, userId);
            return response;
        }

        if (INTENT_DELETE.equals(intent)) {
            fillDeleteResponse(response, message, userId, role);
            return response;
        }

        if (INTENT_POSTING_ADVICE.equals(intent)) {
            fillPostingAdviceResponse(response, request, user);
            return response;
        }

        if (INTENT_RECOMMEND.equals(intent)) {
            fillRecommendationResponse(response, request, user, userId);
            return response;
        }

        fillGeneralChatResponse(response, request, user);
        return response;
    }

    private String resolveConversationId(AiChatRequest request) {
        if (request.getConversationId() != null && !request.getConversationId().trim().isEmpty()) {
            return request.getConversationId().trim();
        }
        return UUID.randomUUID().toString().replace("-", "");
    }

    private String detectIntent(String message) {
        String text = normalize(message);
        if (containsAny(text, "帮助", "能做什么", "功能", "怎么用", "使用说明")) {
            return INTENT_HELP;
        }
        if (containsAny(text, "删除", "下架", "移除", "删掉")) {
            return INTENT_DELETE;
        }
        if ((containsAny(text, "我发布", "我的发布", "我卖", "我上架") || (containsAny(text, "列出", "查看", "展示", "显示") && containsAny(text, "我的", "我")))
                && containsAny(text, "教材", "课本", "书")) {
            return INTENT_MY_TEXTBOOKS;
        }
        if (containsAny(text, "发布文案", "文案", "描述", "定价", "价格建议", "怎么卖", "卖点", "标题优化")) {
            return INTENT_POSTING_ADVICE;
        }
        if (containsAny(text, "推荐", "找", "有没有", "买", "需要", "适合", "免费", "低价", "便宜", "教材", "课本", "书")) {
            return INTENT_RECOMMEND;
        }
        return INTENT_GENERAL;
    }

    private void fillHelpResponse(AiChatResponse response) {
        response.setReply("我是 AI 智能教材助手，可以直接用自然语言帮你完成这些事：\n"
                + "1. 推荐教材：例如“帮我推荐一本计算机网络教材”“有没有便宜的软件工程教材”。\n"
                + "2. 管理我的发布：例如“列出我发布的教材”“删除我发布的《计算机网络》”。\n"
                + "3. 生成发布建议：例如“帮我给数据结构教材写一段发布文案”“这本书卖多少钱合适”。\n"
                + "4. 交易咨询：例如“线下交易要注意什么”“怎么描述教材新旧程度”。");
        response.setActionStatus("help");
    }

    private void fillMyTextbooksResponse(AiChatResponse response, String userId) {
        List<Textbook> list = textbookService.getTextbooksBySellerId(userId);
        List<AiTextbookCard> cards = toCards(list, "这是你发布过的教材，可点击卡片查看详情。", 20);
        response.setTextbooks(cards);
        response.setActionStatus("listed");
        if (cards.isEmpty()) {
            response.setReply("你目前还没有发布教材。可以先进入“发布教材”页面填写教材信息，也可以把教材名称发给我，我帮你生成发布文案和定价建议。");
        } else {
            response.setReply("我已为你列出当前账号发布的 " + cards.size() + " 本教材。你也可以继续说“删除《书名》”，我会在校验权限和未完成订单后帮你下架。");
        }
        response.setSuggestions(Arrays.asList("删除我发布的《教材名》", "帮我写一本教材发布文案", "推荐适合我课程的教材"));
    }

    private void fillDeleteResponse(AiChatResponse response, String message, String userId, String role) {
        if (!"student".equals(role)) {
            response.setReply("当前账号不是学生角色，暂不支持通过 AI 助手发布或删除教材。");
            response.setActionStatus("forbidden");
            return;
        }

        List<Textbook> myTextbooks = textbookService.getTextbooksBySellerId(userId);
        String target = extractDeleteTarget(message);
        List<Textbook> candidates = findDeleteCandidates(myTextbooks, target);

        if (myTextbooks.isEmpty()) {
            response.setReply("你当前没有可删除的已发布教材。");
            response.setActionStatus("empty");
            return;
        }

        if (target.isEmpty() || candidates.isEmpty()) {
            response.setTextbooks(toCards(myTextbooks, "你可以复制教材标题并说：删除《标题》。", 10));
            response.setReply("我没有准确识别到要删除哪一本教材。为避免误删，我先列出你的教材；请用“删除《完整书名》”再确认一次。");
            response.setActionStatus("need_confirm");
            return;
        }

        if (candidates.size() > 1) {
            response.setTextbooks(toCards(candidates, "匹配到多本教材，请用更完整的书名确认。", 10));
            response.setReply("我匹配到了多本可能要删除的教材。为避免误删，请继续输入更完整的书名，例如“删除《" + candidates.get(0).getTitle() + "》”。");
            response.setActionStatus("ambiguous");
            return;
        }

        Textbook targetBook = candidates.get(0);
        Map<String, Object> deleteResult = textbookService.deleteTextbook(targetBook.getId(), userId, role);
        boolean success = Boolean.TRUE.equals(deleteResult.get("success"));
        String messageText = String.valueOf(deleteResult.get("message"));
        if (success) {
            response.setReply("已帮你删除/下架《" + targetBook.getTitle() + "》。系统已完成权限校验，并检查了是否存在未完成交易。你可以继续让我列出最新发布列表。 ");
            response.setActionStatus("deleted");
            List<Textbook> latest = textbookService.getTextbooksBySellerId(userId);
            response.setTextbooks(toCards(latest, "删除后剩余的发布列表。", 10));
        } else {
            response.setReply("这本教材暂时不能删除：" + messageText + "。如果教材存在未完成交易，需要先处理订单后再下架。");
            response.setActionStatus("failed");
            response.setTextbooks(toCards(Collections.singletonList(targetBook), "删除失败的目标教材。", 1));
        }
        response.setSuggestions(Arrays.asList("列出我发布的教材", "推荐一本教材", "帮我写发布文案"));
    }

    private void fillPostingAdviceResponse(AiChatResponse response, AiChatRequest request, User user) {
        String userText = safeTrim(request.getMessage());
        String fallback = buildPostingAdvice(userText);
        String prompt = "请作为高校二手教材交易平台的 AI 助手，根据学生输入生成教材发布建议。"
                + "要求：中文、口语化、可直接粘贴到发布备注中；包含标题优化、价格建议、新旧程度描述、线下交易提醒。"
                + "学生信息：" + buildUserSummary(user) + "。学生输入：" + userText;
        String remote = callQwen(prompt, request, user, null);
        if (remote != null) {
            response.setReply(remote);
            response.setRemoteModelUsed(true);
        } else {
            response.setReply(fallback);
        }
        response.setActionStatus("advice");
        response.setSuggestions(Arrays.asList("帮我推荐一本计算机网络教材", "列出我发布的教材", "这本书卖多少钱合适"));
    }

    private void fillRecommendationResponse(AiChatResponse response, AiChatRequest request, User user, String userId) {
        String message = safeTrim(request.getMessage());
        List<Textbook> matched = findRecommendedTextbooks(message, user, userId);
        List<AiTextbookCard> cards = toCards(matched, "结合课程关键词、价格、新旧程度和发布时间生成的推荐。", 6);
        response.setTextbooks(cards);

        String fallback = buildRecommendationReply(message, cards, user);
        String prompt = "你是高校二手教材交易平台的 AI 教材推荐助手。请根据用户问题和系统检索到的真实教材列表，给出简洁推荐理由。"
                + "要求：1）不要编造不存在的教材；2）如果列表为空，说明如何换关键词搜索；3）引导用户点击页面中的教材卡片查看详情；4）中文回答。\n"
                + "用户信息：" + buildUserSummary(user) + "\n"
                + "用户问题：" + message + "\n"
                + "系统检索教材：" + summarizeCards(cards);
        String remote = callQwen(prompt, request, user, cards);
        if (remote != null) {
            response.setReply(remote);
            response.setRemoteModelUsed(true);
        } else {
            response.setReply(fallback);
        }
        response.setActionStatus(cards.isEmpty() ? "no_result" : "recommended");
        response.setSuggestions(Arrays.asList("推荐免费的教材", "推荐适合我课程的教材", "列出我发布的教材"));
    }

    private void fillGeneralChatResponse(AiChatResponse response, AiChatRequest request, User user) {
        String prompt = "你是高校智能二手教材交易系统中的 AI 助手，专注回答教材购买、教材发布、课程学习资料选择、线下交易安全等问题。"
                + "回答要简洁、可操作，必要时提醒用户使用系统页面完成交易。用户信息：" + buildUserSummary(user)
                + "。用户问题：" + safeTrim(request.getMessage());
        String remote = callQwen(prompt, request, user, null);
        if (remote != null) {
            response.setReply(remote);
            response.setRemoteModelUsed(true);
        } else {
            response.setReply("我可以围绕二手教材交易提供帮助。你可以问我“推荐一本数据结构教材”“列出我发布的教材”“帮我写发布文案”或“线下交易要注意什么”。");
        }
        response.setActionStatus("chat");
    }

    private List<Textbook> findRecommendedTextbooks(String message, User user, String userId) {
        String keyword = extractKeyword(message);
        String priceRange = extractPriceRange(message);
        String condition = extractCondition(message);
        List<Textbook> result = new ArrayList<>();

        if (containsAny(normalize(message), "免费", "赠送", "0元")) {
            result.addAll(safeList(textbookService.getFreeTextbooks(10)));
        }

        if (!keyword.isEmpty()) {
            Map<String, Object> map = textbookService.searchTextbooks(keyword, null, null, priceRange, condition, "publishTime", 1, 12);
            result.addAll(extractTextbookList(map));
        }

        String courseCode = extractCourseCode(message);
        if (!courseCode.isEmpty()) {
            String major = user == null ? null : user.getMajor();
            result.addAll(safeList(textbookService.recommendTextbooksForUser(courseCode, major, userId)));
        }

        if (result.isEmpty() && user != null) {
            List<Course> courses = safeList(courseService.getUserCourses(userId));
            for (Course course : courses) {
                if (result.size() >= 10) {
                    break;
                }
                result.addAll(safeList(textbookService.recommendTextbooksForUser(course.getCourseCode(), user.getMajor(), userId)));
                if (result.isEmpty() && course.getCourseName() != null) {
                    Map<String, Object> byCourseName = textbookService.searchTextbooks(course.getCourseName(), null, null, priceRange, condition, "publishTime", 1, 6);
                    result.addAll(extractTextbookList(byCourseName));
                }
            }
        }

        if (result.isEmpty() && user != null && user.getMajor() != null) {
            Map<String, Object> map = textbookService.searchTextbooks(null, user.getMajor(), null, priceRange, condition, "publishTime", 1, 10);
            result.addAll(extractTextbookList(map));
        }

        if (result.isEmpty()) {
            Map<String, Object> map = textbookService.searchTextbooks(keyword.isEmpty() ? null : keyword, null, null, priceRange, condition, "publishTime", 1, 10);
            result.addAll(extractTextbookList(map));
        }

        return removeSelfAndDuplicate(result, userId, containsAny(normalize(message), "我发布", "我的"));
    }

    @SuppressWarnings("unchecked")
    private List<Textbook> extractTextbookList(Map<String, Object> map) {
        if (map == null) {
            return Collections.emptyList();
        }
        Object list = map.get("list");
        if (list instanceof List) {
            return (List<Textbook>) list;
        }
        return Collections.emptyList();
    }

    private List<Textbook> removeSelfAndDuplicate(List<Textbook> source, String userId, boolean keepSelf) {
        Map<String, Textbook> map = new LinkedHashMap<>();
        if (source == null) {
            return new ArrayList<>();
        }
        for (Textbook textbook : source) {
            if (textbook == null || textbook.getId() == null) {
                continue;
            }
            if (!keepSelf && userId != null && userId.equals(textbook.getSellerId())) {
                continue;
            }
            map.put(textbook.getId(), textbook);
        }
        List<Textbook> list = new ArrayList<>(map.values());
        Collections.sort(list, new Comparator<Textbook>() {
            @Override
            public int compare(Textbook a, Textbook b) {
                BigDecimal pa = a.getPrice() == null ? BigDecimal.ZERO : a.getPrice();
                BigDecimal pb = b.getPrice() == null ? BigDecimal.ZERO : b.getPrice();
                int priceCompare = pa.compareTo(pb);
                if (priceCompare != 0) {
                    return priceCompare;
                }
                String ca = a.getBookCondition() == null ? "" : a.getBookCondition();
                String cb = b.getBookCondition() == null ? "" : b.getBookCondition();
                return conditionScore(cb) - conditionScore(ca);
            }
        });
        return list;
    }

    private int conditionScore(String condition) {
        if ("95新".equals(condition)) {
            return 5;
        }
        if ("9新".equals(condition)) {
            return 4;
        }
        if ("8新".equals(condition)) {
            return 3;
        }
        if ("7新".equals(condition)) {
            return 2;
        }
        return 1;
    }

    private List<AiTextbookCard> toCards(List<Textbook> textbooks, String defaultReason, int limit) {
        List<AiTextbookCard> cards = new ArrayList<>();
        if (textbooks == null) {
            return cards;
        }
        int count = 0;
        for (Textbook textbook : textbooks) {
            if (textbook == null) {
                continue;
            }
            AiTextbookCard card = new AiTextbookCard();
            card.setId(textbook.getId());
            card.setTitle(textbook.getTitle());
            card.setAuthor(textbook.getAuthor());
            card.setCourseName(textbook.getCourseName());
            card.setCourseCode(textbook.getCourseCode());
            card.setApplicableMajor(textbook.getApplicableMajor());
            card.setPrice(textbook.getPrice());
            card.setBookCondition(textbook.getBookCondition());
            card.setStatus(textbook.getStatus());
            card.setSellerName(textbook.getSellerName());
            card.setImages(textbook.getImages());
            card.setDetailUrl("/textbook/" + textbook.getId());
            card.setReason(buildCardReason(textbook, defaultReason));
            cards.add(card);
            count++;
            if (count >= limit) {
                break;
            }
        }
        return cards;
    }

    private String buildCardReason(Textbook textbook, String defaultReason) {
        List<String> parts = new ArrayList<>();
        if (textbook.getCourseName() != null) {
            parts.add("适配课程“" + textbook.getCourseName() + "”");
        }
        if (textbook.getPrice() != null) {
            parts.add(textbook.getPrice().compareTo(BigDecimal.ZERO) == 0 ? "免费" : "价格 ¥" + textbook.getPrice());
        }
        if (textbook.getBookCondition() != null) {
            parts.add("成色" + textbook.getBookCondition());
        }
        if (parts.isEmpty()) {
            return defaultReason;
        }
        return String.join("，", parts);
    }

    private String buildRecommendationReply(String message, List<AiTextbookCard> cards, User user) {
        if (cards == null || cards.isEmpty()) {
            return "我暂时没有在系统中找到完全匹配的教材。建议你换一个课程名、课程代码或专业关键词再试，例如“计算机网络”“CS201”“软件工程”。";
        }
        StringBuilder sb = new StringBuilder();
        sb.append("我根据你的问题筛选出 ").append(cards.size()).append(" 本比较合适的教材，已放在下方卡片里。优先考虑了课程匹配、价格和新旧程度。\n");
        int i = 1;
        for (AiTextbookCard card : cards) {
            sb.append(i++).append(". 《").append(card.getTitle()).append("》：").append(card.getReason()).append("。\n");
        }
        sb.append("点击教材卡片可以进入详情页查看卖家、图片和交易信息。");
        return sb.toString();
    }

    private String buildPostingAdvice(String userText) {
        String title = extractBookTitle(userText);
        if (title.isEmpty()) {
            title = "这本教材";
        }
        return "可以这样发布：\n"
                + "标题建议：《" + title + "》二手教材，适合相关课程使用。\n"
                + "备注建议：教材保存较好，重点章节有少量课堂笔记，适合复习和上课携带；可在图书馆、宿舍楼或教学楼线下交易。\n"
                + "定价建议：如果 95 新可按原价 60%-70% 定价；9 新按 45%-60%；8 新按 30%-45%；有大量笔记或破损应继续下调。\n"
                + "安全提醒：不要提前转账，建议在校内公共区域当面验书后交易。";
    }

    private String callQwen(String prompt, AiChatRequest request, User user, List<AiTextbookCard> cards) {
        if (!isRemoteAvailable()) {
            return null;
        }
        try {
            RestTemplate restTemplate = buildRestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + aiProperties.getApiKey().trim());

            Map<String, Object> body = new HashMap<>();
            body.put("model", aiProperties.getModel());
            body.put("temperature", 0.3);
            body.put("max_tokens", 900);
            body.put("messages", buildQwenMessages(prompt, request));

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(aiProperties.getEndpoint(), entity, Map.class);
            return parseQwenContent(response.getBody());
        } catch (Exception ex) {
            log.warn("调用千问接口失败，已降级为本地规则回复: {}", ex.getMessage());
            return null;
        }
    }

    private boolean isRemoteAvailable() {
        return aiProperties != null
                && aiProperties.isEnabled()
                && aiProperties.getApiKey() != null
                && !aiProperties.getApiKey().trim().isEmpty()
                && aiProperties.getEndpoint() != null
                && !aiProperties.getEndpoint().trim().isEmpty();
    }

    private RestTemplate buildRestTemplate() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        int timeout = Math.max(aiProperties.getTimeoutMillis(), 3000);
        factory.setConnectTimeout(timeout);
        factory.setReadTimeout(timeout);
        return new RestTemplate(factory);
    }

    private List<Map<String, String>> buildQwenMessages(String prompt, AiChatRequest request) {
        List<Map<String, String>> messages = new ArrayList<>();
        Map<String, String> system = new HashMap<>();
        system.put("role", "system");
        system.put("content", "你是高校智能二手教材交易系统的 AI 助手。必须基于系统给出的教材数据回答，不要编造教材 ID、价格和卖家信息。回答使用中文。涉及删除等操作时，只解释结果，不要求用户绕过系统权限。");
        messages.add(system);

        if (request.getHistory() != null) {
            int start = Math.max(0, request.getHistory().size() - 6);
            for (int i = start; i < request.getHistory().size(); i++) {
                AiChatMessage item = request.getHistory().get(i);
                if (item == null || item.getContent() == null || item.getContent().trim().isEmpty()) {
                    continue;
                }
                String role = "assistant".equals(item.getRole()) ? "assistant" : "user";
                Map<String, String> msg = new HashMap<>();
                msg.put("role", role);
                msg.put("content", limitLength(item.getContent(), 500));
                messages.add(msg);
            }
        }

        Map<String, String> user = new HashMap<>();
        user.put("role", "user");
        user.put("content", prompt);
        messages.add(user);
        return messages;
    }

    @SuppressWarnings("unchecked")
    private String parseQwenContent(Map body) {
        if (body == null) {
            return null;
        }
        Object choicesObj = body.get("choices");
        if (!(choicesObj instanceof List)) {
            return null;
        }
        List choices = (List) choicesObj;
        if (choices.isEmpty() || !(choices.get(0) instanceof Map)) {
            return null;
        }
        Map first = (Map) choices.get(0);
        Object messageObj = first.get("message");
        if (!(messageObj instanceof Map)) {
            return null;
        }
        Object content = ((Map) messageObj).get("content");
        if (content == null) {
            return null;
        }
        String text = content.toString().trim();
        return text.isEmpty() ? null : text;
    }

    private List<Textbook> findDeleteCandidates(List<Textbook> myTextbooks, String target) {
        if (myTextbooks == null || target == null || target.trim().isEmpty()) {
            return Collections.emptyList();
        }
        String normalizedTarget = normalizeTitle(target);
        List<Textbook> exact = new ArrayList<>();
        List<Textbook> contains = new ArrayList<>();
        for (Textbook textbook : myTextbooks) {
            if (textbook == null || textbook.getTitle() == null) {
                continue;
            }
            String title = normalizeTitle(textbook.getTitle());
            if (title.equals(normalizedTarget) || textbook.getId().equalsIgnoreCase(target.trim())) {
                exact.add(textbook);
            } else if (title.contains(normalizedTarget) || normalizedTarget.contains(title)) {
                contains.add(textbook);
            }
        }
        if (!exact.isEmpty()) {
            return exact;
        }
        return contains;
    }

    private String extractDeleteTarget(String message) {
        String text = safeTrim(message);
        String title = extractBookTitle(text);
        if (!title.isEmpty()) {
            return title;
        }
        String result = text.replaceAll("(?i)删除|下架|移除|删掉|帮我|请|把|我发布的|我的|这本|这本书|教材|课本|书", " ");
        result = result.replaceAll("[，。！？、,.!?;；：:()（）\\[\\]【】]", " ").trim();
        result = result.replaceAll("\\s+", " ").trim();
        if (result.length() <= 1 || "某本".equals(result)) {
            return "";
        }
        return result;
    }

    private String extractBookTitle(String text) {
        if (text == null) {
            return "";
        }
        List<Pattern> patterns = Arrays.asList(
                Pattern.compile("《([^》]+)》"),
                Pattern.compile("“([^”]+)”"),
                Pattern.compile("\"([^\"]+)\""),
                Pattern.compile("'([^']+)'")
        );
        for (Pattern pattern : patterns) {
            Matcher matcher = pattern.matcher(text);
            if (matcher.find()) {
                return matcher.group(1).trim();
            }
        }
        return "";
    }

    private String extractKeyword(String message) {
        String title = extractBookTitle(message);
        if (!title.isEmpty()) {
            return title;
        }
        String text = safeTrim(message);
        String courseCode = extractCourseCode(text);
        if (!courseCode.isEmpty()) {
            return courseCode;
        }
        String result = text.replaceAll("帮我|请问|请|想要|想买|需要|有没有|有无|找一下|找|推荐|一本|一套|二手|教材|课本|书籍|书|适合|课程|专业|本专业|我|的|吗|呢|吧|一下|便宜|低价|免费|新一点|成色|多少|价格", " ");
        result = result.replaceAll("[，。！？、,.!?;；：:()（）\\[\\]【】]", " ");
        result = result.replaceAll("\\s+", " ").trim();
        if (result.length() > 30) {
            result = result.substring(0, 30);
        }
        return result;
    }

    private String extractCourseCode(String message) {
        if (message == null) {
            return "";
        }
        Matcher matcher = Pattern.compile("[A-Za-z]{1,6}[-_ ]?\\d{2,4}").matcher(message);
        if (matcher.find()) {
            return matcher.group().replace("-", "").replace("_", "").replace(" ", "").toUpperCase();
        }
        return "";
    }

    private String extractPriceRange(String message) {
        String text = normalize(message);
        if (containsAny(text, "免费", "赠送", "0元")) {
            return "0";
        }
        if (containsAny(text, "便宜", "低价", "50以内", "五十以内")) {
            return "1-50";
        }
        if (containsAny(text, "100以上", "贵一点")) {
            return "100+";
        }
        return null;
    }

    private String extractCondition(String message) {
        String text = normalize(message);
        if (text.contains("95新")) {
            return "95新";
        }
        if (text.contains("9新") || text.contains("九新")) {
            return "9新";
        }
        if (text.contains("8新") || text.contains("八新")) {
            return "8新";
        }
        if (text.contains("7新") || text.contains("七新")) {
            return "7新";
        }
        return null;
    }

    private String summarizeCards(List<AiTextbookCard> cards) {
        if (cards == null || cards.isEmpty()) {
            return "无匹配教材";
        }
        StringBuilder sb = new StringBuilder();
        int i = 1;
        for (AiTextbookCard card : cards) {
            sb.append(i++).append(". ID=").append(card.getId())
                    .append("，书名=").append(card.getTitle())
                    .append("，课程=").append(card.getCourseName()).append("/").append(card.getCourseCode())
                    .append("，价格=").append(card.getPrice())
                    .append("，成色=").append(card.getBookCondition())
                    .append("，卖家=").append(card.getSellerName())
                    .append("；");
        }
        return sb.toString();
    }

    private String buildUserSummary(User user) {
        if (user == null) {
            return "未获取到用户资料";
        }
        return "姓名=" + safeText(user.getName())
                + "，专业=" + safeText(user.getMajor())
                + "，年级=" + safeText(user.getGrade())
                + "，角色=" + safeText(user.getRole());
    }

    private List<String> defaultSuggestions() {
        return Arrays.asList("帮我推荐一本计算机网络教材", "列出我发布的教材", "删除我发布的《教材名》", "帮我写教材发布文案");
    }

    private boolean containsAny(String text, String... words) {
        if (text == null) {
            return false;
        }
        for (String word : words) {
            if (word != null && !word.isEmpty() && text.contains(normalize(word))) {
                return true;
            }
        }
        return false;
    }

    private String normalize(String text) {
        if (text == null) {
            return "";
        }
        return text.replaceAll("\\s+", "").toLowerCase();
    }

    private String normalizeTitle(String text) {
        if (text == null) {
            return "";
        }
        return text.replaceAll("[《》“”\"'，。！？、,.!?;；：:()（）\\[\\]【】\\s]", "").toLowerCase();
    }

    private String safeTrim(String text) {
        return text == null ? "" : text.trim();
    }

    private String safeText(String text) {
        return text == null ? "" : text;
    }

    private String limitLength(String text, int max) {
        if (text == null || text.length() <= max) {
            return text;
        }
        return text.substring(0, max) + "...";
    }

    private <T> List<T> safeList(List<T> list) {
        return list == null ? Collections.<T>emptyList() : list;
    }
}
