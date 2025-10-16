import React, { useState, useEffect, useRef } from 'react';

const cities = [
    { name: 'لوس أنجلوس', timezone: 'America/Los_Angeles' }, { name: 'نيويورك', timezone: 'America/New_York' },
    { name: 'لندن', timezone: 'Europe/London' }, { name: 'باريس', timezone: 'Europe/Paris' },
    { name: 'موسكو', timezone: 'Europe/Moscow' }, { name: 'القاهرة', timezone: 'Africa/Cairo' },
    { name: 'دبي', timezone: 'Asia/Dubai' }, { name: 'مومباي', timezone: 'Asia/Kolkata' },
    { name: 'بكين', timezone: 'Asia/Shanghai' }, { name: 'طوكيو', timezone: 'Asia/Tokyo' },
    { name: 'سيدني', timezone: 'Australia/Sydney' }, { name: 'الرياض', timezone: 'Asia/Riyadh' },
];

type View = 'time' | 'alarm' | 'stopwatch' | 'world';

const formatTime = (date: Date, options: Intl.DateTimeFormatOptions = {}) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true, ...options });
};

const formatDate = (date: Date, options: Intl.DateTimeFormatOptions = {}) => {
    return date.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', ...options }).toUpperCase();
};


const WorldClockTool: React.FC = () => {
    const [activeView, setActiveView] = useState<View>('world');
    const [currentTime, setCurrentTime] = useState(new Date());

    // Alarm state
    const [alarms, setAlarms] = useState<string[]>([]);
    const [alarmInput, setAlarmInput] = useState('');
    const audioRef = useRef<HTMLAudioElement>(null);
    const [toast, setToast] = useState<string | null>(null);

    // Stopwatch state
    const [stopwatchTime, setStopwatchTime] = useState(0);
    const [isStopwatchRunning, setIsStopwatchRunning] = useState(false);
    const stopwatchIntervalRef = useRef<number | null>(null);

    // Effect for the main clock
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Effect for the toast message
     useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    // Effect to check for alarms
    useEffect(() => {
        const now = currentTime;
        // Format to HH:MM for comparison with the input type="time"
        const currentFormattedTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        
        // Check only on the first second of the minute to avoid repeated triggers
        if (now.getSeconds() === 0 && alarms.includes(currentFormattedTime)) {
            audioRef.current?.play().catch(e => console.error("Error playing alarm sound:", e));
            setToast(`⏰ تنبيه! حان موعد المنبه ${currentFormattedTime}`);
            
            // Remove the triggered alarm from the list
            setAlarms(prevAlarms => prevAlarms.filter(a => a !== currentFormattedTime));
        }
    }, [currentTime, alarms]);


    useEffect(() => {
        if (isStopwatchRunning) {
            const startTime = Date.now() - stopwatchTime;
            stopwatchIntervalRef.current = window.setInterval(() => {
                setStopwatchTime(Date.now() - startTime);
            }, 10);
        } else {
            if (stopwatchIntervalRef.current) clearInterval(stopwatchIntervalRef.current);
        }
        return () => {
            if (stopwatchIntervalRef.current) clearInterval(stopwatchIntervalRef.current);
        };
    }, [isStopwatchRunning]);

    const handleAddAlarm = () => {
        if (alarmInput && !alarms.includes(alarmInput)) {
            setAlarms([...alarms, alarmInput].sort());
            setAlarmInput('');
        }
    };

    const handleDeleteAlarm = (alarmToDelete: string) => {
        setAlarms(alarms.filter(a => a !== alarmToDelete));
    };
    
    const formatStopwatchTime = (time: number) => {
        const totalSeconds = Math.floor(time / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const milliseconds = Math.floor((time % 1000) / 10);
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}:${String(milliseconds).padStart(2, '0')}`;
    };

    const SidebarItem: React.FC<{ view: View, label: string, icon: React.ReactNode }> = ({ view, label, icon }) => (
        <li
            onClick={() => setActiveView(view)}
            className={`flex items-center gap-3 p-3 rounded-md cursor-pointer transition-colors ${activeView === view ? 'bg-brand-cyan text-brand-dark' : 'text-brand-light hover:bg-brand-mid'}`}
        >
            {icon}
            <span>{label}</span>
        </li>
    );

    return (
        <div className="h-full flex flex-col">
            <audio ref={audioRef} src="https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg" preload="auto" />
            <h2 className="text-3xl font-bold text-white mb-2">ساعات العالم</h2>
            <p className="text-brand-light mb-6">اعرض الوقت الحالي في مدن مختلفة حول العالم، بالإضافة إلى منبه وساعة إيقاف.</p>

            <div className="flex flex-col md:flex-row flex-grow gap-8">
                {/* Sidebar */}
                <aside className="w-full md:w-64 bg-brand-blue p-4 rounded-lg border border-brand-mid">
                    <ul className="space-y-2">
                        <SidebarItem view="world" label="ساعات العالم" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.74 7.343 5.37 8 5.235V8.027a2.001 2.001 0 00-3.668 0zM11 5.235a6.012 6.012 0 012.759 2.792C13.255 7.42 13 7.845 13 8.284V5.235zM14.668 9.027a2.001 2.001 0 00-3.668 0V12a2 2 0 104 0v-1.543a6.012 6.012 0 01-1.241-1.43zM8 12a2 2 0 104 0v-1.543a6.012 6.012 0 01-1.241 1.43C10.255 12.58 10 12.155 10 11.716V12zM5.332 9.027a2.001 2.001 0 00-3.668 0V12a2 2 0 104 0v-1.543a6.012 6.012 0 01-1.241-1.43zM11 14.765a6.012 6.012 0 01-2.759-2.792C8.745 12.58 9 12.155 9 11.716V14.765z" clipRule="evenodd" /></svg>} />
                        <SidebarItem view="time" label="الوقت الحالي" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>} />
                        <SidebarItem view="alarm" label="المنبه" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" /></svg>} />
                        <SidebarItem view="stopwatch" label="ساعة الإيقاف" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12zm-1-8a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" /><path d="M10 4a1 1 0 011 1v3a1 1 0 11-2 0V5a1 1 0 011-1z" /></svg>} />
                    </ul>
                </aside>

                {/* Content */}
                <main className="flex-grow bg-brand-dark p-6 rounded-lg border border-brand-mid">
                    {activeView === 'world' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {cities.map(city => (
                                <div key={city.timezone} className="bg-brand-blue p-4 rounded-lg text-center">
                                    <h3 className="text-lg font-bold text-white">{city.name}</h3>
                                    <p className="text-2xl font-mono text-brand-cyan my-2">{formatTime(currentTime, { timeZone: city.timezone })}</p>
                                    <p className="text-sm text-brand-light">{formatDate(currentTime, { timeZone: city.timezone })}</p>
                                </div>
                            ))}
                        </div>
                    )}
                    {activeView === 'time' && (
                        <div className="flex flex-col items-center justify-center h-full">
                             <div className="text-center bg-brand-blue p-8 rounded-xl shadow-lg">
                                <p className="text-5xl md:text-7xl font-mono text-brand-cyan">{formatTime(currentTime)}</p>
                                <p className="text-xl md:text-2xl text-brand-light mt-4">{formatDate(currentTime)}</p>
                             </div>
                        </div>
                    )}
                    {activeView === 'alarm' && (
                        <div className="flex flex-col items-center h-full">
                            <h3 className="text-2xl font-bold text-white mb-4">المنبه</h3>
                            <div className="flex gap-2 mb-4">
                                <input type="time" value={alarmInput} onChange={e => setAlarmInput(e.target.value)} className="bg-brand-dark border border-brand-mid rounded-lg px-3 py-2 text-white" />
                                <button onClick={handleAddAlarm} className="bg-brand-cyan text-brand-dark font-bold px-4 py-2 rounded-lg">ضبط المنبه</button>
                            </div>
                            <ul className="w-full max-w-sm space-y-2">
                                {alarms.map(alarm => (
                                    <li key={alarm} className="flex justify-between items-center bg-brand-blue p-3 rounded-lg">
                                        <span className="text-lg font-mono text-white">{alarm}</span>
                                        <button onClick={() => handleDeleteAlarm(alarm)} className="text-red-400 hover:text-red-600">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                        </button>
                                    </li>
                                ))}
                                {alarms.length === 0 && (
                                    <p className="text-brand-light text-center mt-4">لا توجد منبهات مضبوطة.</p>
                                )}
                            </ul>
                        </div>
                    )}
                     {activeView === 'stopwatch' && (
                        <div className="flex flex-col items-center justify-center h-full">
                           <div className="text-center bg-brand-blue p-8 rounded-xl shadow-lg">
                                <p className="text-6xl font-mono text-brand-cyan mb-6">{formatStopwatchTime(stopwatchTime)}</p>
                                <div className="flex gap-4">
                                    <button onClick={() => setIsStopwatchRunning(true)} disabled={isStopwatchRunning} className="bg-green-600 text-white font-bold py-2 px-6 rounded-lg disabled:opacity-50">بدء</button>
                                    <button onClick={() => setIsStopwatchRunning(false)} disabled={!isStopwatchRunning} className="bg-yellow-600 text-white font-bold py-2 px-6 rounded-lg disabled:opacity-50">إيقاف</button>
                                    <button onClick={() => { setIsStopwatchRunning(false); setStopwatchTime(0); }} className="bg-red-600 text-white font-bold py-2 px-6 rounded-lg">إعادة تعيين</button>
                                </div>
                           </div>
                        </div>
                    )}
                </main>
            </div>
             {toast && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-brand-cyan text-brand-dark font-bold py-2 px-6 rounded-lg shadow-lg z-50">
                    {toast}
                </div>
            )}
        </div>
    );
};

export default WorldClockTool;
