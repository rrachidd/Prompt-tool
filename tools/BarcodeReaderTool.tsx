import React, { useState, useRef, useEffect, useCallback } from 'react';

// For jsQR loaded via script tag
declare const jsQR: (data: Uint8ClampedArray, width: number, height: number, options?: { inversionAttempts: 'dontInvert' | 'onlyInvert' | 'both' }) => { data: string } | null;

const StatusMessage: React.FC<{ message: { text: string, type: 'success' | 'error' | 'warning' } | null }> = ({ message }) => {
    if (!message) return null;

    const colors = {
        success: 'bg-green-500/20 border-green-400 text-green-300',
        error: 'bg-red-500/20 border-red-400 text-red-300',
        warning: 'bg-yellow-500/20 border-yellow-400 text-yellow-300',
    };

    return (
        <div className={`p-3 my-4 rounded-md border text-center font-semibold ${colors[message.type]}`}>
            {message.text}
        </div>
    );
};


const BarcodeReaderTool: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const scanIntervalRef = useRef<number | null>(null);

    const [isCameraOn, setIsCameraOn] = useState(false);
    const [decodedData, setDecodedData] = useState('');
    const [status, setStatus] = useState<{ text: string, type: 'success' | 'error' | 'warning' } | null>(null);

    const isCameraOnRef = useRef(isCameraOn);
    isCameraOnRef.current = isCameraOn;

    const showStatus = useCallback((text: string, type: 'success' | 'error' | 'warning') => {
        setStatus({ text, type });
        setTimeout(() => setStatus(null), 5000);
    }, []);

    const stopCamera = useCallback(() => {
        if (scanIntervalRef.current) {
            clearInterval(scanIntervalRef.current);
            scanIntervalRef.current = null;
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setIsCameraOn(false);
    }, []);

    const handleQRCode = useCallback((data: string) => {
        setDecodedData(data);
        showStatus('تم قراءة رمز QR بنجاح!', 'success');
        if (isCameraOnRef.current) {
            stopCamera();
        }
    }, [showStatus, stopCamera]);
    
    const scanFrame = useCallback(() => {
        if (videoRef.current && canvasRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
            const canvas = canvasRef.current;
            const video = videoRef.current;
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            if (ctx) {
                canvas.height = video.videoHeight;
                canvas.width = video.videoWidth;
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: 'dontInvert' });
                if (code) {
                    handleQRCode(code.data);
                }
            }
        }
    }, [handleQRCode]);
    
    const startCamera = useCallback(async () => {
        if (streamRef.current) return;
        try {
            showStatus('جاري تشغيل الكاميرا...', 'warning');
            const constraints = { video: { facingMode: 'environment' } };
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play().catch(console.error);
                setIsCameraOn(true);
                showStatus('الكاميرا تعمل! وجه الكاميرا نحو رمز QR', 'success');
                scanIntervalRef.current = window.setInterval(scanFrame, 200);
            }
        } catch (error) {
            console.error('Error starting camera:', error);
            showStatus('لا يمكن الوصول للكاميرا. تأكد من منح الإذن للموقع.', 'error');
        }
    }, [showStatus, scanFrame]);

    useEffect(() => {
        startCamera();
        return () => stopCamera();
    }, [startCamera, stopCamera]);

    const processImageFile = (file: File) => {
        if (!file.type.startsWith('image/')) {
            showStatus('يرجى اختيار ملف صورة صحيح', 'error');
            return;
        }
        showStatus('جاري معالجة الصورة...', 'warning');
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                if (canvasRef.current) {
                    const canvas = canvasRef.current;
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        canvas.width = img.width;
                        canvas.height = img.height;
                        ctx.drawImage(img, 0, 0);
                        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                        const code = jsQR(imageData.data, imageData.width, imageData.height);
                        if (code) {
                            handleQRCode(code.data);
                        } else {
                            showStatus('لم يتم العثور على رمز QR في الصورة', 'error');
                        }
                    }
                }
            };
            img.src = e.target?.result as string;
        };
        reader.readAsDataURL(file);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            processImageFile(e.target.files[0]);
        }
    };
    
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.currentTarget.classList.add('border-brand-cyan', 'bg-brand-mid/20');
    };
    
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.currentTarget.classList.remove('border-brand-cyan', 'bg-brand-mid/20');
    };
    
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.currentTarget.classList.remove('border-brand-cyan', 'bg-brand-mid/20');
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            processImageFile(e.dataTransfer.files[0]);
        }
    };

    const handleCopy = () => {
        if (decodedData) {
            navigator.clipboard.writeText(decodedData).then(() => {
                showStatus('تم نسخ النص بنجاح!', 'success');
            });
        }
    };

    const handleClear = () => {
        setDecodedData('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="h-full flex flex-col">
            <h2 className="text-3xl font-bold text-white mb-2">قارئ رموز QR</h2>
            <p className="text-brand-light mb-6">امسح رموز QR باستخدام الكاميرا أو ارفع صورة.</p>

            <StatusMessage message={status} />

            <div className="text-center mb-4">
                {isCameraOn ? (
                    <button onClick={stopCamera} className="bg-red-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-red-700 transition-colors inline-flex items-center gap-2">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1zm4 0a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                        إيقاف الكاميرا
                    </button>
                ) : (
                    <button onClick={startCamera} className="bg-brand-cyan text-brand-dark font-bold py-2 px-6 rounded-lg hover:bg-opacity-80 transition-colors inline-flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM4 4a1 1 0 00-1 1v1h14V5a1 1 0 00-1-1H4z" /><path d="M11 9a3 3 0 100 6 3 3 0 000-6zM9 12a1 1 0 112 0 1 1 0 01-2 0z" /></svg>
                        تشغيل الكاميرا
                    </button>
                )}
            </div>
            
            <div className={`bg-black rounded-lg relative overflow-hidden my-4 transition-all duration-300 ${isCameraOn ? 'h-64' : 'h-0'}`}>
                <video ref={videoRef} playsInline className="w-full h-full object-cover" />
                {isCameraOn && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48">
                         <div className="absolute w-full h-full border-2 border-white rounded-lg shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]"></div>
                         <div className="absolute w-full h-0.5 bg-green-400 animate-scan"></div>
                    </div>
                )}
            </div>
            
            <canvas ref={canvasRef} className="hidden" />
            
            <div 
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className="border-2 border-dashed border-brand-mid rounded-lg p-10 text-center cursor-pointer transition-colors"
            >
                 <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-brand-light" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                 <h5 className="mt-2 text-white">ارفع صورة تحتوي على رمز QR</h5>
                 <p className="text-brand-light">اسحب الصورة هنا أو اضغط للاختيار</p>
                 <input ref={fileInputRef} type="file" onChange={handleFileChange} accept="image/*" className="hidden" />
            </div>

            {decodedData && (
                <div className="bg-brand-blue border border-brand-mid rounded-lg p-4 mt-6">
                     <h5 className="text-lg font-bold text-brand-cyan mb-2">تم العثور على رمز QR!</h5>
                     <strong>المحتوى:</strong>
                     <pre className="mt-2 p-3 bg-brand-dark text-brand-extralight rounded font-cairo whitespace-pre-wrap break-all" style={{ direction: 'ltr', textAlign: 'left' }}>
                         {decodedData}
                     </pre>
                     <div className="mt-4 space-x-4 rtl:space-x-reverse">
                         <button onClick={handleCopy} className="bg-brand-mid text-white font-bold py-2 px-4 rounded-lg hover:bg-brand-light transition-colors inline-flex items-center gap-2">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                             نسخ
                         </button>
                          <button onClick={handleClear} className="bg-transparent border border-brand-mid text-brand-light font-bold py-2 px-4 rounded-lg hover:bg-brand-mid transition-colors inline-flex items-center gap-2">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                             مسح
                         </button>
                     </div>
                </div>
            )}
        </div>
    );
};

export default BarcodeReaderTool;