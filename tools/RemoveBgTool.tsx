import React, { useState, useRef, useCallback, useEffect } from 'react';
import { removeImageBackground } from '../services/geminiService';

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = error => reject(error);
    });
};

const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

const RemoveBgTool: React.FC = () => {
    // Component State
    const [originalFile, setOriginalFile] = useState<File | null>(null);
    const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
    const [processedImage, setProcessedImage] = useState<HTMLImageElement | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingText, setLoadingText] = useState('');
    const [error, setError] = useState('');
    const [isDragging, setIsDragging] = useState(false);

    // Filter State
    const [filters, setFilters] = useState({
        brightness: 100, contrast: 100, saturate: 100, blur: 0, opacity: 100
    });
    const [backgroundColor, setBackgroundColor] = useState('#ffffff');
    const [isTransparent, setIsTransparent] = useState(true);

    // Refs
    const fileInputRef = useRef<HTMLInputElement>(null);
    const finalCanvasRef = useRef<HTMLCanvasElement>(null);
    const comparisonCanvasRef = useRef<HTMLCanvasElement>(null);

    // --- Core Logic ---

    // Draw on canvases whenever the source image or filters change
    const drawCanvases = useCallback(() => {
        const imageToDraw = processedImage || originalImage;
        if (!imageToDraw) return;

        [finalCanvasRef, comparisonCanvasRef].forEach(canvasRef => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            
            canvas.width = imageToDraw.naturalWidth;
            canvas.height = imageToDraw.naturalHeight;
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            if (processedImage && !isTransparent) {
                ctx.fillStyle = backgroundColor;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
            
            ctx.filter = `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturate}%) blur(${filters.blur}px) opacity(${filters.opacity}%)`;
            ctx.drawImage(imageToDraw, 0, 0);
            ctx.filter = 'none';
        });
    }, [originalImage, processedImage, filters, backgroundColor, isTransparent]);

    useEffect(() => {
        drawCanvases();
    }, [drawCanvases]);

    const handleFileChange = (file: File | null) => {
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            setError('يرجى اختيار ملف صورة صالح.');
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            setError('حجم الملف كبير جداً. الحد الأقصى 10MB.');
            return;
        }
        
        startOver();
        setOriginalFile(file);
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                setOriginalImage(img);
                // Draw initial image on canvas
                const canvas = finalCanvasRef.current;
                if(canvas) {
                    const ctx = canvas.getContext('2d');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx?.drawImage(img, 0, 0);
                }
            };
            img.src = e.target?.result as string;
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveBackground = async () => {
        if (!originalFile) {
            setError('يرجى اختيار صورة أولاً.');
            return;
        }
    
        setIsLoading(true);
        setError('');
        setLoadingText('جاري إزالة الخلفية...');
    
        try {
            const imageBase64 = await fileToBase64(originalFile);
            const result = await removeImageBackground(originalFile.type, imageBase64);
            const imageUrl = `data:${result.mimeType};base64,${result.base64}`;
    
            const img = new Image();
            img.onload = () => {
                setProcessedImage(img);
                setIsTransparent(true);
            };
            img.src = imageUrl;
    
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(`حدث خطأ: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: parseFloat(value) }));
    };

    const resetFilters = () => {
        setFilters({ brightness: 100, contrast: 100, saturate: 100, blur: 0, opacity: 100 });
        setBackgroundColor('#ffffff');
        setIsTransparent(true);
    };

    const addFrame = () => {
        const canvas = finalCanvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.strokeStyle = '#E0E1DD';
        ctx.lineWidth = Math.max(10, canvas.width * 0.02);
        ctx.strokeRect(0, 0, canvas.width, canvas.height);
        drawCanvases(); // Redraw to apply on comparison too
    };

    const addWatermark = () => {
        const text = prompt('أدخل النص للعلامة المائية:', 'PromptTools');
        const canvas = finalCanvasRef.current;
        if (text && canvas) {
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            ctx.save();
            ctx.globalAlpha = 0.5;
            const fontSize = Math.max(24, canvas.width / 20);
            ctx.font = `bold ${fontSize}px Cairo`;
            ctx.fillStyle = '#E0E1DD';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(text, canvas.width / 2, canvas.height / 2);
            ctx.restore();
            drawCanvases(); // Redraw to apply on comparison too
        }
    };

    const downloadImage = (format: 'png' | 'jpeg') => {
        const canvas = finalCanvasRef.current;
        if (!canvas) return;
        const link = document.createElement('a');
        link.download = `result-${Date.now()}.${format}`;
        
        if (format === 'jpeg' && isTransparent) {
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            if (!tempCtx) return;
            tempCanvas.width = canvas.width; tempCanvas.height = canvas.height;
            tempCtx.fillStyle = backgroundColor;
            tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
            tempCtx.drawImage(canvas, 0, 0);
            link.href = tempCanvas.toDataURL('image/jpeg', 0.9);
        } else {
            link.href = canvas.toDataURL(`image/${format}`);
        }
        link.click();
    };

    const startOver = () => {
        setOriginalFile(null); setOriginalImage(null); setProcessedImage(null);
        setError('');
        if(fileInputRef.current) fileInputRef.current.value = "";
        resetFilters();
    };

    // Drag & Drop Handlers
    const onDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragging(true); };
    const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragging(false); };
    const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault(); setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileChange(e.dataTransfer.files[0]);
        }
    };

    return (
        <div className="h-full flex flex-col">
            <h2 className="text-3xl font-bold text-white mb-2">✨ إزالة خلفية الصور</h2>
            <p className="text-brand-light mb-6">قم بإزالة خلفية أي صورة ثم قم بتحريرها بسهولة.</p>

            {!originalFile ? (
                <div 
                    onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`flex-grow flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isDragging ? 'border-brand-cyan bg-brand-mid/20' : 'border-brand-mid hover:border-brand-light'}`}
                >
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e.target.files?.[0] || null)} />
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-brand-light" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                    <p className="mt-4 text-white font-semibold">اسحب الصورة هنا أو انقر للاختيار</p>
                    <p className="text-sm text-brand-light">PNG, JPG (الحد الأقصى 10MB)</p>
                </div>
            ) : (
                <div className="space-y-6 animate-fade-in">
                    {/* Original Image & Stats */}
                    <div className="text-center">
                        <h5 className="text-xl font-bold text-white mb-2">الصورة الأصلية</h5>
                        <img src={originalImage?.src} className="max-w-full max-h-80 object-contain rounded-lg mx-auto shadow-lg" />
                        <div className="bg-brand-blue border border-brand-mid rounded-lg p-3 max-w-md mx-auto mt-3 text-sm text-brand-light">
                            <div className="flex justify-around">
                                <span>الأبعاد: {originalImage?.width}x{originalImage?.height}</span>
                                <span>الحجم: {formatFileSize(originalFile.size)}</span>
                                <span>النوع: {originalFile.type}</span>
                            </div>
                        </div>
                    </div>

                    {/* Tools Panel */}
                    <div className="bg-brand-blue border border-brand-mid rounded-lg p-6">
                        <h5 className="text-xl font-bold text-white mb-4 text-center">أدوات التحرير</h5>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {Object.keys(filters).map(key => (
                                <div key={key}>
                                    <label className="block text-brand-light text-sm mb-1 capitalize">{key} <span className="text-white font-mono">{filters[key as keyof typeof filters]}</span></label>
                                    <input type="range" name={key} value={filters[key as keyof typeof filters]} onChange={handleFilterChange} 
                                        min={key === 'blur' ? 0 : 0} 
                                        max={key === 'blur' ? 10 : (key === 'opacity' ? 100 : 200)} 
                                        step={key === 'blur' ? 0.1 : 1}
                                        className="w-full" />
                                </div>
                            ))}
                             <div>
                                <label className="block text-brand-light text-sm mb-1">لون الخلفية</label>
                                <div className="flex items-center gap-2">
                                    <input type="color" value={backgroundColor} onChange={e => { setBackgroundColor(e.target.value); setIsTransparent(false); }} className="w-10 h-10 p-1 bg-brand-dark border border-brand-mid rounded cursor-pointer" />
                                    <button onClick={() => setIsTransparent(true)} className="text-sm px-3 py-1 border border-brand-mid rounded hover:bg-brand-mid">شفاف</button>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-3 justify-center mt-6 pt-4 border-t border-brand-mid">
                            <button onClick={handleRemoveBackground} disabled={isLoading} className="bg-brand-cyan text-brand-dark font-bold py-2 px-5 rounded-lg hover:bg-opacity-80 disabled:opacity-50">إزالة الخلفية</button>
                            <button onClick={resetFilters} className="bg-brand-mid text-white font-bold py-2 px-5 rounded-lg hover:bg-brand-light">إعادة تعيين</button>
                            <button onClick={addFrame} className="bg-brand-mid text-white font-bold py-2 px-5 rounded-lg hover:bg-brand-light">إضافة إطار</button>
                            <button onClick={addWatermark} className="bg-brand-mid text-white font-bold py-2 px-5 rounded-lg hover:bg-brand-light">علامة مائية</button>
                        </div>
                    </div>
                    
                    {isLoading && <div className="text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-cyan mx-auto"></div><p className="mt-2 text-brand-light">{loadingText}</p></div>}
                    {error && <p className="text-red-400 text-center bg-red-900/50 p-3 rounded-md">{error}</p>}

                    {/* Comparison & Result */}
                    {processedImage && (
                        <div className="space-y-6">
                             <div className="grid md:grid-cols-2 gap-6">
                                <div className="text-center">
                                    <h5 className="text-xl font-bold text-white mb-2">قبل</h5>
                                    <img src={originalImage?.src} className="max-w-full max-h-80 object-contain rounded-lg mx-auto shadow-md" />
                                </div>
                                <div className="text-center">
                                    <h5 className="text-xl font-bold text-white mb-2">بعد</h5>
                                     <canvas ref={comparisonCanvasRef} className="max-w-full max-h-80 object-contain rounded-lg mx-auto shadow-md" style={isTransparent ? {backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none'%3e%3cpath d='M0 0H16V16H0V0ZM16 16H32V32H16V16Z' fill='%23415A77'/%3e%3c/svg%3e")`} : {}} />
                                </div>
                            </div>
                            <div className="bg-brand-blue border border-brand-mid rounded-lg p-6">
                                <h5 className="text-xl font-bold text-white mb-4 text-center">النتيجة النهائية</h5>
                                <canvas ref={finalCanvasRef} className="w-full h-auto object-contain rounded-lg mx-auto shadow-lg" style={isTransparent ? {backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none'%3e%3cpath d='M0 0H16V16H0V0ZM16 16H32V32H16V16Z' fill='%23415A77'/%3e%3c/svg%3e")`} : {}}/>
                                <div className="flex flex-wrap gap-3 justify-center mt-4">
                                    <button onClick={() => downloadImage('png')} className="bg-green-600 text-white font-bold py-2 px-5 rounded-lg hover:bg-green-700">تحميل PNG</button>
                                    <button onClick={() => downloadImage('jpeg')} className="bg-green-600 text-white font-bold py-2 px-5 rounded-lg hover:bg-green-700">تحميل JPG</button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="text-center mt-6 border-t border-brand-mid pt-4">
                        <button onClick={startOver} className="bg-red-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-red-700">🔄 صورة جديدة</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RemoveBgTool;
