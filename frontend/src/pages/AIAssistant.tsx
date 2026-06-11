import { FormEvent, KeyboardEvent, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { useAuth } from '../hooks/useAuth';
import { getTextbookImage } from '../lib/defaultImages';
import { chatWithAi, AiTextbookCard } from '../services/aiService';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  textbooks?: AiTextbookCard[];
  suggestions?: string[];
  remoteModelUsed?: boolean;
  actionStatus?: string;
}

const welcomeMessage: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content:
    '你好，我是 AI 智能教材助手。你可以让我推荐教材、列出你发布的教材、生成发布文案，也可以直接说“删除我发布的《教材名》”，我会在校验权限后帮你下架。',
  suggestions: ['帮我推荐一本计算机网络教材', '列出我发布的教材', '帮我写一本数据结构教材的发布文案'],
};

const quickPrompts = [
  '帮我推荐一本计算机网络教材',
  '推荐免费的教材',
  '列出我发布的教材',
  '帮我写一本教材发布文案',
  '线下交易要注意什么？',
];

function createMessageId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function formatPrice(price: number | undefined) {
  if (price === undefined || price === null) return '价格待确认';
  return Number(price) === 0 ? '免费' : `¥${Number(price).toFixed(2)}`;
}

function getStatusText(status?: string) {
  switch (status) {
    case 'pending':
      return '审核中';
    case 'approved':
      return '已通过';
    case 'rejected':
      return '被拒绝';
    case 'sold':
      return '已售出';
    case 'deleted':
      return '已删除';
    default:
      return status || '未知';
  }
}

