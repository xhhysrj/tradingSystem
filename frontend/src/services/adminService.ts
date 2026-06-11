/**
 * 管理员服务
 */
import { del, get, post } from './api';
import type { Textbook, User, UserChangeRequestView } from '../types';
import type { PageResponse } from './textbookService';

export interface ApproveUserParams {
  userId: string;
  approved: boolean;
  rejectionReason?: string;
}

export interface ApproveTextbookParams {
  textbookId: string;
  approved: boolean;
  approvalReason?: string;
}

export interface ReviewUserChangeRequestParams {
  requestId: string;
  approved: boolean;
  rejectionReason?: string;
}

export interface UpdateUserStatusParams {
  userId: string;
  status: 'normal' | 'frozen';
}

/**
 * 学生账号管理列表项
 */
export interface StudentAccount {
  id: string;
  name: string;
  studentId: string;
  phone: string;
  major: string;
  grade: string;
  role: string;
  status: 'normal' | 'frozen';
}

/**
 * 获取待审核用户列表
 */
export async function getPendingUsers(): Promise<User[]> {
  return get<User[]>('/api/admin/users/pending');
}

/**
 * 审核用户
 */
export async function approveUser(params: ApproveUserParams): Promise<void> {
  return post<void>('/api/admin/users/approve', params);
}

/**
 * 获取用户列表
 */
export async function getUserList(
    page = 1,
    pageSize = 10
): Promise<PageResponse<User>> {
  return get<PageResponse<User>>('/api/admin/users/list', { page, pageSize });
}

/**
 * 冻结/解冻用户
 */
export async function updateUserStatus(params: UpdateUserStatusParams): Promise<void> {
  return post<void>('/api/admin/users/status', params);
}

/**
 * 获取已审核通过的学生列表
 */
export async function getApprovedStudents(
    page = 1,
    pageSize = 10
): Promise<PageResponse<StudentAccount>> {
  return get<PageResponse<StudentAccount>>('/api/admin/users/students', {
    page,
    pageSize,
  });
}

/**
 * 注销用户
 */
export async function deleteUser(userId: string): Promise<void> {
  return del<void>(`/api/admin/users/${userId}`);
}

/**
 * 获取待审核教材列表
 */
export async function getPendingTextbooks(): Promise<Textbook[]> {
  return get<Textbook[]>('/api/admin/textbooks/pending');
}

/**
 * 审核教材
 */
export async function approveTextbook(params: ApproveTextbookParams): Promise<void> {
  return post<void>('/api/admin/textbooks/approve', params);
}

/**
 * 获取待审核的用户信息变更申请列表
 */
export async function getPendingUserChangeRequests(): Promise<UserChangeRequestView[]> {
  return get<UserChangeRequestView[]>('/api/admin/users/change/pending');
}

/**
 * 审核用户信息变更申请
 */
export async function reviewUserChangeRequest(
    params: ReviewUserChangeRequestParams
): Promise<void> {
  return post<void>('/api/admin/users/change/review', params);
}