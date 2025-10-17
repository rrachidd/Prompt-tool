import React, { useState, useRef, useEffect } from 'react';
import { generateProfessionalArticle, ArticleGenerationParams } from '../services/geminiService';

// Make jspdf available from CDN
declare const jspdf: any;

const ArticleGeneratorTool: React.FC = () => {
    const initialFormData: ArticleGenerationParams = {
        title: '',
        keyword: '',
        description: '',
        category: '',
        tone: '',
        length: 'medium',
        intent: '',
        audience: '',
        additionalInfo: '',
    };

    const [formData, setFormData] = useState<ArticleGenerationParams>(initialFormData);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState<any | null>(null);
    const [toast, setToast] = useState('');
    const articleContentRef = useRef<HTMLDivElement>(null);
    const [toc, setToc] = useState<{id: string; text: string}[]>([]);

    useEffect(() => {
        if (result && articleContentRef.current) {
            const headings = articleContentRef.current.querySelectorAll('h2');
            const newToc = Array.from(headings).map(h => {
                const headingElement = h as HTMLHeadingElement;
                const id = (headingElement.textContent || '').replace(/\s+/g, '-').toLowerCase();
                headingElement.id = id;
                return { id, text: headingElement.textContent || '' };
            });
            setToc(newToc);
        }
    }, [result]);

    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setResult(null);
        setToc([]);
        
        try {
            const apiResult = await generateProfessionalArticle(formData);
            setResult(apiResult);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(`حدث خطأ أثناء إنشاء المقال: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = () => {
        if (articleContentRef.current) {
            const content = `${result.generatedTitle}\n\n${articleContentRef.current.innerText}`;
            navigator.clipboard.writeText(content);
            setToast('تم نسخ المقال بنجاح!');
        }
    };
    
    const handlePrint = () => {
        window.print();
    };

    const handleDownload = () => {
        if (result && articleContentRef.current) {
            const { jsPDF } = jspdf;
            const doc = new jsPDF();
            
            // This is a simplified conversion and might not handle complex CSS well.
            doc.html(articleContentRef.current, {
                callback: function (doc: any) {
                    doc.save(`${result.urlSlug}.pdf`);
                },
                x: 10,
                y: 10,
                width: 180, // A4 width in mm is 210, leaving margins
                windowWidth: articleContentRef.current.scrollWidth
            });
            setToast('جاري تحضير الملف للتحميل...');
        }
    };

    const inputClasses = "w-full bg-brand-dark border border-brand-mid rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-cyan";

    return (
        <div className="h-full flex flex-col">
             {toast && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-brand-cyan text-brand-dark font-bold py-2 px-6 rounded-lg shadow-lg z-50">
                    {toast}
                </div>
            )}
            <h2 className="text-3xl font-bold text-white mb-2">إنشاء مقالات احترافية</h2>
            <p className="text-brand-light mb-6">أداة متقدمة لإنشاء محتوى فريد 100% يتبع معايير السيو الحديثة.</p>
            
            <div className="bg-brand-blue border border-brand-mid rounded-lg p-6 mb-8">
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="عنوان المقال" required className={inputClasses} />
                        <input type="text" name="keyword" value={formData.keyword} onChange={handleChange} placeholder="الكلمة المفتاحية الرئيسية" required className={inputClasses} />
                    </div>
                    <textarea name="description" value={formData.description} onChange={handleChange} rows={2} placeholder="وصف موجز للمقال" required className={`${inputClasses} mb-4`}></textarea>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <select name="category" value={formData.category} onChange={handleChange} required className={inputClasses}>
                            <option value="" disabled>اختر فئة المقال</option>
                            <option value="technology">التكنولوجيا</option><option value="health">الصحة</option><option value="business">الأعمال</option><option value="education">التعليم</option><option value="lifestyle">نمط الحياة</option><option value="travel">السفر</option><option value="food">الطعام</option><option value="sports">الرياضة</option><option value="other">أخرى</option>
                        </select>
                         <select name="tone" value={formData.tone} onChange={handleChange} required className={inputClasses}>
                            <option value="" disabled>اختر نبرة الكتابة</option>
                            <option value="professional">احترافية</option><option value="casual">عادية</option><option value="friendly">ودية</option><option value="formal">رسمية</option><option value="humorous">مرحة</option>
                        </select>
                         <select name="length" value={formData.length} onChange={handleChange} required className={inputClasses}>
                            <option value="" disabled>اختر طول المقال</option>
                            <option value="short">قصير (300-500 كلمة)</option><option value="medium">متوسط (500-800 كلمة)</option><option value="long">طويل (800-1200 كلمة)</option><option value="very-long">طويل جداً (1200+ كلمة)</option>
                        </select>
                         <select name="intent" value={formData.intent} onChange={handleChange} required className={inputClasses}>
                            <option value="" disabled>اختر النية البحثية</option>
                            <option value="informational">معلوماتية</option><option value="commercial">تجارية</option><option value="transactional">معاملاتية</option><option value="navigational">تنقلية</option>
                        </select>
                    </div>
                     <input type="text" name="audience" value={formData.audience} onChange={handleChange} placeholder="الجمهور المستهدف (مثال: المبتدئين، الخبراء...)" required className={`${inputClasses} mb-4`} />
                    <textarea name="additionalInfo" value={formData.additionalInfo} onChange={handleChange} rows={2} placeholder="معلومات إضافية (اختياري)" className={`${inputClasses} mb-4`}></textarea>
                    
                    <div className="text-center">
                        <button type="submit" disabled={isLoading} className="bg-brand-cyan text-brand-dark font-bold py-3 px-8 rounded-lg hover:bg-opacity-80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                            {isLoading ? '...جاري الإنشاء' : '✨ إنشاء المقال'}
                        </button>
                    </div>
                </form>
            </div>
            {error && <p className="text-red-400 text-center bg-red-900/50 p-3 rounded-md mb-6">{error}</p>}
            
            {isLoading && <div className="text-center p-10"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-cyan mx-auto"></div><p className="mt-3 text-brand-light">جاري إنشاء المقال، قد يستغرق الأمر لحظات...</p></div>}

            {result && (
                <article className="bg-brand-blue border border-brand-mid rounded-xl shadow-2xl overflow-hidden animate-fade-in">
                    <header className="p-8 bg-[linear-gradient(135deg,_#415A77_0%,_#00F5D4_100%)] text-white">
                        <h1 className="font-noto text-3xl md:text-4xl font-bold mb-3">{result.generatedTitle}</h1>
                        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm opacity-90">
                            <span className="flex items-center gap-2"><i className="far fa-calendar-alt"></i> {new Date().toLocaleDateString('ar-SA')}</span>
                            <span className="flex items-center gap-2"><i className="far fa-clock"></i> {result.readingTime} دقيقة قراءة</span>
                            <span className="flex items-center gap-2"><i className="fas fa-file-word"></i> {result.wordCount} كلمة</span>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                            <button onClick={handleCopy} className="bg-white/20 text-white border border-white/30 text-sm py-1.5 px-4 rounded-full hover:bg-white/30">نسخ</button>
                            <button onClick={handlePrint} className="bg-white/20 text-white border border-white/30 text-sm py-1.5 px-4 rounded-full hover:bg-white/30">طباعة</button>
                            <button onClick={handleDownload} className="bg-white/20 text-white border border-white/30 text-sm py-1.5 px-4 rounded-full hover:bg-white/30">تحميل PDF</button>
                        </div>
                    </header>

                    <div id="printable-area">
                        <div className="p-8">
                             {toc.length > 0 && (
                                <div className="mb-8 p-4 bg-brand-dark rounded-lg border-l-4 border-brand-cyan">
                                    <h3 className="text-xl font-bold text-white mb-2">محتويات المقال</h3>
                                    <ul className="space-y-1">
                                        {toc.map(item => <li key={item.id}><a href={`#${item.id}`} className="text-brand-light hover:text-brand-cyan transition-colors">{item.text}</a></li>)}
                                    </ul>
                                </div>
                            )}
                            <div
                                ref={articleContentRef}
                                className="font-noto text-brand-extralight text-lg leading-relaxed prose prose-invert prose-headings:text-white prose-headings:font-cairo prose-strong:text-white prose-a:text-brand-cyan max-w-none"
                                dangerouslySetInnerHTML={{ __html: result.htmlContent }}
                            />
                        </div>
                    </div>
                     <footer className="bg-brand-dark p-8 border-t border-brand-mid">
                        <h3 className="text-xl font-bold text-white mb-4">تحليل السيو</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 text-center">
                            <div className="bg-brand-blue p-3 rounded-lg"><div className="font-bold text-2xl text-brand-cyan">{result.keywordDensity}%</div><div className="text-brand-light text-sm">كثافة الكلمة المفتاحية</div></div>
                            <div className="bg-brand-blue p-3 rounded-lg"><div className="font-bold text-2xl text-brand-cyan">ممتازة</div><div className="text-brand-light text-sm">قابلية القراءة</div></div>
                            <div className="bg-brand-blue p-3 rounded-lg"><div className="font-bold text-2xl text-brand-cyan">عالية</div><div className="text-brand-light text-sm">جودة المحتوى</div></div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-semibold text-white">وصف الميتا (Meta Description)</h4>
                                <p className="bg-brand-blue p-2 rounded mt-1 text-brand-light">{result.metaDescription}</p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-white">رابط الصفحة المقترح (URL Slug)</h4>
                                <p dir="ltr" className="bg-brand-blue p-2 rounded mt-1 text-brand-light font-mono text-left">{result.urlSlug}</p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-white">الكلمات المفتاحية المقترحة</h4>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {result.suggestedKeywords.map((kw: string, i: number) => <span key={i} className="bg-brand-mid text-white text-sm py-1 px-3 rounded-full">{kw}</span>)}
                                </div>
                            </div>
                        </div>
                    </footer>
                </article>
            )}
        </div>
    );
};

export default ArticleGeneratorTool;