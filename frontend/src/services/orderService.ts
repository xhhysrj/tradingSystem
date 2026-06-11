/**
 * 订单服务
 */
import { del, get, post } from './api';
import type { Order } from '../types';

// 创建订单参数
export interface CreateOrderParams {
  textbookId: string;
  meetingTime: string;
  meetingLocation: string;
  contactPhone: string;
}

// 确认订单参数
export interface ConfirmOrderParams {
  orderId: string;
  accept: boolean;
  rejectReason?: string;
}

// 取消订单参数
export interface CancelOrderParams {
  orderId: string;
  cancelReason?: string;
}

/**
 * 发起交易（创建订单）
 */
export async function createOrder(params: CreateOrderParams): Promise<{ success: boolean; message: string; orderId: string }> {
  return post('/api/orders/create', params);
}

/**
 * 卖家确认订单
 */
export async function confirmOrder(params: ConfirmOrderParams): Promise<void> {
  return post('/api/orders/confirm', params);
}

/**
 * 确认收货（完成订单）
 */
export async function completeOrder(orderId: string): Promise<void> {
  return post('/api/orders/complete', { orderId });
}

/**
 * 取消订单
 */
export async function cancelOrder(params: CancelOrderParams): Promise<void> {
  return post('/api/orders/cancel', params);
}

/**
 * 获取买家订单列表
 */
export async function getBuyerOrders(status?: string): Promise<Order[]> {
  return get<Order[]>('/api/orders/buyer', { status });
}

/**
 * 获取卖家订单列表
 */
export async function getSellerOrders(status?: string): Promise<Order[]> {
  return get<Order[]>('/api/orders/seller', { status });
}

/**
 * 获取订单详情
 */
export async function getOrderDetail(id: string): Promise<Order> {
  return get<Order>(`/api/orders/${id}`);
}

/**
 * 删除订单
 */
export function deleteOrder(orderId: string): Promise<void> {
  return del(`/api/orders/${orderId}`);
}