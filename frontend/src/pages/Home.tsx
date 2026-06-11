import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { LatestReleaseSlider } from '../components/LatestReleaseSlider';
import { ScrollCarousel } from '../components/ScrollCarousel';
import { TextbookShowcaseCard } from '../components/TextbookShowcaseCard';
import { Textbook } from '../types';
import { useAuth } from '../hooks/useAuth';
import { getFreeTextbooks, searchTextbooks } from '../services/textbookService';

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [featuredTextbooks, setFeaturedTextbooks] = useState<Textbook[]>([]);
  const [latestTextbooks, setLatestTextbooks] = useState<Textbook[]>([]);
  const [freeTextbooks, setFreeTextbooks] = useState<Textbook[]>([]);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    const loadTextbooks = async () => {
      try {

        const result = await searchTextbooks({ page: 1, pageSize: 20 });
        const textbooks = result.list || [];

        const featured = textbooks
            .filter((textbook: Textbook) => {
              const cond = textbook.bookCondition || textbook.condition || '';
              return ['95新', '9新'].includes(cond);
            })
            .slice(0, 8);


        const latest = textbooks.slice(0, 10);

        setFeaturedTextbooks(featured);
        setLatestTextbooks(latest);

        const free = await getFreeTextbooks(10);
        setFreeTextbooks(free);
      } catch (error) {
        console.error('加载教材失败:', error);
      }
    };

    loadTextbooks();
  }, [isAdmin, navigate]);

  return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        <Navbar />

        <main className="flex-1">

          <section className="bg-gradient-to-r from-blue-600 to-indigo-700 py-16 px-4 sm:px-6 lg:px-8 text-white">
            <div className="max-w-7xl mx-auto text-center">
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl mb-6">
                让教材循环利用更简单
              </h1>
              <p className="max-w-2xl mx-auto text-xl mb-8 text-blue-100">
                高校教材交易系统，连接有需要的同学，让闲置教材发挥更大价值
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link
                    to="/textbooks"
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-full text-blue-700 bg-white hover:bg-blue-50 md:text-lg md:px-8"
                >
                  浏览教材 <i className="fa-solid fa-arrow-right ml-2"></i>
                </Link>
                <Link
                    to="/post"
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-full text-white bg-blue-800 hover:bg-blue-900 md:text-lg md:px-8"
                >
                  发布教材 <i className="fa-solid fa-plus ml-2"></i>
                </Link>
              </div>
            </div>
          </section>

          <section className="py-14 px-4 sm:px-6 lg:px-8 bg-gray-100/70 dark:bg-gray-800/40">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-end justify-between gap-4 mb-8">
                <div>
                  <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">精选教材</h2>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                    优先展示 95新 / 9新 的教材，欢迎同学们购买
                  </p>
                </div>

                <Link
                    to="/textbooks"
                    className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold text-gray-800 dark:text-gray-100 bg-white/70 dark:bg-gray-800/60 ring-1 ring-gray-200/70 dark:ring-gray-700 hover:bg-white dark:hover:bg-gray-800 transition-colors"
                >
                  查看全部 <i className="fa-solid fa-arrow-right text-xs opacity-80"></i>
                </Link>
              </div>

              <LatestReleaseSlider textbooks={featuredTextbooks} />
            </div>
          </section>


          <section className="py-14 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-end justify-between gap-4 mb-8">
                <div>
                  <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">最新发布</h2>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                    最新发布的教材，欢迎同学们购买
                  </p>
                </div>

                <Link
                    to="/textbooks"
                    className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold text-gray-800 dark:text-gray-100 bg-white/70 dark:bg-gray-800/60 ring-1 ring-gray-200/70 dark:ring-gray-700 hover:bg-white dark:hover:bg-gray-800 transition-colors"
                >
                  查看更多 <i className="fa-solid fa-arrow-right text-xs opacity-80"></i>
                </Link>
              </div>

              {latestTextbooks.length > 0 ? (
                  <ScrollCarousel>
                    {latestTextbooks.map((textbook) => (
                        <div key={textbook.id} className="snap-start shrink-0 w-64 sm:w-72 md:w-64 lg:w-60">
                          <TextbookShowcaseCard textbook={textbook} />
                        </div>
                    ))}
                  </ScrollCarousel>
              ) : (
                  <div className="py-12 text-center text-gray-500 dark:text-gray-400">暂无最新教材</div>
              )}
            </div>
          </section>

          <section className="py-14 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-end justify-between gap-4 mb-8">
                <div>
                  <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
                    <span className="text-emerald-600 dark:text-emerald-400">免费</span> 赠送
                  </h2>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                    0 元领取，同学们按需自取，尽量别浪费
                  </p>
                </div>

                <Link
                    to="/textbooks?price=0"
                    className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold text-gray-800 dark:text-gray-100 bg-white/70 dark:bg-gray-800/60 ring-1 ring-gray-200/70 dark:ring-gray-700 hover:bg-white dark:hover:bg-gray-800 transition-colors"
                >
                  查看全部 <i className="fa-solid fa-arrow-right text-xs opacity-80"></i>
                </Link>
              </div>

              {freeTextbooks.length > 0 ? (
                  <ScrollCarousel>
                    {freeTextbooks.map((textbook) => (
                        <div key={textbook.id} className="snap-start shrink-0 w-64 sm:w-72 md:w-64 lg:w-60">
                          <TextbookShowcaseCard textbook={textbook} forceFree />
                        </div>
                    ))}
                  </ScrollCarousel>
              ) : (
                  <div className="py-12 text-center text-gray-500 dark:text-gray-400">暂无免费教材</div>
              )}
            </div>
          </section>


          <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-100 dark:bg-gray-800">
            <div className="max-w-7xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12">系统特色</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white dark:bg-gray-700 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
                  <div className="w-16 h-16 mx-auto bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-6">
                    <i className="fa-solid fa-book-open text-blue-600 dark:text-blue-400 text-2xl"></i>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">便捷发布</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    简单几步，轻松发布闲置教材，填写详细信息，上传照片，等待审核通过即可。
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-700 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
                  <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-6">
                    <i className="fa-solid fa-magic text-green-600 dark:text-green-400 text-2xl"></i>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">智能匹配</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    根据您的课程自动匹配适合的教材，精准推荐，节省您的时间和精力。
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-700 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
                  <div className="w-16 h-16 mx-auto bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mb-6">
                    <i className="fa-solid fa-handshake text-purple-600 dark:text-purple-400 text-2xl"></i>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">安全交易</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    全线下交易流程，系统记录交易过程，保障双方权益，让交易更安全。
                  </p>
                </div>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
  );
}