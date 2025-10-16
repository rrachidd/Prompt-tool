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

const ToolItem: React.FC<{ label: string, valueDisplay?: string, children: React.ReactNode }> = ({ label, valueDisplay, children }) => (
    <div>
        <label className="block text-brand-light mb-1 text-sm">
            {label}{valueDisplay && <span className="font-mono text-white text-base"> {valueDisplay}</span>}
        </label>
        {children}
    </div>
);

const IconButton: React.FC<{ onClick: () => void, title: string, children: React.ReactNode }> = ({ onClick, title, children }) => (
    <button onClick={onClick} title={title} className="p-2 bg-brand-mid rounded-md hover:bg-brand-light transition-colors">
        {children}
    </button>
);

const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}


const RemoveBgTool: React.FC = () => {
    const [originalFile, setOriginalFile] = useState<File | null>(null);
    const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
    const [processedImage, setProcessedImage] = useState<HTMLImageElement | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [loadingText, setLoadingText] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [isDragging, setIsDragging] = useState(false);
    
    const [filters, setFilters] = useState({
        brightness: 100, contrast: 100, saturate: 100, blur: 0, opacity: 100,
        backgroundColor: '#ffffff',
    });
    const [isBgTransparent, setIsBgTransparent] = useState(true);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const resultCanvasRef = useRef<HTMLCanvasElement>(null);
    
    const drawCanvas = useCallback(() => {
        const canvas = resultCanvasRef.current;
        const imageToDraw = processedImage || originalImage;
        if (!canvas || !imageToDraw) return;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        canvas.width = imageToDraw.naturalWidth;
        canvas.height = imageToDraw.naturalHeight;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (processedImage && !isBgTransparent) {
             ctx.fillStyle = filters.backgroundColor;
             ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        
        ctx.filter = `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturate}%) blur(${filters.blur}px) opacity(${filters.opacity}%)`;
        ctx.drawImage(imageToDraw, 0, 0);
        ctx.filter = 'none';
    }, [originalImage, processedImage, filters, isBgTransparent]);

    useEffect(() => {
        drawCanvas();
    }, [drawCanvas]);

    const handleFileChange = (file: File | null) => {
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setError('يرجى اختيار ملف صورة صالح');
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            setError('حجم الملف كبير جداً. الحد الأقصى 10MB');
            return;
        }
        
        startOver(); // Reset state for new image
        setOriginalFile(file);
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => setOriginalImage(img);
            img.src = e.target?.result as string;
        };
        reader.readAsDataURL(file);
    };

    const removeBackground = async () => {
        if (!originalImage || !originalFile) {
            setError('يرجى اختيار صورة أولاً');
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
                setIsBgTransparent(true);
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
        setFilters(prev => ({ ...prev, [name]: name === 'blur' ? parseFloat(value) : parseInt(value) }));
    };

    const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setIsBgTransparent(false);
        setFilters(prev => ({ ...prev, backgroundColor: e.target.value }));
    }

    const setTransparent = () => {
        setIsBgTransparent(true);
    }

    const resetFilters = () => {
        setFilters({
            brightness: 100, contrast: 100, saturate: 100, blur: 0, opacity: 100, backgroundColor: '#ffffff',
        });
        setIsBgTransparent(true);
    };

    const addEffect = (effect: 'frame' | 'watermark') => {
        const canvas = resultCanvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        if (effect === 'frame') {
            ctx.strokeStyle = '#E0E1DD';
            ctx.lineWidth = Math.max(5, canvas.width * 0.01);
            ctx.strokeRect(0, 0, canvas.width, canvas.height);
        } else if (effect === 'watermark') {
            const text = prompt('أدخل النص للعلامة المائية:', 'PromptTools');
            if (text) {
                ctx.save();
                ctx.globalAlpha = 0.5;
                const fontSize = Math.max(24, canvas.width / 20);
                ctx.font = `bold ${fontSize}px Cairo`;
                ctx.fillStyle = '#E0E1DD';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(text, canvas.width / 2, canvas.height / 2);
                ctx.restore();
            }
        }
    };

    const downloadImage = (format: 'png' | 'jpeg') => {
        const canvas = resultCanvasRef.current;
        if (!canvas) return;
        const link = document.createElement('a');
        link.download = `result-${Date.now()}.${format}`;
        
        if (format === 'jpeg') {
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            if (!tempCtx) return;
            tempCanvas.width = canvas.width;
            tempCanvas.height = canvas.height;
            tempCtx.fillStyle = isBgTransparent ? '#ffffff' : filters.backgroundColor;
            tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
            tempCtx.drawImage(canvas, 0, 0);
            link.href = tempCanvas.toDataURL('image/jpeg', 0.9);
        } else {
            link.href = canvas.toDataURL('image/png');
        }
        link.click();
    };

    const startOver = () => {
        setOriginalFile(null);
        setOriginalImage(null);
        setProcessedImage(null);
        setError('');
        if(fileInputRef.current) fileInputRef.current.value = "";
        resetFilters();
    };

    const onDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragging(true); };
    const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragging(false); };
    const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileChange(e.dataTransfer.files[0]);
        }
    };

    return (
        <div className="h-full flex flex-col">
            <h2 className="text-3xl font-bold text-white mb-2">✨ إزالة خلفية الصور</h2>
            <p className="text-brand-light mb-6">قم بإزالة خلفية أي صورة ثم قم بتحريرها بسهولة.</p>

            <div className="flex-grow grid md:grid-cols-2 gap-8">
                {/* Left Column: Upload & Preview */}
                <div className="flex flex-col gap-4">
                    {!originalImage ? (
                        <div 
                            onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={`flex-grow flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isDragging ? 'border-brand-cyan bg-brand-mid/20' : 'border-brand-mid hover:border-brand-light'}`}
                        >
                            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e.target.files ? e.target.files[0] : null)} />
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-brand-light" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                            <p className="mt-4 text-white font-semibold">اسحب الصورة هنا أو انقر للاختيار</p>
                            <p className="text-sm text-brand-light">PNG, JPG (الحد الأقصى 10MB)</p>
                        </div>
                    ) : (
                        <div className={`bg-brand-dark border border-brand-mid rounded-lg p-4 flex flex-col items-center justify-center relative ${isBgTransparent && processedImage ? 'bg-transparent bg-cover bg-center' : ''}`} style={isBgTransparent && processedImage ? {backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none'%3e%3cpath d='M0 0H16V16H0V0ZM16 16H32V32H16V16Z' fill='%23415A77'/%3e%3c/svg%3e")`} : {}}>
                            <h3 className="text-lg font-bold text-white mb-2">{processedImage ? 'النتيجة النهائية' : 'الصورة الأصلية'}</h3>
                            <canvas ref={resultCanvasRef} className="max-w-full max-h-[400px] object-contain rounded" />
                            {originalFile && (
                                <div className="text-xs text-brand-light mt-2 text-center w-full bg-brand-blue p-2 rounded">
                                    الأبعاد: {originalImage?.naturalWidth}x{originalImage?.naturalHeight} | الحجم: {formatFileSize(originalFile.size)}
                                </div>
                            )}
                        </div>
                    )}
                     {error && <div className="p-3 bg-red-500/20 border border-red-400 text-red-300 rounded-md text-center">{error}</div>}
                </div>

                {/* Right Column: Tools */}
                {originalImage && (
                    <div className="flex flex-col gap-4">
                        <div className="bg-brand-blue border border-brand-mid rounded-lg p-4">
                            <h3 className="text-xl font-bold text-white mb-4">أدوات التحرير</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <ToolItem label="السطوع" valueDisplay={`${filters.brightness}%`}>
                                    <input type="range" name="brightness" min="0" max="200" value={filters.brightness} onChange={handleFilterChange} className="w-full" />
                                </ToolItem>
                                <ToolItem label="التباين" valueDisplay={`${filters.contrast}%`}>
                                    <input type="range" name="contrast" min="0" max="200" value={filters.contrast} onChange={handleFilterChange} className="w-full" />
                                </ToolItem>
                                <ToolItem label="التشبع" valueDisplay={`${filters.saturate}%`}>
                                    <input type="range" name="saturate" min="0" max="200" value={filters.saturate} onChange={handleFilterChange} className="w-full" />
                                </ToolItem>
                                <ToolItem label="الضبابية" valueDisplay={`${filters.blur}px`}>
                                    <input type="range" name="blur" min="0" max="10" step="0.1" value={filters.blur} onChange={handleFilterChange} className="w-full" />
                                </ToolItem>
                                <ToolItem label="لون الخلفية">
                                    <div className="flex items-center gap-2">
                                        <input type="color" value={filters.backgroundColor} onChange={handleColorChange} className="w-10 h-10 p-1 bg-brand-dark border border-brand-mid rounded cursor-pointer" />
                                        <button onClick={setTransparent} className="text-sm px-3 py-1 border border-brand-mid rounded hover:bg-brand-mid">شفاف</button>
                                    </div>
                                </ToolItem>
                                <div className="col-span-2">
                                    <button onClick={resetFilters} className="w-full text-sm py-2 border border-brand-mid rounded hover:bg-brand-mid transition-colors">إعادة تعيين الفلاتر</button>
                                </div>
                            </div>
                        </div>

                        {processedImage && (
                             <div className="bg-brand-blue border border-brand-mid rounded-lg p-4 flex justify-around">
                                <IconButton onClick={() => addEffect('frame')} title="إضافة إطار"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2-2H6a2 2 0 01-2-2v-2" /></svg></IconButton>
                                <IconButton onClick={() => addEffect('watermark')} title="إضافة علامة مائية"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg></IconButton>
                                <IconButton onClick={() => downloadImage('png')} title="تحميل PNG"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg></IconButton>
                                <IconButton onClick={() => downloadImage('jpeg')} title="تحميل JPG"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg></IconButton>
                            </div>
                        )}
                        
                        <div className="flex flex-col gap-4">
                            {!processedImage ? (
                                <button onClick={removeBackground} disabled={isLoading} className="w-full bg-brand-cyan text-brand-dark font-bold py-3 px-6 rounded-lg hover:bg-opacity-80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                    {isLoading ? loadingText : '🪄 إزالة الخلفية'}
                                </button>
                            ) : (
                                <button onClick={startOver} className="w-full bg-brand-mid text-white font-bold py-3 px-6 rounded-lg hover:bg-brand-light transition-colors">
                                    🔄 صورة جديدة
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RemoveBgTool;