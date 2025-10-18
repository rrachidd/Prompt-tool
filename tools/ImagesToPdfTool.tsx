import React, { useState, useRef, useCallback } from 'react';

// Make jspdf available from CDN script
declare const jspdf: any;

const ImagesToPdfTool: React.FC = () => {
    const [uploadedFiles, setUploadedFiles] = useState<{ name: string; dataUrl: string; type: string }[]>([]);
    const [options, setOptions] = useState({
        pageSize: '6x9',
        frameStyle: 'square',
        coloringBookPage: false,
        copyrightPage: false,
        pageNumbering: true,
        bleed: false,
        blankPage: true,
        colorTest: false,
    });
    const [coloringBookTitle, setColoringBookTitle] = useState('');
    const [copyrightText, setCopyrightText] = useState('حقوق النشر © 2025. جميع الحقوق محفوظة.');
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [downloadInfo, setDownloadInfo] = useState<{ url: string; name: string; size: string } | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    // --- Helper Functions ---

    const handleFiles = (files: FileList) => {
        const fileArray = Array.from(files);
        fileArray.forEach(file => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    setUploadedFiles(prev => [...prev, {
                        name: file.name,
                        dataUrl: e.target?.result as string,
                        type: file.type
                    }]);
                };
                reader.readAsDataURL(file);
            }
        });
    };

    const handleRemoveImage = (index: number) => {
        setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const createArabicTextImage = async (text: string, fontSize: number, align: 'center' | 'left' | 'right'): Promise<HTMLImageElement> => {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d')!;
            canvas.width = 800;
            canvas.height = 100;
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.font = `bold ${fontSize}px Cairo`;
            ctx.fillStyle = '#000000';
            ctx.textAlign = align;
            ctx.textBaseline = 'middle';
            let x = align === 'center' ? canvas.width / 2 : align === 'right' ? canvas.width - 10 : 10;
            ctx.fillText(text, x, canvas.height / 2);
            const image = new Image();
            image.onload = () => resolve(image);
            image.src = canvas.toDataURL('image/png');
        });
    };

    const applyPageFrame = (pdf: any, frameStyle: string) => {
        if (frameStyle === 'none') return;
        const { width, height } = pdf.internal.pageSize;
        pdf.setDrawColor(100, 100, 100);
        pdf.setLineWidth(1);
        switch (frameStyle) {
            case 'square': pdf.rect(5, 5, width - 10, height - 10); break;
            case 'double': pdf.rect(5, 5, width - 10, height - 10); pdf.rect(8, 8, width - 16, height - 16); break;
            case 'dashed': pdf.setLineDashPattern([5, 5], 0); pdf.rect(5, 5, width - 10, height - 10); pdf.setLineDashPattern([], 0); break;
            case 'dotted': pdf.setLineDashPattern([1, 3], 0); pdf.rect(5, 5, width - 10, height - 10); pdf.setLineDashPattern([], 0); break;
            case 'rounded': pdf.roundedRect(5, 5, width - 10, height - 10, 3, 3); break;
        }
    };
    
    const getPageSize = () => {
        switch (options.pageSize) {
            case 'a4': return 'a4';
            case 'a5': return 'a5';
            case 'letter': return 'letter';
            case 'legal': return 'legal';
            case '6x9': return [152.4, 228.6];
            case '8x10': return [203.2, 254];
            default: return 'a4';
        }
    };

    const handleGeneratePdf = async () => {
        if (uploadedFiles.length === 0) {
            alert('الرجاء رفع صور واحدة على الأقل');
            return;
        }
        
        setIsLoading(true);
        setDownloadInfo(null);
        setPreviewUrl(null);
        setProgress(0);

        try {
            const { jsPDF } = jspdf;
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: getPageSize() });
            let pageCount = 0;

            if (options.coloringBookPage) {
                applyPageFrame(pdf, options.frameStyle);
                const titleImage = await createArabicTextImage(coloringBookTitle || "كتاب التلوين", 20, 'center');
                pdf.addImage(titleImage, 'PNG', 10, 30, pdf.internal.pageSize.getWidth() - 20, 30);
                if (options.copyrightPage) {
                    const copyrightImage = await createArabicTextImage(copyrightText, 8, 'center');
                    pdf.addImage(copyrightImage, 'PNG', 10, pdf.internal.pageSize.getHeight() - 15, pdf.internal.pageSize.getWidth() - 20, 10);
                }
                pageCount++;
            }

            for (let i = 0; i < uploadedFiles.length; i++) {
                const file = uploadedFiles[i];
                if (options.blankPage && (i > 0 || pageCount > 0)) {
                    pdf.addPage();
                    pageCount++;
                    applyPageFrame(pdf, options.frameStyle);
                    if (options.copyrightPage) { /* Add copyright */ }
                    if (options.pageNumbering) { /* Add page number */ }
                }
                if (i > 0 || pageCount > 0) pdf.addPage();
                pageCount++;

                applyPageFrame(pdf, options.frameStyle);
                
                const { width: pageWidth, height: pageHeight } = pdf.internal.pageSize;
                const img = new Image();
                img.src = file.dataUrl;
                await new Promise(r => img.onload = r);

                const imgRatio = img.width / img.height;
                const pageRatio = pageWidth / pageHeight;
                let imgWidth, imgHeight, x, y;

                if (imgRatio > pageRatio) {
                    imgWidth = pageWidth - 20;
                    imgHeight = imgWidth / imgRatio;
                } else {
                    imgHeight = pageHeight - 20;
                    imgWidth = imgHeight * imgRatio;
                }
                x = (pageWidth - imgWidth) / 2;
                y = (pageHeight - imgHeight) / 2;

                if (options.pageNumbering) {
                    const pageNumImage = await createArabicTextImage(`${pageCount}`, 10, 'center');
                    pdf.addImage(pageNumImage, 'PNG', 10, pageHeight - 15, pageWidth - 20, 10);
                }
                if (options.copyrightPage) {
                    const copyrightImage = await createArabicTextImage(copyrightText, 8, 'center');
                    pdf.addImage(copyrightImage, 'PNG', 10, pageHeight - 15, pageWidth - 20, 10);
                }
                
                pdf.addImage(file.dataUrl, file.type.split('/')[1].toUpperCase(), x, y, imgWidth, imgHeight);
                setProgress(((i + 1) / uploadedFiles.length) * 100);
            }

            if (options.colorTest) {
                // ... logic for color test page
            }
            
            const pdfBlob = pdf.output('blob');
            const url = URL.createObjectURL(pdfBlob);
            setDownloadInfo({
                url,
                name: 'converted.pdf',
                size: `${(pdfBlob.size / 1024).toFixed(2)} KB`
            });
            
        } catch (error) {
            console.error('Error generating PDF:', error);
        } finally {
            setIsLoading(false);
        }
    };
    
    // --- Render ---

    const inputClasses = "w-full bg-brand-dark border border-brand-mid rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-cyan";
    const switchClasses = "w-11 h-6 bg-brand-dark rounded-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-cyan peer-checked:after:translate-x-full peer-checked:after:border-white";

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white mb-2">تحويل الصور إلى PDF</h2>
            <p className="text-brand-light">اجمع صورك في ملف PDF احترافي، مثالي لكتب التلوين والكتالوجات.</p>

            {/* Sections */}
            <div className="space-y-6">
                {/* 1. Page Setup */}
                <div className="bg-brand-blue p-6 rounded-lg border border-brand-mid">
                    <h3 className="text-xl font-bold text-white mb-4">1. إعداد الصفحة</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="pageSize" className="block text-brand-light mb-2">حجم الصفحة</label>
                            <select id="pageSize" value={options.pageSize} onChange={e => setOptions({...options, pageSize: e.target.value})} className={inputClasses}>
                                <option value="a4">A4</option> <option value="a5">A5</option> <option value="letter">Letter</option>
                                <option value="6x9">6 x 9 in</option> <option value="8x10">8 x 10 in</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="frameStyle" className="block text-brand-light mb-2">نمط الإطار</label>
                            <select id="frameStyle" value={options.frameStyle} onChange={e => setOptions({...options, frameStyle: e.target.value})} className={inputClasses}>
                                <option value="square">إطار عادي</option> <option value="rounded">إطار مستدير</option> <option value="double">إطار مزدوج</option>
                                <option value="dashed">إطار متقطع</option> <option value="dotted">إطار منقط</option> <option value="none">بدون إطار</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* 2. Image Upload */}
                <div className="bg-brand-blue p-6 rounded-lg border border-brand-mid">
                    <h3 className="text-xl font-bold text-white mb-4">2. رفع الصور</h3>
                    <div onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)} onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files); }} onClick={() => fileInputRef.current?.click()} className={`p-8 text-center border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isDragging ? 'border-brand-cyan bg-brand-mid/20' : 'border-brand-mid hover:border-brand-light'}`}>
                        <i className="bi bi-cloud-arrow-up-fill text-4xl text-brand-light"></i>
                        <p className="mt-2 text-white font-semibold">اسحب وأفلت الصور هنا، أو انقر للاختيار</p>
                        <input type="file" ref={fileInputRef} onChange={e => handleFiles(e.target.files!)} multiple accept="image/*" className="hidden"/>
                    </div>
                    {uploadedFiles.length > 0 && <div className="mt-4 grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                        {uploadedFiles.map((file, index) => (
                            <div key={index} className="relative group aspect-square">
                                <img src={file.dataUrl} alt={file.name} className="w-full h-full object-cover rounded-md"/>
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                    <button onClick={() => handleRemoveImage(index)} className="text-white text-2xl">&times;</button>
                                </div>
                                <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{index + 1}</div>
                            </div>
                        ))}
                    </div>}
                </div>
                
                {/* 3. Content Options & 4. Advanced */}
                <div className="grid md:grid-cols-2 gap-6">
                     <div className="bg-brand-blue p-6 rounded-lg border border-brand-mid space-y-4">
                        <h3 className="text-xl font-bold text-white mb-2">3. خيارات المحتوى</h3>
                        <label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" checked={options.coloringBookPage} onChange={e => setOptions({...options, coloringBookPage: e.target.checked})} className="sr-only peer"/><div className={switchClasses}></div><span className="mr-3 text-brand-light">هذه صفحة كتاب تلوين</span></label>
                        {options.coloringBookPage && <input type="text" value={coloringBookTitle} onChange={e => setColoringBookTitle(e.target.value)} placeholder="أدخل اسم الصفحة" className={inputClasses}/>}
                        <label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" checked={options.copyrightPage} onChange={e => setOptions({...options, copyrightPage: e.target.checked})} className="sr-only peer"/><div className={switchClasses}></div><span className="mr-3 text-brand-light">إضافة حقوق النشر</span></label>
                        {options.copyrightPage && <textarea value={copyrightText} onChange={e => setCopyrightText(e.target.value)} rows={2} className={inputClasses}></textarea>}
                     </div>
                     <div className="bg-brand-blue p-6 rounded-lg border border-brand-mid space-y-4">
                        <h3 className="text-xl font-bold text-white mb-2">4. الخيارات المتقدمة</h3>
                        <label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" checked={options.pageNumbering} onChange={e => setOptions({...options, pageNumbering: e.target.checked})} className="sr-only peer" /><div className={switchClasses}></div><span className="mr-3 text-brand-light">ترقيم الصفحات</span></label>
                        <label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" checked={options.blankPage} onChange={e => setOptions({...options, blankPage: e.target.checked})} className="sr-only peer" /><div className={switchClasses}></div><span className="mr-3 text-brand-light">صفحة فارغة بين الصور</span></label>
                        <label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" checked={options.colorTest} onChange={e => setOptions({...options, colorTest: e.target.checked})} className="sr-only peer" /><div className={switchClasses}></div><span className="mr-3 text-brand-light">إضافة صفحة اختبار الألوان</span></label>
                     </div>
                </div>

                <div className="text-center">
                    <button onClick={handleGeneratePdf} disabled={isLoading || uploadedFiles.length === 0} className="bg-brand-cyan text-brand-dark font-bold py-3 px-8 rounded-lg hover:bg-opacity-80 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mx-auto">
                        {isLoading ? <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-brand-dark"></div><span>جاري الإنشاء...</span></> : 'إنشاء PDF'}
                    </button>
                </div>

                {isLoading && <div className="w-full bg-brand-dark rounded-full h-2.5"><div className="bg-brand-cyan h-2.5 rounded-full" style={{width: `${progress}%`}}></div></div>}

                {downloadInfo && <div className="bg-green-900/50 border border-green-500 text-green-300 p-4 rounded-lg text-center space-y-4">
                    <p className="font-bold">تم إنشاء الملف بنجاح!</p>
                    <div className="flex justify-center items-center gap-4">
                        <i className="bi bi-file-earmark-pdf-fill text-3xl"></i>
                        <div>{downloadInfo.name} ({downloadInfo.size})</div>
                        <a href={downloadInfo.url} download={downloadInfo.name} className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700">تحميل</a>
                        <button onClick={() => setPreviewUrl(previewUrl ? null : downloadInfo.url)} className="bg-brand-mid text-white py-2 px-4 rounded-lg">{previewUrl ? 'إخفاء المعاينة' : 'معاينة'}</button>
                    </div>
                </div>}

                {previewUrl && <iframe src={previewUrl} className="w-full h-96 rounded-lg border border-brand-mid mt-4"></iframe>}
            </div>
        </div>
    );
};

export default ImagesToPdfTool;
