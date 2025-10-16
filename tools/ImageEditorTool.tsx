import React, { useState, useRef, useEffect, useCallback } from 'react';
import { removeImageBackground } from '../services/geminiService';

// --- Helper Functions ---
const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = error => reject(error);
    });
};

const base64ToBlob = (base64: string, mimeType: string): Blob => {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
};

const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const toBlobPromise = (canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob | null> => {
    return new Promise(resolve => canvas.toBlob(resolve, type, quality));
};


const ImageEditorTool: React.FC = () => {
    // State management
    const [originalFile, setOriginalFile] = useState<File | null>(null);
    const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
    const [originalImageInfo, setOriginalImageInfo] = useState({ size: '', dimensions: { width: 0, height: 0 } });

    const [activeTab, setActiveTab] = useState<'compress' | 'scale' | 'removeBg'>('compress');
    
    // Per-operation loading and error states
    const [isCompressing, setIsCompressing] = useState(false);
    const [isScaling, setIsScaling] = useState(false);
    const [isRemovingBg, setIsRemovingBg] = useState(false);
    const [error, setError] = useState('');

    // Compress state
    const [quality, setQuality] = useState(80);
    const [compressedResult, setCompressedResult] = useState<{ url: string; size: string; blob: Blob | null }>({ url: '', size: '', blob: null });

    // Scale state
    const [scaleWidth, setScaleWidth] = useState(0);
    const [scaleHeight, setScaleHeight] = useState(0);
    const [keepAspectRatio, setKeepAspectRatio] = useState(true);
    const [scaledResult, setScaledResult] = useState<{ url: string; dimensions: string; blob: Blob | null }>({ url: '', dimensions: '', blob: null });

    // Remove BG state
    const [noBgResult, setNoBgResult] = useState<{ url: string; blob: Blob | null }>({ url: '', blob: null });
    
    // Refs
    const imageInputRef = useRef<HTMLInputElement>(null);

    // --- Core Logic ---
    const resetAll = () => {
        if (originalImageUrl) URL.revokeObjectURL(originalImageUrl);
        if (compressedResult.url) URL.revokeObjectURL(compressedResult.url);
        if (scaledResult.url) URL.revokeObjectURL(scaledResult.url);
        if (noBgResult.url) URL.revokeObjectURL(noBgResult.url);
        
        setOriginalFile(null);
        setOriginalImageUrl(null);
        setOriginalImageInfo({ size: '', dimensions: { width: 0, height: 0 } });
        setCompressedResult({ url: '', size: '', blob: null });
        setScaledResult({ url: '', dimensions: '', blob: null });
        setNoBgResult({ url: '', blob: null });
        setError('');
        if (imageInputRef.current) imageInputRef.current.value = "";
    };

    const handleFileSelect = (file: File | null) => {
        if (!file || !file.type.startsWith('image/')) {
            alert('يرجى اختيار ملف صورة صالح.');
            return;
        }
        resetAll();
        
        setOriginalFile(file);
        const url = URL.createObjectURL(file);
        setOriginalImageUrl(url);

        const img = new Image();
        img.onload = () => {
            setOriginalImageInfo({
                size: formatBytes(file.size),
                dimensions: { width: img.width, height: img.height }
            });
            setScaleWidth(img.width);
            setScaleHeight(img.height);
        };
        img.src = url;
    };

    const downloadImage = useCallback((blob: Blob | null, filename: string) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, []);

    // --- Tool Logic Handlers ---

    // Compress
    const handleCompress = async () => {
        if (!originalImageUrl) return;
        setIsCompressing(true);
        setError('');
        try {
            const img = await new Promise<HTMLImageElement>((resolve, reject) => {
                const i = new Image();
                i.onload = () => resolve(i);
                i.onerror = reject;
                i.src = originalImageUrl;
            });

            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0);

            const blob = await toBlobPromise(canvas, 'image/jpeg', quality / 100);
            if (blob) {
                if (compressedResult.url) URL.revokeObjectURL(compressedResult.url);
                setCompressedResult({
                    url: URL.createObjectURL(blob),
                    size: formatBytes(blob.size),
                    blob: blob
                });
            }
        } catch (e) {
            setError('فشل ضغط الصورة.');
        } finally {
            setIsCompressing(false);
        }
    };
    
    // Scale
    const handleScaleWidthChange = (newWidthStr: string) => {
        const newWidth = parseInt(newWidthStr) || 0;
        setScaleWidth(newWidth);
        if (keepAspectRatio && originalImageInfo.dimensions.width > 0) {
            const ratio = originalImageInfo.dimensions.height / originalImageInfo.dimensions.width;
            setScaleHeight(Math.round(newWidth * ratio));
        }
    };
    
    const handleScaleHeightChange = (newHeightStr: string) => {
        const newHeight = parseInt(newHeightStr) || 0;
        setScaleHeight(newHeight);
        if (keepAspectRatio && originalImageInfo.dimensions.height > 0) {
            const ratio = originalImageInfo.dimensions.width / originalImageInfo.dimensions.height;
            setScaleWidth(Math.round(newHeight * ratio));
        }
    };

    const handleScale = async () => {
        if (!originalImageUrl || scaleWidth <= 0 || scaleHeight <= 0) {
            alert('يرجى إدخال أبعاد صالحة.');
            return;
        }
        setIsScaling(true);
        setError('');
        try {
            const img = await new Promise<HTMLImageElement>((resolve, reject) => {
                const i = new Image();
                i.onload = () => resolve(i);
                i.onerror = reject;
                i.src = originalImageUrl;
            });
            
            const canvas = document.createElement('canvas');
            canvas.width = scaleWidth;
            canvas.height = scaleHeight;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, scaleWidth, scaleHeight);

            const blob = await toBlobPromise(canvas, 'image/png');
            if (blob) {
                if(scaledResult.url) URL.revokeObjectURL(scaledResult.url);
                setScaledResult({
                    url: URL.createObjectURL(blob),
                    dimensions: `${scaleWidth}x${scaleHeight}`,
                    blob: blob
                });
            }
        } catch (e) {
            setError('فشل تغيير حجم الصورة.');
        } finally {
            setIsScaling(false);
        }
    };

    // Remove BG (using Gemini API)
    const handleRemoveBg = async () => {
        if (!originalFile) return;
        setIsRemovingBg(true);
        setError('');
        try {
            const imageBase64 = await fileToBase64(originalFile);
            const { base64, mimeType } = await removeImageBackground(originalFile.type, imageBase64);
            
            const blob = base64ToBlob(base64, mimeType);
            if (noBgResult.url) URL.revokeObjectURL(noBgResult.url);
            setNoBgResult({ url: URL.createObjectURL(blob), blob });
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Unknown error';
            setError(`حدث خطأ: ${msg}.`);
        } finally {
            setIsRemovingBg(false);
        }
    };

    // --- UI Components ---
    const TabButton = ({ id, label, icon }: { id: 'compress' | 'scale' | 'removeBg', label: string, icon: string }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`flex items-center justify-center gap-2 flex-1 sm:flex-initial py-3 px-4 sm:px-6 text-base sm:text-lg font-semibold transition-colors duration-300 border-b-4 ${activeTab === id ? 'border-brand-cyan text-brand-cyan' : 'border-transparent text-brand-light hover:text-white'}`}
        >
             <span className="text-xl">{icon}</span> {label}
        </button>
    );

    const PreviewBox: React.FC<{ title: string; imageUrl?: string; info?: string; blob?: Blob | null; downloadFilename?: string; children?: React.ReactNode; isTransparent?: boolean; isLoading?: boolean; loadingText?: string }> = 
        ({ title, imageUrl, info, blob, downloadFilename, children, isTransparent, isLoading, loadingText }) => (
        <div>
            <h6 className="font-bold text-white text-lg mb-2">{title}</h6>
            <div 
                className="w-full h-72 border border-brand-mid rounded-lg flex items-center justify-center bg-brand-dark overflow-hidden relative" 
                style={isTransparent ? {backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none'%3e%3cpath d='M0 0H16V16H0V0ZM16 16H32V32H16V16Z' fill='%23415A77'/%3e%3c/svg%3e")`} : {}}
            >
                {isLoading && (
                     <div className="flex items-center justify-center gap-3 text-brand-light">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-cyan"></div>
                        <span>{loadingText}</span>
                    </div>
                )}
                {!isLoading && imageUrl && <img src={imageUrl} alt={title} className="max-w-full max-h-full object-contain" />}
                {!isLoading && !imageUrl && children && <div className="text-brand-light">{children}</div>}
            </div>
            <div className="mt-2 flex items-center gap-2 flex-wrap">
                {info && <span className="inline-block bg-brand-mid text-white text-sm py-1 px-3 rounded-full">{info}</span>}
                {blob && downloadFilename && (
                    <button 
                        className="bg-green-600 text-white font-bold py-1.5 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2" 
                        onClick={() => downloadImage(blob, downloadFilename)}
                    >
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                       <span>تحميل</span>
                    </button>
                )}
            </div>
        </div>
    );
    
    // --- Main Render ---
    return (
        <div className="h-full flex flex-col">
            <h2 className="text-3xl font-bold text-white mb-2">التعديل على الصور</h2>
            <p className="text-brand-light mb-6">أداة سريعة وقوية لضغط وتكبير وإزالة خلفيات الصور مباشرة من متصفحك.</p>

            {!originalFile ? (
                <div 
                    onClick={() => imageInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                        e.preventDefault();
                        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                            handleFileSelect(e.dataTransfer.files[0]);
                        }
                    }}
                    className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-brand-mid rounded-lg cursor-pointer transition-colors bg-brand-dark hover:bg-brand-blue hover:border-brand-cyan"
                >
                    <span className="text-5xl">☁️</span>
                    <h4 className="mt-4 text-2xl font-bold text-white text-center">اسحب وأفلت الصورة هنا أو انقر للاختيار</h4>
                    <p className="mt-2 text-brand-light">يدعم صيغ PNG, JPG, JPEG, WEBP</p>
                    <input type="file" ref={imageInputRef} onChange={(e) => handleFileSelect(e.target.files ? e.target.files[0] : null)} accept="image/*" className="hidden" />
                </div>
            ) : (
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col sm:flex-row justify-center border-b border-brand-mid">
                        <TabButton id="compress" label="ضغط" icon="🔍"/>
                        <TabButton id="scale" label="تغيير الحجم" icon="📏" />
                        <TabButton id="removeBg" label="إزالة الخلفية" icon="✂️" />
                    </div>
                    
                    <div className="bg-brand-blue border border-brand-mid rounded-lg p-6">
                        {error && <p className="text-red-400 mb-4 bg-red-900/50 p-3 rounded-md text-center">{error}</p>}
                        
                        {activeTab === 'compress' && (
                            <div className="space-y-6">
                               <h5 className="text-2xl font-bold text-white">ضغط جودة الصورة</h5>
                                <div className="mb-4">
                                    <label htmlFor="qualityRange" className="block text-brand-light mb-2">مستوى الجودة: <span className="text-white font-bold">{quality}</span>%</label>
                                    <input type="range" className="w-full accent-brand-cyan" min="10" max="100" value={quality} id="qualityRange" onChange={(e) => setQuality(parseInt(e.target.value))} />
                                </div>
                                <button className="bg-brand-cyan text-brand-dark font-bold py-2 px-6 rounded-full hover:bg-opacity-80 transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed" onClick={handleCompress} disabled={isCompressing}>
                                    {isCompressing ? 'جاري الضغط...' : 'ضغط الآن'}
                                </button>
                                <div className="mt-6 grid md:grid-cols-2 gap-6">
                                    <PreviewBox title="الصورة الأصلية" imageUrl={originalImageUrl!} info={originalImageInfo.size} />
                                    <PreviewBox title="الصورة المضغوطة" imageUrl={compressedResult.url} info={compressedResult.size} blob={compressedResult.blob} downloadFilename="compressed.jpg" isLoading={isCompressing} loadingText="جاري الضغط...">
                                        <p>النتيجة ستظهر هنا.</p>
                                    </PreviewBox>
                                </div>
                            </div>
                        )}
                        {activeTab === 'scale' && (
                           <div className="space-y-6">
                                <h5 className="text-2xl font-bold text-white">تغيير أبعاد الصورة</h5>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="scaleWidth" className="block text-brand-light mb-2">العرض (بكسل)</label>
                                        <input type="number" id="scaleWidth" value={scaleWidth} onChange={(e) => handleScaleWidthChange(e.target.value)} className="w-full bg-brand-dark border border-brand-mid rounded-lg px-4 py-2 text-white" />
                                    </div>
                                    <div>
                                        <label htmlFor="scaleHeight" className="block text-brand-light mb-2">الارتفاع (بكسل)</label>
                                        <input type="number" id="scaleHeight" value={scaleHeight} onChange={(e) => handleScaleHeightChange(e.target.value)} className="w-full bg-brand-dark border border-brand-mid rounded-lg px-4 py-2 text-white" />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input type="checkbox" id="keepAspectRatio" checked={keepAspectRatio} onChange={(e) => setKeepAspectRatio(e.target.checked)} className="w-4 h-4 accent-brand-cyan" />
                                    <label htmlFor="keepAspectRatio" className="text-brand-light">الحفاظ على نسبة الأبعاد</label>
                                </div>
                                <button className="bg-brand-cyan text-brand-dark font-bold py-2 px-6 rounded-full hover:bg-opacity-80 transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed" onClick={handleScale} disabled={isScaling}>
                                    {isScaling ? 'جاري التغيير...' : 'تغيير الحجم الآن'}
                                </button>
                                 <div className="mt-6 grid md:grid-cols-2 gap-6">
                                    <PreviewBox title="الصورة الأصلية" imageUrl={originalImageUrl!} info={`${originalImageInfo.dimensions.width}x${originalImageInfo.dimensions.height}`} />
                                    <PreviewBox title="الصورة الجديدة" imageUrl={scaledResult.url} info={scaledResult.dimensions} blob={scaledResult.blob} downloadFilename="scaled.png" isLoading={isScaling} loadingText="جاري التغيير...">
                                        <p>النتيجة ستظهر هنا.</p>
                                    </PreviewBox>
                                </div>
                           </div>
                        )}
                        {activeTab === 'removeBg' && (
                             <div className="space-y-6">
                                <h5 className="text-2xl font-bold text-white">إزالة خلفية الصورة</h5>
                                <div className="p-3 bg-blue-500/20 text-blue-300 border border-blue-500 rounded-lg flex items-center gap-2">
                                   <span>✨</span> هذه الميزة مدعومة بالذكاء الاصطناعي من Gemini.
                                </div>
                                <button className="bg-brand-cyan text-brand-dark font-bold py-2 px-6 rounded-full hover:bg-opacity-80 transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed" onClick={handleRemoveBg} disabled={isRemovingBg}>
                                    {isRemovingBg ? 'جاري الإزالة...' : 'إزالة الخلفية الآن'}
                                </button>
                                <div className="mt-6 grid md:grid-cols-2 gap-6">
                                    <PreviewBox title="الصورة الأصلية" imageUrl={originalImageUrl!} />
                                    <PreviewBox title="الصورة بدون خلفية" imageUrl={noBgResult.url} blob={noBgResult.blob} downloadFilename="no-bg.png" isTransparent={!!noBgResult.url} isLoading={isRemovingBg} loadingText="جاري الإزالة...">
                                        <p>النتيجة ستظهر هنا.</p>
                                    </PreviewBox>
                                </div>
                            </div>
                        )}
                         <div className="mt-8 border-t border-brand-mid pt-4 text-center">
                            <button onClick={resetAll} className="bg-brand-mid text-white font-bold py-2 px-6 rounded-full hover:bg-brand-light transition-colors">
                                🔄 البدء من جديد بصورة أخرى
                            </button>
                         </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImageEditorTool;