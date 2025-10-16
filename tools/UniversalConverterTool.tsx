import React, { useState, useEffect, useMemo } from 'react';

// --- Data Definitions ---
const lengthUnits = { 'متر': 1, 'كيلومتر': 0.001, 'سنتيمتر': 100, 'مليمتر': 1000, 'ميل': 0.000621371, 'ياردة': 1.09361, 'قدم': 3.28084, 'إنش': 39.3701 };
const weightUnits = { 'كيلوجرام': 1, 'جرام': 1000, 'ميلجرام': 1000000, 'رطل': 2.20462, 'أوقية': 35.274 };
const volumeUnits = { 'لتر': 1, 'ميليلتر': 1000, 'متر مكعب': 0.001, 'جالون': 0.264172, 'كوارت': 1.05669, 'باينت': 2.11338, 'كوب': 4.22675 };
const timeUnits = { 'ثانية': 1, 'دقيقة': 1/60, 'ساعة': 1/3600, 'يوم': 1/86400, 'أسبوع': 1/604800, 'شهر': 1/2629746, 'سنة': 1/31556952 };
const dataUnits = { 'بايت': 1, 'كيلوبايت': 1/1024, 'ميجابايت': 1/1048576, 'جيجابايت': 1/1073741824, 'تيرابايت': 1/1099511627776 };

// --- Generic Converter Component ---
const GenericConverter: React.FC<{ units: Record<string, number>, defaultToUnit: string }> = ({ units, defaultToUnit }) => {
    const [fromValue, setFromValue] = useState('1');
    const [fromUnit, setFromUnit] = useState(Object.keys(units)[0]);
    const [toUnit, setToUnit] = useState(defaultToUnit);

    const result = useMemo(() => {
        const value = parseFloat(fromValue);
        if (isNaN(value)) return '';
        const valueInBase = value / units[fromUnit];
        const convertedValue = valueInBase * units[toUnit];
        return convertedValue.toLocaleString('en-US', { maximumFractionDigits: 6, useGrouping: false });
    }, [fromValue, fromUnit, toUnit, units]);

    const unitOptions = Object.keys(units).map(unit => (
        <option key={unit} value={unit}>{unit.replace('_', ' ')}</option>
    ));

    const inputClasses = "w-full bg-brand-dark border border-brand-mid rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-cyan";

    return (
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_2fr] items-end gap-4">
            <div>
                <label className="block text-brand-light mb-2">من</label>
                <input type="number" value={fromValue} onChange={e => setFromValue(e.target.value)} placeholder="أدخل القيمة" className={inputClasses} />
                <select value={fromUnit} onChange={e => setFromUnit(e.target.value)} className={`${inputClasses} mt-2`}>{unitOptions}</select>
            </div>
            <div className="text-center text-brand-light text-3xl pb-4 hidden md:block">⇌</div>
            <div>
                <label className="block text-brand-light mb-2">إلى</label>
                <input type="text" value={result} readOnly className={`${inputClasses} font-bold text-brand-cyan cursor-not-allowed`} />
                <select value={toUnit} onChange={e => setToUnit(e.target.value)} className={`${inputClasses} mt-2`}>{unitOptions}</select>
            </div>
        </div>
    );
};

