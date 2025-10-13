
import React, { useState } from 'react';
import { extractTextFromImage } from '../services/geminiService';

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = error => reject(error);
    });
};

const OcrTool: React.FC = () => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [extractedText, setExtractedText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
            setExtractedText('');
            setError('');
        }
    };

    const handleExtract = async () => {
        if (!imageFile) {
            setError('الرجاء رفع صورة أولاً.');
            return;
        }
        setIsLoading(true);
        setError('');
        setExtractedText('');
        try {
            const imageBase64 = await fileToBase64(imageFile);
            const result = await extractTextFromImage(imageFile.type, imageBase64);
            setExtractedText(result);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(`حدث خطأ أثناء استخراج النص: ${errorMessage}`);
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleCopyToClipboard = () => {
        navigator.clipboard.writeText(extractedText);
    };

    return (
        <div className="h-full flex flex-col">
            <h2 className="text-3xl font-bold text-white mb-2">تحويل الصورة إلى نص (OCR)</h2>
            <p className="text-brand-light mb-6">استخرج النصوص من الصور بدقة وكفاءة عاليتين.</p>

            <div className="grid md:grid-cols-2 gap-8 flex-grow">
                <div className="flex flex-col">
                    <label htmlFor="image-upload" className="w-full h-full flex flex-col items-center justify-center bg-brand-dark border-2 border-dashed border-brand-mid rounded-lg cursor-pointer hover:border-brand-cyan transition-colors p-6">
                        {imagePreview ? (
                            <img src={imagePreview} alt="Preview" className="max-h-64 rounded-lg object-contain" />
                        ) : (
                            <div className="text-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-brand-light" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                <p className="mt-2 text-brand-light">انقر لرفع صورة</p>
                            </div>
                        )}
                    </label>
                    <input id="image-upload" type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                </div>
                <div className="flex flex-col">
                     <div className="flex-grow bg-brand-dark border border-brand-mid rounded-lg p-4 relative min-h-[200px] flex flex-col">
                        {isLoading && (
                            <div className="m-auto">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-cyan"></div>
                            </div>
                        )}
                        {!isLoading && extractedText && (
                             <>
                                <pre className="whitespace-pre-wrap text-brand-extralight w-full h-full font-cairo text-right">{extractedText}</pre>
                                <div className="absolute top-3 left-3 flex gap-2">
                                  <button onClick={handleCopyToClipboard} className="bg-brand-mid text-white p-2 rounded-md hover:bg-brand-light" title="نسخ إلى الحافظة">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                  </button>
                                </div>
                            </>
                        )}
                        {!isLoading && !extractedText && (
                             <p className="text-brand-light m-auto">{error ? <span className="text-red-400">{error}</span> : "النص المستخرج سيظهر هنا."}</p>
                        )}
                     </div>
                      <button onClick={handleExtract} disabled={isLoading || !imageFile} className="w-full mt-4 bg-brand-cyan text-brand-dark font-bold py-3 px-6 rounded-lg hover:bg-opacity-80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        {isLoading ? '...جاري الاستخراج' : 'استخرج النص'}
                      </button>
                </div>
            </div>
        </div>
    );
};

export default OcrTool;
