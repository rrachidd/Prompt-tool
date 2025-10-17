import React, { useState, useRef, useEffect, useCallback } from 'react';

// Make TypeScript aware of the ColorThief library loaded from the CDN
declare const ColorThief: any;

// --- Helper Functions ---
const rgbToHex = (r: number, g: number, b: number) => '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
const rgbToHslString = (r: number, g: number, b: number) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s, l = (max + min) / 2;
    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return `hsl(${Math.round(h * 360)}, ${Math.round((s || 0) * 100)}%, ${Math.round(l * 100)}%)`;
};
const hslToRgb = (h: number, s: number, l: number): number[] => {
    s /= 100; l /= 100;
    let c = (1 - Math.abs(2 * l - 1)) * s,
        x = c * (1 - Math.abs((h / 60) % 2 - 1)),
        m = l - c/2,
        r = 0, g = 0, b = 0;
    if (0 <= h && h < 60) { r = c; g = x; b = 0; }
    else if (60 <= h && h < 120) { r = x; g = c; b = 0; }
    else if (120 <= h && h < 180) { r = 0; g = c; b = x; }
    else if (180 <= h && h < 240) { r = 0; g = x; b = c; }
    else if (240 <= h && h < 300) { r = x; g = 0; b = c; }
    else if (300 <= h && h < 360) { r = c; g = 0; b = x; }
    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);
    return [r, g, b];
};

