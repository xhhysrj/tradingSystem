import { useState } from 'react';

export function Footer() {
  const [footerModal, setFooterModal] = useState<'help' | 'about' | 'contact' | null>(null);

  return (
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                © 2025 高校教材交易系统 - 让教材循环利用更简单
              </p>
            </div>
            <div className="flex space-x-6">
              <button
                  type="button"
                  onClick={() => setFooterModal('help')}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <span className="sr-only">使用帮助</span>
                <i className="fa-solid fa-question-circle"></i>
              </button>
              <button
                  type="button"
                  onClick={() => setFooterModal('about')}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <span className="sr-only">关于我们</span>
                <i className="fa-solid fa-info-circle"></i>
              </button>
              <button
                  type="button"
                  onClick={() => setFooterModal('contact')}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <span className="sr-only">联系管理员</span>
                <i className="fa-solid fa-headset"></i>
              </button>
            </div>
          </div>
        </div>

        {/* 页脚弹窗 */}
        {footerModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {footerModal === 'help' ? '使用帮助' : footerModal === 'about' ? '关于我们' : '联系管理员'}
                    </h3>
                    <button
                        type="button"
                        onClick={() => setFooterModal(null)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                      <i className="fa-solid fa-times text-xl"></i>
                    </button>
                  </div>

                  {footerModal === 'help' && (
                      <div className="space-y-4 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">快速上手</h4>
                          <ol className="list-decimal ml-5 mt-2 space-y-1">
                            <li>注册/登录：使用学号完成注册，并填写真实联系方式以便线下交易沟通。</li>
                            <li>浏览教材：在“教材列表”中按课程名、课程号、专业等条件筛选检索。</li>
                            <li>发布教材：进入“发布教材”，填写教材名称、作者、适用课程、价格、成色描述并上传图片。</li>
                            <li>下单预约：在教材详情页提交订单，约定见面时间与地点，完成线下交付与付款。</li>
                            <li>评价反馈：交易完成后可对对方进行评分与文字评价，帮助其他同学参考。</li>
                          </ol>
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">交易安全提示</h4>
                          <ul className="list-disc ml-5 mt-2 space-y-1">
                            <li>优先选择校园公共区域当面交易，现场检查版本、成色与附件后再付款。</li>
                            <li>警惕异常低价、反复改约等行为；必要时可取消订单并说明原因。</li>
                            <li>如遇纠纷，可保存订单信息，拍摄相关图片，并联系管理员协助处理。</li>
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">常见问题</h4>
                          <ul className="list-disc ml-5 mt-2 space-y-1">
                            <li><span className="font-medium">Q：忘记密码怎么办？</span> A：请联系管理员核验身份后重置密码。</li>
                            <li><span className="font-medium">Q：发布的教材为什么看不到？</span> A：教材发布可能需要管理员审核，通过后会在列表中展示。</li>
                            <li><span className="font-medium">Q：如何修改订单见面信息？</span> A：可取消当前订单并重新下单，或与对方协商后更新约定信息。</li>
                          </ul>
                        </div>
                      </div>
                  )}

                  {footerModal === 'about' && (
                      <div className="space-y-4 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                        <p>
                          「高校教材交易系统」是一套面向在校师生的教材循环利用平台，帮助同学们更便捷地发布闲置教材、寻找需要的课程资料，
                          通过校内线下交付完成交易，减少资源浪费。
                        </p>

                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">主要功能</h4>
                          <ul className="list-disc ml-5 mt-2 space-y-1">
                            <li>教材发布与图片展示：支持填写课程信息、成色说明与多图上传。</li>
                            <li>教材检索与详情：按课程/专业等条件筛选，展示卖家信息与教材详情。</li>
                            <li>订单与交易记录：下单预约见面时间/地点，记录订单状态与提醒。</li>
                            <li>评价体系：交易完成后可评分并填写评价内容。</li>
                            <li>管理员审核：对新发布教材与用户信息进行审核，维护平台秩序。</li>
                          </ul>
                        </div>

                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          本系统为我们大学内部使用，功能与文案将根据使用情况逐渐调整和完善。
                        </p>
                      </div>
                  )}

                  {footerModal === 'contact' && (
                      <div className="space-y-4 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                        <p>如在使用过程中遇到问题，您可以通过以下步骤联系平台管理员：</p>

                        <ul className="list-disc ml-5 mt-2 space-y-1">
                          <li>问题记录：在相关页面截图问题，并说明出现时间与操作步骤。</li>
                          <li>建议与投诉：如遇违规信息、欺诈等情况，请保留订单与相关证据，管理员将尽快处理。</li>
                          <li>联系渠道：可向班级/学院教材管理员反馈，或通过联系方式（13800000000）沟通。</li>
                        </ul>

                        <div className="bg-gray-50 dark:bg-gray-700/40 rounded-lg p-4">
                          <p className="font-medium text-gray-900 dark:text-white">建议您提供的信息</p>
                          <ul className="list-disc ml-5 mt-2 space-y-1">
                            <li>账号学号、问题页面、操作步骤与截图</li>
                            <li>发生时间、浏览器/设备信息</li>
                            <li>如涉及订单：订单号与对方账号信息</li>
                          </ul>
                        </div>
                      </div>
                  )}

                  <div className="mt-6 flex justify-end">
                    <button
                        type="button"
                        onClick={() => setFooterModal(null)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                    >
                      关闭
                    </button>
                  </div>
                </div>
              </div>
            </div>
        )}
      </footer>
  );
}