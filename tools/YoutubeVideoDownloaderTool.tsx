import React, { useState, useCallback } from 'react';

// Interfaces for API data
interface VideoSnippet {
    publishedAt: string;
    channelTitle: string;
    title: string;
    thumbnails: {
        medium: { url: string };
    };
}

interface VideoItem {
    id: { videoId: string };
    snippet: VideoSnippet;
}

const YoutubeVideoDownloaderTool: React.FC = () => {
    const [query, setQuery] = useState('');
    const [maxResults, setMaxResults] = useState('10');
    const [videos, setVideos] = useState<VideoItem[]>([]);
    const [selectedVideo, setSelectedVideo] = useState<{ id: string; title: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const apiKey = "AIzaSyCRCe1cGNnzheCCLut7dTRagBkWqE2yUvs";

    const performSearch = useCallback(async () => {
        if (!query.trim()) {
            setError('الرجاء إدخال كلمات البحث');
            return;
        }
        setIsLoading(true);
        setError('');
        setVideos([]);
        setSelectedVideo(null);

        const url = `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&type=video&part=snippet&maxResults=${maxResults}&q=${encodeURIComponent(query)}`;

        try {
            const response = await fetch(url);
            const data = await response.json();
            if (data.error) {
                throw new Error(data.error.errors[0]?.message || 'An API error occurred');
            }
            if (data.items.length === 0) {
                setError('لم يتم العثور على نتائج.');
            }
            setVideos(data.items);
        } catch (err) {
            setError(err instanceof Error ? `حدث خطأ أثناء البحث: ${err.message}. قد تكون حصة API قد استنفدت.` : 'حدث خطأ غير متوقع.');
        } finally {
            setIsLoading(false);
        }
    }, [query, maxResults, apiKey]);

    const handleVideoSelect = (video: VideoItem) => {
        setSelectedVideo({ id: video.id.videoId, title: video.snippet.title });
        const playerElement = document.getElementById('video-player-section');
        if (playerElement && window.innerWidth < 1024) {
            playerElement.scrollIntoView({ behavior: 'smooth' });
        }
    };
    
    const handleRealDownload = () => {
        if (!selectedVideo) return;
        const downloadUrl = `https://www.ssyoutube.com/watch?v=${selectedVideo.id}`;
        window.open(downloadUrl, '_blank', 'noopener,noreferrer');
    };

    return (
        <div className="h-full flex flex-col">
            <h2 className="text-3xl font-bold text-white mb-2">تحميل فيديو YouTube</h2>
            <p className="text-brand-light mb-6">ابحث عن فيديوهات يوتيوب وحمّلها عبر خدمة خارجية.</p>

            <div className="bg-brand-blue border border-brand-mid rounded-lg p-6 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <input type="text" value={query} onChange={e => setQuery(e.target.value)} onKeyPress={e => e.key === 'Enter' && performSearch()} placeholder="أدخل كلمات البحث..." className="flex-grow bg-brand-dark border border-brand-mid rounded-full px-5 py-3 text-white" />
                    <select value={maxResults} onChange={e => setMaxResults(e.target.value)} className="bg-brand-dark border border-brand-mid rounded-full px-5 py-3 text-white">
                        <option value="5">5 نتائج</option>
                        <option value="10">10 نتائج</option>
                        <option value="15">15 نتائج</option>
                        <option value="20">20 نتائج</option>
                    </select>
                    <button onClick={performSearch} disabled={isLoading} className="bg-brand-cyan text-brand-dark font-bold py-3 px-6 rounded-full hover:bg-opacity-80 disabled:opacity-50 flex items-center justify-center gap-2">
                        {isLoading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-brand-dark"></div> : <i className="bi bi-search"></i>}
                        <span>{isLoading ? 'جاري البحث...' : 'بحث'}</span>
                    </button>
                </div>
            </div>

            {error && <div className="p-4 mb-6 bg-red-500/20 border border-red-400 text-red-300 rounded-md text-center">{error}</div>}

            <div className="flex-grow grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8">
                    <h3 className="text-2xl font-bold text-white mb-4 border-r-4 border-brand-cyan pr-3">
                        {videos.length > 0 ? `نتائج البحث (${videos.length})` : 'نتائج البحث'}
                    </h3>
                    {isLoading && <div className="text-center p-10"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-cyan mx-auto"></div></div>}
                    {!isLoading && videos.length === 0 && !error && (
                         <div className="text-center py-10 text-brand-light"><i className="bi bi-youtube text-5xl"></i><p className="mt-3">ابحث للعثور على الفيديوهات.</p></div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {videos.map(video => (
                            <div key={video.id.videoId} onClick={() => handleVideoSelect(video)} className="bg-brand-blue border border-brand-mid rounded-lg overflow-hidden cursor-pointer transition-transform transform hover:-translate-y-1 hover:shadow-lg hover:shadow-brand-cyan/10">
                                <img src={video.snippet.thumbnails.medium.url} alt={video.snippet.title} className="w-full h-40 object-cover"/>
                                <div className="p-3">
                                    <h4 className="text-white font-semibold h-12 overflow-hidden">{video.snippet.title}</h4>
                                    <p className="text-sm text-brand-light mt-1">{video.snippet.channelTitle}</p>
                                    <p className="text-xs text-brand-mid mt-1">نشر في: {new Date(video.snippet.publishedAt).toLocaleDateString('ar-EG')}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                
                <div className="lg:col-span-4 lg:sticky top-24 self-start" id="video-player-section">
                    <h3 className="text-2xl font-bold text-white mb-4 border-r-4 border-brand-cyan pr-3">مشغل الفيديو</h3>
                    <div className="aspect-w-16 aspect-h-9 bg-black rounded-lg overflow-hidden mb-4">
                        {selectedVideo ? (
                            <iframe src={`https://www.youtube.com/embed/${selectedVideo.id}`} allowFullScreen className="w-full h-full"></iframe>
                        ) : (
                            <div className="flex items-center justify-center h-full text-brand-light"><div className="text-center"><i className="bi bi-play-circle text-4xl"></i><p className="mt-2">اختر فيديو لعرضه</p></div></div>
                        )}
                    </div>
                    
                    {selectedVideo && (
                        <div className="bg-brand-blue border border-brand-mid rounded-lg p-4 animate-fade-in">
                            <h5 className="font-bold text-white mb-1 truncate">{selectedVideo.title}</h5>
                            <p className="text-sm text-brand-light mb-4">
                                لتحميل هذا الفيديو، سيتم توجيهك إلى خدمة خارجية.
                            </p>
                            <button 
                                onClick={handleRealDownload} 
                                className="w-full mt-4 bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 transition-transform transform hover:scale-105"
                            >
                                <i className="bi bi-box-arrow-up-right"></i>
                                <span>الانتقال إلى صفحة التحميل</span>
                            </button>
                            <p className="text-xs text-brand-mid mt-2 text-center">
                                ملاحظة: سيتم فتح نافذة جديدة. نحن غير مسؤولين عن محتوى الخدمات الخارجية.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default YoutubeVideoDownloaderTool;