export default function AIAssistant() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [conversationId, setConversationId] = useState<string>();
  const [messages, setMessages] = useState<ChatMessage[]>([welcomeMessage]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);

  const historyForApi = useMemo(
    () =>
      messages
        .filter((item) => item.id !== 'welcome')
        .slice(-8)
        .map((item) => ({ role: item.role, content: item.content })),
    [messages]
  );

  const scrollToBottom = () => {
    window.setTimeout(() => {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
    }, 50);
  };

  const sendMessage = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;

    if (!isAuthenticated) {
      toast.error('请先登录后使用 AI 智能助手');
      navigate('/login');
      return;
    }

    const userMessage: ChatMessage = { id: createMessageId(), role: 'user', content };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    scrollToBottom();

    try {
      const result = await chatWithAi({
        message: content,
        conversationId,
        history: historyForApi,
      });
      setConversationId(result.conversationId);
      const assistantMessage: ChatMessage = {
        id: createMessageId(),
        role: 'assistant',
        content: result.reply,
        textbooks: result.textbooks || [],
        suggestions: result.suggestions || [],
        remoteModelUsed: result.remoteModelUsed,
        actionStatus: result.actionStatus,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      toast.error(error?.message || 'AI 助手暂时不可用');
      setMessages((prev) => [
        ...prev,
        {
          id: createMessageId(),
          role: 'assistant',
          content: '抱歉，AI 助手请求失败。请检查后端服务、登录状态或千问 API 配置后再试。',
          actionStatus: 'error',
        },
      ]);
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    sendMessage();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const renderTextbookCards = (textbooks?: AiTextbookCard[]) => {
    if (!textbooks || textbooks.length === 0) return null;
    return (
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        {textbooks.map((book) => {
          const imageUrl = getTextbookImage(book.images, book.id);
          return (
            <Link
              key={book.id}
              to={`/textbook/${book.id}`}
              className="group bg-white dark:bg-gray-800 rounded-xl border border-blue-100 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex gap-3 p-3">
                <div className="h-24 w-20 flex-shrink-0 rounded-lg bg-gray-100 dark:bg-gray-700 overflow-hidden">
                  <img src={imageUrl} alt={book.title} className="w-full h-full object-contain bg-white dark:bg-gray-700" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-300">
                      {book.title}
                    </h3>
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-300 whitespace-nowrap">
                      {formatPrice(book.price)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                    {book.courseName} · {book.courseCode}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200">
                      {book.bookCondition || '成色未填'}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-200">
                      {getStatusText(book.status)}
                    </span>
                  </div>
                  {book.reason && <p className="mt-2 text-xs text-gray-600 dark:text-gray-300 line-clamp-2">{book.reason}</p>}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    );
  };

  const renderAssistantMeta = (message: ChatMessage) => {
    if (message.role !== 'assistant' || message.id === 'welcome') return null;
    return (
      <div className="mt-2 flex flex-wrap gap-2 text-xs">
        <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-300">
          {message.remoteModelUsed ? '千问模型已参与生成' : '本地规则稳定回复'}
        </span>
        {message.actionStatus && (
          <span className="px-2 py-1 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-200">
            状态：{message.actionStatus}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="flex-1">
        <section className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 text-white py-10 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <div>
                <p className="text-blue-100 text-sm mb-2">AI + 高校二手教材交易</p>
                <h1 className="text-3xl md:text-4xl font-bold">智能教材助手</h1>
                <p className="mt-3 text-blue-50 max-w-2xl">
                  通过自然语言完成教材推荐、发布管理、删除下架和交易咨询，让二手教材流转更高效。
                </p>
              </div>
              {isAuthenticated && (
                <div className="rounded-2xl bg-white/10 backdrop-blur px-4 py-3 text-sm">
                  当前用户：{user?.name || '同学'} · {user?.major || '未填写专业'} · {user?.grade || '未填写年级'}
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-4 gap-6">
          <aside className="lg:col-span-1 space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-5 border border-gray-100 dark:border-gray-700">
              <h2 className="font-bold text-gray-900 dark:text-white mb-3">支持的 AI 能力</h2>
              <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                <li className="flex gap-2"><i className="fa-solid fa-wand-magic-sparkles text-blue-500 mt-1" /> 智能推荐教材并展示可点击卡片</li>
                <li className="flex gap-2"><i className="fa-solid fa-list text-blue-500 mt-1" /> 列出本人发布的教材</li>
                <li className="flex gap-2"><i className="fa-solid fa-trash-can text-blue-500 mt-1" /> 自然语言删除本人教材</li>
                <li className="flex gap-2"><i className="fa-solid fa-pen-nib text-blue-500 mt-1" /> 生成发布文案和定价建议</li>
                <li className="flex gap-2"><i className="fa-solid fa-cloud text-blue-500 mt-1" /> 支持千问模型，失败时自动降级</li>
              </ul>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-5 border border-gray-100 dark:border-gray-700">
              <h2 className="font-bold text-gray-900 dark:text-white mb-3">快捷提问</h2>
              <div className="space-y-2">
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => sendMessage(prompt)}
                    disabled={loading}
                    className="w-full text-left px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-100 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-900/30 dark:hover:text-blue-100 disabled:opacity-50"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <section className="lg:col-span-3 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col min-h-[680px]">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-gray-900 dark:text-white">AI 对话框</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">输入教材、课程、价格或操作意图，系统会调用后端 AI 接口处理。</p>
              </div>
              <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full text-xs bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-200">
                <span className="w-2 h-2 rounded-full bg-green-500 mr-2" /> 在线
              </span>
            </div>

            <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-5 space-y-5 bg-gray-50/70 dark:bg-gray-900/30">
              {messages.map((message) => {
                const isUser = message.role === 'user';
                return (
                  <div key={message.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[92%] md:max-w-[82%] ${isUser ? 'items-end' : 'items-start'}`}>
                      <div
                        className={`rounded-2xl px-4 py-3 whitespace-pre-wrap leading-relaxed text-sm md:text-base ${
                          isUser
                            ? 'bg-blue-600 text-white rounded-br-sm'
                            : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-100 dark:border-gray-700 rounded-bl-sm shadow-sm'
                        }`}
                      >
                        {message.content}
                      </div>
                      {!isUser && renderAssistantMeta(message)}
                      {!isUser && renderTextbookCards(message.textbooks)}
                      {!isUser && message.suggestions && message.suggestions.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {message.suggestions.slice(0, 4).map((suggestion) => (
                            <button
                              key={suggestion}
                              type="button"
                              onClick={() => sendMessage(suggestion)}
                              disabled={loading}
                              className="text-xs px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-100 dark:hover:bg-blue-900/50 disabled:opacity-50"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl rounded-bl-sm px-4 py-3 text-gray-500 dark:text-gray-300 shadow-sm">
                    <i className="fa-solid fa-circle-notch fa-spin mr-2" /> AI 正在分析教材数据...
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="p-4 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
              <div className="flex gap-3 items-end">
                <textarea
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={2}
                  placeholder="例如：帮我推荐一本操作系统教材；列出我发布的教材；删除我发布的《计算机网络（第7版）》"
                  className="flex-1 resize-none rounded-2xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="h-12 px-5 rounded-2xl bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  发送 <i className="fa-solid fa-paper-plane ml-1" />
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                删除教材属于写操作，后端会校验 JWT 登录态、本人教材权限和未完成订单，避免误删。
              </p>
            </form>
          </section>
        </section>
      </main>
      <Footer />
    </div>
  );
}
