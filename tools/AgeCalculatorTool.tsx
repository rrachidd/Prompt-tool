import React, { useState, useEffect, useCallback, useMemo } from 'react';

// --- Helper Functions ---
const calculateGregorianAge = (birthDate: Date, today: Date) => {
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    let days = today.getDate() - birthDate.getDate();
    if (days < 0) {
        months--;
        const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        days += lastMonth.getDate();
    }
    if (months < 0) {
        years--;
        months += 12;
    }
    return { years, months, days };
};

const gregorianToHijri = (date: Date) => {
    // Simplified conversion, for a real app a dedicated library is better.
    const jd = Math.floor((date.getTime() / 86400000) - (date.getTimezoneOffset() / 1440) + 2440587.5);
    const l = jd - 1948440 + 10632;
    const n = Math.floor((l - 1) / 10631);
    const i = l - 10631 * n + 354;
    const j = (Math.floor((10985 - i) / 5316)) * (Math.floor((50 * i) / 17719)) + (Math.floor(i / 5670)) * (Math.floor((43 * i) / 15238));
    const year = 30 * n + j - 30;
    const month = Math.floor((211 * i - 10484) / 5900);
    const day = Math.floor((211 * i - 10484 - 5900 * month + 5835) / 199);
    return { year, month, day };
};

const calculateHijriAge = (hijriBirth: { year: number, month: number, day: number }, hijriToday: { year: number, month: number, day: number }) => {
    let years = hijriToday.year - hijriBirth.year;
    let months = hijriToday.month - hijriBirth.month;
    let days = hijriToday.day - hijriBirth.day;
    if (days < 0) {
        months--;
        days += 30; // Approximation
    }
    if (months < 0) {
        years--;
        months += 12;
    }
    return { years, months, days };
};

const calculateNextBirthday = (birthDate: Date, today: Date) => {
    let nextBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
    if (nextBirthday < today) {
        nextBirthday.setFullYear(today.getFullYear() + 1);
    }
    const diff = nextBirthday.getTime() - today.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return { date: nextBirthday, formatted: `${days} يوم و ${hours} ساعة و ${minutes} دقيقة` };
};

