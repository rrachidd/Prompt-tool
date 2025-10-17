import React, { useState, useCallback } from 'react';
import { transcribeYoutubeVideo, VideoTranscriptResult } from '../services/geminiService';

const VideoToTextTool: React.FC = () => {
    // State management
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [videoId, setVideoId] = useState<string | null>(null);
    const [language, setLanguage] = useState('ar');
    
    const [isLoading, setIsLoading] = useState(false); // For transcription API call
    const [error, setError] = useState('');
    
    const [result, setResult] = useState<VideoTranscriptResult | null>(null);

    // Helper to get video ID from URL
    const getYoutubeVideoId = (url: string): string | null => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    // Stage 1: Load Video
    const handleLoadVideo = () => {
        setError('');
        setResult(null);
        const id = getYoutubeVideoId(youtubeUrl);
        if (id) {
            setVideoId(id);
        } else {
            setError('الرجاء إدخال رابط فيديو يوتيوب صحيح.');
        }
    };

    // Stage 2: Transcribe
    const handleTranscribe = useCallback(async () => {
        if (!youtubeUrl) {
            setError('الرجاء إدخال رابط الفيديو أولاً.');
            return;
        }
        setIsLoading(true);
        setError('');
        setResult(null);
        try {
            const apiResult = await transcribeYoutubeVideo(youtubeUrl, language);
            setResult(apiResult);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [youtubeUrl, language]);
    
    // Actions on transcript
    const handleCopyToClipboard = () => {
        if (result?.transcript) {
            navigator.clipboard.writeText(result.transcript);
            alert('تم نسخ النص بنجاح!');
        }
    };
    
    const handleDownloadTranscript = () => {
        if (result?.transcript) {
            const blob = new Blob([result.transcript], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${result.title || 'transcript'}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    };

    const handleReset = () => {
        setYoutubeUrl('');
        setVideoId(null);
        setResult(null);
        setError('');
        setIsLoading(false);
    };

    const inputClasses = "w-full bg-brand-dark border border-brand-mid rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-cyan";

    return (
        <div className="h-full flex flex-col gap-6">
            <header className="text-center">
                <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-2">تحويل فيديو يوتيوب إلى نص</h2>
                <p className="text-brand-light max-w-2xl mx-auto">استخدم قوة Gemini لاستخراج النصوص من أي فيديو يوتيوب بدقة وسرعة.</p>
            </header>
            
            <div className="bg-brand-blue p-6 rounded-xl border border-brand-mid">
                <div className="flex flex-col sm:flex-row gap-4">
                    <input
                        type="url"
                        value={youtubeUrl}
                        onChange={(e) => setYoutubeUrl(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !videoId && handleLoadVideo()}
                        placeholder="أدخل رابط فيديو يوتيوب هنا..."
                        className="flex-grow bg-brand-dark border border-brand-mid rounded-lg px-4 py-3 text-white"
                        disabled={!!videoId}
                    />
                    {!videoId ? (
                         <button onClick={handleLoadVideo} className="bg-brand-cyan text-brand-dark font-bold py-3 px-6 rounded-lg hover:bg-opacity-80 transition-colors">
                            تحميل الفيديو
                         </button>
                    ) : (
                         <button onClick={handleReset} className="bg-red-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-red-700 transition-colors">
                            إعادة تعيين
                         </button>
                    )}
                </div>
                 {error && !videoId && <p className="text-red-400 text-center mt-3">{error}</p>}
            </div>

            {videoId && (
                <div className="grid md:grid-cols-2 gap-8 flex-grow animate-fade-in">
                    {/* Left: Video & Controls */}
                    <div className="bg-brand-blue p-6 rounded-xl border border-brand-mid flex flex-col gap-4">
                         <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden bg-black">
                            <iframe
                                key={videoId} // Force re-render on new video
                                src={`https://www.youtube.com/embed/${videoId}`}
                                title="YouTube video player"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="w-full h-full"
                            ></iframe>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4">
                             <select value={language} onChange={(e) => setLanguage(e.target.value)} disabled={isLoading} className={`${inputClasses} flex-grow`}>
                                <option value="ar">العربية</option>
                                <option value="en">English</option>
                                <option value="fr">Français</option>
                                <option value="es">Español</option>
                                <option value="de">Deutsch</option>
                            </select>
                             <button onClick={handleTranscribe} disabled={isLoading} className="bg-brand-cyan text-brand-dark font-bold py-3 px-6 rounded-lg hover:bg-opacity-80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                {isLoading ? '...جاري التحويل' : 'استخراج النص'}
                            </button>
                        </div>
                        {error && !result && <p className="text-red-400 text-center">{error}</p>}
                    </div>
                    {/* Right: Transcript */}
                     <div className="bg-brand-blue p-6 rounded-xl border border-brand-mid flex flex-col">
                        <h3 className="text-xl font-bold text-white mb-2">{result?.title || 'النص المستخرج'}</h3>
                         <div className="flex-grow bg-brand-dark rounded-lg p-4 overflow-y-auto min-h-[300px] relative">
                            {isLoading && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-brand-light">
                                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-cyan"></div>
                                    <p className="mt-3">جاري تحليل الفيديو...</p>
                                </div>
                            )}
                            {result?.transcript ? (
                                <>
                                <pre className="whitespace-pre-wrap text-brand-extralight w-full h-full font-cairo">{result.transcript}</pre>
                                <div className="absolute top-2 left-2 flex gap-2">
                                    <button onClick={handleCopyToClipboard} title="نسخ النص" className="p-2 bg-brand-mid rounded-md hover:bg-brand-light">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                    </button>
                                     <button onClick={handleDownloadTranscript} title="تحميل النص" className="p-2 bg-brand-mid rounded-md hover:bg-brand-light">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                    </button>
                                </div>
                                </>
                            ) : (
                                !isLoading && <p className="text-brand-light m-auto text-center">سيظهر النص هنا بعد معالجة الفيديو.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VideoToTextTool;
