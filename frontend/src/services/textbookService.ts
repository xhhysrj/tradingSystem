/**
 * 教材服务
 */
import { get, post } from './api';
import type { Textbook } from '../types';

// 发布教材参数
export interface PublishTextbookParams {
  title: string;
  author: string;
  courseName: string;
  courseCode: string;
  applicableMajor: string;
  price: number;
  condition: string;
  notes: string;
  images: string[];
}

// 搜索教材参数
export interface SearchTextbooksParams {
  keyword?: string;
  major?: string;
  grade?: string;
  priceRange?: string;
  condition?: string;
  sortBy?: string;
  page?: number;
  pageSize?: number;
}

// 分页响应
export interface PageResponse<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * 发布教材
 */
export async function publishTextbook(params: PublishTextbookParams): Promise<{ success: boolean; message: string; textbookId: string }> {
  return post('/api/textbooks/publish', params);
}

/**
 * 获取教材详情
 */
export async function getTextbookDetail(id: string): Promise<Textbook> {
  return get<Textbook>(`/api/textbooks/detail/${id}`);
}

/**
 * 获取我发布的教材列表
 */
export async function getMyTextbooks(): Promise<Textbook[]> {
  return get<Textbook[]>('/api/textbooks/my');
}

/**
 * 搜索教材
 */
export async function searchTextbooks(params: SearchTextbooksParams = {}): Promise<PageResponse<Textbook>> {
  return get<PageResponse<Textbook>>('/api/textbooks/list', params);
}

/**
 * 根据课程推荐教材
 */
export async function recommendTextbooks(courseCode: string, major: string): Promise<Textbook[]> {
  return get<Textbook[]>('/api/textbooks/recommend', { courseCode, major });
}

/**
 * 获取免费教材列表
 */
export async function getFreeTextbooks(limit: number = 10): Promise<Textbook[]> {
  return get<Textbook[]>('/api/textbooks/free', { limit });
}

/**
 * 删除教材
 */
export async function deleteTextbook(id: string) {
  return post(`/api/textbooks/delete/${id}`);
}