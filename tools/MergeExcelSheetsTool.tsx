import React, { useState, useRef, useCallback } from 'react';

// Make SheetJS library available from the CDN script
declare const XLSX: any;

const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const MergeExcelSheetsTool: React.FC = () => {
    const [files, setFiles] = useState<File[]>([]);
    const [mergedData, setMergedData] = useState<any[][] | null>(null);
    const [resultInfo, setResultInfo] = useState<{ files: number; sheets: number; rows: number; cols: number } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [isMultiMode, setIsMultiMode] = useState(false);
    const [isCompactView, setIsCompactView] = useState(true);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const resultCardRef = useRef<HTMLDivElement>(null);

    const handleClear = useCallback(() => {
        setFiles([]);
        setMergedData(null);
        setResultInfo(null);
        setError('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, []);
    
    const setMode = (multi: boolean) => {
        setIsMultiMode(multi);
        handleClear();
    };

    const handleFileSelection = useCallback((selectedFiles: FileList | null) => {
        if (!selectedFiles || selectedFiles.length === 0) return;
        const fileArray = Array.from(selectedFiles);

        if (!isMultiMode && fileArray.length > 1) {
            setError('في وضع الملف الواحد، يرجى اختيار ملف واحد فقط. للتحميل المتعدد، قم بتفعيل وضع "عدة ملفات".');
            return;
        }
        
        setError('');
        setMergedData(null);
        setResultInfo(null);
        
        if (isMultiMode) {
            setFiles(prev => {
                const existingNames = new Set(prev.map(f => f.name));
                const newFiles = fileArray.filter(f => !existingNames.has(f.name));
                return [...prev, ...newFiles];
            });
        } else {
            setFiles(fileArray.slice(0, 1));
        }
    }, [isMultiMode]);

    const handleRemoveFile = (indexToRemove: number) => {
        setFiles(prev => prev.filter((_, index) => index !== indexToRemove));
    };
    
    const handleProcess = async () => {
        if (files.length === 0) {
            setError('الرجاء اختيار ملفات أولاً.');
            return;
        }
        setIsLoading(true);
        setError('');
        setResultInfo(null);
        setMergedData(null);

        try {
            const workbooks = await Promise.all(
                files.map(file => new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = e => {
                        try {
                            const data = new Uint8Array(e.target!.result as ArrayBuffer);
                            resolve(XLSX.read(data, { type: 'array', cellDates: true }));
                        } catch (err) {
                            reject(new Error(`فشل قراءة الملف: ${file.name}`));
                        }
                    };
                    reader.onerror = () => reject(new Error(`خطأ في قراءة الملف: ${file.name}`));
                    reader.readAsArrayBuffer(file);
                }))
            );

            // Defer heavy processing to allow UI update
            setTimeout(() => {
                const allHeaders = new Set<string>();
                let totalSheetsProcessed = 0;

                workbooks.forEach((workbook: any) => {
                    workbook.SheetNames.forEach((sheetName: string) => {
                        const ws = workbook.Sheets[sheetName];
                        const jsonData: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });
                        if (jsonData.length > 0 && jsonData[0]) {
                            jsonData[0].forEach(header => {
                                if (header !== null && header !== undefined) allHeaders.add(String(header));
                            });
                        }
                    });
                });

                const headersArray = Array.from(allHeaders);
                const merged: any[][] = [headersArray];

                workbooks.forEach((workbook: any) => {
                    workbook.SheetNames.forEach((sheetName: string) => {
                        totalSheetsProcessed++;
                        const ws = workbook.Sheets[sheetName];
                        const jsonData: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false });

                        if (jsonData.length > 1) {
                            const sheetHeaders = jsonData[0].map(h => String(h));
                            const dataRows = jsonData.slice(1);
                            dataRows.forEach(row => {
                                const newRow = Array(headersArray.length).fill(undefined);
                                sheetHeaders.forEach((header, colIndex) => {
                                    const finalHeaderIndex = headersArray.indexOf(header);
                                    if (finalHeaderIndex !== -1 && row[colIndex] !== undefined) {
                                        newRow[finalHeaderIndex] = row[colIndex];
                                    }
                                });
                                merged.push(newRow);
                            });
                        }
                    });
                });
                
                setMergedData(merged);
                setResultInfo({
                    files: workbooks.length,
                    sheets: totalSheetsProcessed,
                    rows: merged.length - 1,
                    cols: headersArray.length,
                });
                setIsLoading(false);
                setTimeout(() => resultCardRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
            }, 100);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع أثناء معالجة الملفات.');
            setIsLoading(false);
        }
    };

    const handleDownload = () => {
        if (!mergedData) return;
        const ws = XLSX.utils.aoa_to_sheet(mergedData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "البيانات المدمجة");
        XLSX.writeFile(wb, `الملفات_المدمجة_${new Date().toISOString().slice(0, 10)}.xlsx`);
    };

    const onDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragging(true); };
    const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragging(false); };
    const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        handleFileSelection(e.dataTransfer.files);
    };

    return (
        <div className="space-y-6">
            <div className="bg-brand-blue p-6 rounded-lg border border-brand-mid">
                <div className="flex justify-center gap-2 mb-4">
                    <button onClick={() => setMode(false)} className={`py-2 px-6 rounded-lg font-semibold transition-colors ${!isMultiMode ? 'bg-brand-cyan text-brand-dark' : 'bg-brand-dark text-white hover:bg-brand-mid'}`}>ملف واحد</button>
                    <button onClick={() => setMode(true)} className={`py-2 px-6 rounded-lg font-semibold transition-colors ${isMultiMode ? 'bg-brand-cyan text-brand-dark' : 'bg-brand-dark text-white hover:bg-brand-mid'}`}>عدة ملفات</button>
                </div>
                <div onClick={() => fileInputRef.current?.click()} onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop} className={`p-8 text-center border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isDragging ? 'border-brand-cyan bg-brand-mid/20' : 'border-brand-mid hover:border-brand-light'}`}>
                    <i className="bi bi-cloud-upload text-4xl text-brand-cyan mb-3 block"></i>
                    <h5 className="text-white font-semibold">{isMultiMode ? 'اسحب ملفات الإكسل هنا أو انقر للاختيار' : 'اسحب ملف الإكسل هنا أو انقر للاختيار'}</h5>
                    <p className="text-sm text-brand-light mt-1">يدعم .xlsx, .xls</p>
                    <input type="file" ref={fileInputRef} onChange={e => handleFileSelection(e.target.files)} accept=".xlsx, .xls" multiple={isMultiMode} className="hidden" />
                </div>
                {files.length > 0 && (
                     <div className="mt-4">
                        <div className="flex justify-between items-center mb-2">
                             <h3 className="font-semibold text-white">الملفات المختارة ({files.length}):</h3>
                             <button onClick={handleClear} className="text-sm text-yellow-400 hover:underline">مسح الكل</button>
                         </div>
                         <div className="space-y-2 max-h-40 overflow-y-auto bg-brand-dark p-2 rounded-md border border-brand-mid">
                            {files.map((file, index) => (
                                <div key={`${file.name}-${index}`} className="flex justify-between items-center p-2 rounded bg-brand-blue/50">
                                    <span className="text-white truncate" title={file.name}><i className="bi bi-file-earmark-excel text-green-400 mr-2"></i>{file.name}</span>
                                    <div className="flex items-center gap-4 flex-shrink-0">
                                        <span className="text-brand-light text-sm">{formatFileSize(file.size)}</span>
                                        <button onClick={() => handleRemoveFile(index)} className="text-red-400 hover:text-red-600"><i className="bi bi-x-lg"></i></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                <div className="mt-4 p-4 bg-brand-dark rounded-md border border-brand-mid">
                    <div className="flex items-center">
                        <input id="compactView" type="checkbox" checked={isCompactView} onChange={e => setIsCompactView(e.target.checked)} className="w-4 h-4 text-brand-cyan bg-gray-700 border-gray-600 rounded focus:ring-brand-cyan" />
                        <label htmlFor="compactView" className="mr-2 text-sm font-medium text-brand-light">عرض مضغوط للبيانات</label>
                    </div>
                </div>
                {error && <div className="p-3 mt-4 rounded-md border text-center font-semibold bg-red-500/20 border-red-400 text-red-300">{error}</div>}
                <div className="mt-4 flex flex-col sm:flex-row gap-4">
                    <button onClick={handleProcess} disabled={isLoading || files.length === 0} className="w-full bg-brand-cyan text-brand-dark font-bold py-3 px-6 rounded-lg hover:bg-opacity-80 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                        {isLoading ? <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-brand-dark"></div><span>جاري المعالجة...</span></> : 'معالجة ودمج الأوراق'}
                    </button>
                    <button onClick={handleClear} className="w-full sm:w-auto bg-yellow-500 text-black font-bold py-3 px-6 rounded-lg hover:bg-yellow-600 transition-colors">مسح الكل</button>
                </div>
            </div>

            {isLoading && !resultInfo && <div className="text-center p-10"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-cyan mx-auto"></div><p className="mt-3 text-brand-light">جاري معالجة الملفات، يرجى الانتظار...</p></div>}

            {resultInfo && (
                <div ref={resultCardRef} className="bg-brand-blue p-6 rounded-lg border border-brand-mid animate-fade-in space-y-4">
                     <div className="p-3 rounded-md bg-green-900/50 text-green-300 text-center">
                        تم دمج <strong>{resultInfo.files}</strong> ملفات تحتوي على <strong>{resultInfo.sheets}</strong> ورقة، والنتيجة <strong>{resultInfo.rows}</strong> صف و <strong>{resultInfo.cols}</strong> عمود.
                    </div>
                    {mergedData && mergedData.length > 1 ? (
                        <div className="max-h-96 overflow-auto border border-brand-mid rounded-lg">
                            <table className={`w-full text-sm text-left text-brand-light ${isCompactView ? 'table-fixed' : ''}`}>
                                <thead className="text-xs text-white uppercase bg-brand-dark sticky top-0">
                                    <tr>
                                        {mergedData[0].map((header, index) => (
                                            <th key={index} scope="col" className={`px-4 ${isCompactView ? 'py-2' : 'py-3'}`}>{header || 'عمود فارغ'}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {mergedData.slice(1, 101).map((row, rowIndex) => (
                                        <tr key={rowIndex} className="bg-brand-blue border-b border-brand-mid even:bg-brand-blue/50 hover:bg-brand-mid/50">
                                            {row.map((cell, cellIndex) => (
                                                <td key={cellIndex} className={`px-4 truncate ${isCompactView ? 'py-1' : 'py-2'}`}>{cell === null || cell === undefined ? '' : String(cell)}</td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : <p className="text-center text-brand-light">لا توجد بيانات للعرض.</p>}
                    {mergedData && mergedData.length > 101 && <p className="text-center text-sm text-brand-light">يتم عرض أول 100 صف فقط للمعاينة.</p>}
                    <div className="text-center">
                        <button onClick={handleDownload} className="bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 mx-auto">
                            <i className="bi bi-download mr-2"></i><span>تحميل الملف المدمج</span>
                        </button>
                    </div>
                </div>
            )}
            
             <div className="bg-brand-blue p-6 rounded-lg border border-brand-mid text-brand-light space-y-3">
                <h5 className="font-bold text-white text-lg">كيفية الاستخدام:</h5>
                <ol className="list-decimal list-inside space-y-1">
                    <li>اختر وضع "ملف واحد" أو "عدة ملفات".</li>
                    <li>قم بتحميل ملف أو عدة ملفات إكسل.</li>
                    <li>انقر على زر "معالجة ودمج الأوراق".</li>
                    <li>ستظهر معاينة للبيانات المدمجة في جدول.</li>
                    <li>انقر على زر "تحميل الملف المدمج" لتنزيل النتيجة.</li>
                </ol>
            </div>
        </div>
    );
};

export default MergeExcelSheetsTool;
