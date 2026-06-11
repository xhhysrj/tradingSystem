/**
 * 认证服务
 */
import { get, post } from './api';
import type { User } from '../types';

// 登录请求参数
export interface LoginParams {
  studentId: string;
  password: string;
}

// 登录响应
export interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  user: User;
}

// 注册请求参数
export interface RegisterParams {
  studentId: string;
  password: string;
  name: string;
  phone: string;
  major: string;
  grade: string;
}

/**
 * 用户登录
 */
export async function login(params: LoginParams): Promise<LoginResponse> {
  return post<LoginResponse>('/api/auth/login', params);
}

/**
 * 用户注册
 */
export async function register(params: RegisterParams): Promise<void> {
  return post('/api/auth/register', params);
}

/**
 * 获取当前用户信息
 */
export async function getCurrentUser(): Promise<User> {
  return get<User>('/api/auth/current');
}

/**
 * 退出登录
 */
export function logout() {
  localStorage.clear();
  window.location.href = '/login';
}
