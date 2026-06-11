import { useEffect, useMemo, useState } from 'react';
import { Order } from '../types';
import { getTextbookImage } from '../lib/defaultImages';
import { getTextbookDetail } from '../services/textbookService';

const coverUrlCache = new Map<string, string>();
const coverPromiseCache = new Map<string, Promise<string>>();

async function getCoverUrl(textbookId: string): Promise<string> {
  const cached = coverUrlCache.get(textbookId);
  if (cached) return cached;

  const inflight = coverPromiseCache.get(textbookId);
  if (inflight) return inflight;

  const p = getTextbookDetail(textbookId)
      .then((tb) => {
        const url = getTextbookImage(tb.images, tb.id);
        coverUrlCache.set(textbookId, url);
        return url;
      })
      .catch(() => {
        const url = getTextbookImage(undefined, textbookId);
        coverUrlCache.set(textbookId, url);
        return url;
      })
      .finally(() => {
        coverPromiseCache.delete(textbookId);
      });

  coverPromiseCache.set(textbookId, p);
  return p;
}

interface OrderCardProps {
  order: Order;
  isBuyer?: boolean;
  hasReviewed?: boolean;
  onAction?: (action: string, orderId: string, reason?: string) => void;
}

export function OrderCard({ order, isBuyer = true, hasReviewed = false, onAction }: OrderCardProps) {
  const getStatusInfo = () => {
    switch (order.status) {
      case 'waiting_seller_confirm':
        return {
          text: '待卖家确认',
          description: '已发起交易申请，待卖家响应',
          color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
        };
      case 'waiting_meeting':
        return {
          text: '待见面',

          description: isBuyer ? '卖家已同意，请按约定信息完成线下交易' : '你已同意交易，请按约定信息完成线下交易',
          color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
        };
      case 'completed':
        return {
          text: '已完成',
          description: isBuyer
              ? `交易完成，教材：《${order.textbookTitle}》，价格：${order.price === 0 ? '免费' : `¥${order.price}`}`
              : `交易完成，教材：《${order.textbookTitle}》，收款：${order.price === 0 ? '免费' : `¥${order.price}`}`,
          color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
        };
      case 'cancelled':
        return {
          text: '已取消',
          description: `订单已取消，原因：${order.cancelReason || '未知'}`,
          color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
        };
      default:
        return {
          text: '未知状态',
          description: '',
          color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
        };
    }
  };

  const statusInfo = getStatusInfo();

  const fallbackCoverUrl = useMemo(() => getTextbookImage(undefined, order.textbookId), [order.textbookId]);
  const [coverUrl, setCoverUrl] = useState<string>(() => coverUrlCache.get(order.textbookId) || fallbackCoverUrl);

  useEffect(() => {
    let cancelled = false;

    const cached = coverUrlCache.get(order.textbookId);
    if (cached) {
      setCoverUrl(cached);
      return;
    }
    setCoverUrl(fallbackCoverUrl);

    getCoverUrl(order.textbookId).then((url) => {
      if (!cancelled) setCoverUrl(url);
    });

    return () => {
      cancelled = true;
    };
  }, [order.textbookId, fallbackCoverUrl]);

  const priceText = order.price === 0 ? '免费' : `¥${order.price}`;
  const priceColor = order.price === 0 ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400';

  const metaItems: Array<{ icon: string; label: string; value: string }> = [];
  const pushMeta = (icon: string, label: string, value?: string | null) => {
    if (!value) return;
    metaItems.push({ icon, label, value });
  };

  if (order.status === 'waiting_seller_confirm') {
    pushMeta('fa-clock', '约定时间', order.meetingTime);
    pushMeta('fa-location-dot', '约定地点', order.meetingLocation);

    if (!isBuyer) {
      pushMeta('fa-user', '买家', `${order.buyerGrade}级 ${order.buyerMajor} ${order.buyerName}`);
    }
  }

  if (order.status === 'waiting_meeting') {
    pushMeta('fa-clock', '约定时间', order.meetingTime);
    pushMeta('fa-location-dot', '约定地点', order.meetingLocation);

    const counterpartLabel = isBuyer ? '卖家信息' : '买家信息';
    const counterpartValue = isBuyer
        ? `${order.sellerGrade}级 ${order.sellerMajor} ${order.sellerName}`
        : `${order.buyerGrade}级 ${order.buyerMajor} ${order.buyerName}`;
    pushMeta('fa-user', counterpartLabel, counterpartValue);

    pushMeta('fa-phone', '联系电话', isBuyer ? order.sellerPhone : order.buyerPhone);
  }

  return (
      <div className="p-4 sm:p-5 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* 左侧：封面  基本信息 */}
          <div className="flex flex-1 gap-4 min-w-0">

            <div className="flex-shrink-0">
              <div className="w-24 h-32 sm:w-28 sm:h-36 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 overflow-hidden flex items-center justify-center">
                <img
                    src={coverUrl}
                    alt={order.textbookTitle}
                    className="w-full h-full object-contain bg-white dark:bg-gray-700"
                    loading="lazy"
                />
              </div>
            </div>

            {/* 文本信息 */}
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white leading-snug break-words">
                    {order.textbookTitle}
                  </h3>

                  <div className={`mt-1 text-sm font-semibold ${priceColor}`}>
                    {isBuyer ? '价格：' : '收款：'}
                    {priceText}
                  </div>
                </div>

                <span className={`sm:hidden px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${statusInfo.color}`}>
                {statusInfo.text}
              </span>
              </div>

              {statusInfo.description && (
                  <p className="mt-3 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    {statusInfo.description}
                  </p>
              )}

              {metaItems.length > 0 && (
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
                    {metaItems.map((item, idx) => (
                        <div
                            key={`${item.label}-${idx}`}
                            className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300"
                        >
                          <i className={`fa-solid ${item.icon} mt-0.5 text-gray-400 dark:text-gray-500`}></i>
                          <p className="min-w-0">
                            <span className="text-gray-500 dark:text-gray-400">{item.label}：</span>
                            <span className="break-words">{item.value}</span>
                          </p>
                        </div>
                    ))}
                  </div>
              )}
            </div>
          </div>


          <div className="sm:w-64 flex-shrink-0 flex flex-col sm:items-end gap-3">
          <span className={`hidden sm:inline-flex px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap ${statusInfo.color}`}>
            {statusInfo.text}
          </span>

            <div className="flex flex-wrap gap-2 sm:justify-end">

              <button
                  onClick={() => onAction?.('view_textbook', order.id)}
                  className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                查看教材详情
              </button>

              {/* 根据订单状态显示不同操作按钮 */}
              {order.status === 'waiting_seller_confirm' && (
                  <>
                    {isBuyer ? (
                        <button
                            onClick={() => onAction?.('cancel_apply', order.id)}
                            className="px-4 py-2 text-sm font-medium rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                        >
                          取消申请
                        </button>
                    ) : (
                        <>
                          <button
                              onClick={() => onAction?.('accept_order', order.id)}
                              className="px-4 py-2 text-sm font-medium rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors"
                          >
                            同意交易
                          </button>
                          <button
                              onClick={() => onAction?.('reject_order', order.id)}
                              className="px-4 py-2 text-sm font-medium rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                          >
                            拒绝交易
                          </button>
                        </>
                    )}
                  </>
              )}

              {order.status === 'waiting_meeting' && (
                  <>
                    {isBuyer ? (
                        <>
                          <button
                              onClick={() => onAction?.('send_reminder', order.id)}
                              className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                          >
                            发送提醒
                          </button>
                          <button
                              onClick={() => onAction?.('confirm_receipt', order.id)}
                              className="px-4 py-2 text-sm font-medium rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors"
                          >
                            确认收货
                          </button>
                          <button
                              onClick={() => onAction?.('cancel_order', order.id)}
                              className="px-4 py-2 text-sm font-medium rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                          >
                            取消订单
                          </button>
                        </>
                    ) : (
                        <button
                            onClick={() => onAction?.('send_reminder', order.id)}
                            className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                        >
                          发送提醒
                        </button>
                    )}
                  </>
              )}

              {/* 已完成订单显示评价按钮 */}
              {order.status === 'completed' && !hasReviewed && (
                  <button
                      onClick={() => onAction?.('review', order.id)}
                      className="px-4 py-2 text-sm font-medium rounded-lg bg-purple-500 text-white hover:bg-purple-600 transition-colors"
                  >
                    评价订单
                  </button>
              )}

              {/* 已完成/已取消，订单显示删除按钮 */}
              {(order.status === 'completed' || order.status === 'cancelled') && (
                  <button
                      onClick={() => onAction?.('confirm_delete_order', order.id)}
                      className="px-4 py-2 text-sm font-medium rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                  >
                    删除订单
                  </button>
              )}
            </div>
          </div>
        </div>
      </div>
  );
}