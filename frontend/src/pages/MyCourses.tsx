import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Course, Textbook } from '../types';
import { toast } from 'sonner';
import { useAuth } from '../hooks/useAuth';
import { getUserCourses, addCourse, deleteCourse, getRecommendations } from '../services/courseService';
import { getTextbookImage } from '../lib/defaultImages';

export default function MyCourses() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [recommendedTextbooks, setRecommendedTextbooks] = useState<Textbook[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseCode, setNewCourseCode] = useState('');
  
  // 加载课程和推荐教材
  const loadData = async () => {
    try {
      const [coursesData, recommendations] = await Promise.all([
        getUserCourses(),
        getRecommendations()
      ]);
      setCourses(coursesData);
      
      // 将推荐教材合并为一个数组
      const allRecommended: Textbook[] = [];
      Object.values(recommendations).forEach(textbooks => {
        textbooks.forEach(textbook => {
          if (!allRecommended.find(t => t.id === textbook.id)) {
            allRecommended.push(textbook);
          }
        });
      });
      setRecommendedTextbooks(allRecommended);
    } catch (error: any) {
      console.error('加载数据失败:', error);
    }
  };
  
  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);
  
  // 检查用户是否已登录
  if (!isAuthenticated) {
    toast.error('请先登录');
    navigate('/login');
    return null;
  }
  
  // 添加新课程
  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newCourseName.trim() || !newCourseCode.trim()) {
      toast.error('请填写完整的课程信息');
      return;
    }
    
    try {
      await addCourse({ courseName: newCourseName, courseCode: newCourseCode });
      toast.success('课程添加成功');
      setShowAddForm(false);
      setNewCourseName('');
      setNewCourseCode('');
      // 重新加载数据
      loadData();
    } catch (error: any) {
      toast.error(error.message || '添加课程失败');
    }
  };
  
  // 删除课程
  const handleDeleteCourse = async (courseId: string) => {
    try {
      await deleteCourse(courseId);
      toast.success('课程已删除');
      // 重新加载数据
      loadData();
    } catch (error: any) {
      toast.error(error.message || '删除课程失败');
    }
  };
  
  // 跳转到教材详情
  const handleViewTextbook = (textbookId: string) => {
    navigate(`/textbook/${textbookId}`);
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">我的课程</h1>
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <i className="fa-solid fa-plus mr-2"></i> 添加课程
            </button>
          </div>
          
          {/* 我的课程列表 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">已添加课程</h2>
            
            {courses.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                      >
                        课程名称
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                      >
                        课程代码
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                      >
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {courses.map((course) => (
                      <tr key={course.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {course.courseName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                          {course.courseCode}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleDeleteCourse(course.id)}
                            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                          >
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
                  <i className="fa-solid fa-book-open text-gray-400 text-xl"></i>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">还没有添加课程</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">添加您的课程，系统将为您推荐相关教材</p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                  <i className="fa-solid fa-plus mr-2"></i> 添加课程
                </button>
              </div>
            )}
          </div>
          
          {/* 为您推荐 */}
          {recommendedTextbooks.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">为您推荐</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recommendedTextbooks.map((textbook) => (
                  <div
                    key={textbook.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleViewTextbook(textbook.id)}
                  >
                    <div className="flex items-center mb-3">
                      <div className="w-12 h-12 rounded-md overflow-hidden mr-3">
                        <img 
                          src={getTextbookImage(textbook.images, textbook.id)} 
                          alt={textbook.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 dark:text-white truncate">{textbook.title}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{textbook.courseName} ({textbook.courseCode})</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={`font-bold ${textbook.price === 0 ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'}`}>
                        {textbook.price === 0 ? '免费' : `¥${textbook.price}`}
                      </span>
                      {(() => {
                        const cond = textbook.bookCondition || textbook.condition || '';
                        return (
                          <span className={`text-xs px-2 py-1 rounded-full ${
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
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* 添加课程表单弹窗 */}
          {showAddForm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">添加课程</h3>
                    <button
                      onClick={() => setShowAddForm(false)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <i className="fa-solid fa-times"></i>
                    </button>
                  </div>
                  
                  <form onSubmit={handleAddCourse}>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">课程名称 <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        placeholder="例如：数据结构"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={newCourseName}
                        onChange={(e) => setNewCourseName(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">课程代码 <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        placeholder="例如：130101"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={newCourseCode}
                        onChange={(e) => setNewCourseCode(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setShowAddForm(false)}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        取消
                      </button>
                      
                      <button
                        type="submit"
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                      >
                        添加
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