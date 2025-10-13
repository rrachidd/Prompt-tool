
import React, { useState } from 'react';
import { rephraseText } from '../services/geminiService';

const HumanRephraseTool: React.FC = () => {
    const [text, setText] = useState('');
    const [result, setResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleRephrase = async () => {
        if (!text.trim()) {
            setError('الرجاء إدخال نص لإعادة صياغته.');
            return;
        }
        setIsLoading(true);
        setError('');
        setResult('');
        try {
            const apiResult = await rephraseText(text);
            setResult(apiResult);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(`حدث خطأ أثناء إعادة الصياغة: ${errorMessage}`);
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleCopyToClipboard = () => {
        navigator.clipboard.writeText(result);
    };

    return (
        <div className="h-full flex flex-col">
            <h2 className="text-3xl font-bold text-white mb-2">إعادة صياغة بشرية</h2>
            <p className="text-brand-light mb-6">حوّل النصوص الآلية إلى نصوص طبيعية وإنسانية تعكس أسلوبك الخاص.</p>

            <div className="grid md:grid-cols-2 gap-8 flex-grow">
                <div className="flex flex-col">
                    <h3 className="text-xl font-bold text-white mb-3">النص الأصلي</h3>
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="أدخل النص هنا..."
                        className="flex-grow bg-brand-dark border border-brand-mid rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-cyan min-h-[200px] resize-y"
                    />
                </div>
                <div className="flex flex-col">
                     <h3 className="text-xl font-bold text-white mb-3">النص المُعاد صياغته</h3>
                     <div className="flex-grow bg-brand-dark border border-brand-mid rounded-lg p-4 relative min-h-[200px] flex flex-col">
                        {isLoading && (
                            <div className="m-auto">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-cyan"></div>
                            </div>
                        )}
                        {!isLoading && result && (
                             <>
                                <pre className="whitespace-pre-wrap text-brand-extralight w-full h-full font-cairo text-right">{result}</pre>
                                <div className="absolute top-3 left-3 flex gap-2">
                                  <button onClick={handleCopyToClipboard} className="bg-brand-mid text-white p-2 rounded-md hover:bg-brand-light" title="نسخ إلى الحافظة">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                  </button>
                                </div>
                            </>
                        )}
                        {!isLoading && !result && (
                             <p className="text-brand-light m-auto">{error ? <span className="text-red-400">{error}</span> : "ستظهر النتيجة هنا."}</p>
                        )}
                     </div>
                </div>
            </div>
            <div className="mt-6 text-center">
                 <button onClick={handleRephrase} disabled={isLoading || !text} className="bg-brand-cyan text-brand-dark font-bold py-3 px-8 rounded-lg hover:bg-opacity-80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    {isLoading ? '...جاري الصياغة' : 'أعد الصياغة'}
                 </button>
            </div>
             {error && !result && <p className="text-red-400 mt-4 text-center">{error}</p>}
        </div>
    );
};
export default HumanRephraseTool;
