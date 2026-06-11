/**
 * 文件上传服务
 */
import { upload } from './api';
import { API_BASE_URL } from './api';

// 上传响应
export interface UploadResponse {
  url: string;
  filename: string;
}

/**
 * 验证图片文件
 */
function validateImageFile(file: File): void {
  // 验证文件类型
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('只支持上传图片文件（jpg, jpeg, png, gif, bmp, webp）');
  }

  // 验证文件大小（最大5MB）
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error('文件大小不能超过5MB');
  }
}

/**
 * 上传图片
 */
export async function uploadImage(file: File): Promise<string> {
  // 前端验证
  validateImageFile(file);

  try {
    const response = await upload<UploadResponse>('/api/upload/image', file);
    // 返回完整URL
    return `${API_BASE_URL}${response.url}`;
  } catch (error: any) {
    console.error('图片上传失败:', error);
    throw new Error(error.message || '上传失败，请重试');
  }
}
