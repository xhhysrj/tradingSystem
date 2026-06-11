import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { TextbookCard } from '../components/TextbookCard';
import { Textbook } from '../types';
import { Empty } from '../components/Empty';
import { searchTextbooks } from '../services/textbookService';

export default function TextbooksList() {
  const [textbooks, setTextbooks] = useState<Textbook[]>([]);
  const [filteredTextbooks, setFilteredTextbooks] = useState<Textbook[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  
  // 筛选条件
  const [searchTerm, setSearchTerm] = useState('');
  const [major, setMajor] = useState('');
  const [grade, setGrade] = useState('');
  const [priceRange, setPriceRange] = useState<string>('all');
  const [condition, setCondition] = useState<string>('all');
  
  // 排序方式
  const [sortBy, setSortBy] = useState<string>('publishTime');
  
  // 打开/关闭筛选面板
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);

  useEffect(() => {
    //  加载教材列表
    const loadTextbooks = async () => {
      try {
        const result = await searchTextbooks({ page: 1, pageSize: 100 });
        setTextbooks(result.list || []);
      } catch (error) {
        console.error('加载教材失败:', error);
      }
    };
    loadTextbooks();
    
    // 从URL参数中加载筛选条件
    const search = searchParams.get('search');
    const majorParam = searchParams.get('major');
    const gradeParam = searchParams.get('grade');
    const priceParam = searchParams.get('price');
    const conditionParam = searchParams.get('condition');
    
    if (search) setSearchTerm(search);
    if (majorParam) setMajor(majorParam);
    if (gradeParam) setGrade(gradeParam);
    if (priceParam) setPriceRange(priceParam);
    if (conditionParam) setCondition(conditionParam);
  }, [searchParams]);

  useEffect(() => {
    // 应用筛选
    let result = [...textbooks];
    
    // 搜索关键词筛选
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(textbook => 
        textbook.title.toLowerCase().includes(term) ||
        textbook.author.toLowerCase().includes(term) ||
        textbook.courseName.toLowerCase().includes(term) ||
        textbook.courseCode.toLowerCase().includes(term) ||
        textbook.applicableMajor.toLowerCase().includes(term)
      );
    }
    
    // 专业筛选
    if (major) {
      result = result.filter(textbook => textbook.applicableMajor.includes(major));
    }
    
    // 年级筛选
    if (grade) {
      result = result.filter(textbook => textbook.sellerGrade === grade);
    }
    
    // 价格筛选
    if (priceRange === '0') {
      result = result.filter(textbook => textbook.price === 0);
    } else if (priceRange === '1-50') {
      result = result.filter(textbook => textbook.price > 0 && textbook.price <= 50);
    } else if (priceRange === '50-100') {
      result = result.filter(textbook => textbook.price > 50 && textbook.price <= 100);
    } else if (priceRange === '100+') {
      result = result.filter(textbook => textbook.price > 100);
    }
    
    // 新旧程度筛选
    if (condition !== 'all') {
      result = result.filter(textbook => (textbook.bookCondition || textbook.condition) === condition);
    }
    
    // 排序
    if (sortBy === 'publishTime') {
      result.sort((a, b) => new Date(b.publishTime).getTime() - new Date(a.publishTime).getTime());
    } else if (sortBy === 'priceAsc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'priceDesc') {
      result.sort((a, b) => b.price - a.price);
    }
    
    setFilteredTextbooks(result);
    
    // 更新URL参数
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (major) params.set('major', major);
    if (grade) params.set('grade', grade);
    if (priceRange !== 'all') params.set('price', priceRange);
    if (condition !== 'all') params.set('condition', condition);
    setSearchParams(params, { replace: true });
  }, [textbooks, searchTerm, major, grade, priceRange, condition, sortBy, setSearchParams]);

  // 清空筛选条件
  const clearFilters = () => {
    setSearchTerm('');
    setMajor('');
    setGrade('');
    setPriceRange('all');
    setCondition('all');
    setSortBy('publishTime');
    setSearchParams({}, { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">教材列表</h1>
          
          {/* 搜索和筛选栏 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <i className="fa-solid fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                <input
                  type="text"
                  placeholder="搜索教材名称、作者、课程名、课程代码或专业..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setFilterPanelOpen(!filterPanelOpen)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <i className="fa-solid fa-filter mr-2"></i> 筛选
                </button>
                
                <select
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="publishTime">最新发布</option>
                  <option value="priceAsc">价格从低到高</option>
                  <option value="priceDesc">价格从高到低</option>
                </select>
              </div>
            </div>
            
            {/* 筛选面板 */}
            {filterPanelOpen && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">适用专业</label>
                  <input
                    type="text"
                    placeholder="输入专业名称..."
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={major}
                    onChange={(e) => setMajor(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">发布者年级</label>
                  <input
                    type="text"
                    placeholder="输入年级，如“2024”"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">价格区间</label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value)}
                  >
                    <option value="all">全部价格</option>
                    <option value="0">免费</option>
                    <option value="1-50">1-50元</option>
                    <option value="50-100">50-100元</option>
                    <option value="100+">100元以上</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">新旧程度</label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                  >
                    <option value="all">全部新旧程度</option>
                    <option value="95新">95新</option>
                    <option value="9新">9新</option>
                    <option value="8新">8新</option>
                    <option value="7新">7新</option>
                    <option value="7新以下">7新以下</option>
                  </select>
                </div>
                
                <div className="md:col-span-4 flex justify-end">
                  <button
                    onClick={clearFilters}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 mr-2"
                  >
                    <i className="fa-solid fa-times mr-2"></i> 清空筛选
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* 教材列表 */}
          {filteredTextbooks.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {filteredTextbooks.map((textbook) => (
                <TextbookCard key={textbook.id} textbook={textbook} />
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-12 text-center">
              <Empty />
              <p className="text-gray-500 dark:text-gray-400 mt-2">没有找到符合条件的教材</p>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}