
import React, { useState } from 'react';
import { checkPromptQuality } from '../services/geminiService';

const PromptCheckerTool: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [result, setResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleCheck = async () => {
        if (!prompt.trim()) {
            setError('الرجاء إدخال أمر لفحصه.');
            return;
        }
        setIsLoading(true);
        setError('');
        setResult('');
        try {
            const apiResult = await checkPromptQuality(prompt);
            setResult(apiResult);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(`حدث خطأ أثناء فحص الأمر: ${errorMessage}`);
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleCopyToClipboard = () => {
        navigator.clipboard.writeText(result);
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="h-full flex flex-col">
            <h2 className="text-3xl font-bold text-white mb-2">فحص الأوامر</h2>
            <p className="text-brand-light mb-6">قيّم جودة الأمر الخاص بك قبل استخدامه واحصل على اقتراحات للتحسين.</p>

            <div className="flex flex-col gap-4 mb-4">
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="أدخل الأمر هنا لتقييم جودته..."
                    className="flex-grow bg-brand-dark border border-brand-mid rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-cyan min-h-[100px] resize-y"
                />
                <button
                    onClick={handleCheck}
                    disabled={isLoading}
                    className="bg-brand-cyan text-brand-dark font-bold py-3 px-6 rounded-lg hover:bg-opacity-80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed self-start"
                >
                    {isLoading ? '...جاري الفحص' : 'افحص جودة الأمر'}
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
                    <>
                        <div id="printable-area" className="flex-grow">
                             <pre className="whitespace-pre-wrap text-brand-extralight w-full h-full font-cairo text-right">{result}</pre>
                        </div>
                        <div className="absolute top-3 left-3 flex gap-2">
                          <button 
                            onClick={handleCopyToClipboard}
                            className="bg-brand-mid text-white p-2 rounded-md hover:bg-brand-light"
                            title="نسخ إلى الحافظة"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </button>
                          <button 
                            onClick={handlePrint}
                            className="bg-brand-mid text-white p-2 rounded-md hover:bg-brand-light"
                            title="طباعة"
                          >
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v6a2 2 0 002 2h1v-4a1 1 0 011-1h10a1 1 0 011 1v4h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                    </>
                )}
                
                {!isLoading && !result && !error && (
                    <p className="text-brand-light m-auto">ستظهر نتيجة تحليل الأمر هنا.</p>
                )}
            </div>
        </div>
    );
};
export default PromptCheckerTool;
