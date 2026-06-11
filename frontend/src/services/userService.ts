import { get, post } from './api';
import type { UserChangeRequest } from '../types';

export interface SubmitChangeRequestParams {
    phone?: string;
    major?: string;
    grade?: string;
    newPassword?: string;
    confirmPassword?: string;
}

/**
 * 学生提交信息变更申请（需要登录）
 */
export async function submitChangeRequest(params: SubmitChangeRequestParams): Promise<void> {
    return post('/api/user/change-request', params);
}

/**
 * 获取我的最新一条信息变更申请（需要登录）
 */
export async function getMyLatestChangeRequest(): Promise<UserChangeRequest | null> {
    return get<UserChangeRequest | null>('/api/user/change-request/latest');
}