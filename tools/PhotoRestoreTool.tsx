import React, { useState, useRef } from 'react';
import { restoreAndColorizePhoto } from '../services/geminiService';

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = error => reject(error);
    });
};

const PhotoRestoreTool: React.FC = () => {
    const [originalFile, setOriginalFile] = useState<File | null>(null);
    const [originalImagePreview, setOriginalImagePreview] = useState<string | null>(null);
    const [restoredImage, setRestoredImage] = useState<{ base64: string; mimeType: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isDragging, setIsDragging] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (file: File | null) => {
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setError('الرجاء اختيار ملف صورة صالح.');
            return;
        }
        if (file.size > 15 * 1024 * 1024) { // Max size for Gemini 1.5 Flash is 15MB
            setError('حجم الملف كبير جداً. الحد الأقصى 15MB.');
            return;
        }
        
        setOriginalFile(file);
        setRestoredImage(null);
        setError('');
        setOriginalImagePreview(URL.createObjectURL(file));
    };

    const handleRestore = async () => {
        if (!originalFile) {
            setError('الرجاء رفع صورة أولاً.');
            return;
        }
        setIsLoading(true);
        setError('');
        setRestoredImage(null);

        try {
            const imageBase64 = await fileToBase64(originalFile);
            const result = await restoreAndColorizePhoto(originalFile.type, imageBase64);
            setRestoredImage(result);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(errorMessage);
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = () => {
        if (!restoredImage) return;
        const link = document.createElement('a');
        link.href = `data:${restoredImage.mimeType};base64,${restoredImage.base64}`;
        link.download = `restored-${originalFile?.name || 'image.png'}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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
            <h2 className="text-3xl font-bold text-white mb-2">ترميم وتلوين الصور</h2>
            <p className="text-brand-light mb-6">أصلح الصور القديمة والتالفة، وأضف إليها الألوان لإعادتها إلى الحياة.</p>

            {!originalFile && (
                <div 
                    onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`flex-grow flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isDragging ? 'border-brand-cyan bg-brand-mid/20' : 'border-brand-mid hover:border-brand-light'}`}
                >
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e.target.files ? e.target.files[0] : null)} />
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-brand-light" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                    <p className="mt-4 text-white font-semibold">اسحب الصورة القديمة هنا أو انقر للاختيار</p>
                    <p className="text-sm text-brand-light">PNG, JPG (الحد الأقصى 15MB)</p>
                </div>
            )}
            
            {originalFile && (
                 <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col items-center">
                        <h3 className="text-xl font-bold text-white mb-3">الصورة الأصلية</h3>
                        <div className="w-full h-80 bg-brand-dark border border-brand-mid rounded-lg flex items-center justify-center p-2">
                             {originalImagePreview && <img src={originalImagePreview} alt="Original" className="max-w-full max-h-full object-contain rounded" />}
                        </div>
                    </div>
                     <div className="flex flex-col items-center">
                        <h3 className="text-xl font-bold text-white mb-3">الصورة المرممة</h3>
                        <div className="w-full h-80 bg-brand-dark border border-brand-mid rounded-lg flex items-center justify-center p-2 relative">
                             {isLoading && (
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-cyan mx-auto"></div>
                                    <p className="mt-4 text-brand-light">جاري الترميم... قد يستغرق الأمر دقيقة.</p>
                                </div>
                             )}
                             {!isLoading && restoredImage && (
                                 <>
                                    <img src={`data:${restoredImage.mimeType};base64,${restoredImage.base64}`} alt="Restored" className="max-w-full max-h-full object-contain rounded" />
                                     <div className="absolute top-3 left-3 flex gap-2">
                                        <button onClick={handleDownload} className="bg-brand-mid text-white p-2 rounded-md hover:bg-brand-light" title="تحميل الصورة">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                        </button>
                                     </div>
                                 </>
                             )}
                              {!isLoading && !restoredImage && <p className="text-brand-light text-center">ستظهر النتيجة هنا.</p>}
                        </div>
                    </div>
                </div>
            )}
            
            {originalFile && (
                <div className="mt-6 text-center">
                    <button onClick={handleRestore} disabled={isLoading} className="bg-brand-cyan text-brand-dark font-bold py-3 px-8 rounded-lg hover:bg-opacity-80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        {isLoading ? '...جاري المعالجة' : '✨ رمم ولون الصورة'}
                    </button>
                </div>
            )}
            
            {error && <p className="text-red-400 mt-4 text-center">{error}</p>}
        </div>
    );
};

export default PhotoRestoreTool;
