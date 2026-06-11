// 教材类型定义
export interface Textbook {
  id: string;
  title: string;
  author: string;
  courseName: string;
  courseCode: string;
  applicableMajor: string;
  price: number;
  condition?: string;
  bookCondition?: string;  // 后端返回的字段名
  notes: string;
  images: string[];
  sellerId: string;
  sellerName: string;
  sellerMajor: string;
  sellerGrade: string;
  publishTime: string;
  status: 'pending' | 'approved' | 'rejected' | 'sold';
  approvalReason?: string;
}

// 订单类型定义
export interface Order {
  id: string;
  textbookId: string;
  textbookTitle: string;
  buyerId: string;
  buyerName: string;
  buyerPhone: string;
  buyerMajor: string;
  buyerGrade: string;
  sellerId: string;
  sellerName: string;
  sellerPhone: string;
  sellerMajor: string;
  sellerGrade: string;
  price: number;
  meetingTime: string;
  meetingLocation: string;
  status: 'waiting_seller_confirm' | 'waiting_meeting' | 'completed' | 'cancelled';
  cancelReason?: string;
  createdAt: string;
}

//消息提醒的定义
export interface OrderReminder {
  id: string;
  orderId: string;
  senderId: string;
  receiverId: string;
  content: string;
  isRead: boolean;
  createdAt: string;

  textbookTitle?: string;
  senderName?: string;
}


// 用户类型定义
export interface User {
  id: string;
  studentId: string;
  name: string;
  phone: string;
  major: string;
  grade: string;
  role: 'student' | 'admin';
  status: 'normal' | 'frozen';
  approvalStatus: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
}


export interface UserChangeRequest {
  id: string;
  userId: string;
  phone?: string;
  major?: string;
  grade?: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserChangeRequestView {
  requestId: string;
  userId: string;
  studentId: string;
  name: string;

  currentPhone: string;
  currentMajor: string;
  currentGrade: string;

  newPhone?: string;
  newMajor?: string;
  newGrade?: string;

  passwordChanged: boolean;

  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;

  createdAt: string;
  updatedAt: string;
}

// 课程类型定义
export interface Course {
  id: string;
  courseName: string;
  courseCode: string;
  userId: string;
  createdAt?: string;
}

// 评价类型定义
export interface Review {
  id: string;
  orderId: string;
  textbookId: string;
  reviewerId: string;
  reviewerName: string;
  revieweeId: string;
  revieweeName: string;
  reviewType: 'buyer_to_seller' | 'seller_to_buyer';
  rating: number;
  content: string;
  isAnonymous: boolean;
  createdAt: string;
}

// 登录日志类型定义
export interface LoginLog {
  id: string;
  userId: string;
  studentId: string;
  userName: string;
  userRole: 'student' | 'admin';
  loginIp: string;
  loginTime: string;
  userAgent: string;
  loginStatus: 'success' | 'failed';
  failureReason?: string;
}