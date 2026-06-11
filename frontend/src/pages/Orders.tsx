import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { OrderCard } from '../components/OrderCard';
import { getBuyerOrders, getSellerOrders, confirmOrder, completeOrder, cancelOrder, deleteOrder} from '../services/orderService';
import { createReview, hasReviewed } from '../services/reviewService';
import { toast } from 'sonner';
import { useAuth } from '../hooks/useAuth';
import { getUnreadOrderReminders, markOrderRemindersRead, sendOrderReminder } from '../services/orderReminderService';
import { Order, OrderReminder } from '../types';
import {ConfirmModal} from "@/components/ConfirmModal.tsx";

export default function Orders() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'buyer' | 'seller'>('buyer');
  const [orders, setOrders] = useState<Order[]>([]);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [actionType, setActionType] = useState<'reject_order' | 'cancel_order'>('reject_order');
  const [selectedReason, setSelectedReason] = useState('');
  const [reviewedOrders, setReviewedOrders] = useState<Set<string>>(new Set());

  // 评价相关状态
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewOrderId, setReviewOrderId] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewContent, setReviewContent] = useState('');
  const [reviewAnonymous, setReviewAnonymous] = useState(false);

  // 提醒相关
  const [unreadReminders, setUnreadReminders] = useState<OrderReminder[]>([]);

  const loadUnreadReminders = async () => {
    try {
      const list = await getUnreadOrderReminders();
      setUnreadReminders(list || []);
    } catch (error: any) {
      setUnreadReminders([]);
    }
  };

  const formatReminderTime = (time: string) => {
    try {
      return new Date(time).toLocaleString();
    } catch {
      return time;
    }
  };

  const markRemindersRead = async (ids: string[]) => {
    try {
      await markOrderRemindersRead(ids);
      setUnreadReminders(prev => prev.filter(r => !ids.includes(r.id)));
      toast.success('已标记为已读');
    } catch (error: any) {
      toast.error(error.message || '操作失败');
    }
  };
  
  // 加载订单数据
  const loadOrders = async () => {
    try {
      let data: Order[];
      if (activeTab === 'buyer') {
        data = await getBuyerOrders(selectedStatus === 'all' ? undefined : selectedStatus);
      } else {
        data = await getSellerOrders(selectedStatus === 'all' ? undefined : selectedStatus);
      }
      setOrders(data);

      // 检查已完成订单是否已评价
      const completedOrders = data.filter(o => o.status === 'completed');
      const reviewChecks = await Promise.all(
        completedOrders.map(o => hasReviewed(o.id))
      );
      const reviewed = new Set<string>();
      completedOrders.forEach((o, index) => {
        if (reviewChecks[index]) {
          reviewed.add(o.id);
        }
      });
      setReviewedOrders(reviewed);
    } catch (error: any) {
      toast.error(error.message || '获取订单失败');
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadOrders();
      loadUnreadReminders();
    }
  }, [activeTab, selectedStatus, isAuthenticated]);
  
  useEffect(() => {
    // 应用状态筛选
    if (selectedStatus === 'all') {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter(order => order.status === selectedStatus));
    }
  }, [orders, selectedStatus]);
  
  // 检查用户是否已登录
  if (!isAuthenticated) {
    toast.error('请先登录');
    navigate('/login');
    return null;
  }
  
  // 处理订单操作
  const handleOrderAction = async (action: string, orderId: string) => {
    switch (action) {
      case 'view_textbook':
        // 查看教材详情
        const order = orders.find(o => o.id === orderId);
        if (order) {
          navigate(`/textbook/${order.textbookId}`);
        }
        break;

      case 'cancel_apply':
        // 取消申请（买家在待卖家确认状态下）
        await handleCancelOrder(orderId, '买家取消申请');
        break;

      case 'cancel_order':
        // 取消订单（买家在待见面状态下）
        setSelectedOrderId(orderId);
        setActionType('cancel_order');
        setShowReasonModal(true);
        break;

      case 'send_reminder':
        // 发送提醒
        try {
          await sendOrderReminder({ orderId });
          toast.success('提醒已发送');
        } catch (error: any) {
          toast.error(error.message || '发送提醒失败');
        }
        break;

      case 'confirm_receipt':
        // 确认收货（买家在待见面状态下）
        await handleCompleteOrder(orderId);
        break;

      case 'accept_order':
        // 同意交易（卖家在待确认状态下）
        await handleConfirmOrder(orderId, true);
        break;

      case 'reject_order':
        // 拒绝交易（卖家在待确认状态下）
        setSelectedOrderId(orderId);
        setActionType('reject_order');
        setShowReasonModal(true);
        break;

      case 'review':
        // 评价订单
        const reviewOrder = orders.find(o => o.id === orderId);
        if (reviewOrder) {
          setReviewOrderId(orderId);
          setShowReviewModal(true);
        }
        break;

      case 'confirm_delete_order':
        setPendingDeleteId(orderId);
        break;

      default:
        break;
    }
  };
  
  // 卖家确认订单
  const handleConfirmOrder = async (orderId: string, accept: boolean, rejectReason?: string) => {
    try {
      await confirmOrder({ orderId, accept, rejectReason });
      toast.success(accept ? '已同意交易，等待见面' : '已拒绝交易');
      loadOrders();
    } catch (error: any) {
      toast.error(error.message || '操作失败');
    }
  };
  
  // 买家确认收货
  const handleCompleteOrder = async (orderId: string) => {
    try {
      await completeOrder(orderId);
      toast.success('交易已完成');
      loadOrders();
    } catch (error: any) {
      toast.error(error.message || '操作失败');
    }
  };
  
  // 取消订单
  const handleCancelOrder = async (orderId: string, cancelReason?: string) => {
    try {
      await cancelOrder({ orderId, cancelReason });
      toast.success('订单已取消');
      loadOrders();
    } catch (error: any) {
      toast.error(error.message || '操作失败');
    }
  };
  
  // 提交拒绝/取消原因
  const submitReason = async () => {
    if (!selectedReason) {
      toast.error('请选择原因');
      return;
    }

    if (actionType === 'reject_order') {
      await handleConfirmOrder(selectedOrderId, false, selectedReason);
    } else {
      await handleCancelOrder(selectedOrderId, selectedReason);
    }

    // 关闭弹窗
    setShowReasonModal(false);
    setSelectedOrderId('');
    setSelectedReason('');
  };

  // 提交评价
  const submitReview = async () => {
    if (!reviewContent.trim()) {
      toast.error('请填写评价内容');
      return;
    }

    const reviewOrder = orders.find(o => o.id === reviewOrderId);
    if (!reviewOrder) {
      toast.error('订单不存在');
      return;
    }

    // 确定被评价人和评价类型
    const revieweeId = activeTab === 'buyer' ? reviewOrder.sellerId : reviewOrder.buyerId;
    const reviewType = activeTab === 'buyer' ? 'buyer_to_seller' : 'seller_to_buyer';

    try {
      await createReview({
        orderId: reviewOrderId,
        revieweeId,
        reviewType,
        rating: reviewRating,
        content: reviewContent,
        isAnonymous: reviewAnonymous
      });
      toast.success('评价成功');
      setShowReviewModal(false);
      setReviewOrderId('');
      setReviewRating(5);
      setReviewContent('');
      setReviewAnonymous(false);
      loadOrders(); // 重新加载订单列表
    } catch (error: any) {
      toast.error(error.message || '评价失败');
    }
  };
  
  // 获取状态筛选选项
  const getStatusOptions = () => {
    if (activeTab === 'buyer') {
      return [
        { value: 'all', label: '全部订单' },
        { value: 'waiting_seller_confirm', label: '待卖家确认' },
        { value: 'waiting_meeting', label: '待见面' },
        { value: 'completed', label: '已完成' },
        { value: 'cancelled', label: '已取消' }
      ];
    } else {
      return [
        { value: 'all', label: '全部订单' },
        { value: 'waiting_confirm', label: '待确认' },
        { value: 'waiting_meeting', label: '待见面' },
        { value: 'completed', label: '已完成' },
        { value: 'cancelled', label: '已取消' }
      ];
    }
  };
  
  // 获取拒绝/取消原因选项
  const getReasonOptions = () => {
    if (actionType === 'reject_order') {
      return [
        { value: '时间冲突', label: '时间冲突' },
        { value: '不想卖了', label: '不想卖了' },
        { value: '买家需求不符', label: '买家需求不符' }
      ];
    } else {
      return [
        { value: '教材与描述不符', label: '教材与描述不符' },
        { value: '存在缺页', label: '存在缺页' },
        { value: '其他', label: '其他' }
      ];
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">订单中心</h1>
          {/* 未读提醒列表 */}
          {unreadReminders.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">订单提醒</h2>
                  <button
                      onClick={() => markRemindersRead(unreadReminders.map(r => r.id))}
                      className="text-sm px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                  >
                    全部标记已读
                  </button>
                </div>

                <div className="space-y-3">
                  {unreadReminders.map((r) => (
                      <div key={r.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              来自 {r.senderName || '对方'} 的提醒
                              {r.textbookTitle ? `（《${r.textbookTitle}》）` : ''}
                            </div>
                            <div className="text-sm text-gray-700 dark:text-gray-300 mt-1">{r.content}</div>
                            <div className="text-xs text-gray-400 mt-2">{formatReminderTime(r.createdAt)}</div>
                          </div>

                          <button
                              onClick={() => markRemindersRead([r.id])}
                              className="text-sm px-3 py-2 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                          >
                            已读
                          </button>
                        </div>
                      </div>
                  ))}
                </div>
              </div>
          )}
          
          {/* 标签页切换 */}
          <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => {
                  setActiveTab('buyer');
                  setSelectedStatus('all');
                }}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'buyer'
                    ? 'border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
              >
                我买到的
              </button>
              <button
                onClick={() => {
                  setActiveTab('seller');
                  setSelectedStatus('all');
                }}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'seller'
                    ? 'border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
              >
                我卖出的
              </button>
            </nav>
          </div>
          
          {/* 状态筛选 */}
          <div className="mb-6 flex justify-between items-center">
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-3">筛选：</span>
              <select
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                {getStatusOptions().map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="text-sm text-gray-500 dark:text-gray-400">
              共 {filteredOrders.length} 个订单
            </div>
          </div>

          {/* 订单列表 */}
          {filteredOrders.length > 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden divide-y divide-gray-100 dark:divide-gray-700">
                {filteredOrders.map((order) => (
                    <OrderCard
                        key={order.id}
                        order={order}
                        isBuyer={activeTab === 'buyer'}
                        hasReviewed={reviewedOrders.has(order.id)}
                        onAction={handleOrderAction}
                    />
                ))}
              </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
                <i className="fa-solid fa-file-invoice text-gray-400 text-xl"></i>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">暂无订单</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {activeTab === 'buyer' 
                  ? '您还没有购买任何教材，去逛逛吧' 
                  : '您还没有卖出任何教材，去发布教材吧'
                }
              </p>
              <button
                onClick={() => navigate(activeTab === 'buyer' ? '/textbooks' : '/post')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                {activeTab === 'buyer' 
                  ? '浏览教材' 
                  : '发布教材'
                }
              </button>
            </div>
          )}
        </div>
        {pendingDeleteId && (
            <ConfirmModal
                title="删除确认"
                message="确定删除这条订单吗？操作不可撤销！"
                onCancel={() => setPendingDeleteId(null)}
                onConfirm={async () => {
                  try {
                    await deleteOrder(pendingDeleteId);
                    toast.success('订单已删除');
                    setOrders(prev => prev.filter(o => o.id !== pendingDeleteId));
                  } catch (e: any) {
                    toast.error(e.message || '删除失败');
                  } finally {
                    setPendingDeleteId(null);
                  }
                }}
            />
        )}
      </main>
      
      {/* 原因选择弹窗 */}
      {showReasonModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {actionType === 'reject_order' ? '拒绝交易' : '取消订单'}
                </h3>
                <button
                  onClick={() => {
                    setShowReasonModal(false);
                    setSelectedOrderId('');
                    setSelectedReason('');
                  }}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <i className="fa-solid fa-times"></i>
                </button>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  请选择{actionType === 'reject_order' ? '拒绝' : '取消'}原因
                </label>
                <div className="space-y-2">
                  {getReasonOptions().map((option) => (
                    <div
                      key={option.value}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedReason === option.value
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                      onClick={() => setSelectedReason(option.value)}
                    >
                      <div className="flex items-center">
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-2 ${
                          selectedReason === option.value
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}>
                          {selectedReason === option.value && (
                            <i className="fa-solid fa-check text-white text-xs"></i>
                          )}
                        </div>
                        <span className="text-gray-900 dark:text-white">{option.label}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowReasonModal(false);
                    setSelectedOrderId('');
                    setSelectedReason('');
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  取消
                </button>
                
                <button
                  onClick={submitReason}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  确认
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 评价弹窗 */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">评价订单</h3>
                <button
                  onClick={() => {
                    setShowReviewModal(false);
                    setReviewOrderId('');
                    setReviewRating(5);
                    setReviewContent('');
                    setReviewAnonymous(false);
                  }}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <i className="fa-solid fa-times"></i>
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  评分
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setReviewRating(star)}
                      className="text-3xl focus:outline-none"
                    >
                      <i
                        className={`fa-solid fa-star ${
                          star <= reviewRating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
                        }`}
                      ></i>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  评价内容
                </label>
                <textarea
                  placeholder="请输入评价内容..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  value={reviewContent}
                  onChange={(e) => setReviewContent(e.target.value)}
                  required
                />
              </div>

              <div className="mb-6">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reviewAnonymous}
                    onChange={(e) => setReviewAnonymous(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">匿名评价</span>
                </label>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowReviewModal(false);
                    setReviewOrderId('');
                    setReviewRating(5);
                    setReviewContent('');
                    setReviewAnonymous(false);
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  取消
                </button>

                <button
                  onClick={submitReview}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700"
                >
                  提交评价
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  );
}