import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";

// Make html2pdf available from the CDN script
declare const html2pdf: any;

interface FormData {
    book_title: string;
    age_group: string;
    genre: string;
    main_idea: string;
    characters: string;
    setting: string;
    narrative_style: string;
    moral: string;
    chapters_count: string;
}

const StoryBookTool: React.FC = () => {
    const [formData, setFormData] = useState<FormData>({
        book_title: "مغامرة النملة الشجاعة",
        age_group: "من 9 إلى 12 سنة",
        genre: "مغامرة",
        main_idea: "نملة صغيرة تكتشف أنها تستطيع التحدث مع الحيوانات الأخرى وتقرر إنقاذ مستعمرتها من خطر كبير.",
        characters: "- ليلى: نملة شجاعة ومغامرة.\n- زهير: صديقها دودة الأرض الحكيمة.\n- العقرب كشر: الشرير الذي يريد السيطرة على الغابة.",
        setting: "في غابة استوائية مليئة بالأشجار الضخمة والنباتات العجيبة، في زمن لم تكن فيه التكنولوجيا موجودة.",
        narrative_style: "سارد ثالث (يعرف كل شيء)",
        moral: "الشجاعة والتعاون هما مفتاح التغلب على أي صعوبة، مهما كان حجم الفرد صغيراً.",
        chapters_count: "5",
    });

    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState('');
    const [error, setError] = useState('');
    const [toast, setToast] = useState('');
    const resultRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        const API_KEY = process.env.API_KEY;
        if (!API_KEY) {
            setError("مفتاح API غير مهيأ. لا يمكن لهذه الأداة العمل.");
            return;
        }

        const prompt = `
أنت كاتب محترف متخصص في تأليف الكتب التفاعلية للأطفال.
أريدك أن تنتج لي كتاباً كاملاً اعتماداً على المعطيات التالية:

📚 عنوان الكتاب: ${formData.book_title}
👶 الفئة العمرية: ${formData.age_group}
🎨 النوع الأدبي: ${formData.genre}
🧩 الفكرة الأساسية: ${formData.main_idea}
🧙‍♂️ الشخصيات الرئيسية:
 ${formData.characters}
🌍 مكان وزمان القصة:
 ${formData.setting}
💬 نمط السرد: ${formData.narrative_style}
🎯 الهدف التربوي: ${formData.moral}
📖 عدد الفصول المطلوبة: ${formData.chapters_count}

✍️ المطلوب من Gemini:
1. توليد الكتاب كاملاً مقسماً إلى فصول منظمة.
2. كتابة نص جذاب ومناسب للفئة العمرية.
3. اقتراح وصف لكل صورة ترافق الفصول.
4. إنهاء الكتاب بخلاصة تربوية واضحة.

ابدأ الآن في كتابة الكتاب بناءً على هذه المعطيات.
      `;

        setIsLoading(true);
        setError('');
        setResult('');

        try {
            const ai = new GoogleGenAI({ apiKey: API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-pro',
                contents: prompt,
            });
            setResult(response.text);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(`⚠️ حدث خطأ أثناء الاتصال بـ API: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleDownloadPdf = () => {
        if (!resultRef.current) return;
        const element = resultRef.current;
        const opt = {
          margin: 0.5,
          filename: `${formData.book_title.trim()}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: "in", format: "a4", orientation: "portrait" }
        };
        html2pdf().set(opt).from(element).save();
    };

    const handleCopyToClipboard = () => {
        if (result) {
            navigator.clipboard.writeText(result);
            setToast('تم نسخ الكتاب بنجاح!');
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
            <h2 className="text-3xl font-bold text-white mb-2">✨ مولّد كتب Story Book</h2>
            <p className="text-brand-light mb-6">أنشئ كتب قصصية كاملة للأطفال مع فصول واقتراحات للصور بناءً على أفكارك.</p>
            
            <form onSubmit={handleSubmit} className="bg-brand-blue border border-brand-mid rounded-lg p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                        <label htmlFor="book_title" className="block text-brand-light mb-2">📚 عنوان الكتاب</label>
                        <input type="text" id="book_title" value={formData.book_title} onChange={handleChange} required className={inputClasses} />
                    </div>
                    <div>
                        <label htmlFor="age_group" className="block text-brand-light mb-2">👶 الفئة العمرية</label>
                        <select id="age_group" value={formData.age_group} onChange={handleChange} required className={inputClasses}>
                            <option value="من 3 إلى 5 سنوات">من 3 إلى 5 سنوات</option>
                            <option value="من 6 إلى 8 سنوات">من 6 إلى 8 سنوات</option>
                            <option value="من 9 إلى 12 سنة">من 9 إلى 12 سنة</option>
                            <option value="من 13 إلى 15 سنة">من 13 إلى 15 سنة</option>
                            <option value="لكل الأعمار">لكل الأعمار</option>
                        </select>
                    </div>
                     <div>
                        <label htmlFor="genre" className="block text-brand-light mb-2">🎨 النوع الأدبي</label>
                        <select id="genre" value={formData.genre} onChange={handleChange} required className={inputClasses}>
                            <option value="مغامرة">مغامرة</option>
                            <option value="خيال علمي">خيال علمي</option>
                            <option value="فانتازيا">فانتازيا</option>
                            <option value="غموض">غموض</option>
                            <option value="حكايات قبل النوم">حكايات قبل النوم</option>
                            <option value="كوميدي">كوميدي</option>
                            <option value="تعليمي">تعليمي</option>
                            <option value="تاريخي">تاريخي</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label htmlFor="main_idea" className="block text-brand-light mb-2">💡 الفكرة الأساسية</label>
                    <textarea id="main_idea" value={formData.main_idea} onChange={handleChange} rows={2} className={inputClasses}></textarea>
                </div>
                <div>
                    <label htmlFor="characters" className="block text-brand-light mb-2">🧙‍♂️ الشخصيات الرئيسية</label>
                    <textarea id="characters" value={formData.characters} onChange={handleChange} rows={3} className={inputClasses}></textarea>
                </div>
                <div>
                    <label htmlFor="setting" className="block text-brand-light mb-2">🌍 المكان والزمان</label>
                    <textarea id="setting" value={formData.setting} onChange={handleChange} rows={2} className={inputClasses}></textarea>
                </div>

                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label htmlFor="narrative_style" className="block text-brand-light mb-2">💬 نمط السرد</label>
                        <select id="narrative_style" value={formData.narrative_style} onChange={handleChange} className={inputClasses}>
                            <option value="سارد ثالث (يعرف كل شيء)">سارد ثالث (يعرف كل شيء)</option>
                            <option value="سارد ثالث (محدود)">سارد ثالث (محدود)</option>
                            <option value="سارد أول شخص">سارد أول شخص</option>
                            <option value="حواري بين الشخصيات">حواري بين الشخصيات</option>
                        </select>
                    </div>
                     <div>
                        <label htmlFor="moral" className="block text-brand-light mb-2">🎯 الهدف التربوي</label>
                        <input type="text" id="moral" value={formData.moral} onChange={handleChange} className={inputClasses} />
                    </div>
                    <div>
                        <label htmlFor="chapters_count" className="block text-brand-light mb-2">📖 عدد الفصول</label>
                        <input type="number" id="chapters_count" value={formData.chapters_count} onChange={handleChange} min="1" className={inputClasses} />
                    </div>
                </div>
                <button type="submit" disabled={isLoading} className="w-full bg-brand-cyan text-brand-dark font-bold py-3 px-6 rounded-lg hover:bg-opacity-80 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                    {isLoading ? <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-brand-dark"></div><span>جاري الإنشاء...</span></> : '🚀 إنتاج الكتاب'}
                </button>
            </form>

            {error && <p className="text-red-400 text-center bg-red-900/50 p-3 rounded-md my-4">{error}</p>}

            {isLoading && <div className="text-center p-10"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-cyan mx-auto"></div><p className="mt-3 text-brand-light">جاري إنشاء الكتاب، الرجاء الانتظار...</p></div>}
            
            {result && (
                <div className="mt-6 flex flex-col">
                    <div className="flex justify-end mb-4 gap-2">
                        <button onClick={handleCopyToClipboard} className="bg-brand-mid text-white font-bold py-2 px-4 rounded-lg hover:bg-brand-light flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                            نسخ النص
                        </button>
                        <button onClick={handleDownloadPdf} className="bg-brand-mid text-white font-bold py-2 px-4 rounded-lg hover:bg-brand-light flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                            تحميل كـ PDF
                        </button>
                    </div>
                    <div ref={resultRef} className="bg-white text-gray-800 p-6 rounded-lg shadow-lg prose max-w-none font-noto">
                        <pre className="whitespace-pre-wrap font-noto text-base">{result}</pre>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StoryBookTool;