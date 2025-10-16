import React, { useState, useRef, useEffect, useCallback } from 'react';

const WheelOfFortuneTool: React.FC = () => {
    const [names, setNames] = useState<string[]>(['Eric', 'Fatima', 'Diyaa', 'Ali', 'Beatriz', 'Charles', 'Gabriel', 'Hana']);
    const [nameInput, setNameInput] = useState('');
    const [multiNameInput, setMultiNameInput] = useState('');
    const [isSpinning, setIsSpinning] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [winner, setWinner] = useState<string | null>(null);
    const [showWinnerModal, setShowWinnerModal] = useState(false);
    const [showClearModal, setShowClearModal] = useState(false);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'];

    const drawWheel = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const { width, height } = canvas;
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(centerX, centerY) - 10;
        
        ctx.clearRect(0, 0, width, height);
        
        if (names.length === 0) {
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
            ctx.fillStyle = '#415A77';
            ctx.fill();
            ctx.fillStyle = '#E0E1DD';
            ctx.font = 'bold 20px Cairo';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('أضف أسماء للبدء', centerX, centerY);
            return;
        }

        const anglePerName = (2 * Math.PI) / names.length;
        ctx.font = `bold ${names.length > 20 ? '12px' : '16px'} Cairo`;
        
        names.forEach((name, i) => {
            const startAngle = i * anglePerName;
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, startAngle, startAngle + anglePerName);
            ctx.closePath();
            ctx.fillStyle = colors[i % colors.length];
            ctx.fill();

            // Draw text
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(startAngle + anglePerName / 2);
            ctx.textAlign = 'right';
            ctx.fillStyle = '#FFFFFF';
            ctx.shadowColor = 'rgba(0,0,0,0.5)';
            ctx.shadowBlur = 3;
            ctx.fillText(name.length > 15 ? name.substring(0, 12) + '...' : name, radius - 15, 0);
            ctx.restore();
        });
    }, [names, colors]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const container = canvas.parentElement;
            if (container) {
                const size = Math.min(container.clientWidth, container.clientHeight, 500);
                canvas.width = size;
                canvas.height = size;
            }
        }
        drawWheel();
    }, [drawWheel]);
    
    const handleAddName = () => {
        if (nameInput.trim() && !names.includes(nameInput.trim())) {
            setNames([...names, nameInput.trim()]);
            setNameInput('');
        }
    };

    const handleAddMultipleNames = () => {
        const newNames = multiNameInput
            .split(/[,،\n]+/)
            .map(name => name.trim())
            .filter(name => name && !names.includes(name));
        if (newNames.length > 0) {
            setNames([...names, ...newNames]);
            setMultiNameInput('');
        }
    };

    const handleDeleteName = (index: number) => {
        setNames(names.filter((_, i) => i !== index));
    };

    const handleSpin = () => {
        if (isSpinning || names.length === 0) return;
        setIsSpinning(true);
        setWinner(null);
        
        const newRotation = rotation + 360 * 5 + Math.random() * 360;
        setRotation(newRotation);

        setTimeout(() => {
            const totalAngle = newRotation % 360;
            const degreesPerSegment = 360 / names.length;
            const winningIndex = Math.floor((360 - totalAngle + (degreesPerSegment / 2)) % 360 / degreesPerSegment);
            
            const winnerName = names[winningIndex];
            setWinner(winnerName);
            setShowWinnerModal(true);
            setIsSpinning(false);
        }, 5000); // Corresponds to transition duration
    };

    const handleClearAll = () => {
        setNames([]);
        setShowClearModal(false);
    };

    return (
        <div className="h-full flex flex-col">
            <h2 className="text-3xl font-bold text-white mb-2">عجلة الحظ</h2>
            <p className="text-brand-light mb-6">عجلة أسماء تفاعلية لاختيار فائز عشوائي من قائمة.</p>

            <div className="flex flex-col lg:flex-row gap-8 flex-grow">
                {/* Wheel Section */}
                <div className="w-full lg:w-1/2 flex items-center justify-center relative">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[30px] border-t-brand-cyan z-10"></div>
                    <canvas 
                        ref={canvasRef}
                        style={{
                            transform: `rotate(${rotation}deg)`,
                            transition: isSpinning ? 'transform 5s cubic-bezier(0.25, 1, 0.5, 1)' : 'none',
                        }}
                    />
                </div>

                {/* Controls Section */}
                <div className="w-full lg:w-1/2 flex flex-col gap-4 bg-brand-blue p-6 rounded-lg border border-brand-mid">
                    <div className="space-y-2">
                        <label className="font-semibold text-white">إضافة اسم واحد</label>
                        <div className="flex gap-2">
                            <input type="text" value={nameInput} onChange={e => setNameInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddName()} placeholder="أدخل اسمًا" className="flex-grow bg-brand-dark border border-brand-mid rounded-lg px-4 py-2 text-white" />
                            <button onClick={handleAddName} className="bg-brand-cyan text-brand-dark font-bold py-2 px-4 rounded-lg">إضافة</button>
                        </div>
                    </div>
                     <div className="space-y-2">
                        <label className="font-semibold text-white">إضافة أسماء متعددة</label>
                        <textarea value={multiNameInput} onChange={e => setMultiNameInput(e.target.value)} placeholder="ألصق الأسماء هنا (كل اسم في سطر)" className="w-full bg-brand-dark border border-brand-mid rounded-lg px-4 py-2 text-white h-24 resize-y"></textarea>
                        <button onClick={handleAddMultipleNames} className="w-full bg-brand-mid text-white font-bold py-2 px-4 rounded-lg">إضافة الأسماء</button>
                    </div>

                    <div className="flex-grow flex flex-col min-h-0">
                        <h3 className="font-semibold text-white mb-2">قائمة الأسماء ({names.length})</h3>
                        <div className="flex-grow bg-brand-dark rounded-lg p-2 overflow-y-auto">
                            {names.map((name, index) => (
                                <div key={index} className="flex justify-between items-center p-2 rounded hover:bg-brand-mid">
                                    <span className="text-white">{name}</span>
                                    <button onClick={() => handleDeleteName(index)} className="text-red-400 hover:text-red-600">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-brand-mid">
                        <button onClick={handleSpin} disabled={isSpinning || names.length < 2} className="col-span-2 bg-brand-cyan text-brand-dark font-bold py-3 rounded-lg disabled:opacity-50">
                            {isSpinning ? '...جاري الدوران' : '🎲 دور العجلة'}
                        </button>
                        <button onClick={() => setShowClearModal(true)} className="bg-red-600 text-white font-bold py-2 rounded-lg">مسح الكل</button>
                    </div>
                </div>
            </div>

            {/* Winner Modal */}
            {showWinnerModal && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-brand-blue p-8 rounded-lg text-center border border-brand-cyan shadow-lg">
                        <h2 className="text-2xl font-bold text-white mb-4">🎉 مبروك! 🎉</h2>
                        <p className="text-lg text-brand-light mb-6">الفائز هو:</p>
                        <p className="text-3xl font-bold text-brand-cyan mb-8">{winner}</p>
                        <button onClick={() => setShowWinnerModal(false)} className="bg-brand-cyan text-brand-dark font-bold py-2 px-6 rounded-lg">إغلاق</button>
                    </div>
                </div>
            )}

            {/* Clear Confirmation Modal */}
            {showClearModal && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-brand-blue p-8 rounded-lg text-center border border-brand-mid shadow-lg">
                        <h2 className="text-xl font-bold text-white mb-4">هل أنت متأكد؟</h2>
                        <p className="text-brand-light mb-8">سيتم مسح جميع الأسماء من القائمة.</p>
                        <div className="flex gap-4 justify-center">
                            <button onClick={() => setShowClearModal(false)} className="bg-brand-mid text-white font-bold py-2 px-6 rounded-lg">إلغاء</button>
                            <button onClick={handleClearAll} className="bg-red-600 text-white font-bold py-2 px-6 rounded-lg">تأكيد المسح</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WheelOfFortuneTool;
