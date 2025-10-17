import React, { useState } from 'react';

// Interfaces for the API responses
interface Author {
    avatar: string;
    nickname: string;
}

interface VideoData {
    author: Author;
    title: string;
    digg_count: number;
    comment_count: number;
    share_count: number;
    play: string; // no watermark
    wmplay: string; // with watermark
    hdplay: string;
    music: string;
}

const TiktokDownloaderTool: React.FC = () => {
    const [videoUrl, setVideoUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<VideoData | null>(null);
    const [error, setError] = useState('');

    const isValidTikTokUrl = (url: string) => {
        const tiktokPattern = /(https?:\/\/(www\.)?)?(vm\.|vt\.)?tiktok\.com\/.+/;
        return tiktokPattern.test(url);
    };

    const fetchVideoData = async (url: string): Promise<VideoData> => {
        const apiUrl = `https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`;
        
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('فشل في الاتصال بخدمة التحميل.');
        }
        const data = await response.json();

        if (data.code !== 0) {
            throw new Error(data.msg || 'فشل في معالجة الفيديو. قد يكون الرابط غير صحيح أو خاص.');
        }
        return data.data;
    };
    
    const formatCount = (count: number) => {
        if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M';
        if (count >= 1000) return (count / 1000).toFixed(1) + 'K';
        return count.toString();
    };
    
    const downloadFile = (url: string, filename: string) => {
        const a = document.createElement('a');
        a.href = url;
        a.target = '_blank';
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const handleDownload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isValidTikTokUrl(videoUrl)) {
            setError('الرجاء إدخال رابط تيك توك صحيح!');
            return;
        }

        setIsLoading(true);
        setResult(null);
        setError('');

        try {
            const data = await fetchVideoData(videoUrl);
            setResult(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع.');
        } finally {
            setIsLoading(false);
        }
    };

    const inputClasses = "w-full bg-brand-dark border border-brand-mid rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-cyan";
    
    return (
        <div className="h-full flex flex-col">
            <h2 className="text-3xl font-bold text-white mb-2"><i className="bi bi-tiktok mr-2"></i> تحميل فيديو تيك توك</h2>
            <p className="text-brand-light mb-6">بدون علامة مائية | مجاني وسريع</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left side: Instructions & Form */}
                <div className="bg-brand-blue border border-brand-mid rounded-lg p-6 space-y-6">
                    <div>
                        <div className="flex items-center mb-3"><div className="w-8 h-8 rounded-full bg-brand-cyan text-brand-dark flex items-center justify-center font-bold ml-3 flex-shrink-0">1</div><p>انسخ رابط فيديو تيك توك</p></div>
                        <div className="flex items-center"><div className="w-8 h-8 rounded-full bg-brand-cyan text-brand-dark flex items-center justify-center font-bold ml-3 flex-shrink-0">2</div><p>الصق الرابط في الحقل أدناه واضغط تحميل</p></div>
                    </div>

                    <form onSubmit={handleDownload}>
                        <div className="mb-4">
                            <label htmlFor="videoUrl" className="block text-brand-light mb-2">رابط الفيديو:</label>
                            <input type="text" id="videoUrl" value={videoUrl} onChange={e => setVideoUrl(e.target.value)} placeholder="https://vm.tiktok.com/..." required className={inputClasses}/>
                        </div>
                        <button type="submit" disabled={isLoading} className="w-full bg-brand-cyan text-brand-dark font-bold py-3 px-6 rounded-lg hover:bg-opacity-80 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                            {isLoading ? <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-brand-dark"></div><span>جاري المعالجة...</span></> : <><i className="bi bi-download"></i><span>تحميل الفيديو</span></>}
                        </button>
                    </form>
                    {error && <div className="p-3 mt-4 rounded-md border text-center font-semibold bg-red-500/20 border-red-400 text-red-300">{error}</div>}
                </div>
                
                {/* Right side: Result */}
                <div className="bg-brand-blue border border-brand-mid rounded-lg p-6 flex flex-col items-center justify-center min-h-[300px]">
                    {isLoading && (
                        <div className="text-center text-brand-light">
                             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-cyan mx-auto"></div>
                             <p className="mt-3">جاري معالجة طلبك...</p>
                        </div>
                    )}

                    {result && !isLoading && (
                         <div className="w-full animate-fade-in">
                            <h3 className="text-xl font-bold text-white mb-4 text-center">الفيديو جاهز!</h3>
                            
                            <div className="bg-brand-dark p-3 rounded-lg mb-4">
                               <div className="flex items-center mb-3">
                                   <img src={result.author.avatar} className="w-12 h-12 rounded-full ml-3" alt="صورة الناشر" />
                                   <div>
                                       <div className="font-bold text-white">{result.author.nickname}</div>
                                       <p className="text-sm text-brand-light truncate">{result.title}</p>
                                   </div>
                               </div>
                                <div className="flex justify-around text-center text-sm border-t border-brand-mid pt-2">
                                    <div><div className="font-bold text-brand-cyan">{formatCount(result.digg_count)}</div><div className="text-brand-light">إعجاب</div></div>
                                    <div><div className="font-bold text-brand-cyan">{formatCount(result.comment_count)}</div><div className="text-brand-light">تعليق</div></div>
                                    <div><div className="font-bold text-brand-cyan">{formatCount(result.share_count)}</div><div className="text-brand-light">مشاركة</div></div>
                                </div>
                            </div>
                            
                            <video src={result.play || result.hdplay} controls className="w-full rounded-lg mb-4 bg-black"></video>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <button onClick={() => downloadFile(result.hdplay || result.play, 'tiktok-video-hd.mp4')} className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2">
                                    <i className="bi bi-camera-video-fill"></i> تحميل الفيديو (HD)
                                </button>
                                <button onClick={() => downloadFile(result.music, 'tiktok-audio.mp3')} className="bg-brand-mid text-white font-bold py-2 px-4 rounded-lg hover:bg-brand-light flex items-center justify-center gap-2">
                                    <i className="bi bi-music-note-beamed"></i> تحميل الصوت
                                </button>
                            </div>
                         </div>
                    )}

                    {!result && !isLoading && !error && (
                        <div className="text-center text-brand-light">
                            <p>ستظهر نتائج التحميل هنا.</p>
                        </div>
                    )}
                </div>
            </div>
            <div className="p-4 mt-6 rounded-md border text-center font-semibold bg-yellow-500/20 border-yellow-400 text-yellow-300">
                <i className="bi bi-exclamation-triangle-fill mr-2"></i>
                <strong>ملاحظة:</strong> هذا الموقع مخصص للاستخدام الشخصي فقط. يرجى احترام حقوق الملكية الفكرية.
            </div>
        </div>
    );
};

export default TiktokDownloaderTool;