const ColorExtractorTool: React.FC = () => {
    // State
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [palette, setPalette] = useState<number[][] | null>(null);
    const [selectedColor, setSelectedColor] = useState<number[] | null>(null);
    const [pickerData, setPickerData] = useState<{ hex: string; rgb: string; x: number; y: number } | null>(null);
    const [colorCount, setColorCount] = useState(8);
    const [isLoading, setIsLoading] = useState(false);
    const [toast, setToast] = useState('');
    const [activeTab, setActiveTab] = useState<'palette' | 'schemes'>('palette');

    // Refs
    const imageRef = useRef<HTMLImageElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const colorThiefRef = useRef<any>(null);

    // Effects
    useEffect(() => {
        if (imageUrl && imageRef.current) {
            const img = imageRef.current;
            img.onload = () => {
                const canvas = canvasRef.current;
                if (canvas) {
                    canvas.width = img.naturalWidth;
                    canvas.height = img.naturalHeight;
                    const ctx = canvas.getContext('2d', { willReadFrequently: true });
                    ctx?.drawImage(img, 0, 0);
                    colorThiefRef.current = new ColorThief();
                }
            };
        }
    }, [imageUrl]);

    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(''), 2000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    // Handlers
    const handleFileChange = (file: File | null) => {
        if (!file || !file.type.startsWith('image/')) {
            alert('يرجى اختيار ملف صورة صالح.');
            return;
        }
        if (imageUrl) URL.revokeObjectURL(imageUrl);
        setPalette(null);
        setSelectedColor(null);
        setImageUrl(URL.createObjectURL(file));
    };

    const handleExtract = useCallback(() => {
        if (!imageRef.current || !colorThiefRef.current) return;
        setIsLoading(true);
        setPalette(null);
        setSelectedColor(null);
        setTimeout(() => {
            try {
                const palette = colorThiefRef.current.getPalette(imageRef.current, colorCount);
                setPalette(palette);
            } catch (error) {
                console.error("Error extracting colors:", error);
                alert("فشل استخراج الألوان. قد تكون الصورة غير مدعومة.");
            }
            setIsLoading(false);
        }, 100);
    }, [colorCount]);

    const handleMouseMoveOnImage = (e: React.MouseEvent<HTMLImageElement>) => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = Math.floor((e.clientX - rect.left) * scaleX);
        const y = Math.floor((e.clientY - rect.top) * scaleY);

        const pixel = ctx.getImageData(x, y, 1, 1).data;
        const [r, g, b] = pixel;
        setPickerData({
            hex: rgbToHex(r, g, b),
            rgb: `rgb(${r}, ${g}, ${b})`,
            x: e.pageX + 15,
            y: e.pageY - 60,
        });
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setToast('تم نسخ القيمة بنجاح!');
    };

    const handleReset = () => {
        if (imageUrl) URL.revokeObjectURL(imageUrl);
        setImageUrl(null);
        setPalette(null);
        setSelectedColor(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const generateSchemes = (baseRgb: number[]) => {
        const [r, g, b] = baseRgb;
        // This regex is a bit brittle, a proper parsing function would be better
        const hslString = rgbToHslString(r, g, b);
        const match = /hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/.exec(hslString);
        if(!match) return { monochromatic: [], complementary: [], analogous: [], triadic: [] };

        const h = parseInt(match[1]);
        const s = parseInt(match[2]);
        const l = parseInt(match[3]);
        
        const monochromatic = Array(5).fill(0).map((_, i) => hslToRgb(h, s, 15 + i * 20));
        const complementary = [baseRgb, hslToRgb((h + 180) % 360, s, l)];
        const analogous = [hslToRgb((h - 30 + 360) % 360, s, l), baseRgb, hslToRgb((h + 30) % 360, s, l)];
        const triadic = [baseRgb, hslToRgb((h + 120) % 360, s, l), hslToRgb((h + 240) % 360, s, l)];
        
        return { monochromatic, complementary, analogous, triadic };
    };

    const schemes = selectedColor ? generateSchemes(selectedColor) : null;

    // --- Render ---
    return (
        <div className="h-full flex flex-col">
            <h2 className="text-3xl font-bold text-white mb-2">مستخرج الألوان من الصور</h2>
            <p className="text-brand-light mb-6">ارفع صورة واستخرج لوحة الألوان منها، أو استخدم منتقي الألوان لاختيار لون معين.</p>

            <div className="flex-grow grid lg:grid-cols-2 gap-8">
                {/* Left Column: Uploader & Preview */}
                <div className="flex flex-col gap-6">
                     {!imageUrl ? (
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                                e.preventDefault();
                                if (e.dataTransfer.files && e.dataTransfer.files[0]) handleFileChange(e.dataTransfer.files[0]);
                            }}
                            className="flex-grow flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors bg-brand-dark hover:bg-brand-blue hover:border-brand-cyan"
                        >
                            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e.target.files?.[0] || null)} />
                            <span className="text-5xl">🖼️</span>
                            <p className="mt-4 text-white font-semibold">اسحب الصورة هنا أو انقر للاختيار</p>
                        </div>
                    ) : (
                        <>
                           <div className="relative bg-brand-dark border border-brand-mid rounded-lg p-2">
                                <img
                                    ref={imageRef}
                                    src={imageUrl}
                                    alt="Uploaded"
                                    className="w-full h-auto max-h-[400px] object-contain cursor-crosshair"
                                    crossOrigin="anonymous"
                                    onMouseMove={handleMouseMoveOnImage}
                                    onMouseLeave={() => setPickerData(null)}
                                    onClick={() => pickerData && handleCopy(pickerData.hex)}
                                />
                                <canvas ref={canvasRef} className="hidden" />
                            </div>
                            <div className="bg-brand-blue border border-brand-mid rounded-lg p-4 space-y-4">
                                <div>
                                    <label htmlFor="colorCount" className="block text-brand-light mb-2">عدد الألوان: <span className="text-white font-bold">{colorCount}</span></label>
                                    <input type="range" id="colorCount" min="3" max="20" value={colorCount} onChange={e => setColorCount(Number(e.target.value))} className="w-full accent-brand-cyan" />
                                </div>
                                <div className="flex gap-4">
                                    <button onClick={handleExtract} disabled={isLoading} className="flex-1 bg-brand-cyan text-brand-dark font-bold py-2 px-6 rounded-lg hover:bg-opacity-80 transition-colors disabled:opacity-50">
                                        {isLoading ? '...جاري الاستخراج' : 'استخراج الألوان'}
                                    </button>
                                    <button onClick={handleReset} className="flex-1 bg-brand-mid text-white font-bold py-2 px-6 rounded-lg hover:bg-brand-light transition-colors">إعادة تعيين</button>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Right Column: Results */}
                <div className="flex flex-col gap-6">
                    {isLoading && <div className="m-auto text-center text-brand-light"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-cyan mx-auto"></div><p className="mt-4">جاري التحليل...</p></div>}
                    
                    {palette && (
                        <div className="bg-brand-blue border border-brand-mid rounded-lg p-4">
                             <div className="flex border-b border-brand-mid mb-4">
                                <button onClick={() => setActiveTab('palette')} className={`py-2 px-4 font-semibold ${activeTab === 'palette' ? 'text-brand-cyan border-b-2 border-brand-cyan' : 'text-brand-light'}`}>لوحة الألوان</button>
                                <button onClick={() => setActiveTab('schemes')} disabled={!selectedColor} className={`py-2 px-4 font-semibold ${activeTab === 'schemes' ? 'text-brand-cyan border-b-2 border-brand-cyan' : 'text-brand-light'} disabled:opacity-50`}>مخططات</button>
                            </div>
                            
                            {activeTab === 'palette' && (
                                <>
                                    <div className="flex flex-wrap gap-3 justify-center mb-6">
                                        {palette.map((rgb, i) => (
                                            <div key={i}
                                                className="w-12 h-12 rounded-lg cursor-pointer transition-transform transform hover:scale-110"
                                                style={{ backgroundColor: `rgb(${rgb.join(',')})`, boxShadow: selectedColor === rgb ? `0 0 0 3px #00F5D4` : 'none' }}
                                                onClick={() => setSelectedColor(rgb)}
                                            />
                                        ))}
                                    </div>

                                    {selectedColor && (
                                        <div className="space-y-2">
                                            <div className="h-24 rounded-lg" style={{ backgroundColor: `rgb(${selectedColor.join(',')})` }}></div>
                                            {[
                                                { label: 'HEX', value: rgbToHex(selectedColor[0], selectedColor[1], selectedColor[2]) },
                                                { label: 'RGB', value: `rgb(${selectedColor.join(', ')})` },
                                                { label: 'HSL', value: rgbToHslString(selectedColor[0], selectedColor[1], selectedColor[2]) }
                                            ].map(({ label, value }) => (
                                                <div key={label} className="flex justify-between items-center bg-brand-dark p-2 rounded">
                                                    <span className="text-brand-light font-semibold">{label}:</span>
                                                    <span onClick={() => handleCopy(value)} className="font-mono text-white cursor-pointer hover:text-brand-cyan">{value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                            
                            {activeTab === 'schemes' && schemes && (
                                <div className="space-y-4">
                                    {(Object.keys(schemes) as Array<keyof typeof schemes>).map(key => (
                                        <div key={key}>
                                            <h4 className="font-semibold text-brand-light capitalize mb-2">{key === 'monochromatic' ? 'أحادي' : key === 'complementary' ? 'متناظر' : key === 'analogous' ? 'متجاور' : 'ثلاثي'}</h4>
                                            <div className="flex h-12 rounded-md overflow-hidden">
                                                {schemes[key].map((rgb, i) => (
                                                    <div key={i} className="flex-1" style={{ backgroundColor: `rgb(${rgb.join(',')})` }} title={rgbToHex(rgb[0],rgb[1],rgb[2])} />
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Picker Tooltip */}
            {pickerData && (
                <div style={{ position: 'fixed', top: pickerData.y, left: pickerData.x }} className="bg-brand-dark border border-brand-cyan rounded-lg p-2 shadow-lg z-50 pointer-events-none text-sm text-white flex items-center gap-2">
                    <div className="w-8 h-8 rounded" style={{ backgroundColor: pickerData.hex }}></div>
                    <div className="font-mono">
                        <div>{pickerData.hex}</div>
                        <div className="text-xs text-brand-light">{pickerData.rgb}</div>
                    </div>
                </div>
            )}
            
            {/* Toast Notification */}
            {toast && <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-brand-cyan text-brand-dark font-bold py-2 px-6 rounded-lg shadow-lg z-50">{toast}</div>}
        </div>
    );
};

export default ColorExtractorTool;