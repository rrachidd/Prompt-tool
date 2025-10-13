
import React, { useState } from 'react';
import { detectAiText } from '../services/geminiService';

const AiDetectorTool: React.FC = () => {
    const [text, setText] = useState('');
    const [result, setResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleDetect = async () => {
        if (!text.trim()) {
            setError('الرجاء إدخال نص للكشف عنه.');
            return;
        }
        setIsLoading(true);
        setError('');
        setResult('');
        try {
            const apiResult = await detectAiText(text);
            setResult(apiResult);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(`حدث خطأ أثناء الكشف: ${errorMessage}`);
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="h-full flex flex-col">
            <h2 className="text-3xl font-bold text-white mb-2">كاشف نصوص الذكاء الاصطناعي</h2>
            <p className="text-brand-light mb-6">اكتشف المحتوى الذي تم إنشاؤه بواسطة الذكاء الاصطناعي بدقة فائقة.</p>

            <div className="flex flex-col gap-4 mb-4">
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="أدخل النص هنا..."
                    className="flex-grow bg-brand-dark border border-brand-mid rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-cyan min-h-[150px] resize-y"
                />
                <button
                    onClick={handleDetect}
                    disabled={isLoading}
                    className="bg-brand-cyan text-brand-dark font-bold py-3 px-6 rounded-lg hover:bg-opacity-80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed self-start"
                >
                    {isLoading ? '...جاري الكشف' : 'اكشف الآن'}
                </button>
            </div>
            {error && <p className="text-red-400 mb-4">{error}</p>}
            
            <div className="flex-grow bg-brand-dark border border-brand-mid rounded-lg p-4 mt-4 relative min-h-[200px] flex flex-col">
                {isLoading && (
                   <div className="m-auto">
                     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-cyan"></div>
                   </div>
                )}
                {!isLoading && result && (
                    <pre className="whitespace-pre-wrap text-brand-extralight w-full h-full font-cairo text-right">{result}</pre>
                )}
                {!isLoading && !result && !error && (
                    <p className="text-brand-light m-auto">ستظهر نتيجة الكشف هنا.</p>
                )}
            </div>
        </div>
    );
};
export default AiDetectorTool;
