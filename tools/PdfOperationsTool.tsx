import React, { useState, useRef, useCallback, useEffect, ReactNode } from 'react';

// Declarations for CDN libraries
declare const jspdf: any;
declare const PDFLib: any;
declare const pdfjsLib: any;
if (typeof pdfjsLib !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
}

// --- Helper Functions & Components ---
const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const FileDropZone: React.FC<{ onFileChange: (files: File[]) => void; multiple?: boolean; accept?: string; children: React.ReactNode }> = ({ onFileChange, multiple = false, accept, children }) => {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (files: FileList | null) => {
        if (files) {
            onFileChange(Array.from(files));
            if(fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const onDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragging(true); };
    const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragging(false); };
    const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        handleFileSelect(e.dataTransfer.files);
    };

    return (
        <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
            className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isDragging ? 'border-brand-cyan bg-brand-mid/20' : 'border-brand-mid hover:border-brand-light'}`}
        >
            <input type="file" ref={fileInputRef} onChange={(e) => handleFileSelect(e.target.files)} multiple={multiple} accept={accept} className="hidden" />
            {children}
        </div>
    );
};

// --- Tool Implementations ---

const CreatePdfView: React.FC = () => {
    const [title, setTitle] = useState('');
    const contentRef = useRef<HTMLDivElement>(null);
    const [images, setImages] = useState<File[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [resultUrl, setResultUrl] = useState<string | null>(null);

    const handleCreate = async () => {
        const content = contentRef.current?.innerText || '';
        if (!content.trim() && images.length === 0) {
            alert('الرجاء إضافة محتوى نصي أو صور.');
            return;
        }
        setIsLoading(true);
        setResultUrl(null);
        try {
            const { jsPDF } = jspdf;
            const doc = new jsPDF();
            
            doc.setFont('Helvetica'); 
            doc.setR2L(true);

            doc.text(title || "مستند جديد", 105, 20, { align: 'center' });
            
            let yPosition = 40;
            if(content) {
                const lines = doc.splitTextToSize(content, 180);
                doc.text(lines, 200, yPosition, { align: 'right' });
                yPosition += (lines.length * 10) + 10;
            }

            for (const file of images) {
                if (yPosition > 250) {
                    doc.addPage();
                    yPosition = 20;
                }
                const imgData = await fileToBase64(file);
                const img = new Image();
                img.src = imgData;
                await new Promise(resolve => img.onload = resolve);
                
                const imgProps = doc.getImageProperties(imgData);
                const imgWidth = 180;
                const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

                if (yPosition + imgHeight > 280) {
                    doc.addPage();
                    yPosition = 20;
                }
                doc.addImage(imgData, 'JPEG', 15, yPosition, imgWidth, imgHeight);
                yPosition += imgHeight + 10;
            }

            const pdfBlob = doc.output('blob');
            const url = URL.createObjectURL(pdfBlob);
            setResultUrl(url);

        } catch (error) {
            console.error(error);
            alert('حدث خطأ أثناء إنشاء الملف.');
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="space-y-4">
            <h3 className="text-2xl font-bold text-white mb-2">إنشاء ملف PDF جديد</h3>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="عنوان المستند (اختياري)" className="w-full bg-brand-dark border border-brand-mid rounded-lg px-4 py-2 text-white" />
            <div ref={contentRef} contentEditable suppressContentEditableWarning className="w-full min-h-[150px] bg-brand-dark border border-brand-mid rounded-lg p-4 text-white" data-placeholder="اكتب المحتوى هنا..."></div>
            <FileDropZone onFileChange={files => setImages(files)} multiple accept="image/*">
                <p>أضف صورًا (اختياري)</p>
            </FileDropZone>
            {images.length > 0 && <p className="text-brand-light">{images.length} صور تم اختيارها.</p>}
            <button onClick={handleCreate} disabled={isLoading} className="bg-brand-cyan text-brand-dark font-bold py-2 px-6 rounded-lg disabled:opacity-50">
                {isLoading ? 'جاري الإنشاء...' : 'إنشاء PDF'}
            </button>
            {resultUrl && <a href={resultUrl} download={`${title || 'document'}.pdf`} className="block text-center bg-green-600 text-white font-bold py-2 px-6 rounded-lg">تحميل الملف الناتج</a>}
        </div>
    );
}

const MergePdfView: React.FC = () => {
    const [files, setFiles] = useState<File[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [resultUrl, setResultUrl] = useState<string | null>(null);
    const [error, setError] = useState('');

    const handleMerge = async () => {
        if (files.length < 2) {
            setError('الرجاء اختيار ملفين على الأقل.');
            return;
        }
        setIsLoading(true);
        setError('');
        setResultUrl(null);
        try {
            const { PDFDocument } = PDFLib;
            const mergedPdf = await PDFDocument.create();
            for (const file of files) {
                const arrayBuffer = await file.arrayBuffer();
                const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
                const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
                copiedPages.forEach(page => mergedPdf.addPage(page));
            }
            const mergedPdfBytes = await mergedPdf.save();
            const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            setResultUrl(url);
        } catch (err: unknown) {
             if (err instanceof Error) {
                if (err.message.includes('encrypted')) {
                    setError('أحد الملفات محمي بكلمة مرور.');
                } else {
                    setError('أحد الملفات قد يكون تالفًا.');
                }
            } else {
                setError('حدث خطأ غير متوقع.');
            }
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="space-y-4">
             <h3 className="text-2xl font-bold text-white mb-2">دمج ملفات PDF</h3>
            <FileDropZone onFileChange={newFiles => setFiles(prev => [...prev, ...newFiles])} multiple accept=".pdf">
                <p className="text-white font-semibold">اسحب ملفات PDF هنا أو انقر للاختيار</p>
            </FileDropZone>
            {files.length > 0 && (
                <ul className="space-y-2">
                    {files.map((file, i) => <li key={i} className="text-brand-light bg-brand-dark p-2 rounded">{file.name}</li>)}
                </ul>
            )}
            {error && <p className="text-red-400">{error}</p>}
            <button onClick={handleMerge} disabled={isLoading || files.length < 2} className="bg-brand-cyan text-brand-dark font-bold py-2 px-6 rounded-lg disabled:opacity-50">
                {isLoading ? 'جاري الدمج...' : 'دمج الملفات'}
            </button>
            {resultUrl && <a href={resultUrl} download="merged.pdf" className="block text-center bg-green-600 text-white font-bold py-2 px-6 rounded-lg">تحميل الملف المدمج</a>}
        </div>
    );
}

const SplitPdfView: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [range, setRange] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [resultUrls, setResultUrls] = useState<{ name: string, url: string }[]>([]);
    const [error, setError] = useState('');

    const handleSplit = async () => {
        if (!file || !range.trim()) {
            setError('الرجاء اختيار ملف وتحديد نطاق الصفحات.');
            return;
        }
        setIsLoading(true);
        setError('');
        setResultUrls([]);
        try {
            const { PDFDocument } = PDFLib;
            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer);
            const totalPages = pdfDoc.getPageCount();

            const pagesToExtract = new Set<number>();
            range.split(',').forEach(part => {
                if (part.includes('-')) {
                    const [start, end] = part.split('-').map(Number);
                    for (let i = start; i <= end; i++) {
                        if (i > 0 && i <= totalPages) pagesToExtract.add(i - 1);
                    }
                } else {
                    const page = Number(part);
                    if (page > 0 && page <= totalPages) pagesToExtract.add(page - 1);
                }
            });

            if (pagesToExtract.size === 0) {
                setError('النطاق المحدد غير صالح أو فارغ.');
                setIsLoading(false);
                return;
            }

            const newPdf = await PDFDocument.create();
            const copiedPages = await newPdf.copyPages(pdfDoc, Array.from(pagesToExtract));
            copiedPages.forEach(page => newPdf.addPage(page));

            const newPdfBytes = await newPdf.save();
            const blob = new Blob([newPdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            setResultUrls([{ name: 'split.pdf', url }]);

        } catch (err) {
            setError('فشل تقسيم الملف.');
        } finally {
            setIsLoading(false);
        }
    };
    return (
         <div className="space-y-4">
             <h3 className="text-2xl font-bold text-white mb-2">تقسيم ملف PDF</h3>
             <FileDropZone onFileChange={files => setFile(files[0])} accept=".pdf">
                <p className="text-white font-semibold">اختر ملف PDF</p>
            </FileDropZone>
            {file && <p className="text-brand-light">{file.name}</p>}
            <input type="text" value={range} onChange={e => setRange(e.target.value)} placeholder="نطاق الصفحات (مثال: 1-3,5,8)" className="w-full bg-brand-dark border border-brand-mid rounded-lg px-4 py-2 text-white" />
            {error && <p className="text-red-400">{error}</p>}
            <button onClick={handleSplit} disabled={isLoading || !file} className="bg-brand-cyan text-brand-dark font-bold py-2 px-6 rounded-lg disabled:opacity-50">
                {isLoading ? 'جاري التقسيم...' : 'تقسيم الملف'}
            </button>
            {resultUrls.length > 0 && resultUrls.map(res => <a key={res.name} href={res.url} download={res.name} className="block text-center bg-green-600 text-white font-bold py-2 px-6 rounded-lg">تحميل {res.name}</a>)}
        </div>
    );
};

const RepairPdfView: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [resultUrl, setResultUrl] = useState<string | null>(null);
    const [error, setError] = useState('');

    const handleRepair = async () => {
        if (!file) {
            setError('الرجاء اختيار ملف لإصلاحه.');
            return;
        }
        setIsLoading(true);
        setError('');
        setResultUrl(null);
        try {
            const { PDFDocument } = PDFLib;
            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
            const repairedBytes = await pdfDoc.save();
            const blob = new Blob([repairedBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            setResultUrl(url);
        } catch (err) {
            setError('فشل إصلاح الملف. قد يكون تالفًا جدًا.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-4">
             <h3 className="text-2xl font-bold text-white mb-2">إصلاح ملف PDF</h3>
             <p className="text-brand-light">محاولة لإصلاح الملفات التالفة عن طريق إعادة بنائها.</p>
             <FileDropZone onFileChange={files => setFile(files[0])} accept=".pdf">
                <p className="text-white font-semibold">اختر ملف PDF تالف</p>
            </FileDropZone>
            {file && <p className="text-brand-light">{file.name}</p>}
            {error && <p className="text-red-400">{error}</p>}
             <button onClick={handleRepair} disabled={isLoading || !file} className="bg-brand-cyan text-brand-dark font-bold py-2 px-6 rounded-lg disabled:opacity-50">
                {isLoading ? 'جاري الإصلاح...' : 'إصلاح الآن'}
            </button>
            {resultUrl && <a href={resultUrl} download={`repaired_${file?.name}`} className="block text-center bg-green-600 text-white font-bold py-2 px-6 rounded-lg">تحميل الملف المُصلح</a>}
        </div>
    );
};

const PdfToImagesView: React.FC = () => {
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [imageFormat, setImageFormat] = useState<'image/png' | 'image/jpeg' | 'image/webp'>('image/png');
    const [jpegQuality, setJpegQuality] = useState(0.9);
    const [generatedImages, setGeneratedImages] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState({ current: 0, total: 0 });
    const [error, setError] = useState('');

    const handleConvert = useCallback(async () => {
        if (!pdfFile) { setError('الرجاء اختيار ملف أولاً.'); return; }
        setIsLoading(true); setError(''); setGeneratedImages([]); setProgress({ current: 0, total: 0 });
        try {
            const arrayBuffer = await pdfFile.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            const numPages = pdf.numPages;
            setProgress({ current: 0, total: numPages });
            const images: string[] = [];
            for (let i = 1; i <= numPages; i++) {
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: 2.0 });
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.height = viewport.height; canvas.width = viewport.width;
                await page.render({ canvasContext: context, viewport }).promise;
                images.push(canvas.toDataURL(imageFormat, imageFormat === 'image/jpeg' ? jpegQuality : undefined));
                setProgress({ current: i, total: numPages });
            }
            setGeneratedImages(images);
        } catch (err) { setError('فشل تحويل الملف.'); } finally { setIsLoading(false); }
    }, [pdfFile, imageFormat, jpegQuality]);
    
    return (
        <div className="space-y-4">
            <h3 className="text-2xl font-bold text-white mb-2">تحويل PDF إلى صور</h3>
            <FileDropZone onFileChange={files => setPdfFile(files[0])} accept=".pdf">
                <p className="text-white font-semibold">اختر ملف PDF</p>
            </FileDropZone>
            {pdfFile && <p className="text-brand-light bg-brand-dark p-2 rounded text-center">{pdfFile.name}</p>}
            <div className="grid sm:grid-cols-2 gap-4">
                <select value={imageFormat} onChange={e => setImageFormat(e.target.value as any)} className="w-full bg-brand-dark border border-brand-mid rounded-lg px-4 py-2 text-white">
                    <option value="image/png">PNG</option><option value="image/jpeg">JPEG</option><option value="image/webp">WebP</option>
                </select>
                {imageFormat === 'image/jpeg' && <input type="range" min="0.1" max="1" step="0.1" value={jpegQuality} onChange={e => setJpegQuality(parseFloat(e.target.value))} className="w-full accent-brand-cyan" />}
            </div>
            {error && <p className="text-red-400">{error}</p>}
            <button onClick={handleConvert} disabled={isLoading || !pdfFile} className="bg-brand-cyan text-brand-dark font-bold py-2 px-6 rounded-lg disabled:opacity-50">
                {isLoading ? `جاري التحويل... ${progress.current}/${progress.total}` : 'تحويل'}
            </button>
            {generatedImages.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {generatedImages.map((src, i) => <img key={i} src={src} alt={`Page ${i+1}`} className="rounded border border-brand-mid"/>)}
                </div>
            )}
        </div>
    );
};

const CompressPdfView: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [quality, setQuality] = useState<'medium' | 'low' | 'high'>('medium');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<{ url: string, originalSize: string, newSize: string } | null>(null);
    const [error, setError] = useState('');

    const handleCompress = async () => {
        if (!file) { setError('اختر ملفًا أولاً.'); return; }
        setIsLoading(true); setError(''); setResult(null);
        try {
            const qualitySettings = { low: { scale: 0.7, quality: 0.5 }, medium: { scale: 1, quality: 0.7 }, high: { scale: 1.5, quality: 0.9 } };
            const { scale, quality: jpegQuality } = qualitySettings[quality];
            const { jsPDF } = jspdf;
            
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            
            let doc: any | null = null;

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale });
                if (!doc) {
                    doc = new jsPDF({ orientation: viewport.width > viewport.height ? 'l' : 'p', unit: 'pt', format: [viewport.width, viewport.height] });
                } else {
                    doc.addPage([viewport.width, viewport.height], viewport.width > viewport.height ? 'l' : 'p');
                }
                const canvas = document.createElement('canvas');
                canvas.width = viewport.width; canvas.height = viewport.height;
                const context = canvas.getContext('2d');
                await page.render({ canvasContext: context, viewport }).promise;
                const imgData = canvas.toDataURL('image/jpeg', jpegQuality);
                doc.addImage(imgData, 'JPEG', 0, 0, viewport.width, viewport.height);
            }
            
            const pdfBlob = doc.output('blob');
            setResult({ url: URL.createObjectURL(pdfBlob), originalSize: formatBytes(file.size), newSize: formatBytes(pdfBlob.size) });

        } catch (err) { setError('فشل ضغط الملف.'); } finally { setIsLoading(false); }
    };

    return (
        <div className="space-y-4">
            <h3 className="text-2xl font-bold text-white mb-2">ضغط ملف PDF</h3>
            <FileDropZone onFileChange={files => setFile(files[0])} accept=".pdf"><p className="text-white font-semibold">اختر ملف PDF</p></FileDropZone>
            {file && <p className="text-brand-light">{file.name}</p>}
            <select value={quality} onChange={e => setQuality(e.target.value as any)} className="w-full bg-brand-dark border border-brand-mid rounded-lg px-4 py-2 text-white">
                <option value="low">ضغط عالي (جودة أقل)</option><option value="medium">ضغط متوسط (موصى به)</option><option value="high">ضغط خفيف (جودة أعلى)</option>
            </select>
            {error && <p className="text-red-400">{error}</p>}
            <button onClick={handleCompress} disabled={isLoading || !file} className="bg-brand-cyan text-brand-dark font-bold py-2 px-6 rounded-lg disabled:opacity-50">
                {isLoading ? 'جاري الضغط...' : 'ضغط الملف'}
            </button>
            {result && <div><p className="text-green-400">تم الضغط! الحجم الأصلي: {result.originalSize}, الحجم الجديد: {result.newSize}</p><a href={result.url} download={`compressed_${file?.name}`} className="block text-center bg-green-600 text-white font-bold py-2 px-6 rounded-lg mt-2">تحميل</a></div>}
        </div>
    );
};

const DeletePagesView: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [range, setRange] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [resultUrl, setResultUrl] = useState<string | null>(null);
    const [error, setError] = useState('');

    const handleDelete = async () => {
        if (!file || !range.trim()) { setError('اختر ملفًا وحدد الصفحات.'); return; }
        setIsLoading(true); setError(''); setResultUrl(null);
        try {
            const { PDFDocument } = PDFLib;
            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer);
            const totalPages = pdfDoc.getPageCount();

            const pagesToDelete = new Set<number>();
            range.split(',').forEach(part => {
                if (part.includes('-')) {
                    const [start, end] = part.split('-').map(Number);
                    for (let i = start; i <= end; i++) { if (i > 0 && i <= totalPages) pagesToDelete.add(i - 1); }
                } else {
                    const page = Number(part);
                    if (page > 0 && page <= totalPages) pagesToDelete.add(page - 1);
                }
            });
            
            const indicesToRemove = Array.from(pagesToDelete).sort((a,b) => b-a);
            indicesToRemove.forEach(index => pdfDoc.removePage(index));

            const newPdfBytes = await pdfDoc.save();
            const blob = new Blob([newPdfBytes], { type: 'application/pdf' });
            setResultUrl(URL.createObjectURL(blob));
        } catch (err) { setError('فشل حذف الصفحات.'); } finally { setIsLoading(false); }
    };

    return (
         <div className="space-y-4">
             <h3 className="text-2xl font-bold text-white mb-2">حذف صفحات من PDF</h3>
             <FileDropZone onFileChange={files => setFile(files[0])} accept=".pdf"><p className="text-white font-semibold">اختر ملف PDF</p></FileDropZone>
            {file && <p className="text-brand-light">{file.name}</p>}
            <input type="text" value={range} onChange={e => setRange(e.target.value)} placeholder="الصفحات للحذف (مثال: 2, 5-7, 10)" className="w-full bg-brand-dark border border-brand-mid rounded-lg px-4 py-2 text-white" />
            {error && <p className="text-red-400">{error}</p>}
            <button onClick={handleDelete} disabled={isLoading || !file} className="bg-brand-cyan text-brand-dark font-bold py-2 px-6 rounded-lg disabled:opacity-50">
                {isLoading ? 'جاري الحذف...' : 'حذف الصفحات'}
            </button>
            {resultUrl && <a href={resultUrl} download={`edited_${file?.name}`} className="block text-center bg-green-600 text-white font-bold py-2 px-6 rounded-lg mt-2">تحميل</a>}
        </div>
    );
};

const ConvertToPdfView: React.FC = () => {
    const [files, setFiles] = useState<File[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [resultUrl, setResultUrl] = useState<string | null>(null);

    const handleConvert = async () => {
        if (files.length === 0) { alert('اختر صورًا أولاً.'); return; }
        setIsLoading(true); setResultUrl(null);
        try {
            const { jsPDF } = jspdf;
            const doc = new jsPDF();
            for (const [index, file] of files.entries()) {
                if (index > 0) doc.addPage();
                const imgData = await fileToBase64(file);
                const img = new Image();
                img.src = imgData;
                await new Promise(r => img.onload = r);
                const { width: pageWidth, height: pageHeight } = doc.internal.pageSize;
                const ratio = Math.min(pageWidth / img.width, pageHeight / img.height);
                const imgWidth = img.width * ratio; const imgHeight = img.height * ratio;
                const x = (pageWidth - imgWidth) / 2; const y = (pageHeight - imgHeight) / 2;
                doc.addImage(imgData, 'JPEG', x, y, imgWidth, imgHeight);
            }
            const blob = doc.output('blob');
            setResultUrl(URL.createObjectURL(blob));
        } catch (err) { alert('فشل تحويل الصور.'); } finally { setIsLoading(false); }
    };

    return (
        <div className="space-y-4">
             <h3 className="text-2xl font-bold text-white mb-2">تحويل صور إلى PDF</h3>
             <FileDropZone onFileChange={files => setFiles(files)} multiple accept="image/*"><p className="text-white font-semibold">اختر صورًا للتحويل</p></FileDropZone>
            {files.length > 0 && <p className="text-brand-light">{files.length} صور تم اختيارها.</p>}
            <button onClick={handleConvert} disabled={isLoading || files.length === 0} className="bg-brand-cyan text-brand-dark font-bold py-2 px-6 rounded-lg disabled:opacity-50">
                {isLoading ? 'جاري التحويل...' : 'تحويل إلى PDF'}
            </button>
            {resultUrl && <a href={resultUrl} download="converted.pdf" className="block text-center bg-green-600 text-white font-bold py-2 px-6 rounded-lg mt-2">تحميل PDF</a>}
        </div>
    );
};


// Main Component
type PdfOperationsTab = 'create' | 'convert' | 'toimage' | 'merge' | 'repair' | 'compress' | 'split' | 'delete';

const PdfOperationsTool: React.FC = () => {
    const [activeTab, setActiveTab] = useState<PdfOperationsTab>('create');

    const TABS: { id: PdfOperationsTab; label: string; icon: ReactNode }[] = [
        { id: 'create', label: 'إنشاء', icon: '➕' },
        { id: 'merge', label: 'دمج', icon: '🔗' },
        { id: 'split', label: 'تقسيم', icon: '✂️' },
        { id: 'delete', label: 'حذف صفحات', icon: '🗑️' },
        { id: 'compress', label: 'ضغط', icon: '📦' },
        { id: 'repair', label: 'إصلاح', icon: '🛠️' },
        { id: 'toimage', label: 'PDF إلى صور', icon: '🖼️' },
        { id: 'convert', label: 'صور إلى PDF', icon: '🔄' },
    ];
    
    const renderContent = () => {
        switch (activeTab) {
            case 'create': return <CreatePdfView />;
            case 'merge': return <MergePdfView />;
            case 'split': return <SplitPdfView />;
            case 'repair': return <RepairPdfView />;
            case 'toimage': return <PdfToImagesView />;
            case 'compress': return <CompressPdfView />;
            case 'delete': return <DeletePagesView />;
            case 'convert': return <ConvertToPdfView />;
            default:
                return <div className="text-center py-10"><h3 className="text-xl font-bold text-white">قيد التطوير</h3><p className="text-brand-light mt-2">هذه الأداة قيد الإنشاء حاليًا.</p></div>;
        }
    };
    
    return (
         <div className="h-full flex flex-col">
            <h2 className="text-3xl font-bold text-white mb-2">عمليات على PDF</h2>
            <p className="text-brand-light mb-6">مجموعة أدوات متكاملة للتعامل مع ملفات PDF.</p>

            <div className="flex flex-wrap border-b border-brand-mid mb-6 -mx-4 px-2">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 py-3 px-4 font-semibold border-b-4 transition-colors ${activeTab === tab.id ? 'text-brand-cyan border-brand-cyan' : 'text-brand-light border-transparent hover:text-white'}`}
                    >
                        <span>{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="flex-grow bg-brand-blue border border-brand-mid rounded-lg p-6">
                {renderContent()}
            </div>
        </div>
    );
};

export default PdfOperationsTool;
