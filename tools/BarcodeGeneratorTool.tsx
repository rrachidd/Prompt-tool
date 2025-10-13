import React, { useState } from 'react';

const BarcodeGeneratorTool: React.FC = () => {
    const [inputText, setInputText] = useState('');
    const [size, setSize] = useState('256');
    const [generatedImageUrl, setGeneratedImageUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGenerate = () => {
        if (!inputText.trim()) {
            setError('الرجاء إدخال نص أو رابط!');
            setGeneratedImageUrl('');
            return;
        }
        setError('');
        setIsLoading(true);
        const encodedText = encodeURIComponent(inputText);
        const url = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedText}&ts=${Date.now()}`;
        setGeneratedImageUrl(url);
    };

    const handleDownload = async () => {
        if (!generatedImageUrl) return;
        try {
            const response = await fetch(generatedImageUrl);
            if (!response.ok) throw new Error('Network response was not ok');
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'qrcode.png';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (downloadError) {
            setError('فشل تحميل الصورة. يرجى المحاولة مرة أخرى.');
            console.error('Download error:', downloadError);
        }
    };

    return (
        <div className="h-full flex flex-col">
            <h2 className="text-3xl font-bold text-white mb-2">🎯 مولد أكواد QR</h2>
            <p className="text-brand-light mb-6">أدخل نصًا أو رابطًا لإنشاء صورة QR Code خاصة بك قابلة للتحميل.</p>

            <div className="flex flex-col gap-4 mb-4">
                <div className="flex flex-col md:flex-row gap-4 items-start">
                     <div className="flex-grow w-full">
                        <label htmlFor="text-input" className="block text-brand-light mb-2">النص أو الرابط:</label>
                        <input
                            id="text-input"
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="أدخل النص أو الرابط هنا..."
                            className="w-full bg-brand-dark border border-brand-mid rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-cyan"
                            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                        />
                     </div>
                     <div className="flex-shrink-0">
                        <label htmlFor="size" className="block text-brand-light mb-2">الحجم:</label>
                        <div className="flex items-center gap-2">
                             <input 
                                type="number"
                                id="size"
                                value={size}
                                onChange={(e) => setSize(e.target.value)}
                                min="128"
                                max="1024"
                                className="w-24 bg-brand-dark border border-brand-mid rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-cyan"
                            />
                             <span className="text-brand-light">بكسل</span>
                        </div>
                     </div>
                </div>
                <button
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="bg-brand-cyan text-brand-dark font-bold py-3 px-6 rounded-lg hover:bg-opacity-80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed self-start"
                >
                    {isLoading ? '...جاري الإنشاء' : 'توليد كود QR'}
                </button>
            </div>
            
            {error && <p className="text-red-400 mb-4">{error}</p>}
            
            <div className="flex-grow bg-brand-dark border border-brand-mid rounded-lg p-4 mt-4 relative min-h-[320px] flex flex-col items-center justify-center">
                {isLoading && (
                   <div className="m-auto">
                     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-cyan"></div>
                   </div>
                )}

                {generatedImageUrl && (
                     <img
                        key={generatedImageUrl}
                        src={generatedImageUrl}
                        alt="QR Code"
                        onLoad={() => setIsLoading(false)}
                        onError={() => {
                            setIsLoading(false);
                            setError('حدث خطأ في تحميل صورة الكود.');
                            setGeneratedImageUrl('');
                        }}
                        className="p-2 bg-white rounded-md"
                        style={{
                            display: isLoading ? 'none' : 'block',
                            maxWidth: '100%',
                            maxHeight: '100%',
                            objectFit: 'contain'
                        }}
                      />
                )}
                
                {!isLoading && generatedImageUrl && (
                    <div className="absolute top-3 left-3 flex gap-2">
                      <button 
                        onClick={handleDownload}
                        className="bg-brand-mid text-white p-2 rounded-md hover:bg-brand-light"
                        title="تحميل PNG"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                )}
                
                {!isLoading && !generatedImageUrl && (
                    <p className="text-brand-light m-auto">{error ? '' : 'سيظهر رمز QR Code هنا.'}</p>
                )}
            </div>
        </div>
    );
};

export default BarcodeGeneratorTool;
