import React, { useState, useCallback } from 'react';

interface GeneratedImage {
    id: number;
    url: string;
    prompt: string;
    size: string;
}

const PrintOnDemandTool: React.FC = () => {
    const [prompt, setPrompt] = useState('cute cartoon cat wearing sunglasses');
    const [selectedSize, setSelectedSize] = useState('512x512');
    const [selectedStyle, setSelectedStyle] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
    const [imageCounter, setImageCounter] = useState(0);

    const presets = [
        { label: 'قط كرتوني لطيف', value: 'cute cartoon cat wearing sunglasses' },
        { label: 'غروب ريترو', value: 'vintage retro sunset with palm trees' },
        { label: 'تصميم هندسي بسيط', value: 'minimalist geometric design' },
        { label: 'مجرة فضائية', value: 'space galaxy with stars' },
        { label: 'فن تجريدي ملون', value: 'colorful abstract art' },
    ];

    const styles = [
        { label: 'عادي', value: '' },
        { label: 'كرتوني', value: 'cartoon style' },
        { label: 'واقعي', value: 'realistic' },
        { label: 'بسيط', value: 'minimalist' },
        { label: 'كلاسيكي', value: 'vintage' },
        { label: 'سايبر', value: 'cyberpunk' },
    ];

    const sizes = [
        { label: 'مربع', value: '512x512', desc: '512x512' },
        { label: 'عمودي', value: '512x768', desc: '512x768' },
        { label: 'أفقي', value: '768x512', desc: '768x512' },
    ];

    const generatePollinationsImage = useCallback(async (fullPrompt: string, size: string) => {
        const cleanPrompt = encodeURIComponent(fullPrompt);
        const [width, height] = size.split('x');
        const seed = Math.floor(Math.random() * 1000000);
        const imageUrl = `https://image.pollinations.ai/prompt/${cleanPrompt}?width=${width}&height=${height}&seed=${seed}&enhance=true&nologo=true`;
        
        return new Promise<string>((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(imageUrl);
            img.onerror = () => reject('فشل في تحميل الصورة من المصدر.');
            img.src = imageUrl;
        });
    }, []);

    const handleGenerate = useCallback(async (variationPrompt?: string) => {
        const currentPrompt = variationPrompt || prompt;
        if (!currentPrompt.trim()) {
            setError('يرجى إدخال وصف للصورة');
            return;
        }

        setIsLoading(true);
        setError('');
        try {
            let fullPrompt = currentPrompt;
            if (selectedStyle) fullPrompt += `, ${selectedStyle}`;
            fullPrompt += ', high quality, detailed, vibrant colors, for t-shirt printing';

            const imageUrl = await generatePollinationsImage(fullPrompt, selectedSize);
            
            const newImage: GeneratedImage = {
                id: imageCounter + 1,
                url: imageUrl,
                prompt: currentPrompt,
                size: selectedSize,
            };
            setGeneratedImages(prev => [newImage, ...prev]);
            setImageCounter(prev => prev + 1);

        } catch (err) {
            console.error('Error generating image:', err);
            const message = err instanceof Error ? err.message : String(err);
            setError(`حدث خطأ في إنشاء الصورة: ${message}`);
        } finally {
            setIsLoading(false);
        }
    }, [prompt, selectedStyle, selectedSize, imageCounter, generatePollinationsImage]);

    const downloadImage = useCallback(async (imageUrl: string, id: number) => {
        try {
            setError('');
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `generated-image-${id}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download error:', error);
            setError('فشل تحميل الصورة.');
        }
    }, []);

    const inputStyle = "w-full bg-brand-dark border border-brand-mid rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-cyan";

    return (
        <div className="h-full flex flex-col">
            <h2 className="text-3xl font-bold text-white mb-2">
                <i className="fas fa-magic"></i> مولد الصور للطباعة عند الطلب
            </h2>
            <p className="text-brand-light mb-6">أنشئ صور عالية الجودة للتيشيرتات والطباعة باستخدام الذكاء الاصطناعي</p>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Controls */}
                <div className="w-full md:w-1/3 flex-shrink-0 space-y-4">
                     <div>
                        <label className="block text-brand-light mb-2 font-semibold">أمثلة سريعة:</label>
                        <div className="flex flex-wrap gap-2">
                            {presets.map(p => (
                                <button key={p.value} onClick={() => setPrompt(p.value)} className="bg-brand-blue text-sm text-brand-extralight py-1 px-3 rounded-full hover:bg-brand-mid transition-colors">{p.label}</button>
                            ))}
                        </div>
                     </div>
                     <div>
                        <label htmlFor="promptInput" className="block text-brand-light mb-2 font-semibold">وصف الصورة:</label>
                        <textarea id="promptInput" value={prompt} onChange={(e) => setPrompt(e.target.value)} className={`${inputStyle} min-h-[100px] resize-y`} placeholder="اكتب وصف تفصيلي..." />
                     </div>
                     <div>
                        <label className="block text-brand-light mb-2 font-semibold">أسلوب الرسم:</label>
                        <div className="flex flex-wrap gap-2">
                            {styles.map(s => (
                                <button key={s.value} onClick={() => setSelectedStyle(s.value)} className={`py-1 px-4 rounded-full border-2 transition-colors ${selectedStyle === s.value ? 'bg-brand-cyan text-brand-dark border-brand-cyan' : 'bg-brand-blue border-brand-mid hover:border-brand-light'}`}>{s.label}</button>
                            ))}
                        </div>
                     </div>
                      <div>
                        <label className="block text-brand-light mb-2 font-semibold">حجم الصورة:</label>
                        <div className="grid grid-cols-3 gap-2">
                            {sizes.map(s => (
                                <button key={s.value} onClick={() => setSelectedSize(s.value)} className={`p-2 text-center rounded-lg border-2 transition-colors ${selectedSize === s.value ? 'bg-brand-cyan text-brand-dark border-brand-cyan' : 'bg-brand-blue border-brand-mid hover:border-brand-light'}`}>
                                    <span className="font-bold">{s.label}</span>
                                    <small className="block opacity-75">{s.desc}</small>
                                </button>
                            ))}
                        </div>
                     </div>
                     <button onClick={() => handleGenerate()} disabled={isLoading} className="w-full bg-brand-cyan text-brand-dark font-bold py-3 px-6 rounded-lg hover:bg-opacity-80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                         {isLoading ? '...جاري الإنشاء' : 'إنشاء الصورة'}
                    </button>
                    {error && <p className="text-red-400 mt-2 text-center">{error}</p>}
                </div>
                {/* Gallery */}
                <div className="flex-grow bg-brand-dark border border-brand-mid rounded-lg p-4 min-h-[400px]">
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center h-full text-brand-light">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-cyan"></div>
                            <p className="mt-4">جاري إنشاء الصورة... قد يستغرق الأمر بضع لحظات.</p>
                        </div>
                    )}
                    {!isLoading && generatedImages.length === 0 && (
                        <div className="flex items-center justify-center h-full text-brand-light">
                             <p>ستظهر الصور التي تم إنشاؤها هنا.</p>
                        </div>
                    )}
                    {generatedImages.length > 0 && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full overflow-y-auto pr-2">
                            {generatedImages.map(image => (
                                <div key={image.id} className="bg-brand-blue p-3 rounded-lg flex flex-col gap-2">
                                    <img src={image.url} alt={image.prompt} className="w-full h-auto object-cover rounded" />
                                    <p className="text-xs text-brand-light truncate" title={image.prompt}>{image.prompt}</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button onClick={() => downloadImage(image.url, image.id)} className="w-full bg-brand-mid text-white text-sm font-bold py-2 px-4 rounded-lg hover:bg-brand-light transition-colors">تحميل</button>
                                        <button onClick={() => handleGenerate(image.prompt)} className="w-full bg-transparent border border-brand-mid text-brand-light text-sm font-bold py-2 px-4 rounded-lg hover:bg-brand-mid transition-colors">نسخة أخرى</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PrintOnDemandTool;