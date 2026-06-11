import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { toast } from 'sonner';
import { useAuth } from '../hooks/useAuth';
import { publishTextbook } from '../services/textbookService';
import { uploadImage } from '../services/uploadService';

export default function PostTextbook() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const isAdmin = user?.role === 'admin';
  const hasLocalSession = Boolean(localStorage.getItem('userId') && localStorage.getItem('userRole'));
  const isAuthLoading = !isAuthenticated && hasLocalSession;

  // 表单状态
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [courseName, setCourseName] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [applicableMajor, setApplicableMajor] = useState('');
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState('95新');
  const [notes, setNotes] = useState('');
  const [images, setImages] = useState<string[]>([]);

  // 图片上传相关
  const coverImageInputRef = useRef<HTMLInputElement>(null);
  const pageImageInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  /*模拟用户信息
  const currentUser = {
    id: localStorage.getItem('userId') || '1',
    name: localStorage.getItem('userName') || '张三',
    major: localStorage.getItem('userMajor') || '计算机科学与技术',
    grade: localStorage.getItem('userGrade') || '2023'
  };
  */

  // 未登录,跳转登录页
  useEffect(() => {
    if (!isAuthenticated && !isAuthLoading) {
      toast.error('请先登录', { id: 'posttextbook-login-required', duration: 800 });
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, isAuthLoading, navigate]);

  // 管理员,跳转首页
  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      toast.error('管理员暂时不支持发布教材', { id: 'posttextbook-admin-block', duration: 800 });
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, isAdmin, navigate]);

  // 跳转中占位，避免空白页
  if (isAuthLoading || !isAuthenticated || isAdmin) {
    return (
        <div className="min-h-screen flex items-center justify-center text-gray-500 dark:text-gray-400">
          正在跳转...
        </div>
    );
  }

  // 管理员暂时不可以发布教材
  if (user?.role === 'admin') {
    toast.error('管理员暂时不支持发布教材');
    navigate('/admin/textbooks');
    return null;
  }
  
  // 处理封面图片上传
  const handleCoverImageUpload = () => {
    if (coverImageInputRef.current) {
      coverImageInputRef.current.click();
    }
  };
  
  // 处理内页图片上传
  const handlePageImageUpload = () => {
    if (pageImageInputRef.current) {
      pageImageInputRef.current.click();
    }
  };
  
  // 处理图片选择
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>, type: 'cover' | 'page') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // 调用真实的上传接口
      const imageUrl = await uploadImage(file);

      if (type === 'cover') {
        setImages(prev => [imageUrl, ...prev.slice(1)]);
      } else {
        setImages(prev => prev.length > 0 ? [prev[0], imageUrl] : ['', imageUrl]);
      }

      toast.success(`${type === 'cover' ? '封面' : '内页'}图片上传成功`);
    } catch (error: any) {
      toast.error(error.message || '图片上传失败');
    } finally {
      setIsUploading(false);
      // 重置input以允许再次上传同一文件
      e.target.value = '';
    }
  };
  
  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 管理员二次拦截
    if (isAdmin) {
      toast.error('管理员暂时不支持发布教材', { id: 'posttextbook-admin-block', duration: 800});
      return;
    }
    // 表单验证
    if (!title.trim()) {
      toast.error('请输入书名');
      return;
    }

    if (!author.trim()) {
      toast.error('请输入作者');
      return;
    }

    if (!courseName.trim()) {
      toast.error('请输入适用课程名称');
      return;
    }

    if (!courseCode.trim()) {
      toast.error('请输入课程代码');
      return;
    }

    if (!applicableMajor.trim()) {
      toast.error('请输入适用专业');
      return;
    }

    if (price === '' || isNaN(Number(price)) || Number(price) < 0) {
      toast.error('请输入有效的价格');
      return;
    }

    // 图片验证
    if (images.length === 0) {
      toast.error('请至少上传一张封面图片');
      return;
    }

    if (images.filter(img => img).length < 2) {
      toast.error('请上传封面图片和内页图片');
      return;
    }

    // 提交表单
    setIsSubmitting(true);

    try {
      await publishTextbook({
        title: title.trim(),
        author: author.trim(),
        courseName: courseName.trim(),
        courseCode: courseCode.trim(),
        applicableMajor: applicableMajor.trim(),
        price: Number(price),
        condition: condition,
        notes: notes.trim(),
        images: images
      });

      toast.success('教材发布成功，请等待审核');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || '发布失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">发布闲置教材</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">填写教材详细信息，帮助更多同学找到需要的教材</p>
          
          <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            {/* 基本信息 */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">基本信息</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">书名 <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="请输入教材名称"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">作者 <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="请输入作者姓名"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">适用课程名称 <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={courseName}
                    onChange={(e) => setCourseName(e.target.value)}
                    placeholder="例如：数据结构"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">课程代码 <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={courseCode}
                    onChange={(e) => setCourseCode(e.target.value)}
                    placeholder="例如：130101"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">适用专业 <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={applicableMajor}
                    onChange={(e) => setApplicableMajor(e.target.value)}
                    placeholder="例如：计算机科学与技术"
                  />
                </div>
              </div>
            </div>
            
            {/* 交易信息 */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">交易信息</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">价格（元） <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">¥</span>
                    <input
                      type="number"
                      className="w-full pl-8 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="0（免费赠送）"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">新旧程度 <span className="text-red-500">*</span></label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                  >
                    <option value="95新">95新</option>
                    <option value="9新">9新</option>
                    <option value="8新">8新</option>
                    <option value="7新">7新</option>
                    <option value="7新以下">7新以下</option>
                  </select>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">使用备注</label>
                <textarea
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="描述教材的使用情况，如：重点章节有笔记、无缺页但封面有轻微折痕等"
                ></textarea>
              </div>
            </div>
            
            {/* 图片上传 */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">上传图片 <span className="text-red-500">*</span></h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">请上传1张封面图片和1张内页图片，用于展示教材的新旧程度</p>

              {isUploading && (
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg flex items-center">
                  <i className="fa-solid fa-spinner fa-spin text-blue-600 dark:text-blue-400 mr-2"></i>
                  <span className="text-sm text-blue-700 dark:text-blue-300">正在上传图片...</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  onClick={isUploading ? undefined : handleCoverImageUpload}
                  className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                    isUploading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700'
                  } ${
                    images.length > 0 && images[0] ? 'border-green-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                >
                  {images.length > 0 && images[0] ? (
                    <div className="relative">
                      <img
                        src={images[0]}
                        alt="教材封面"
                        className="w-full h-40 object-cover rounded"
                      />
                      <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                        封面图片
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-2">
                        <i className="fa-solid fa-camera text-gray-400 text-xl"></i>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">点击上传封面图片</p>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    ref={coverImageInputRef}
                    onChange={(e) => handleImageSelect(e, 'cover')}
                    className="hidden"
                    disabled={isUploading}
                  />
                </div>

                <div
                  onClick={isUploading ? undefined : handlePageImageUpload}
                  className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                    isUploading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700'
                  } ${
                    images.length > 1 && images[1] ? 'border-green-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                >
                  {images.length > 1 && images[1] ? (
                    <div className="relative">
                      <img
                        src={images[1]}
                        alt="教材内页"
                        className="w-full h-40 object-cover rounded"
                      />
                      <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                        内页图片
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-2">
                        <i className="fa-solid fa-book-open text-gray-400 text-xl"></i>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">点击上传内页图片</p>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    ref={pageImageInputRef}
                    onChange={(e) => handleImageSelect(e, 'page')}
                    className="hidden"
                    disabled={isUploading}
                  />
                </div>
              </div>
            </div>
            
            {/* 交易方式 */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">交易方式</h2>
              <div className="flex items-center">
                <div className="flex items-center h-5">
                  <input
                    id="offline"
                    name="transactionMethod"
                    type="radio"
                    checked
                    disabled
                    className="w-4 h-4 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-600 focus:ring-2"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="offline" className="font-medium text-gray-700 dark:text-gray-300">线下交易</label>
                  <p className="text-gray-500 dark:text-gray-400">系统仅支持线下交易，交易双方需约定时间地点见面完成交易</p>
                </div>
              </div>
            </div>
            
            {/* 提交按钮 */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                取消
              </button>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {isSubmitting ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin mr-2"></i> 提交中...
                  </>
                ) : (
                  '发布教材'
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}