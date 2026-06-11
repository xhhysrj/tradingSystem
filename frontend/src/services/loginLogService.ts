/**
 * 登录日志服务
 */
import { del, get, post } from './api';
import type { LoginLog } from '../types';

export interface LoginLogQueryParams {
  studentId?: string;
  userName?: string;
  loginStatus?: string;
  startDate?: string;
  endDate?: string;
  page: number;
  pageSize: number;
}

export interface LoginLogResponse {
  list: LoginLog[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * 获取登录日志列表（管理员）
 */
export async function getLoginLogs(params: LoginLogQueryParams): Promise<LoginLogResponse> {
  return get<LoginLogResponse>('/api/admin/logs/login', params);
}

export function deleteLoginLog(id: string): Promise<void> {
  return del(`/api/admin/logs/login/${id}`);
}

export function batchDeleteLoginLogs(ids: string[]): Promise<void> {
  return post('/api/admin/logs/login/batchDelete', { ids });
}
