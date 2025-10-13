import React, { useState } from 'react';
import { generateYoutubeTitles } from '../services/geminiService';

const YoutubeTitleGeneratorTool: React.FC = () => {
    const [topic, setTopic] = useState('');
    const [titles, setTitles] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const handleGenerate = async () => {
        if (!topic.trim()) {
            setError('الرجاء إدخال موضوع الفيديو.');
            return;
        }
        setIsLoading(true);
        setError('');
        setTitles([]);
        try {
            const result = await generateYoutubeTitles(topic);
            setTitles(result);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(errorMessage);
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopyToClipboard = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    return (
        <div className="h-full flex flex-col">
            <h2 className="text-3xl font-bold text-white mb-2">توليد عناوين فيديو يوتيوب</h2>
            <p className="text-brand-light mb-6">احصل على 10 عناوين جذابة ومحسّنة لفيديوهاتك بناءً على أفضل الممارسات.</p>

            <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="مثال: تاريخ المغرب القديم باختصار"
                    className="flex-grow bg-brand-dark border border-brand-mid rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-cyan"
                    onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                />
                <button
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="bg-brand-cyan text-brand-dark font-bold py-3 px-6 rounded-lg hover:bg-opacity-80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? '...جاري التوليد' : 'ولّد 10 عناوين'}
                </button>
            </div>
            {error && <p className="text-red-400 mb-4">{error}</p>}
            
            <div className="flex-grow bg-brand-dark border border-brand-mid rounded-lg p-4 mt-4 relative min-h-[300px] flex flex-col">
                {isLoading && (
                   <div className="m-auto">
                     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-cyan"></div>
                   </div>
                )}

                {!isLoading && titles.length > 0 && (
                    <ul className="space-y-3">
                        {titles.map((title, index) => (
                            <li key={index} className="flex items-center justify-between gap-4 p-3 bg-brand-blue rounded-md">
                                <span className="text-brand-extralight flex-grow">{index + 1}. {title}</span>
                                <button 
                                    onClick={() => handleCopyToClipboard(title, index)}
                                    className="bg-brand-mid text-white p-2 rounded-md hover:bg-brand-light transition-colors flex-shrink-0"
                                    title="نسخ إلى الحافظة"
                                    aria-label={`نسخ العنوان ${index + 1}`}
                                >
                                    {copiedIndex === index ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                    )}
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
                
                {!isLoading && titles.length === 0 && !error && (
                    <p className="text-brand-light m-auto">ستظهر العناوين المقترحة هنا.</p>
                )}
            </div>
        </div>
    );
};

export default YoutubeTitleGeneratorTool;