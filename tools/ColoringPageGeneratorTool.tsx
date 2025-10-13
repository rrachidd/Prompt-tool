import React, { useState, useCallback, useRef } from 'react';

const InputGroup: React.FC<{ label: string; children: React.ReactNode; className?: string }> = ({ label, children, className }) => (
    <div className={className}>
        <label className="block text-brand-light mb-2 font-semibold">{label}</label>
        {children}
    </div>
);

const ColoringPageGeneratorTool: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [style, setStyle] = useState('coloring book');
    const [complexity, setComplexity] = useState('medium');
    const [size, setSize] = useState('768');
    const [theme, setTheme] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [loadingText, setLoadingText] = useState('');
    const [resultImageUrl, setResultImageUrl] = useState('');
    const [error, setError] = useState('');

    const canvasRef = useRef<HTMLCanvasElement>(null);

    const buildEnhancedPrompt = useCallback((basePrompt: string, style: string, complexity: string, theme: string): string => {
        let enhancedPrompt = basePrompt;
        if (theme) enhancedPrompt = `${theme}, ${enhancedPrompt}`;

        const styleMap: { [key: string]: string } = {
            'coloring book': 'coloring book style, black and white line art, clean outlines',
            'mandala': 'mandala style, intricate patterns, geometric designs',
            'cartoon': 'cartoon style, simple lines, kid-friendly',
            'realistic': 'realistic style, detailed line art',
            'geometric': 'geometric patterns, mathematical designs',
            'floral': 'floral patterns, botanical designs',
        };
        enhancedPrompt += `, ${styleMap[style] || ''}`;

        const complexityMap: { [key: string]: string } = {
            'simple': 'simple lines, easy to color, minimal details',
            'medium': 'moderate detail, suitable for children',
            'detailed': 'detailed artwork, intricate design',
            'intricate': 'highly detailed, complex patterns, advanced coloring',
        };
        enhancedPrompt += `, ${complexityMap[complexity] || ''}`;
        
        enhancedPrompt += ', line art, coloring page, black and white, no shading, clear outlines';
        return enhancedPrompt;
    }, []);

    const handleGenerate = useCallback(async () => {
        if (!prompt.trim()) {
            setError('الرجاء كتابة وصف للصورة المطلوبة');
            return;
        }

        setIsLoading(true);
        setError('');
        setResultImageUrl('');
        setLoadingText('جاري إنتاج الصورة...');

        try {
            const enhancedPrompt = buildEnhancedPrompt(prompt, style, complexity, theme);
            const encodedPrompt = encodeURIComponent(enhancedPrompt);
            const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${size}&height=${size}&model=flux&enhance=true&nologo=true`;
            
            // Preload image to check for errors
            const img = new Image();
            img.onload = () => {
                setResultImageUrl(url);
                setIsLoading(false);
            };
            img.onerror = () => {
                setError('حدث خطأ أثناء جلب الصورة. قد تكون الخدمة غير متاحة.');
                setIsLoading(false);
            };
            img.src = url;
            
        } catch (err) {
            setError('حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.');
            setIsLoading(false);
            console.error(err);
        }
    }, [prompt, style, complexity, theme, size, buildEnhancedPrompt]);
    
    const handleDownload = () => {
        if (!resultImageUrl) return;
        const link = document.createElement('a');
        link.href = resultImageUrl;
        link.download = `coloring-page-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const useExample = (exampleText: string) => {
        setPrompt(exampleText);
    };

    const inputStyle = "w-full bg-brand-dark border border-brand-mid rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-cyan";

    return (
        <div className="h-full flex flex-col">
            <h2 className="text-3xl font-bold text-white mb-2">🎨 انتاج صور للتلوين</h2>
            <p className="text-brand-light mb-6">إنتاج صور تلوين عالية الجودة باستخدام الذكاء الاصطناعي.</p>

            <div className="flex-grow grid md:grid-cols-2 gap-8">
                {/* Right Side - Inputs */}
                <div className="flex flex-col gap-4">
                    <InputGroup label="📝 وصف مفصل للصورة:">
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="مثال: وردة جميلة مع بتلات كبيرة وأوراق مفصلة..."
                            className={`${inputStyle} min-h-[120px] resize-y`}
                        />
                    </InputGroup>

                    <div className="grid sm:grid-cols-2 gap-4">
                        <InputGroup label="🎨 نمط الرسم:">
                            <select value={style} onChange={(e) => setStyle(e.target.value)} className={inputStyle}>
                                <option value="coloring book">كتاب تلوين كلاسيكي</option>
                                <option value="mandala">ماندالا مفصلة</option>
                                <option value="cartoon">كرتوني للأطفال</option>
                                <option value="realistic">واقعي مفصل</option>
                                <option value="geometric">أشكال هندسية</option>
                                <option value="floral">زخارف نباتية</option>
                            </select>
                        </InputGroup>
                        <InputGroup label="🔧 مستوى التفاصيل:">
                             <select value={complexity} onChange={(e) => setComplexity(e.target.value)} className={inputStyle}>
                                <option value="simple">بسيط - للأطفال الصغار</option>
                                <option value="medium">متوسط - للأطفال</option>
                                <option value="detailed">مفصل - للبالغين</option>
                                <option value="intricate">معقد - خبراء التلوين</option>
                            </select>
                        </InputGroup>
                        <InputGroup label="📏 دقة الصورة:">
                           <select value={size} onChange={(e) => setSize(e.target.value)} className={inputStyle}>
                                <option value="512">512x512 - عادية</option>
                                <option value="768">768x768 - عالية</option>
                                <option value="1024">1024x1024 - فائقة الجودة</option>
                            </select>
                        </InputGroup>
                        <InputGroup label="🌈 الموضوع:">
                            <select value={theme} onChange={(e) => setTheme(e.target.value)} className={inputStyle}>
                                <option value="">(اختياري)</option>
                                <option value="animals">حيوانات</option>
                                <option value="nature">طبيعة</option>
                                <option value="fantasy">خيال</option>
                                <option value="vehicles">مركبات</option>
                                <option value="food">طعام</option>
                                <option value="characters">شخصيات</option>
                            </select>
                        </InputGroup>
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={isLoading}
                        className="mt-4 bg-brand-cyan text-brand-dark font-bold py-3 px-6 rounded-lg hover:bg-opacity-80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? '...جاري الإنتاج' : '✨ إنتاج صورة عالية الجودة'}
                    </button>
                    {error && <p className="text-red-400 mt-2 text-center">{error}</p>}
                </div>

                {/* Left Side - Output */}
                <div className="flex flex-col">
                     <div className="flex-grow bg-brand-dark border border-brand-mid rounded-lg p-4 relative min-h-[320px] flex flex-col items-center justify-center">
                        {isLoading && (
                           <div className="text-center">
                             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-cyan mx-auto"></div>
                             <p className="mt-4 text-brand-light">{loadingText}</p>
                           </div>
                        )}

                        {!isLoading && resultImageUrl && (
                             <>
                                <img src={resultImageUrl} alt="صورة التلوين المنتجة" className="max-w-full max-h-full object-contain rounded-md bg-white p-1" />
                                <div className="absolute top-3 left-3 flex flex-col gap-2">
                                  <button onClick={handleDownload} className="bg-brand-mid text-white p-2 rounded-md hover:bg-brand-light" title="تحميل">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                  </button>
                                  <button onClick={handleGenerate} className="bg-brand-mid text-white p-2 rounded-md hover:bg-brand-light" title="إنتاج نسخة أخرى">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm10 10a1 1 0 01-1-1V11.899a7.002 7.002 0 01-11.601-2.566 1 1 0 011.885-.666A5.002 5.002 0 0014.001 13H11a1 1 0 010-2h5a1 1 0 011 1v5a1 1 0 01-1 1z" clipRule="evenodd" /></svg>
                                  </button>
                                </div>
                             </>
                        )}
                        
                        {!isLoading && !resultImageUrl && !error && (
                            <div className="text-center text-brand-light">
                                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                <p className="mt-4">ستظهر صورة التلوين هنا.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-8">
                 <h3 className="text-xl font-bold text-white mb-3">🎯 أمثلة شائعة</h3>
                 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    <button onClick={() => useExample('A beautiful rose with large petals and detailed leaves')} className="text-right p-3 bg-brand-blue rounded-lg hover:bg-brand-mid transition-colors text-sm">
                        <p className="font-bold text-white">🌹 وردة كلاسيكية</p>
                        <p className="text-brand-light">وردة مفصلة مع بتلات وأوراق</p>
                    </button>
                    <button onClick={() => useExample('A cute cat sitting comfortably, clear fur details')} className="text-right p-3 bg-brand-blue rounded-lg hover:bg-brand-mid transition-colors text-sm">
                        <p className="font-bold text-white">🐱 قطة لطيفة</p>
                        <p className="text-brand-light">حيوان أليف بسيط للأطفال</p>
                    </button>
                    <button onClick={() => useExample('An intricate geometric mandala with interlocking circular patterns')} className="text-right p-3 bg-brand-blue rounded-lg hover:bg-brand-mid transition-colors text-sm">
                        <p className="font-bold text-white">🔮 ماندالا معقدة</p>
                        <p className="text-brand-light">أشكال هندسية للاسترخاء</p>
                    </button>
                     <button onClick={() => useExample('A fantasy castle with towers and bridges, fairytale style')} className="text-right p-3 bg-brand-blue rounded-lg hover:bg-brand-mid transition-colors text-sm">
                        <p className="font-bold text-white">🏰 قلعة خيالية</p>
                        <p className="text-brand-light">عمارة خيالية مفصلة</p>
                    </button>
                 </div>
            </div>
            <canvas ref={canvasRef} className="hidden" />
        </div>
    );
};

export default ColoringPageGeneratorTool;