import React, { useState, useRef } from 'react';

// Make SheetJS library available from the CDN script
declare const XLSX: any;

const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const MergeExcelTool: React.FC = () => {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);
    const [resultInfo, setResultInfo] = useState<{ name: string; size: string; sheets: number } | null>(null);
    const [mergedWorkbook, setMergedWorkbook] = useState<any | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFilesChange = (files: File[]) => {
        const newFiles = files.filter(file => /\.(xlsx|xls)$/i.test(file.name));
        if (newFiles.length !== files.length) {
            setStatus({ message: 'تم اختيار ملفات غير مدعومة. يرجى اختيار ملفات Excel فقط (.xlsx, .xls).', type: 'warning' });
        }
        setSelectedFiles(prev => [...prev, ...newFiles]);
        setStatus(null);
        setResultInfo(null);
        setMergedWorkbook(null);
    };

    const removeFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleMerge = async () => {
        if (selectedFiles.length < 2) {
            setStatus({ message: 'الرجاء اختيار ملفين على الأقل للدمج.', type: 'warning' });
            return;
        }

        setIsLoading(true);
        setStatus(null);
        setResultInfo(null);

        try {
            const newWorkbook = XLSX.utils.book_new();
            let totalSheets = 0;

            for (const file of selectedFiles) {
                const data = await file.arrayBuffer();
                const workbook = XLSX.read(data, { type: 'array' });

                workbook.SheetNames.forEach((sheetName: string) => {
                    const worksheet = workbook.Sheets[sheetName];
                    let newSheetName = sheetName;
                    let counter = 1;
                    while (newWorkbook.SheetNames.includes(newSheetName)) {
                        newSheetName = `${sheetName}_${counter++}`;
                    }
                    XLSX.utils.book_append_sheet(newWorkbook, worksheet, newSheetName);
                    totalSheets++;
                });
            }

            const mergedData = XLSX.write(newWorkbook, { type: 'array', bookType: 'xlsx' });
            setMergedWorkbook(newWorkbook);
            setResultInfo({
                name: `ملف_مدمج_${Date.now()}.xlsx`,
                size: formatFileSize(mergedData.length),
                sheets: totalSheets
            });
            setStatus({ message: 'تم دمج الملفات بنجاح! الملف جاهز للتحميل.', type: 'success' });
        } catch (error) {
            console.error("Error merging files:", error);
            setStatus({ message: 'حدث خطأ أثناء دمج الملفات. تأكد من أن الملفات صالحة وغير تالفة.', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = () => {
        if (mergedWorkbook && resultInfo) {
            XLSX.writeFile(mergedWorkbook, resultInfo.name);
        }
    };
    
    const onDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragging(true); };
    const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragging(false); };
    const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files) {
            handleFilesChange(Array.from(e.dataTransfer.files));
        }
    };

    return (
        <div className="h-full flex flex-col space-y-6">
            <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
                className={`flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isDragging ? 'border-brand-cyan bg-brand-mid/20' : 'border-brand-mid hover:border-brand-light'}`}
            >
                <i className="bi bi-cloud-upload-fill text-4xl text-brand-light mb-2"></i>
                <h5 className="text-white font-semibold">اختر ملفات إكسيل للدمج</h5>
                <p className="text-brand-light mb-0">اسحب الملفات هنا أو انقر للاختيار</p>
                <input type="file" ref={fileInputRef} onChange={e => e.target.files && handleFilesChange(Array.from(e.target.files))} accept=".xlsx, .xls" multiple className="hidden" />
            </div>

            {selectedFiles.length > 0 && (
                <div className="space-y-2 max-h-48 overflow-y-auto bg-brand-dark p-2 rounded-md border border-brand-mid">
                    {selectedFiles.map((file, index) => (
                        <div key={index} className="flex justify-between items-center p-2 rounded bg-brand-blue/50">
                            <span className="text-white truncate" title={file.name}>{file.name}</span>
                            <div className="flex items-center gap-4 flex-shrink-0">
                                <span className="text-brand-light text-sm">{formatFileSize(file.size)}</span>
                                <button onClick={() => removeFile(index)} className="text-red-400 hover:text-red-600">
                                    <i className="bi bi-x-lg"></i>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
            {status && <div className={`p-3 rounded-md border text-center font-semibold ${status.type === 'success' ? 'bg-green-500/20 border-green-400 text-green-300' : status.type === 'warning' ? 'bg-yellow-500/20 border-yellow-400 text-yellow-300' : 'bg-red-500/20 border-red-400 text-red-300'}`}>{status.message}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button 
                    onClick={handleMerge} 
                    disabled={isLoading || selectedFiles.length < 2} 
                    className="w-full bg-brand-cyan text-brand-dark font-bold py-3 px-6 rounded-lg hover:bg-opacity-80 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {isLoading ? <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-brand-dark"></div><span>جاري الدمج...</span></> : <><i className="bi bi-magic mr-2"></i><span>دمج الملفات</span></>}
                </button>
                <button 
                    onClick={handleDownload} 
                    disabled={!mergedWorkbook} 
                    className="w-full bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    <i className="bi bi-download mr-2"></i>
                    <span>تحميل الملف المدمج</span>
                </button>
            </div>

            {resultInfo && (
                <div className="p-4 bg-brand-dark rounded-lg border border-brand-mid animate-fade-in">
                    <h5 className="font-bold text-brand-cyan mb-2">معلومات الملف المدمج:</h5>
                    <div className="text-brand-light text-sm space-y-1">
                        <p><strong>اسم الملف:</strong> {resultInfo.name}</p>
                        <p><strong>الحجم:</strong> {resultInfo.size}</p>
                        <p><strong>عدد الأوراق:</strong> {resultInfo.sheets}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MergeExcelTool;