import React, { useState, useCallback, useEffect } from 'react';

interface VideoResult {
    id: string;
    title: string;
    thumbnail: string;
    channelTitle: string;
    description: string;
    tags: string[];
    viewCount: string;
    likeCount: string;
    commentCount: string;
    duration: string;
}

const YOUTUBE_API_KEY = 'AIzaSyCRCe1cGNnzheCCLut7dTRagBkWqE2yUvs';

const YoutubeNicheSearchTool: React.FC = () => {
    const [query, setQuery] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [durationFilter, setDurationFilter] = useState('');
    const [results, setResults] = useState<VideoResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [toast, setToast] = useState<string | null>(null);
    const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});
    const [isApiConfigured, setIsApiConfigured] = useState(false);

    useEffect(() => {
        if (YOUTUBE_API_KEY) {
            setIsApiConfigured(true);
        } else {
            setError('مفتاح YouTube Data API غير مهيأ. هذه الأداة لن تعمل.');
            setIsApiConfigured(false);
        }
    }, []);

    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    const showToast = (message: string) => {
        setToast(message);
    };

    const copyToClipboard = useCallback((text: string, successMessage: string) => {
        navigator.clipboard.writeText(text).then(() => {
            showToast(successMessage);
        }).catch(() => {
            showToast('فشل النسخ إلى الحافظة');
        });
    }, []);

    const performSearch = useCallback(async () => {
        if (!isApiConfigured) {
            return;
        }
        if (!query.trim()) {
            setError('الرجاء إدخال مصطلح للبحث عنه.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setResults([]);
        
        try {
            // Build search parameters
            const params: Record<string, string> = {
                part: 'snippet',
                q: query,
                type: 'video',
                key: YOUTUBE_API_KEY!,
                maxResults: '12',
                order: 'viewCount'
            };

            if (dateFilter) {
                const now = new Date();
                let date = new Date();
                if (dateFilter === 'today') date.setHours(0, 0, 0, 0);
                else if (dateFilter === 'this_week') date.setDate(now.getDate() - 7);
                else if (dateFilter === 'this_month') date.setMonth(now.getMonth() - 1);
                else if (dateFilter === 'this_year') date.setFullYear(now.getFullYear() - 1);
                params.publishedAfter = date.toISOString();
            }

            if (durationFilter) params.videoDuration = durationFilter;

            const searchResponse = await fetch(`https://www.googleapis.com/youtube/v3/search?${new URLSearchParams(params)}`);
            const searchData = await searchResponse.json();

            if (searchData.error) throw new Error(searchData.error.errors[0]?.message || 'An API error occurred');
            if (!searchData.items || searchData.items.length === 0) {
                 setError('لم يتم العثور على فيديوهات. حاول بكلمات بحث مختلفة.');
                 setIsLoading(false);
                 return;
            }

            const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',');
            const detailsResponse = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=statistics,contentDetails,snippet&id=${videoIds}&key=${YOUTUBE_API_KEY!}`);
            const detailsData = await detailsResponse.json();

            const formatNumber = (numStr: string | undefined): string => {
                const num = parseInt(numStr || '0', 10);
                if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
                if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
                return num.toString();
            };

            const formatDuration = (durationStr: string | undefined): string => {
                if (!durationStr) return 'N/A';
                const match = durationStr.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
                if (!match) return 'N/A';
                const hours = parseInt(match[1] || '0');
                const minutes = parseInt(match[2] || '0');
                const seconds = parseInt(match[3] || '0');
                if (hours > 0) return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                return `${minutes}:${seconds.toString().padStart(2, '0')}`;
            };
            
            const videos = searchData.items.map((item: any): VideoResult => {
                const details = detailsData.items.find((d: any) => d.id === item.id.videoId);
                return {
                    id: item.id.videoId,
                    title: item.snippet.title,
                    thumbnail: item.snippet.thumbnails.medium.url,
                    channelTitle: item.snippet.channelTitle,
                    description: details?.snippet?.description || '',
                    tags: details?.snippet?.tags || [],
                    viewCount: formatNumber(details?.statistics?.viewCount),
                    likeCount: formatNumber(details?.statistics?.likeCount),
                    commentCount: formatNumber(details?.statistics?.commentCount),
                    duration: formatDuration(details?.contentDetails?.duration),
                };
            });
            setResults(videos);
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'An unknown error occurred';
            setError(`حدث خطأ: ${msg}. تأكد من صحة مفتاح API وصلاحياته.`);
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [query, dateFilter, durationFilter, isApiConfigured]);
    
    const handleCopyTitle = (id: string, title: string) => {
        copyToClipboard(title, 'تم نسخ العنوان!');
        setCopiedStates(prev => ({ ...prev, [id]: true }));
        setTimeout(() => {
             setCopiedStates(prev => ({ ...prev, [id]: false }));
        }, 2000);
    };

    const copyAllTitles = useCallback(() => {
        if (results.length === 0) return;
        const allTitles = results.map(v => v.title).join('\n');
        copyToClipboard(allTitles, `تم نسخ ${results.length} عناوين!`);
    }, [results, copyToClipboard]);

    const copyAllKeywords = useCallback(() => {
        if (results.length === 0) return;
        const allKeywords = [...new Set(results.flatMap(v => v.tags))];
        if (allKeywords.length === 0) {
            showToast('لا توجد كلمات مفتاحية لنسخها.');
            return;
        }
        const keywordsText = allKeywords.join(', ');
        copyToClipboard(keywordsText, `تم نسخ ${allKeywords.length} كلمة مفتاحية فريدة!`);
    }, [results, copyToClipboard]);

    const isDisabled = !isApiConfigured || isLoading;

    return (
        <div className="h-full flex flex-col">
            <h2 className="text-3xl font-bold text-white mb-2">بحث فيديوهات يوتيوب الرائجة</h2>
            <p className="text-brand-light mb-6">اكتشف الفيديوهات الأكثر مشاهدة في مجالك أو تخصصك.</p>

            <div className="bg-brand-blue border border-brand-mid rounded-lg p-4 mb-6">
                 <div className="flex flex-col sm:flex-row gap-4 mb-4">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && performSearch()}
                        placeholder="أدخل تخصصًا أو موضوعًا..."
                        className="flex-grow bg-brand-dark border border-brand-mid rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-cyan disabled:opacity-50"
                        disabled={isDisabled}
                    />
                    <button onClick={performSearch} disabled={isDisabled} className="bg-brand-cyan text-brand-dark font-bold py-3 px-6 rounded-lg hover:bg-opacity-80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        {isLoading ? '...جاري البحث' : 'بحث'}
                    </button>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-grow">
                        <label htmlFor="dateFilter" className="block text-brand-light mb-2 text-sm">تاريخ الرفع:</label>
                        <select id="dateFilter" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="w-full bg-brand-dark border border-brand-mid rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-brand-cyan disabled:opacity-50" disabled={isDisabled}>
                            <option value="">أي وقت</option>
                            <option value="today">اليوم</option>
                            <option value="this_week">هذا الأسبوع</option>
                            <option value="this_month">هذا الشهر</option>
                            <option value="this_year">هذه السنة</option>
                        </select>
                    </div>
                    <div className="flex-grow">
                        <label htmlFor="durationFilter" className="block text-brand-light mb-2 text-sm">المدة:</label>
                        <select id="durationFilter" value={durationFilter} onChange={(e) => setDurationFilter(e.target.value)} className="w-full bg-brand-dark border border-brand-mid rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-brand-cyan disabled:opacity-50" disabled={isDisabled}>
                            <option value="">أي مدة</option>
                            <option value="short">قصيرة (&lt; 4 دقائق)</option>
                            <option value="medium">متوسطة (4-20 دقيقة)</option>
                            <option value="long">طويلة (&gt; 20 دقيقة)</option>
                        </select>
                    </div>
                </div>
            </div>
            
            <div className="flex-grow">
                {isLoading && (
                    <div className="flex flex-col items-center justify-center h-full text-brand-light">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-cyan"></div>
                        <p className="mt-4">جاري تحميل النتائج...</p>
                    </div>
                )}
                {error && <div className="p-4 bg-red-500/20 border border-red-400 text-red-300 rounded-md text-center">{error}</div>}
                {results.length > 0 && (
                    <>
                        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 pb-4 border-b border-brand-mid">
                             <h2 className="text-2xl font-bold text-white">نتائج البحث</h2>
                             <div className="flex gap-2 mt-4 sm:mt-0">
                                 <button onClick={copyAllTitles} className="bg-brand-mid text-white font-bold py-2 px-4 rounded-lg hover:bg-brand-light transition-colors inline-flex items-center gap-2 text-sm">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                    نسخ العناوين
                                 </button>
                                 <button onClick={copyAllKeywords} className="bg-brand-mid text-white font-bold py-2 px-4 rounded-lg hover:bg-brand-light transition-colors inline-flex items-center gap-2 text-sm">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2zm0 0v10a2 2 0 002 2h5a2 2 0 002-2V5a2 2 0 00-2-2H5z" /></svg>
                                    نسخ الكلمات المفتاحية
                                 </button>
                             </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {results.map(video => (
                                <div key={video.id} className="bg-brand-blue border border-brand-mid rounded-lg overflow-hidden flex flex-col">
                                    <a href={`https://www.youtube.com/watch?v=${video.id}`} target="_blank" rel="noopener noreferrer">
                                        <img src={video.thumbnail} alt={video.title} className="w-full h-48 object-cover"/>
                                    </a>
                                    <div className="p-4 flex flex-col flex-grow">
                                        <div className="flex justify-between items-start gap-2 mb-2">
                                            <h3 className="text-md font-bold text-white leading-snug flex-grow" title={video.title}>{video.title}</h3>
                                            <button onClick={() => handleCopyTitle(video.id, video.title)} title="نسخ العنوان" className="flex-shrink-0 text-brand-light hover:text-brand-cyan transition-colors">
                                                {copiedStates[video.id] ? 
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg> :
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                                }
                                            </button>
                                        </div>
                                        <p className="text-sm text-brand-mid mb-3">{video.channelTitle}</p>
                                        <div className="text-xs text-brand-light grid grid-cols-2 gap-x-2 gap-y-1 mb-3">
                                            <span className="flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C3.732 4.943 9.522 3 10 3s6.268 1.943 9.542 7c-3.274 5.057-9.064 7-9.542 7S3.732 15.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>{video.viewCount} مشاهدة</span>
                                            <span className="flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" /></svg>{video.likeCount} إعجاب</span>
                                            <span className="flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.08-3.239A8.969 8.969 0 012 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM4.707 11.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4a1 1 0 00-1.414-1.414L7 12.586l-1.293-1.293z" clipRule="evenodd" /></svg>{video.commentCount} تعليق</span>
                                            <span className="flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>{video.duration}</span>
                                        </div>
                                        {video.tags.length > 0 && (
                                            <div className="mt-auto pt-3 border-t border-brand-mid">
                                                <div className="flex flex-wrap gap-1">
                                                    {video.tags.slice(0, 4).map(tag => (
                                                        <span key={tag} className="bg-brand-dark text-brand-light text-xs px-2 py-1 rounded-full">{tag}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
            
            {toast && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-brand-cyan text-brand-dark font-bold py-2 px-6 rounded-lg shadow-lg z-50">
                    {toast}
                </div>
            )}
        </div>
    );
};

export default YoutubeNicheSearchTool;