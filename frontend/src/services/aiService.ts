import { post } from './api';

export interface AiChatHistoryItem {
  role: 'user' | 'assistant';
  content: string;
}

export interface AiTextbookCard {
  id: string;
  title: string;
  author: string;
  courseName: string;
  courseCode: string;
  applicableMajor: string;
  price: number;
  bookCondition: string;
  status: string;
  sellerName: string;
  images?: string[];
  reason?: string;
  detailUrl?: string;
}

export interface AiChatRequest {
  message: string;
  conversationId?: string;
  history?: AiChatHistoryItem[];
}

export interface AiChatResponse {
  conversationId: string;
  intent: string;
  reply: string;
  actionStatus: string;
  remoteModelUsed: boolean;
  textbooks: AiTextbookCard[];
  suggestions: string[];
}

export async function chatWithAi(params: AiChatRequest): Promise<AiChatResponse> {
  return post<AiChatResponse>('/api/ai/chat', params);
}
