import React, { useState, useMemo, useCallback, useEffect } from 'react';

// --- Color Conversion Helpers ---
const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : null;
};
const rgbToHex = (r: number, g: number, b: number) => "#" + [r, g, b].map(x => Math.round(x).toString(16).padStart(2, '0')).join('');
const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
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
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
};
const hslToRgb = (h: number, s: number, l: number) => {
    s /= 100; l /= 100;
    const k = (n: number) => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
    return { r: 255 * f(0), g: 255 * f(8), b: 255 * f(4) };
};

const ColorValueItem: React.FC<{ label: string, value: string }> = ({ label, value }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };
    return (
        <div className="flex justify-between items-center bg-brand-dark p-3 rounded-lg">
            <span className="font-semibold text-brand-light">{label}</span>
            <div className="flex items-center gap-2">
                <span className="font-mono text-white">{value}</span>
                <button onClick={handleCopy} className="text-brand-light hover:text-brand-cyan">
                    {copied ? <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg> : <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>}
                </button>
            </div>
        </div>
    );
};


const ColorConverterTool: React.FC = () => {
    const [hsl, setHsl] = useState({ h: 200, s: 70, l: 50 });
    const [searchInput, setSearchInput] = useState('');
    const [error, setError] = useState('');

    const { hex, rgb } = useMemo(() => {
        const rgbColor = hslToRgb(hsl.h, hsl.s, hsl.l);
        const hexColor = rgbToHex(rgbColor.r, rgbColor.g, rgbColor.b);
        return { hex: hexColor, rgb: rgbColor };
    }, [hsl]);
    
    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setHsl(prev => ({ ...prev, [name]: parseInt(value) }));
    };

    const handleSearch = () => {
        const parsedRgb = hexToRgb(searchInput);
        if (parsedRgb) {
            setHsl(rgbToHsl(parsedRgb.r, parsedRgb.g, parsedRgb.b));
            setError('');
        } else {
            setError('صيغة HEX غير صالحة. مثال: #FF5733');
        }
    };
    
    useEffect(() => {
        if(error) {
            const timer = setTimeout(() => setError(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    const isLight = hsl.l > 60;

    return (
        <div className="h-full flex flex-col">
            <h2 className="text-3xl font-bold text-white mb-2">محول الألوان</h2>
            <p className="text-brand-light mb-6">حوّل بين صيغ الألوان المختلفة وتعرّف عليها بسهولة.</p>

            <div className="flex-grow grid lg:grid-cols-2 gap-8">
                {/* Left: Picker & Sliders */}
                <div className="flex flex-col gap-6">
                    <div className="relative h-48 rounded-lg flex items-center justify-center text-center" style={{ backgroundColor: hex }}>
                        <div className={`text-2xl font-bold ${isLight ? 'text-black' : 'text-white'}`}>{hex.toUpperCase()}</div>
                    </div>

                    <div className="relative">
                        <input
                            type="color"
                            value={hex}
                            onChange={(e) => setHsl(rgbToHsl(hexToRgb(e.target.value)!.r, hexToRgb(e.target.value)!.g, hexToRgb(e.target.value)!.b))}
                            className="w-full h-12 p-0 border-none rounded-lg cursor-pointer appearance-none bg-transparent"
                            style={{'--color': hex} as React.CSSProperties}
                        />
                    </div>
                    
                    <div className="space-y-4 bg-brand-blue p-4 rounded-lg border border-brand-mid">
                        <div>
                            <label className="flex justify-between text-brand-light"><span>Hue (اللون)</span> <span className="text-white">{hsl.h}</span></label>
                            <input type="range" name="h" min="0" max="360" value={hsl.h} onChange={handleSliderChange} className="w-full accent-brand-cyan" />
                        </div>
                        <div>
                            <label className="flex justify-between text-brand-light"><span>Saturation (التشبع)</span> <span className="text-white">{hsl.s}%</span></label>
                            <input type="range" name="s" min="0" max="100" value={hsl.s} onChange={handleSliderChange} className="w-full accent-brand-cyan" />
                        </div>
                        <div>
                            <label className="flex justify-between text-brand-light"><span>Lightness (الإضاءة)</span> <span className="text-white">{hsl.l}%</span></label>
                            <input type="range" name="l" min="0" max="100" value={hsl.l} onChange={handleSliderChange} className="w-full accent-brand-cyan" />
                        </div>
                    </div>
                </div>

                {/* Right: Values */}
                <div className="flex flex-col gap-6">
                     <div className="space-y-2">
                        <div className="flex gap-2">
                             <input type="text" value={searchInput} onChange={e => setSearchInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} placeholder="ابحث عن لون بكود HEX..." className="flex-grow bg-brand-dark border border-brand-mid rounded-lg px-4 py-2 text-white" />
                             <button onClick={handleSearch} className="bg-brand-cyan text-brand-dark font-bold py-2 px-4 rounded-lg">بحث</button>
                        </div>
                        {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
                    </div>

                    <div className="bg-brand-blue p-4 rounded-lg border border-brand-mid space-y-3">
                        <ColorValueItem label="HEX" value={hex.toUpperCase()} />
                        <ColorValueItem label="RGB" value={`rgb(${Math.round(rgb.r)}, ${Math.round(rgb.g)}, ${Math.round(rgb.b)})`} />
                        <ColorValueItem label="HSL" value={`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ColorConverterTool;
