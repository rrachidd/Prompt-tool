
import React, { useState } from 'react';
import { imageFusionPrompt } from '../services/geminiService';

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = error => reject(error);
    });
};

const ImageUploader: React.FC<{ onUpload: (file: File) => void; preview: string | null; id: string }> = ({ onUpload, preview, id }) => {
    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            onUpload(event.target.files[0]);
        }
    };
    return (
        <div className="flex flex-col h-full">
            <label htmlFor={id} className="w-full h-full flex flex-col items-center justify-center bg-brand-dark border-2 border-dashed border-brand-mid rounded-lg cursor-pointer hover:border-brand-cyan transition-colors p-6">
                {preview ? (
                    <img src={preview} alt="Preview" className="max-h-56 rounded-lg object-contain" />
                ) : (
                    <div className="text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-brand-light" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                        <p className="mt-2 text-brand-light">رفع الصورة</p>
                    </div>
                )}
            </label>
            <input id={id} type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
        </div>
    );
};


const ImageFusionTool: React.FC = () => {
    const [imageFile1, setImageFile1] = useState<File | null>(null);
    const [imagePreview1, setImagePreview1] = useState<string | null>(null);
    const [imageFile2, setImageFile2] = useState<File | null>(null);
    const [imagePreview2, setImagePreview2] = useState<string | null>(null);
    const [generatedPrompt, setGeneratedPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGenerate = async () => {
        if (!imageFile1 || !imageFile2) {
            setError('الرجاء رفع الصورتين.');
            return;
        }
        setIsLoading(true);
        setError('');
        setGeneratedPrompt('');
        try {
            const [base64_1, base64_2] = await Promise.all([
                fileToBase64(imageFile1),
                fileToBase64(imageFile2)
            ]);
            
            const image1 = { mimeType: imageFile1.type, imageBase64: base64_1 };
            const image2 = { mimeType: imageFile2.type, imageBase64: base64_2 };

            const result = await imageFusionPrompt(image1, image2);
            setGeneratedPrompt(result);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(`حدث خطأ أثناء إنشاء الأمر: ${errorMessage}`);
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleCopyToClipboard = () => {
        navigator.clipboard.writeText(generatedPrompt);
    };

    return (
        <div className="h-full flex flex-col">
            <h2 className="text-3xl font-bold text-white mb-2">دمج صورتين في أمر</h2>
            <p className="text-brand-light mb-6">ادمج مفاهيم صورتين مختلفتين في أمر واحد لإنتاج صور فريدة.</p>

            <div className="grid md:grid-cols-2 gap-8 mb-6">
                <ImageUploader id="uploader-1" preview={imagePreview1} onUpload={(file) => {setImageFile1(file); setImagePreview1(URL.createObjectURL(file))}} />
                <ImageUploader id="uploader-2" preview={imagePreview2} onUpload={(file) => {setImageFile2(file); setImagePreview2(URL.createObjectURL(file))}} />
            </div>

            <div className="text-center mb-6">
                 <button onClick={handleGenerate} disabled={isLoading || !imageFile1 || !imageFile2} className="bg-brand-cyan text-brand-dark font-bold py-3 px-8 rounded-lg hover:bg-opacity-80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    {isLoading ? '...جاري الدمج' : 'ولّد أمر الدمج'}
                 </button>
            </div>
            {error && <p className="text-red-400 mb-4 text-center">{error}</p>}
            
            <div className="flex-grow bg-brand-dark border border-brand-mid rounded-lg p-4 relative min-h-[200px] flex flex-col">
                {isLoading && (
                    <div className="m-auto"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-cyan"></div></div>
                )}
                {!isLoading && generatedPrompt && (
                     <>
                        <pre className="whitespace-pre-wrap text-brand-extralight w-full h-full font-cairo text-right">{generatedPrompt}</pre>
                        <div className="absolute top-3 left-3 flex gap-2">
                            <button onClick={handleCopyToClipboard} className="bg-brand-mid text-white p-2 rounded-md hover:bg-brand-light" title="نسخ إلى الحافظة">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                            </button>
                        </div>
                    </>
                )}
                {!isLoading && !generatedPrompt && (
                     <p className="text-brand-light m-auto">الأمر النصي المدموج سيظهر هنا.</p>
                )}
            </div>
        </div>
    );
};

export default ImageFusionTool;
