import { get, post } from './api';
import type { OrderReminder } from '../types';

export function sendOrderReminder(params: { orderId: string; content?: string }): Promise<void> {
    return post('/api/orders/reminders/send', params);
}

export function getUnreadOrderReminders(): Promise<OrderReminder[]> {
    return get<OrderReminder[]>('/api/orders/reminders/unread');
}

export function markOrderRemindersRead(ids: string[]): Promise<void> {
    return post('/api/orders/reminders/read', { ids });
}