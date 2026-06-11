import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { toast } from 'sonner';
import { register } from '../services/authService';

export default function Register() {
  const [studentId, setStudentId] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [major, setMajor] = useState('');
  const [grade, setGrade] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [policyModal, setPolicyModal] = useState<'terms' | 'privacy' | null>(null);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 表单验证
    if (!studentId.trim() || !name.trim() || !phone.trim() || !major.trim() || !grade.trim() || !password || !confirmPassword) {
      toast.error('请填写完整的注册信息');
      return;
    }

    // 手机号格式验证
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      toast.error('请输入正确的手机号');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('两次输入的密码不一致');
      return;
    }

    if (password.length < 6) {
      toast.error('密码长度至少为6位');
      return;
    }

    setIsSubmitting(true);

    try {
      await register({
        studentId,
        name,
        phone,
        major,
        grade,
        password
      });

      toast.success('注册成功，请登录');
      navigate('/login');
    } catch (error: any) {
      toast.error(error?.message || '注册失败，请稍后重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        <Navbar />

        <main className="flex-grow py-12">
          <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                注册账号
              </h2>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                请填写您的个人信息完成注册
              </p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    学号 <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i className="fa-solid fa-id-card text-gray-400"></i>
                    </div>
                    <input
                        type="text"
                        value={studentId}
                        onChange={(e) => setStudentId(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="请输入学号"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    姓名 <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i className="fa-solid fa-user text-gray-400"></i>
                    </div>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="请输入姓名"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    手机号 <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i className="fa-solid fa-phone text-gray-400"></i>
                    </div>
                    <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="请输入手机号（用于线下交易联系）"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      专业 <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i className="fa-solid fa-graduation-cap text-gray-400"></i>
                      </div>
                      <input
                          type="text"
                          value={major}
                          onChange={(e) => setMajor(e.target.value)}
                          className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                          placeholder="请输入专业"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      年级 <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i className="fa-solid fa-calendar text-gray-400"></i>
                      </div>
                      <select
                          value={grade}
                          onChange={(e) => setGrade(e.target.value)}
                          className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="">请选择年级</option>
                        <option value="2025">2025级</option>
                        <option value="2024">2024级</option>
                        <option value="2023">2023级</option>
                        <option value="2022">2022级</option>
                        <option value="2021">2021级</option>
                        <option value="2020">2020级</option>
                        <option value="2019">2019级</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    密码 <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i className="fa-solid fa-lock text-gray-400"></i>
                    </div>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="请设置密码（至少6位）"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    确认密码 <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i className="fa-solid fa-lock text-gray-400"></i>
                    </div>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="请再次输入密码"
                    />
                  </div>
                </div>
              </div>

              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p>
                  注册即表示您同意我们的
                  <button
                      type="button"
                      onClick={() => setPolicyModal('terms')}
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    服务条款
                  </button>
                  和
                  <button
                      type="button"
                      onClick={() => setPolicyModal('privacy')}
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    隐私政策
                  </button>
                </p>
              </div>

              <div>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {isSubmitting ? (
                      <>
                        <i className="fa-solid fa-spinner fa-spin mr-2"></i> 注册中...
                      </>
                  ) : (
                      '注册'
                  )}
                </button>
              </div>
            </form>

            <div className="text-center mt-6">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                已有账号？{' '}
                <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                >
                  立即登录
                </button>
              </p>
            </div>
          </div>
        </main>

        {/* 服务条款 / 隐私政策弹窗 */}
        {policyModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {policyModal === 'terms' ? '服务条款' : '隐私政策'}
                    </h3>
                    <button
                        type="button"
                        onClick={() => setPolicyModal(null)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                      <i className="fa-solid fa-times text-xl"></i>
                    </button>
                  </div>

                  {policyModal === 'terms' ? (
                      <div className="space-y-4 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                        <p>
                          欢迎使用「高校教材交易系统」。本系统旨在为在校师生提供闲置教材信息发布、浏览与线下交易撮合服务。
                          为保障您的权益，请您在注册前仔细阅读并理解本服务条款；当您点击“注册”或实际使用本系统时，即表示您已同意本条款。
                        </p>

                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">1. 服务说明</h4>
                          <p className="mt-2">
                            本系统提供教材信息发布、检索浏览、下单预约、交易信息记录、评价与订单提醒等功能。平台仅提供信息撮合与管理能力，
                            具体交易通常在线下完成，平台不直接参与付款、验货、交付等环节。
                          </p>
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">2. 账号注册与安全</h4>
                          <p className="mt-2">
                            注册时请如实填写学号、姓名、手机号、专业、年级等信息，并妥善保管账号密码。因您保管不善导致的账号被盗用、信息泄露等风险由您自行承担。
                          </p>
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">3. 信息发布规范</h4>
                          <ul className="list-disc ml-5 mt-2 space-y-1">
                            <li>发布教材信息应真实、准确、完整，不得虚构价格、成色、版本等关键信息。</li>
                            <li>不得发布与教材交易无关的广告、引流、违法违规内容。</li>
                            <li>不得发布侵犯他人知识产权的内容（如盗版教材、非法复制资料）。</li>
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">4. 交易规则与风险提示</h4>
                          <ul className="list-disc ml-5 mt-2 space-y-1">
                            <li>建议选择公共场所当面交易，现场核对教材版本、成色、附件（习题册/光盘等）后再完成付款。</li>
                            <li>平台不提供担保交易与强制退款服务，交易纠纷请买卖双方友好协商解决。</li>
                            <li>如发现欺诈、恶意违约等行为，可向平台管理员举报，平台将依据规则进行处理。</li>
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">5. 违规处理</h4>
                          <p className="mt-2">
                            对于发布虚假信息、恶意骚扰、违规交易、攻击系统等行为，平台有权采取包括但不限于删除内容、封禁账号等措施。
                          </p>
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">6. 免责声明</h4>
                          <p className="mt-2">
                            在法律允许范围内，平台对因不可抗力、网络原因、第三方行为等导致的服务中断、数据丢失、交易损失不承担责任。
                          </p>
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">7. 联系方式</h4>
                          <p className="mt-2">
                            如您对本条款或平台规则有疑问，可通过页脚“联系管理员”入口与管理员取得联系。
                          </p>
                        </div>
                      </div>
                  ) : (
                      <div className="space-y-4 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                        <p>
                          本隐私政策用于说明我们如何收集、使用、存储与保护您的个人信息。我们将遵循最小必要原则处理信息，
                          并采取合理的安全措施保护您的数据安全。
                        </p>

                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">1. 我们收集的信息</h4>
                          <ul className="list-disc ml-5 mt-2 space-y-1">
                            <li>账号注册信息：学号、姓名、手机号、专业、年级、密码（系统仅保存加密后的密码摘要）。</li>
                            <li>交易与内容信息：您发布的教材信息、订单信息、评价内容等。</li>
                            <li>日志信息：登录时间、登录IP、浏览器/设备信息（User-Agent）、操作日志等，用于安全风控与故障排查。</li>
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">2. 我们如何使用信息</h4>
                          <ul className="list-disc ml-5 mt-2 space-y-1">
                            <li>用于创建账号、身份校验、联系沟通与完成交易流程。</li>
                            <li>用于平台内容展示（如教材发布者昵称/姓名的展示）与订单提醒。</li>
                            <li>用于安全保障（异常登录识别、反作弊、违规内容治理）与系统运维。</li>
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">3. 信息共享与公开范围</h4>
                          <p className="mt-2">
                            平台不会向无关第三方出售您的个人信息。为完成交易撮合，平台可能向交易相对方展示与交易相关的必要信息
                            （例如发布者姓名、专业、年级、联系方式等），具体以页面展示为准。
                          </p>
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">4. 信息存储与安全</h4>
                          <p className="mt-2">
                            我们会在提供服务所必需的期限内保存您的信息，并使用访问控制、加密传输、日志审计等方式保护数据。
                            但请理解，任何系统都无法保证绝对安全。
                          </p>
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">5. 您的权利</h4>
                          <ul className="list-disc ml-5 mt-2 space-y-1">
                            <li>您可以在个人相关页面查看个人资料，也可联系管理员修改部分个人资料。</li>
                            <li>如需注销账号，可联系管理员协助处理。</li>
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">6. 政策更新</h4>
                          <p className="mt-2">
                            我们可能会适时更新本隐私政策，更新后将在页面展示最新版本。继续使用服务即表示您接受更新后的政策内容。
                          </p>
                        </div>
                      </div>
                  )}

                  <div className="mt-6 flex justify-end">
                    <button
                        type="button"
                        onClick={() => setPolicyModal(null)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                    >
                      我知道了
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