const getMonthName = (month: number) => ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'][month - 1];
const getHijriMonthName = (month: number) => ['محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني', 'جمادى الأولى', 'جمادى الثانية', 'رجب', 'شعبان', 'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'][month - 1];
const getDayName = (day: number) => ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'][day];
const getSeason = (month: number) => { if (month >= 3 && month <= 5) return 'الربيع'; if (month >= 6 && month <= 8) return 'الصيف'; if (month >= 9 && month <= 11) return 'الخريف'; return 'الشتاء'; };
const getLifeStage = (age: number) => { if (age < 1) return 'الرضاعة'; if (age < 3) return 'الطفولة المبكرة'; if (age < 12) return 'الطفولة'; if (age < 18) return 'المراهقة'; if (age < 40) return 'الشباب'; if (age < 60) return 'منتصف العمر'; return 'الشيخوخة'; };
const getSleepRecommendation = (age: number) => { if (age < 1) return '14-17 ساعة'; if (age < 3) return '11-14 ساعة'; if (age < 6) return '10-13 ساعة'; if (age < 13) return '9-11 ساعة'; if (age < 18) return '8-10 ساعات'; return '7-9 ساعات'; };
const formatDuration = (hours: number) => { const years = Math.floor(hours / (24 * 365.25)); const remainingHours = hours % (24 * 365.25); const days = Math.floor(remainingHours / 24); return `${years} سنة و ${days} يوم`; };
const formatDate = (date: Date) => date.toLocaleDateString('ar-EG-u-nu-latn', { year: 'numeric', month: 'long', day: 'numeric' });
const getZodiacSign = (day: number, month: number) => { if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return { name: 'الحمل', icon: '♈' }; if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return { name: 'الثور', icon: '♉' }; if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return { name: 'الجوزاء', icon: '♊' }; if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return { name: 'السرطان', icon: '♋' }; if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return { name: 'الأسد', icon: '♌' }; if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return { name: 'العذراء', icon: '♍' }; if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return { name: 'الميزان', icon: '♎' }; if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return { name: 'العقرب', icon: '♏' }; if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return { name: 'القوس', icon: '♐' }; if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return { name: 'الجدي', icon: '♑' }; if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return { name: 'الدلو', icon: '♒' }; return { name: 'الحوت', icon: '♓' }; };
const zodiacInfoData: Record<string, any> = {
    'الحمل': { description: 'يتميزون بالشجاعة والحماس والمبادرة.', traits: ['شجاع', 'متحمس', 'مبادر', 'واثق'], compatibility: ['الأسد', 'القوس', 'الجوزاء'], element: 'ناري', ruling: 'المريخ' },
    'الثور': { description: 'يتميزون بالصبر والموثوقية والعمل الجاد.', traits: ['صبور', 'موثوق', 'مثابر', 'مخلص'], compatibility: ['العذراء', 'الجدي', 'السرطان'], element: 'أرضي', ruling: 'الزهرة' },
    'الجوزاء': { description: 'يتميزون بالذكاء والتكيف والمرونة.', traits: ['ذكي', 'فضولي', 'متكيف', 'اجتماعي'], compatibility: ['الميزان', 'الدلو', 'الحمل'], element: 'هوائي', ruling: 'عطارد' },
    'السرطان': { description: 'يتميزون بالعطف والحماية والحدس القوي.', traits: ['عطوف', 'حمائي', 'حدسي', 'حساس'], compatibility: ['العقرب', 'الحوت', 'الثور'], element: 'مائي', ruling: 'القمر' },
    'الأسد': { description: 'يتميزون بالثقة بالنفس والكرم والشجاعة.', traits: ['واثق', 'كريم', 'شجاع', 'قيادي'], compatibility: ['الحمل', 'القوس', 'الميزان'], element: 'ناري', ruling: 'الشمس' },
    'العذراء': { description: 'يتميزون بالعملية والانتباه للتفاصيل والمسؤولية.', traits: ['عملي', 'دقيق', 'منظم', 'محلل'], compatibility: ['الثور', 'الجدي', 'السرطان'], element: 'أرضي', ruling: 'عطارد' },
    'الميزان': { description: 'يتميزون بالدبلوماسية والاجتماعية والسعي للانسجام.', traits: ['دبلوماسي', 'اجتماعي', 'منصف', 'متعاون'], compatibility: ['الجوزاء', 'الدلو', 'الأسد'], element: 'هوائي', ruling: 'الزهرة' },
    'العقرب': { description: 'يتميزون بالقوة والعمق العاطفي والمثابرة.', traits: ['قوي', 'عميق', 'شغوف', 'مخلص'], compatibility: ['السرطان', 'الحوت', 'العذراء'], element: 'مائي', ruling: 'بلوتو والمريخ' },
    'القوس': { description: 'يتميزون بالتفاؤل والفضول وحب الحرية والمغامرة.', traits: ['متفائل', 'مغامر', 'صادق', 'مستقل'], compatibility: ['الحمل', 'الأسد', 'الدلو'], element: 'ناري', ruling: 'المشتري' },
    'الجدي': { description: 'يتميزون بالجدية والمسؤولية والطموح والانضباط.', traits: ['جدي', 'مسؤول', 'طموح', 'صبور'], compatibility: ['الثور', 'العذراء', 'الحوت'], element: 'أرضي', ruling: 'زحل' },
    'الدلو': { description: 'يتميزون بالأصالة والإنسانية والاستقلالية الفكرية.', traits: ['أصيل', 'إنساني', 'مستقل', 'مبتكر'], compatibility: ['الجوزاء', 'الميزان', 'القوس'], element: 'هوائي', ruling: 'أورانوس وزحل' },
    'الحوت': { description: 'يتميزون بالحساسية والخيال الواسع والتعاطف العميق.', traits: ['حساس', 'خيالي', 'متعاطف', 'فني'], compatibility: ['السرطان', 'العقرب', 'الجدي'], element: 'مائي', ruling: 'نبتون والمشتري' },
};
const calculateFacts = (days: number) => ({ breaths: Math.floor(days * 23040), heartbeats: Math.floor(days * 103680), laughs: Math.floor(days * 10), sleepTime: formatDuration(days * 8), eatingTime: formatDuration(days * 1.5), });
// --- Component ---
const InfoItem: React.FC<{ label: string, value?: string }> = ({ label, value }) => ( <div className="py-2 border-b border-brand-mid/50 flex justify-between items-center"><span className="font-semibold text-brand-light">{label}</span><span className="text-white text-left">{value}</span></div> );
const FactItem: React.FC<{ icon: string, text: React.ReactNode }> = ({ icon, text }) => ( <div className="bg-brand-dark p-3 rounded-lg flex items-center gap-3 border-r-4 border-brand-cyan"><span className="text-xl">{icon}</span><span className="text-brand-extralight">{text}</span></div> );