// --- Temperature Converter Component ---
const TempConverter: React.FC = () => {
    const [fromValue, setFromValue] = useState('');
    const [fromUnit, setFromUnit] = useState('celsius');
    const [toUnit, setToUnit] = useState('fahrenheit');

    const result = useMemo(() => {
        let value = parseFloat(fromValue);
        if (isNaN(value)) return '';
        let resultValue;
        
        if (fromUnit === 'fahrenheit') value = (value - 32) * 5 / 9;
        if (fromUnit === 'kelvin') value = value - 273.15;

        if (toUnit === 'celsius') resultValue = value;
        if (toUnit === 'fahrenheit') resultValue = (value * 9 / 5) + 32;
        if (toUnit === 'kelvin') resultValue = value + 273.15;

        return resultValue?.toFixed(2) ?? '';
    }, [fromValue, fromUnit, toUnit]);

    const inputClasses = "w-full bg-brand-dark border border-brand-mid rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-cyan";

    return (
      <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_2fr] items-end gap-4">
            <div>
                <label className="block text-brand-light mb-2">من</label>
                <input type="number" value={fromValue} onChange={e => setFromValue(e.target.value)} placeholder="أدخل القيمة" className={inputClasses} />
                <select value={fromUnit} onChange={e => setFromUnit(e.target.value)} className={`${inputClasses} mt-2`}>
                    <option value="celsius">مئوية (°C)</option>
                    <option value="fahrenheit">فهرنهايت (°F)</option>
                    <option value="kelvin">كلفن (K)</option>
                </select>
            </div>
            <div className="text-center text-brand-light text-3xl pb-4 hidden md:block">⇌</div>
            <div>
                <label className="block text-brand-light mb-2">إلى</label>
                <input type="text" value={result} readOnly className={`${inputClasses} font-bold text-brand-cyan cursor-not-allowed`} />
                <select value={toUnit} onChange={e => setToUnit(e.target.value)} className={`${inputClasses} mt-2`}>
                    <option value="celsius">مئوية (°C)</option>
                    <option value="fahrenheit">فهرنهايت (°F)</option>
                    <option value="kelvin">كلفن (K)</option>
                </select>
            </div>
        </div>
    );
};

// --- Currency Converter Component ---
const CurrencyConverter: React.FC = () => {
    const [rates, setRates] = useState<Record<string, number> | null>(null);
    const [lastUpdated, setLastUpdated] = useState('');
    const [error, setError] = useState('');
    
    const [fromValue, setFromValue] = useState('1');
    const [fromUnit, setFromUnit] = useState('USD');
    const [toUnit, setToUnit] = useState('EUR');

    useEffect(() => {
        const fetchRates = async () => {
            const CURRENCY_API_KEY = '9d99b50d50fe858542155abb';
            const CURRENCY_API_URL = `https://v6.exchangerate-api.com/v6/${CURRENCY_API_KEY}/latest/USD`;
            try {
                const response = await fetch(CURRENCY_API_URL);
                if (!response.ok) throw new Error('فشل في جلب بيانات العملات.');
                const data = await response.json();
                if (data.result === 'error') throw new Error(data['error-type']);
                
                setRates(data.conversion_rates);
                setLastUpdated(new Date(data.time_last_update_utc).toLocaleString('ar-EG'));
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Unknown error';
                setError(`خطأ في محول العملات: ${message}`);
            }
        };
        fetchRates();
    }, []);

    const result = useMemo(() => {
        if (!rates) return '';
        const value = parseFloat(fromValue);
        if (isNaN(value)) return '';
        
        const fromRate = rates[fromUnit];
        const toRate = rates[toUnit];
        if (!fromRate || !toRate) return '';

        const valueInUSD = value / fromRate;
        const convertedValue = valueInUSD * toRate;
        
        return convertedValue.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }, [fromValue, fromUnit, toUnit, rates]);
    
    const currencyOptions = useMemo(() => {
        if (!rates) return <option>جاري التحميل...</option>;
        return Object.keys(rates).sort().map(currency => (
            <option key={currency} value={currency}>{currency}</option>
        ));
    }, [rates]);

    const inputClasses = "w-full bg-brand-dark border border-brand-mid rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-cyan";

    return (
        <div>
            {error && <div className="p-3 my-4 rounded-md border text-center font-semibold bg-red-500/20 border-red-400 text-red-300">{error}</div>}
            <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_2fr] items-end gap-4">
                <div>
                    <label className="block text-brand-light mb-2">المبلغ</label>
                    <input type="number" value={fromValue} onChange={e => setFromValue(e.target.value)} placeholder="أدخل المبلغ" className={inputClasses} />
                    <select value={fromUnit} onChange={e => setFromUnit(e.target.value)} className={`${inputClasses} mt-2`}>{currencyOptions}</select>
                </div>
                <div className="text-center text-brand-light text-3xl pb-4 hidden md:block">⇌</div>
                <div>
                    <label className="block text-brand-light mb-2">النتيجة</label>
                    <input type="text" value={result} readOnly className={`${inputClasses} font-bold text-brand-cyan cursor-not-allowed`} />
                    <select value={toUnit} onChange={e => setToUnit(e.target.value)} className={`${inputClasses} mt-2`}>{currencyOptions}</select>
                </div>
            </div>
             <div className="text-center mt-3 text-sm text-brand-light">
                آخر تحديث: {lastUpdated}
            </div>
        </div>
    );
};

