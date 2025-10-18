import React, { useState, useRef, useCallback } from 'react';

// Make TypeScript aware of pdf-lib from CDN
declare const PDFLib: any;

const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const MergePdfTool: React.FC = () => {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<{ message: string; type: 'success' | 'warning' | 'danger' } | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const newFiles = Array.from(event.target.files);
            setSelectedFiles(prevFiles => [...prevFiles, ...newFiles]);
            // Reset input value to allow selecting the same file again after removing it
            event.target.value = '';
        }
    };
    
    const handleRemoveFile = (index: number) => {
        setSelectedFiles(files => files.filter((_, i) => i !== index));
    };

    const handleMerge = async () => {
        if (selectedFiles.length < 2) {
            setStatus({ message: 'الرجاء اختيار ملفين أو أكثر للدمج.', type: 'warning' });
            return;
        }

        setIsLoading(true);
        setStatus(null);

        try {
            const { PDFDocument } = PDFLib;
            const mergedPdfDoc = await PDFDocument.create();

            for (const file of selectedFiles) {
                const fileBytes = await file.arrayBuffer();
                const pdfDoc = await PDFDocument.load(fileBytes, { ignoreEncryption: true });
                const copiedPages = await mergedPdfDoc.copyPages(pdfDoc, pdfDoc.getPageIndices());
                copiedPages.forEach((page) => mergedPdfDoc.addPage(page));
            }

            const mergedPdfBytes = await mergedPdfDoc.save();
            const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `merged-pdf-${Date.now()}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            setStatus({ message: '✅ تم دمج الملفات بنجاح! جاري التحميل...', type: 'success' });
            setSelectedFiles([]);

        } catch (error: unknown) {
            console.error('Error during PDF merge:', error);
            let errorMessage = 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.';
            
            // FIX: Use `instanceof Error` type guard to safely access properties on the unknown error object.
            if (error instanceof Error) {
                if (error.message.includes('encrypted') || error.message.includes('password')) {
                    errorMessage = '❌ خطأ: أحد الملفات محمي بكلمة مرور. هذه الأداة لا تدعم الملفات المحمية.';
                } else {
                    errorMessage = '❌ خطأ: أحد الملفات قد يكون تالفًا أو ليس ملف PDF صالحًا.';
                }
            }
            setStatus({ message: errorMessage, type: 'danger' });
        } finally {
            setIsLoading(false);
        }
    };

    const onDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragging(true); };
    const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragging(false); };
    const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files) {
            const newFiles = Array.from(e.dataTransfer.files).filter(f => f.type === 'application/pdf');
             setSelectedFiles(prevFiles => [...prevFiles, ...newFiles]);
        }
    };

    const StatusAlert = () => {
        if (!status) return null;
        const alertClasses = {
            success: 'bg-green-500/20 border-green-400 text-green-300',
            warning: 'bg-yellow-500/20 border-yellow-400 text-yellow-300',
            danger: 'bg-red-500/20 border-red-400 text-red-300',
        };
        return (
            <div className={`p-4 my-4 rounded-md border text-center font-semibold ${alertClasses[status.type]}`}>
                {status.message}
            </div>
        );
    };

    return (
        <div className="h-full flex flex-col">
            <h2 className="text-3xl font-bold text-white mb-2">دمج ملفات PDF</h2>
            <p className="text-brand-light mb-6">اجمع عدة ملفات PDF في ملف واحد بسهولة وسرعة.</p>

             <div className="bg-brand-blue border border-brand-mid rounded-lg p-6 space-y-6">
                 <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
                    className={`flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isDragging ? 'border-brand-cyan bg-brand-mid/20' : 'border-brand-mid hover:border-brand-light'}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-brand-light" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    <p className="mt-4 text-white font-semibold">اسحب ملفات PDF هنا أو انقر للاختيار</p>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="application/pdf" multiple className="hidden" />
                </div>
                
                {selectedFiles.length > 0 && (
                    <div>
                        <h3 className="font-semibold text-white mb-2">الملفات المختارة ({selectedFiles.length}):</h3>
                        <ul className="space-y-2 max-h-48 overflow-y-auto bg-brand-dark p-2 rounded-md">
                            {selectedFiles.map((file, index) => (
                                <li key={index} className="flex justify-between items-center p-2 rounded bg-brand-mid/50">
                                    <span className="text-white truncate" title={file.name}>{file.name}</span>
                                    <div className="flex items-center gap-3">
                                        <span className="text-brand-light text-sm">{formatBytes(file.size)}</span>
                                        <button onClick={() => handleRemoveFile(index)} className="text-red-400 hover:text-red-600">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                
                <StatusAlert />
                
                <button 
                    onClick={handleMerge} 
                    disabled={isLoading || selectedFiles.length < 2} 
                    className="w-full bg-brand-cyan text-brand-dark font-bold py-3 px-6 rounded-lg hover:bg-opacity-80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isLoading ? (
                         <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-brand-dark"></div>
                            <span>جاري الدمج...</span>
                         </>
                    ) : (
                         <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v1H5V4zM5 8h10a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1V9a1 1 0 011-1z" /><path d="M9 12a1 1 0 00-1 1v1a1 1 0 102 0v-1a1 1 0 00-1-1z" /></svg>
                            <span>دمج الملفات</span>
                         </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default MergePdfTool;
