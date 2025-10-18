import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { TOOLS_CONFIG } from '../constants';
import { Tool, ToolCategory } from '../types';

const Sidebar: React.FC = () => {
    const categories = [ToolCategory.TEXT, ToolCategory.IMAGE, ToolCategory.VIDEO, ToolCategory.PDF, ToolCategory.EXCEL, ToolCategory.MISC];

    return (
        <aside className="w-full md:w-72 bg-brand-blue border-l border-brand-mid p-6 flex-shrink-0">
            <h2 className="text-2xl font-bold text-white mb-6">الأدوات</h2>
            <nav className="space-y-6">
                {categories.map(category => (
                    <div key={category}>
                        <h3 className="text-brand-cyan font-semibold mb-3">{category}</h3>
                        <ul className="space-y-2">
                            {TOOLS_CONFIG.filter(tool => tool.category === category).map(tool => (
                                <li key={tool.id}>
                                    <NavLink 
                                        to={tool.path}
                                        className={({ isActive }) => `flex items-center space-x-3 p-2 rounded-md transition-colors duration-200 ${isActive ? 'bg-brand-cyan text-brand-dark' : 'text-[#FDE7FC] hover:bg-brand-mid hover:text-white'}`}
                                    >
                                        <tool.icon className="w-5 h-5" />
                                        <span>{tool.name}</span>
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </nav>
        </aside>
    );
};

const FaqItem: React.FC<{ question: string; answer: string }> = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-brand-mid">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center text-right py-4">
                <span className="font-semibold text-white">{question}</span>
                <span className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                    <svg className="w-5 h-5 text-brand-light" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </span>
            </button>
            {isOpen && <div className="pb-4 pr-2 text-brand-light">{answer}</div>}
        </div>
    );
};

const ToolHubPage: React.FC = () => {
    const location = useLocation();
    const [currentTool, setCurrentTool] = useState<Tool | undefined>(undefined);

    useEffect(() => {
        let path = location.pathname;
        if (path === '/tools' || path === '/tools/') {
            // Default to the first tool in the config if path is just /tools
            const defaultTool = TOOLS_CONFIG.find(t => t.path === '/tools/prompt-generator') || TOOLS_CONFIG[0];
            setCurrentTool(defaultTool);
            return;
        }
        const tool = TOOLS_CONFIG.find(t => t.path === path);
        setCurrentTool(tool);
    }, [location.pathname]);

    if (!currentTool) {
        return (
            <div className="container mx-auto px-6 py-8">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-cyan"></div>
                </div>
            </div>
        );
    }
    
    const CurrentToolIcon = currentTool.icon;

    return (
        <div className="container mx-auto px-6 py-8">
            <div className="flex flex-col md:flex-row bg-brand-dark rounded-xl shadow-2xl overflow-hidden border border-brand-mid">
                <Sidebar />
                <div className="flex-grow p-4 sm:p-8 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 120px)' }}>
                    {/* 🧩 1. العنوان الرئيسي (Hero Section) */}
                    <section className="text-center mb-10">
                        <div className="inline-block p-4 bg-brand-blue rounded-full border-2 border-brand-mid">
                            <CurrentToolIcon className="w-16 h-16 text-brand-cyan" />
                        </div>
                        <h1 className="text-4xl font-extrabold text-white mt-4">{currentTool.name}</h1>
                        <p className="mt-2 text-lg text-brand-light max-w-3xl mx-auto">{currentTool.heroDescription || currentTool.description}</p>
                    </section>
                    
                    <section className="bg-brand-blue rounded-lg p-6 mb-10 border border-brand-mid">
                        <Outlet />
                    </section>

                    <div className="space-y-10">
                        {/* 🧠 2. الوصف الكامل للأداة (About the Tool) */}
                        {(currentTool.about || currentTool.features) && (
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4 border-r-4 border-brand-cyan pr-3">🧠 حول الأداة</h2>
                            <div className="bg-brand-blue rounded-lg p-6 border border-brand-mid space-y-4">
                                {currentTool.about && <p className="text-brand-extralight">{currentTool.about}</p>}
                                {currentTool.features && (
                                    <ul className="space-y-3 text-brand-extralight">
                                        {currentTool.features.map((feature, index) => (
                                            <li key={index} className="flex items-start gap-3">
                                                <i className={`${feature.icon} text-brand-cyan mt-1`}></i>
                                                <span>{feature.text}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </section>
                        )}

                        {/* 🧭 3. طريقة الاستخدام (How It Works) */}
                        {currentTool.howToSteps && currentTool.howToSteps.length > 0 && (
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4 border-r-4 border-brand-cyan pr-3">🧭 طريقة الاستخدام</h2>
                             <div className="grid md:grid-cols-3 gap-6 text-center">
                                {currentTool.howToSteps.map((step, index) => (
                                     <div key={index} className="bg-brand-blue p-6 rounded-lg border border-brand-mid">
                                        <div className="text-4xl mb-3">{['1️⃣', '2️⃣', '3️⃣'][index]}</div>
                                        <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                                        <p className="text-brand-light">{step.description}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                        )}

                        {/* 🔐 5. التنبيهات والسياسات (Usage Notice / Privacy) */}
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4 border-r-4 border-brand-cyan pr-3">🔐 الخصوصية والأمان</h2>
                             <div className="bg-brand-blue p-6 rounded-lg border border-green-500/50 flex items-start gap-4">
                                <i className="bi bi-shield-check text-green-400 text-3xl mt-1"></i>
                                <div>
                                    <h3 className="font-bold text-white">بياناتك آمنة معنا</h3>
                                    <p className="text-brand-light mt-1">نحن نحترم خصوصيتك بالكامل. لا يتم تخزين أي من بياناتك أو ملفاتك التي تستخدمها في هذه الأداة على خوادمنا. تتم جميع المعالجات بشكل آمن وتُحذف المدخلات فورًا بعد انتهاء جلستك. لمزيد من المعلومات، يرجى مراجعة <NavLink to="/privacy" className="text-brand-cyan underline">سياسة الخصوصية</NavLink>.</p>
                                </div>
                            </div>
                        </section>
                        
                        {/* 💬 6. قسم الأسئلة الشائعة (FAQ) */}
                        {currentTool.faqs && currentTool.faqs.length > 0 ? (
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4 border-r-4 border-brand-cyan pr-3">💬 أسئلة شائعة</h2>
                             <div className="bg-brand-blue rounded-lg p-6 border border-brand-mid">
                                {currentTool.faqs.map((faq, index) => (
                                    <FaqItem key={index} question={faq.question} answer={faq.answer} />
                                ))}
                                <FaqItem question="هل هذه الأداة مجانية؟" answer="نعم، جميع أدواتنا في PromptTools مجانية بالكامل للاستخدام الشخصي والتجاري." />
                                <FaqItem question="هل تعمل الأداة على الهاتف المحمول؟" answer="نعم، موقعنا مصمم ليكون متجاوبًا ويعمل بكفاءة على جميع الأجهزة، بما في ذلك الهواتف الذكية والأجهزة اللوحية." />
                            </div>
                        </section>
                        ) : (
                             <section>
                                <h2 className="text-2xl font-bold text-white mb-4 border-r-4 border-brand-cyan pr-3">💬 أسئلة شائعة</h2>
                                <div className="bg-brand-blue rounded-lg p-6 border border-brand-mid">
                                     <FaqItem question="هل هذه الأداة مجانية؟" answer="نعم، جميع أدواتنا في PromptTools مجانية بالكامل للاستخدام الشخصي والتجاري." />
                                     <FaqItem question="هل بياناتي وملفاتي آمنة؟" answer="بالتأكيد. نحن لا نحفظ أو نشارك أي بيانات تقوم بإدخالها. خصوصيتك هي أولويتنا القصوى." />
                                     <FaqItem question="هل تعمل الأداة على الهاتف المحمول؟" answer="نعم، موقعنا مصمم ليكون متجاوبًا ويعمل بكفاءة على جميع الأجهزة، بما في ذلك الهواتف الذكية والأجهزة اللوحية." />
                                     <FaqItem question="ما هي التقنية المستخدمة في هذه الأداة؟" answer="تعتمد أدواتنا على أحدث نماذج الذكاء الاصطناعي من Google Gemini لضمان تقديم أفضل النتائج وأكثرها دقة." />
                                </div>
                            </section>
                        )}


                        {/* 🧾 7. قسم المصداقية (Testimonials / Stats / Sources) */}
                        <section>
                             <h2 className="text-2xl font-bold text-white mb-4 border-r-4 border-brand-cyan pr-3">🧾 المصداقية</h2>
                             <div className="grid md:grid-cols-3 gap-6 text-center">
                                <div className="bg-brand-blue p-6 rounded-lg border border-brand-mid"><div className="text-3xl mb-2">🚀</div><h3 className="text-lg font-bold text-white">مدعوم بـ Google Gemini</h3><p className="text-sm text-brand-light">نستخدم أحدث التقنيات لضمان أفضل النتائج.</p></div>
                                <div className="bg-brand-blue p-6 rounded-lg border border-brand-mid"><div className="text-3xl mb-2">⭐</div><h3 className="text-lg font-bold text-white">يثق به الآلاف</h3><p className="text-sm text-brand-light">أكثر من 10,000 مستخدم نشط شهريًا.</p></div>
                                <div className="bg-brand-blue p-6 rounded-lg border border-brand-mid"><div className="text-3xl mb-2">🔒</div><h3 className="text-lg font-bold text-white">آمن 100%</h3><p className="text-sm text-brand-light">خصوصيتك مضمونة، لا يتم تخزين أي بيانات.</p></div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ToolHubPage;