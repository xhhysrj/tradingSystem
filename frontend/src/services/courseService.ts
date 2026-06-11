/**
 * 课程服务
 */
import { get, post, del } from './api';
import type { Course, Textbook } from '../types';

// 添加课程参数
export interface AddCourseParams {
  courseName: string;
  courseCode: string;
}

/**
 * 添加课程
 */
export async function addCourse(params: AddCourseParams): Promise<{ success: boolean; message: string; courseId: string }> {
  return post('/api/courses/add', params);
}

/**
 * 获取用户课程列表
 */
export async function getUserCourses(): Promise<Course[]> {
  return get<Course[]>('/api/courses/list');
}

/**
 * 删除课程
 */
export async function deleteCourse(id: string): Promise<void> {
  return del(`/api/courses/${id}`);
}

/**
 * 获取推荐教材（根据用户的所有课程）
 */
export async function getRecommendations(): Promise<Record<string, Textbook[]>> {
  return get<Record<string, Textbook[]>>('/api/courses/recommendations');
}
