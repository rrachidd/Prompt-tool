import React, { useState, useEffect } from 'react';
import { getAiNews, AiNewsArticle } from '../services/geminiService';

const NewsArticleCard: React.FC<{ article: AiNewsArticle }> = ({ article }) => (
    <div className="bg-brand-blue rounded-xl overflow-hidden shadow-lg hover:shadow-brand-cyan/20 border border-brand-mid hover:border-brand-cyan transition-all duration-300 transform hover:-translate-y-2 flex flex-col">
        <div className="p-6 flex-grow flex flex-col">
            <h3 className="text-xl font-bold text-white mb-3">{article.title}</h3>
            <p className="text-brand-light mb-4 flex-grow">{article.summary}</p>
            <div className="mt-auto pt-4 border-t border-brand-mid flex justify-between items-center">
                <span className="text-sm text-brand-mid font-semibold truncate" title={article.sourceTitle}>{article.sourceName}</span>
                <a 
                    href={article.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-brand-cyan hover:underline font-bold"
                    aria-label={`Read more about ${article.title}`}
                >
                    اقرأ المزيد &rarr;
                </a>
            </div>
        </div>
    </div>
);


const BlogPage: React.FC = () => {
    const [articles, setArticles] = useState<AiNewsArticle[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchNews = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const newsArticles = await getAiNews();
                setArticles(newsArticles);
            } catch (err) {
                const message = err instanceof Error ? err.message : 'An unknown error occurred';
                setError(`فشل في جلب الأخبار: ${message}`);
            } finally {
                setIsLoading(false);
            }
        };

        fetchNews();
    }, []);

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {Array.from({ length: 6 }).map((_, index) => (
                         <div key={index} className="bg-brand-blue rounded-xl p-6 border border-brand-mid">
                            <div className="animate-pulse flex flex-col gap-4">
                                <div className="h-6 bg-brand-mid rounded w-3/4"></div>
                                <div className="h-4 bg-brand-mid rounded w-full"></div>
                                <div className="h-4 bg-brand-mid rounded w-5/6"></div>
                                <div className="h-4 bg-brand-mid rounded w-1/2 mt-4"></div>
                            </div>
                        </div>
                    ))}
                </div>
            );
        }

        if (error) {
            return (
                <div className="text-center py-20 bg-red-900/20 border border-red-500 rounded-lg">
                    <p className="text-red-400 text-lg font-bold">حدث خطأ</p>
                    <p className="text-red-300 mt-2">{error}</p>
                </div>
            );
        }
        
        if (articles.length === 0) {
            return (
                 <div className="text-center py-20">
                    <p className="text-brand-light text-lg">لم يتم العثور على مقالات حاليًا.</p>
                </div>
            );
        }

        return (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {articles.map((article, index) => (
                    <NewsArticleCard key={index} article={article} />
                ))}
            </div>
        );
    };

    return (
        <div className="container mx-auto px-6 py-16">
            <div className="text-center mb-16">
                <h1 className="text-4xl md:text-5xl font-extrabold text-white">المدونة</h1>
                <p className="mt-4 text-lg text-brand-light max-w-2xl mx-auto">
                    أحدث المقالات والأخبار من عالم الذكاء الاصطناعي، يتم تحديثها تلقائيًا.
                </p>
            </div>
            {renderContent()}
        </div>
    );
};

export default BlogPage;