const AgeCalculatorTool: React.FC = () => {
    const [day, setDay] = useState('');
    const [month, setMonth] = useState('');
    const [year, setYear] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<any | null>(null);
    const [activeTab, setActiveTab] = useState('gregorian');
    const [error, setError] = useState('');

    const years = useMemo(() => Array.from({ length: new Date().getFullYear() - 1899 }, (_, i) => new Date().getFullYear() - i), []);
    const months = useMemo(() => Array.from({ length: 12 }, (_, i) => ({ value: i + 1, name: getMonthName(i + 1) })), []);
    const daysInMonth = useMemo(() => {
        if (!month || !year) return 31;
        const m = parseInt(month), y = parseInt(year);
        return new Date(y, m, 0).getDate();
    }, [month, year]);

    useEffect(() => {
        if (day && parseInt(day) > daysInMonth) setDay(String(daysInMonth));
    }, [daysInMonth, day]);

    const handleCalculate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!day || !month || !year) {
            setError('الرجاء إكمال تاريخ الميلاد.');
            return;
        }
        setError('');
        setIsLoading(true);
        setResults(null);
        setTimeout(() => {
            const birthDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
            const today = new Date();
            const gregorianAge = calculateGregorianAge(birthDate, today);
            const ageInDays = Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));
            const hijriBirth = gregorianToHijri(birthDate);
            const hijriToday = gregorianToHijri(today);
            setResults({
                gregorianAge,
                hijriAge: calculateHijriAge(hijriBirth, hijriToday),
                gregorianBirth: formatDate(birthDate),
                hijriBirth: `${hijriBirth.day}/${hijriBirth.month}/${hijriBirth.year}`,
                gregorianBirthMonth: getMonthName(parseInt(month)),
                hijriBirthMonth: getHijriMonthName(hijriBirth.month),
                nextBirthday: calculateNextBirthday(birthDate, today),
                birthDayName: getDayName(birthDate.getDay()),
                birthSeason: getSeason(parseInt(month)),
                ageInDays,
                ageInMonths: Math.floor(ageInDays / 30.44),
                ageInWeeks: Math.floor(ageInDays / 7),
                ageInHours: ageInDays * 24,
                zodiacSign: getZodiacSign(parseInt(day), parseInt(month)),
                lifeStage: getLifeStage(gregorianAge.years),
                sleepRecommendation: getSleepRecommendation(gregorianAge.years),
                facts: calculateFacts(ageInDays),
            });
            setIsLoading(false);
        }, 1000);
    };

    const inputClasses = "w-full bg-brand-dark border border-brand-mid rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-cyan text-center";

    return (
        <div className="h-full flex flex-col">
            <h2 className="text-3xl font-bold text-white mb-2">📅 حاسبة العمر بالميلادي و الهجري</h2>
            <p className="text-brand-light mb-6">احسب عمرك بدقة بالتقويمين الميلادي والهجري واكتشف تفاصيل ممتعة.</p>

            <div className="bg-brand-blue border border-brand-mid rounded-xl shadow-lg p-6 mb-6">
                <form onSubmit={handleCalculate}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <select value={day} onChange={e => setDay(e.target.value)} required className={inputClasses}>
                            <option value="" disabled>اليوم</option>
                            {Array.from({ length: daysInMonth }, (_, i) => <option key={i + 1} value={i + 1}>{i + 1}</option>)}
                        </select>
                        <select value={month} onChange={e => setMonth(e.target.value)} required className={inputClasses}>
                            <option value="" disabled>الشهر</option>
                            {months.map(m => <option key={m.value} value={m.value}>{m.name}</option>)}
                        </select>
                        <select value={year} onChange={e => setYear(e.target.value)} required className={inputClasses}>
                            <option value="" disabled>السنة</option>
                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                    {error && <p className="text-red-400 text-center mt-3">{error}</p>}
                    <div className="text-center mt-4">
                        <button type="submit" disabled={isLoading} className="bg-brand-cyan text-brand-dark font-bold py-3 px-8 rounded-lg hover:bg-opacity-80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                            {isLoading ? '...جاري الحساب' : 'احسب عمري'}
                        </button>
                    </div>
                </form>
            </div>

            {isLoading && <div className="m-auto"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-cyan"></div></div>}
            
            {results && (
                <div className="animate-fade-in">
                    <div className="bg-yellow-900/50 border border-yellow-500 text-yellow-300 p-4 rounded-lg mb-6">
                         <h5 className="font-bold">ملاحظة هامة</h5>
                         <p className="text-sm">يختلف عمرك بالهجري عن عمرك بالميلادي لأن السنة الهجرية أقصر من الميلادية بحوالي 11 يومًا.</p>
                    </div>

                    <div className="flex border-b border-brand-mid mb-4">
                        <button onClick={() => setActiveTab('gregorian')} className={`py-2 px-4 font-semibold ${activeTab === 'gregorian' ? 'text-brand-cyan border-b-2 border-brand-cyan' : 'text-brand-light'}`}>العمر بالميلادي</button>
                        <button onClick={() => setActiveTab('hijri')} className={`py-2 px-4 font-semibold ${activeTab === 'hijri' ? 'text-brand-cyan border-b-2 border-brand-cyan' : 'text-brand-light'}`}>العمر بالهجري</button>
                        <button onClick={() => setActiveTab('details')} className={`py-2 px-4 font-semibold ${activeTab === 'details' ? 'text-brand-cyan border-b-2 border-brand-cyan' : 'text-brand-light'}`}>تفاصيل إضافية</button>
                    </div>
                    
                    {activeTab === 'gregorian' && <div className="bg-brand-blue p-6 rounded-lg border border-brand-mid">
                        <div className="text-center text-3xl font-bold text-brand-cyan mb-4">{`${results.gregorianAge.years} سنة و ${results.gregorianAge.months} شهر و ${results.gregorianAge.days} يوم`}</div>
                        <div className="grid md:grid-cols-2 gap-x-6">
                            <InfoItem label="تاريخ الميلاد" value={results.gregorianBirth} />
                            <InfoItem label="شهر الميلاد" value={results.gregorianBirthMonth} />
                            <InfoItem label="يوم الميلاد" value={results.birthDayName} />
                            <InfoItem label="موسم الميلاد" value={results.birthSeason} />
                        </div>
                        <InfoItem label="باقي لعيد ميلادك القادم" value={results.nextBirthday.formatted} />
                        <InfoItem label="سيكون عيد ميلادك يوم" value={`${getDayName(results.nextBirthday.date.getDay())} الموافق ${formatDate(results.nextBirthday.date)}`} />
                    </div>}

                    {activeTab === 'hijri' && <div className="bg-brand-blue p-6 rounded-lg border border-brand-mid">
                         <div className="text-center text-3xl font-bold text-brand-cyan mb-4">{`${results.hijriAge.years} سنة و ${results.hijriAge.months} شهر و ${results.hijriAge.days} يوم`}</div>
                         <InfoItem label="تاريخ الميلاد" value={results.hijriBirth} />
                         <InfoItem label="شهر الميلاد" value={results.hijriBirthMonth} />
                    </div>}

                    {activeTab === 'details' && <div className="space-y-6">
                        <div className="bg-brand-blue p-6 rounded-lg border border-brand-mid">
                            <h4 className="text-xl font-bold text-white mb-2">عمرك بصيغ مختلفة</h4>
                            <div className="grid md:grid-cols-2 gap-x-6">
                                <InfoItem label="بالأشهر" value={`${results.ageInMonths} شهر و ${results.ageInDays % 30} يوم`} />
                                <InfoItem label="بالأسابيع" value={`${results.ageInWeeks} أسبوع و ${results.ageInDays % 7} يوم`} />
                                <InfoItem label="بالأيام" value={`${results.ageInDays.toLocaleString()} يوم`} />
                                <InfoItem label="بالساعات" value={`~ ${results.ageInHours.toLocaleString()} ساعة`} />
                            </div>
                        </div>
                        <div className="bg-brand-blue p-6 rounded-lg border border-brand-mid">
                             <h4 className="text-xl font-bold text-white mb-2">معلومات فلكية وصحية</h4>
                             <div className="text-center text-6xl my-4">{results.zodiacSign.icon}</div>
                             <div className="grid md:grid-cols-2 gap-x-6">
                                <InfoItem label="برجك" value={results.zodiacSign.name} />
                                <InfoItem label="مرحلة حياتك" value={results.lifeStage} />
                                <InfoItem label="نومك الصحي" value={results.sleepRecommendation} />
                             </div>
                        </div>
                        <div className="bg-brand-blue p-6 rounded-lg border border-brand-mid">
                            <h4 className="text-xl font-bold text-white mb-4">حقائق عن حياتك (تقريبي)</h4>
                            <div className="space-y-3">
                                <FactItem icon="🫁" text={<span>تَنَفَستَ حوالي <b>{results.facts.breaths.toLocaleString()}</b> مرة</span>} />
                                <FactItem icon="❤️" text={<span>نَبَضَ قلبك حوالي <b>{results.facts.heartbeats.toLocaleString()}</b> نبضة</span>} />
                                <FactItem icon="😂" text={<span>ضَحِكتَ حوالي <b>{results.facts.laughs.toLocaleString()}</b> مرة</span>} />
                                <FactItem icon="😴" text={<span>نِمتَ حوالي <b>{results.facts.sleepTime}</b></span>} />
                                <FactItem icon="🍔" text={<span>أمضيتَ في الأكل <b>{results.facts.eatingTime}</b></span>} />
                            </div>
                        </div>
                         <div className="bg-brand-blue p-6 rounded-lg border border-brand-mid">
                            <h4 className="text-xl font-bold text-white mb-4">معلومات أكثر عن برجك</h4>
                            {(() => {
                                const zodiacInfo = zodiacInfoData[results.zodiacSign.name];
                                if (!zodiacInfo) return null;
                                return (
                                    <div className="space-y-4">
                                        <div className="grid md:grid-cols-2 gap-x-6">
                                            <InfoItem label="العنصر" value={zodiacInfo.element} />
                                            <InfoItem label="الكوكب الحاكم" value={zodiacInfo.ruling} />
                                            <InfoItem label="التوافق مع" value={zodiacInfo.compatibility.join(', ')} />
                                            <InfoItem label="صفات مميزة" value={zodiacInfo.traits.join(', ')} />
                                        </div>
                                        <div>
                                            <span className="font-semibold text-brand-light">الوصف:</span>
                                            <p className="text-white mt-1 text-sm">{zodiacInfo.description}</p>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    </div>}
                </div>
            )}
        </div>
    );
};

export default AgeCalculatorTool;