// --- Main Tool Component ---
const UniversalConverterTool: React.FC = () => {
    type Tab = 'length' | 'weight' | 'volume' | 'temp' | 'time' | 'data' | 'currency';
    const [activeTab, setActiveTab] = useState<Tab>('length');

    const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
        { id: 'length', label: 'الطول', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16M8 4v4m8-4v4m-4 8v4" /></svg> },
        { id: 'weight', label: 'الوزن', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8a4 4 0 11-8 0 4 4 0 018 0zM12 12v10m-4-8h8" /></svg> },
        { id: 'volume', label: 'الحجم', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V8a2 2 0 00-2-2H7a2 2 0 00-2 2v11a2 2 0 002 2zM9 8V4h6v4" /></svg> },
        { id: 'temp', label: 'الحرارة', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m4-4a4 4 0 10-8 0 4 4 0 008 0z" /></svg> },
        { id: 'time', label: 'الوقت', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
        { id: 'data', label: 'البيانات', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" /></svg> },
        { id: 'currency', label: 'العملات', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8v10M16 12H8" /></svg> },
    ];
    
    const renderContent = () => {
        switch (activeTab) {
            case 'length': return <div><h3 className="text-xl font-bold text-white mb-4">محول الطول</h3><GenericConverter units={lengthUnits} defaultToUnit="قدم" /></div>;
            case 'weight': return <div><h3 className="text-xl font-bold text-white mb-4">محول الوزن</h3><GenericConverter units={weightUnits} defaultToUnit="رطل" /></div>;
            case 'volume': return <div><h3 className="text-xl font-bold text-white mb-4">محول الحجم</h3><GenericConverter units={volumeUnits} defaultToUnit="جالون" /></div>;
            case 'temp': return <div><h3 className="text-xl font-bold text-white mb-4">محول درجة الحرارة</h3><TempConverter /></div>;
            case 'time': return <div><h3 className="text-xl font-bold text-white mb-4">محول الوقت</h3><GenericConverter units={timeUnits} defaultToUnit="ساعة" /></div>;
            case 'data': return <div><h3 className="text-xl font-bold text-white mb-4">محول البيانات</h3><GenericConverter units={dataUnits} defaultToUnit="جيجابايت" /></div>;
            case 'currency': return <div><h3 className="text-xl font-bold text-white mb-4">محول العملات</h3><CurrencyConverter /></div>;
            default: return null;
        }
    };

    return (
        <div className="h-full flex flex-col">
            <h2 className="text-3xl font-bold text-white mb-2">المحول الشامل</h2>
            <p className="text-brand-light mb-6">حوّل بين مختلف وحدات القياس بسهولة وسرعة.</p>
            
            <div className="flex flex-wrap border-b border-brand-mid mb-6 -mx-4 px-2">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 py-3 px-4 font-semibold border-b-4 transition-colors ${activeTab === tab.id ? 'text-brand-cyan border-brand-cyan' : 'text-brand-light border-transparent hover:text-white'}`}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>
            
            <div className="bg-brand-blue p-6 rounded-lg border border-brand-mid">
                {renderContent()}
            </div>
        </div>
    );
};
export default UniversalConverterTool;