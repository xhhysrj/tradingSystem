/**
 * 评价服务
 */
import { get, post } from './api';
import type { Review } from '../types';

// 创建评价参数
export interface CreateReviewParams {
  orderId: string;
  revieweeId: string;
  reviewType: 'buyer_to_seller' | 'seller_to_buyer';
  rating: number;
  content: string;
  isAnonymous?: boolean;
}

// 评价统计
export interface ReviewStats {
  averageRating: number;
  reviewCount: number;
}

/**
 * 创建评价
 */
export async function createReview(params: CreateReviewParams): Promise<{ success: boolean; message: string }> {
  return post('/api/reviews/create', params);
}

/**
 * 获取订单的评价列表
 */
export async function getOrderReviews(orderId: string): Promise<Review[]> {
  return get<Review[]>(`/api/reviews/order/${orderId}`);
}

/**
 * 获取用户收到的评价列表
 */
export async function getUserReviews(userId: string, limit?: number): Promise<Review[]> {
  const params = limit ? { limit } : {};
  return get<Review[]>(`/api/reviews/user/${userId}`, params);
}

/**
 * 获取用户的评价统计信息
 */
export async function getUserReviewStats(userId: string): Promise<ReviewStats> {
  return get<ReviewStats>(`/api/reviews/user/${userId}/stats`);
}

/**
 * 检查用户是否已评价某订单
 */
export async function hasReviewed(orderId: string): Promise<boolean> {
  return get<boolean>('/api/reviews/check', { orderId });
}

/**
 * 根据教材ID获取卖家的评价
 */
export async function getTextbookReviews(textbookId: string): Promise<Review[]> {
  return get<Review[]>(`/api/reviews/textbook/${textbookId}`);
}
