import React, { useState, useRef, useCallback } from 'react';

// Make TypeScript aware of pdf.js from CDN and set the worker source
declare const pdfjsLib: any;
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

const PdfToImagesTool: React.FC = () => {
    // State
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [fileName, setFileName] = useState<string>('');
    const [imageFormat, setImageFormat] = useState<'image/png' | 'image/jpeg' | 'image/webp'>('image/png');
    const [jpegQuality, setJpegQuality] = useState(0.9);
    const [generatedImages, setGeneratedImages] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [error, setError] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [progress, setProgress] = useState({ current: 0, total: 0 });

    // Ref
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Handlers
    const handleFileChange = (file: File | null) => {
        if (!file || file.type !== 'application/pdf') {
            setError('الرجاء اختيار ملف PDF صالح.');
            return;
        }
        setError('');
        setPdfFile(file);
        setFileName(file.name);
        setGeneratedImages([]); // Clear previous results
    };

    const handleConvert = useCallback(async () => {
        if (!pdfFile) {
            setError('الرجاء اختيار ملف أولاً.');
            return;
        }
        setIsLoading(true);
        setError('');
        setGeneratedImages([]);
        setProgress({ current: 0, total: 0 });

        try {
            const arrayBuffer = await pdfFile.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            const numPages = pdf.numPages;
            setProgress({ current: 0, total: numPages });
            const images: string[] = [];

            for (let pageNum = 1; pageNum <= numPages; pageNum++) {
                const page = await pdf.getPage(pageNum);
                const scale = 2.0; // Higher scale for better quality
                const viewport = page.getViewport({ scale });

                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                const renderContext = { canvasContext: context, viewport: viewport };
                await page.render(renderContext).promise;

                const imgUrl = canvas.toDataURL(imageFormat, imageFormat === 'image/jpeg' ? jpegQuality : undefined);
                images.push(imgUrl);
                setProgress({ current: pageNum, total: numPages });
            }
            setGeneratedImages(images);
        } catch (err) {
            console.error('Error converting PDF:', err);
            setError('فشل تحويل الملف. يرجى التأكد من أن الملف غير تالف.');
        } finally {
            setIsLoading(false);
        }
    }, [pdfFile, imageFormat, jpegQuality]);

    const handleDownloadAll = useCallback(() => {
        if (generatedImages.length === 0) return;
        setIsDownloading(true);

        const extension = imageFormat.split('/')[1];
        
        generatedImages.forEach((imgSrc, index) => {
            setTimeout(() => {
                const link = document.createElement('a');
                link.href = imgSrc;
                link.download = `page-${index + 1}.${extension}`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                if (index === generatedImages.length - 1) {
                    setIsDownloading(false);
                }
            }, index * 200); // Stagger downloads to prevent browser issues
        });
    }, [generatedImages, imageFormat]);

    // Drag and Drop handlers
    const onDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragging(true); };
    const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragging(false); };
    const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileChange(e.dataTransfer.files[0]);
        }
    };

    // UI Render
    return (
        <div className="h-full flex flex-col">
            <h2 className="text-3xl font-bold text-white mb-2">تحويل PDF إلى صور</h2>
            <p className="text-brand-light mb-6">حوّل صفحات ملف PDF إلى صور بصيغ مختلفة (PNG, JPEG, WebP) بسهولة.</p>

            <div className="bg-brand-blue border border-brand-mid rounded-lg p-6 space-y-6">
                {!pdfFile ? (
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
                        className={`flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isDragging ? 'border-brand-cyan bg-brand-mid/20' : 'border-brand-mid hover:border-brand-light'}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-brand-light" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        <p className="mt-4 text-white font-semibold">اسحب ملف PDF هنا أو انقر للاختيار</p>
                        <input type="file" ref={fileInputRef} onChange={(e) => handleFileChange(e.target.files?.[0] || null)} accept="application/pdf" className="hidden" />
                    </div>
                ) : (
                    <div className="flex items-center justify-between bg-brand-dark p-4 rounded-lg">
                        <div className="flex items-center gap-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                            <span className="text-white font-medium truncate">{fileName}</span>
                        </div>
                        <button onClick={() => { setPdfFile(null); setFileName(''); setGeneratedImages([]); }} className="text-brand-light hover:text-white transition-colors">تغيير الملف</button>
                    </div>
                )}
                
                <div className="grid md:grid-cols-2 gap-4 items-end">
                    <div>
                        <label htmlFor="imageFormat" className="block text-brand-light mb-2">صيغة الصورة:</label>
                        <select id="imageFormat" value={imageFormat} onChange={(e) => setImageFormat(e.target.value as any)} className="w-full bg-brand-dark border border-brand-mid rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-cyan">
                            <option value="image/png">PNG (جودة عالية)</option>
                            <option value="image/jpeg">JPEG (حجم أصغر)</option>
                            <option value="image/webp">WebP (أفضل توازن)</option>
                        </select>
                    </div>
                    {imageFormat === 'image/jpeg' && (
                        <div>
                            <label htmlFor="jpegQuality" className="block text-brand-light mb-2">جودة JPEG: <span className="text-white font-bold">{jpegQuality}</span></label>
                            <input type="range" id="jpegQuality" min="0.1" max="1" step="0.1" value={jpegQuality} onChange={(e) => setJpegQuality(parseFloat(e.target.value))} className="w-full accent-brand-cyan" />
                        </div>
                    )}
                </div>
                
                <div className="flex gap-4 flex-wrap">
                    <button onClick={handleConvert} disabled={isLoading || !pdfFile} className="flex-1 bg-brand-cyan text-brand-dark font-bold py-3 px-6 rounded-lg hover:bg-opacity-80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm10 10a1 1 0 01-1-1V11.899a7.002 7.002 0 01-11.601-2.566 1 1 0 011.885-.666A5.002 5.002 0 0014.001 13H11a1 1 0 010-2h5a1 1 0 011 1v5a1 1 0 01-1 1z" clipRule="evenodd" /></svg>
                        {isLoading ? `جاري التحويل... (${progress.current}/${progress.total})` : 'تحويل الآن'}
                    </button>
                    <button onClick={handleDownloadAll} disabled={isDownloading || generatedImages.length === 0} className="flex-1 bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                        {isDownloading ? 'جاري التحميل...' : 'تحميل الكل'}
                    </button>
                </div>
            </div>
            
            {error && <p className="text-red-400 mt-4 bg-red-900/50 p-3 rounded-md text-center">{error}</p>}
            
            <div className="flex-grow mt-6">
                {isLoading && (
                    <div className="w-full bg-brand-dark rounded-lg overflow-hidden">
                        <div className="bg-brand-cyan h-2" style={{ width: `${(progress.current / progress.total) * 100}%`, transition: 'width 0.3s' }}></div>
                    </div>
                )}
                {generatedImages.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {generatedImages.map((src, index) => (
                            <div key={index} className="bg-brand-dark p-2 rounded-lg shadow-lg border border-brand-mid group transition-transform transform hover:-translate-y-1">
                                <img src={src} alt={`Page ${index + 1}`} className="w-full h-auto rounded-md" loading="lazy" />
                                <p className="text-center text-brand-light mt-2 text-sm">صفحة {index + 1}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PdfToImagesTool;
