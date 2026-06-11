import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { ReviewCard } from '../components/ReviewCard';
import { Textbook, Review } from '../types';
import { toast } from 'sonner';
import { useAuth } from '../hooks/useAuth';
import { getTextbookDetail } from '../services/textbookService';
import { createOrder } from '../services/orderService';
import { getUserReviews, getUserReviewStats } from '../services/reviewService';
import { getTextbookImage } from '../lib/defaultImages';

export default function TextbookDetail() {
  const { id } = useParams<{ id: string }>();
  const [textbook, setTextbook] = useState<Textbook | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [meetingTime, setMeetingTime] = useState('');
  const [meetingLocation, setMeetingLocation] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [sellerReviews, setSellerReviews] = useState<Review[]>([]);
  const [sellerStats, setSellerStats] = useState({ averageRating: 0, reviewCount: 0 });
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    const loadTextbook = async () => {
      if (!id) return;

      setLoading(true);
      try {
        const data = await getTextbookDetail(id);
        setTextbook(data);

        // 加载卖家的评论和评分
        if (data.sellerId) {
          try {
            const [reviews, stats] = await Promise.all([
              getUserReviews(data.sellerId, 5), // 只显示最近5条评价
              getUserReviewStats(data.sellerId)
            ]);
            setSellerReviews(reviews);
            setSellerStats(stats);
          } catch (error) {
            console.error('加载卖家评价失败:', error);
          }
        }
      } catch (error) {
        console.error('加载教材详情失败:', error);
        setTextbook(null);
      } finally {
        setLoading(false);
      }
    };

    loadTextbook();
  }, [id]);

  // loading 状态下显示加载界面
  if (loading) {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
          <Navbar />
          <main className="flex-1 flex items-center justify-center py-8 px-4">
            <div className="text-center">
              <i className="fa-solid fa-circle-notch fa-spin text-blue-500 text-4xl mb-4"></i>
              <p className="text-gray-600 dark:text-gray-400">
                正在加载教材详情...
              </p>
            </div>
          </main>
          <Footer />
        </div>
    );
  }

  if (!textbook) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-8 px-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 text-center">
            <i className="fa-solid fa-exclamation-circle text-red-500 text-4xl mb-4"></i>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">教材不存在</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">您访问的教材不存在或已被删除</p>
            <button
              onClick={() => navigate('/textbooks')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              <i className="fa-solid fa-arrow-left mr-2"></i> 返回教材列表
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleStartTransaction = () => {
    if (isAdmin) return;
    // 未登录
    if (!isAuthenticated) {
      toast.warning('该操作需要先登录');
      setTimeout(() => navigate('/login'), 800);
      return;
    }

    setShowTransactionForm(true);
  };
  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? textbook.images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === textbook.images.length - 1 ? 0 : prev + 1));
  };
  const handleSubmitTransaction = async (e: React.FormEvent) => {

    if (isAdmin) {
      toast.error('管理员暂时无法发起交易');
      return;
    }

    e.preventDefault();

    if (!meetingTime || !meetingLocation || !contactPhone) {
      toast.error('请填写完整的交易信息');
      return;
    }

    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(contactPhone)) {
      toast.error('请输入正确的手机号格式');
      return;
    }

    try {
      await createOrder({
        textbookId: textbook!.id,
        meetingTime,
        meetingLocation,
        contactPhone
      });
      toast.success('交易申请已发送，请等待卖家确认');
      setShowTransactionForm(false);
      setMeetingTime('');
      setMeetingLocation('');
      setContactPhone('');
      navigate('/orders');
    } catch (error: any) {
      toast.error(error.message || '创建订单失败');
    }
  };



  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Navbar />

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* 返回按钮 */}
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center mb-6 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
          >
            <i className="fa-solid fa-arrow-left mr-2"></i> 返回
          </button>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
            {/* 教材图片 */}
            <div className="relative">
              <div className="h-80 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <img
                  src={
                    textbook.images && textbook.images.length > 0 && textbook.images[currentImageIndex]
                      ? textbook.images[currentImageIndex]
                      : getTextbookImage(textbook.images, textbook.id)
                  }
                  alt={`${textbook.title} - 图片 ${currentImageIndex + 1}`}
                  className="max-w-full max-h-full object-contain"
                />
              </div>

              {/* 图片导航，只有多张图片时显示 */}
              {textbook.images && textbook.images.length > 1 && textbook.images[0] && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center"
                  >
                    <i className="fa-solid fa-chevron-left"></i>
                  </button>

                  <button
                    onClick={handleNextImage}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center"
                  >
                    <i className="fa-solid fa-chevron-right"></i>
                  </button>

                  <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                    {textbook.images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-3 h-3 rounded-full ${
                          index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                        }`}
                      ></button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* 教材信息 */}
            <div className="p-6">
              <div className="flex flex-col md:flex-row md:items-start justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{textbook.title}</h1>
                  <p className="text-gray-600 dark:text-gray-300 mb-1">作者：{textbook.author}</p>
                  <div className="flex items-center">
                    {(() => {
                      const cond = textbook.bookCondition || textbook.condition || '';
                      return (
                        <span className={`px-3 py-1 rounded-full text-sm font-medium mr-2 ${
                          cond === '95新' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                          cond === '9新' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' :
                          cond === '8新' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' :
                          cond === '7新' ? 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200' :
                          'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                        }`}>
                          {cond}
                        </span>
                      );
                    })()}
                    <span className="text-gray-600 dark:text-gray-300">
                      发布于 {new Date(textbook.publishTime).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="mt-4 md:mt-0">
                  <span className={`text-3xl font-bold ${textbook.price === 0 ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'}`}>
                    {textbook.price === 0 ? '免费' : `¥${textbook.price}`}
                  </span>
                </div>
              </div>

              {/* 交易按钮 */}
              <div className="flex flex-wrap gap-3 mb-8">
                <button
                    onClick={handleStartTransaction}
                    disabled={isAdmin}
                    className={`px-4 py-2 rounded-md text-white ${
                        textbook.price === 0 ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
                    } ${isAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {textbook.price === 0 ? '免费领取' : '发起交易'}
                </button>
              </div>

              {/* 分隔线 */}
              <div className="border-t border-gray-200 dark:border-gray-700 my-6"></div>

              {/* 教材详情 */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">基本信息</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">适用课程</p>
                      <p className="text-gray-900 dark:text-white">{textbook.courseName} ({textbook.courseCode})</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">适用专业</p>
                      <p className="text-gray-900 dark:text-white">{textbook.applicableMajor}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">使用备注</h2>
                  <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    {textbook.notes || '暂无备注信息'}
                  </p>
                </div>

                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">卖家信息</h2>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-4">
                          <i className="fa-solid fa-user text-blue-600 dark:text-blue-400 text-xl"></i>
                        </div>
                        <div>
                          <p className="text-gray-900 dark:text-white font-medium">{textbook.sellerName}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{textbook.sellerGrade}级 {textbook.sellerMajor}</p>
                        </div>
                      </div>
                      {sellerStats.reviewCount > 0 && (
                        <div className="text-right">
                          <div className="flex items-center gap-1">
                            <i className="fa-solid fa-star text-yellow-400"></i>
                            <span className="text-lg font-bold text-gray-900 dark:text-white">
                              {sellerStats.averageRating.toFixed(1)}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {sellerStats.reviewCount} 条评价
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 卖家评价 */}
                {sellerReviews.length > 0 && (
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">卖家评价</h2>
                    <div className="space-y-3">
                      {sellerReviews.map((review) => (
                        <ReviewCard key={review.id} review={review} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 交易表单弹窗 */}
          {showTransactionForm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">发起线下交易</h3>
                    <button
                      onClick={() => setShowTransactionForm(false)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <i className="fa-solid fa-times"></i>
                    </button>
                  </div>

                  <form onSubmit={handleSubmitTransaction}>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">约定时间</label>
                      <input
                        type="text"
                        placeholder="例如：周一下午 3:00-3:30"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={meetingTime}
                        onChange={(e) => setMeetingTime(e.target.value)}
                        required
                      />
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">约定地点</label>
                      <input
                        type="text"
                        placeholder="例如：7号宿舍楼大厅"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={meetingLocation}
                        onChange={(e) => setMeetingLocation(e.target.value)}
                        required
                      />
                    </div>

                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">联系电话</label>
                      <input
                        type="tel"
                        placeholder="请输入您的手机号"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        maxLength={11}
                        required
                      />
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">用于卖家联系您，请填写真实手机号</p>
                    </div>

                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setShowTransactionForm(false)}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        取消
                      </button>

                      <button
                        type="submit"
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                      >
                        提交申请
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}