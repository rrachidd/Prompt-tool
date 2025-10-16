import React, { useState, useRef } from 'react';

const ResultSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-brand-dark p-4 rounded-lg mt-4">
        <h5 className="text-xl font-bold text-brand-cyan border-b border-brand-mid pb-2 mb-4">{title}</h5>
        <div className="space-y-2 text-brand-extralight">
            {children}
        </div>
    </div>
);

const PlanCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-brand-blue p-4 rounded-lg border border-brand-mid transition-transform transform hover:-translate-y-1">
        <div className="font-bold text-white mb-1">{title}</div>
        <p className="text-brand-light">{children}</p>
    </div>
);


const CalorieCalculatorTool: React.FC = () => {
    // State for inputs
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('male');
    const [activityLevel, setActivityLevel] = useState('1.2');
    const [error, setError] = useState('');

    // State for results
    const [results, setResults] = useState<any | null>(null);
    const resultsRef = useRef<HTMLDivElement>(null);

    const activityLevels = [
        { value: '1.2', text: 'كثير الجلوس (قليل أو لا يوجد تمارين)' },
        { value: '1.375', text: 'نشاط خفيف (تمارين 1-3 أيام في الأسبوع)' },
        { value: '1.55', text: 'نشاط متوسط (تمارين 3-5 أيام في الأسبوع)' },
        { value: '1.725', text: 'نشاط عالي (تمارين 6-7 أيام في الأسبوع)' },
        { value: '1.9', text: 'نشاط شاق جداً (تمارين شاقة أو عمل بدني)' },
    ];

    const calculateResults = () => {
        setError('');
        const weightNum = parseFloat(weight);
        const heightNum = parseFloat(height);
        const ageNum = parseInt(age);
        const activityLevelNum = parseFloat(activityLevel);
        const activityLevelText = activityLevels.find(l => l.value === activityLevel)?.text || '';
        
        if (isNaN(weightNum) || isNaN(heightNum) || isNaN(ageNum) || weightNum <= 0 || heightNum <= 0 || ageNum <= 0) {
            setError('يرجى ملء جميع الحقول بقيم صحيحة وموجبة.');
            return;
        }

        let bmr;
        if (gender === 'male') {
            bmr = 10 * weightNum + 6.25 * (heightNum * 100) - 5 * ageNum + 5;
        } else {
            bmr = 10 * weightNum + 6.25 * (heightNum * 100) - 5 * ageNum - 161;
        }
        const maintenanceCalories = bmr * activityLevelNum;

        const bmi = weightNum / (heightNum * heightNum);
        let bmiCategory = '';
        if (bmi < 18.5) bmiCategory = 'نقص في الوزن';
        else if (bmi >= 18.5 && bmi < 25) bmiCategory = 'وزن طبيعي';
        else if (bmi >= 25 && bmi < 30) bmiCategory = 'زيادة في الوزن';
        else if (bmi >= 30 && bmi < 35) bmiCategory = 'سمنة من الدرجة الأولى';
        else if (bmi >= 35 && bmi < 40) bmiCategory = 'سمنة من الدرجة الثانية';
        else bmiCategory = 'سمنة مفرطة جداً';

        const minNormalWeight = 18.5 * (heightNum * heightNum);
        const maxNormalWeight = 24.9 * (heightNum * heightNum);

        setResults({
            weight, height, age, gender,
            bmr: bmr.toFixed(0),
            maintenanceCalories: maintenanceCalories.toFixed(0),
            activityLevelText,
            bmi: bmi.toFixed(2),
            bmiCategory,
            minNormalWeight: minNormalWeight.toFixed(1),
            maxNormalWeight: maxNormalWeight.toFixed(1),
            isOverweight: weightNum > maxNormalWeight,
            isUnderweight: weightNum < minNormalWeight,
            weightToLose: (weightNum - maxNormalWeight).toFixed(1),
            weightToGain: (minNormalWeight - weightNum).toFixed(1),
            plan1Calories: (maintenanceCalories - ((0.25 * 7700) / 7)).toFixed(0),
            plan2Calories: (maintenanceCalories - ((0.5 * 7700) / 7)).toFixed(0),
            plan3Calories: (maintenanceCalories - ((1 * 7700) / 7)).toFixed(0),
        });

        setTimeout(() => {
            resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        calculateResults();
    };
    
    const inputClasses = "w-full bg-brand-dark border border-brand-mid rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-cyan";
    const ResultValue: React.FC<{children: React.ReactNode}> = ({ children }) => <span className="font-bold text-brand-cyan">{children}</span>;

    return (
        <div className="h-full flex flex-col">
            <h2 className="text-3xl font-bold text-white mb-2">حاسبة السعرات الحرارية ومؤشر الجسم</h2>
            <p className="text-brand-light mb-6">احسب احتياجك اليومي من السعرات الحرارية ومؤشر كتلة الجسم (BMI) للحفاظ على صحتك.</p>
            
            <div className="bg-brand-blue border border-brand-mid rounded-lg p-6">
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label htmlFor="weight" className="block text-brand-light mb-2">الوزن (بالكيلوجرام)</label>
                            <input type="number" id="weight" value={weight} onChange={e => setWeight(e.target.value)} placeholder="مثال: 76" required step="0.1" className={inputClasses} />
                        </div>
                        <div>
                            <label htmlFor="height" className="block text-brand-light mb-2">الطول (بالمتر)</label>
                            <input type="number" id="height" value={height} onChange={e => setHeight(e.target.value)} placeholder="مثال: 1.70" required step="0.01" className={inputClasses} />
                        </div>
                        <div>
                            <label htmlFor="age" className="block text-brand-light mb-2">العمر (بالسنوات)</label>
                            <input type="number" id="age" value={age} onChange={e => setAge(e.target.value)} placeholder="مثال: 50" required className={inputClasses} />
                        </div>
                        <div>
                            <label className="block text-brand-light mb-2">الجنس</label>
                            <div className="flex gap-4 items-center bg-brand-dark border border-brand-mid rounded-lg px-4 py-3">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="gender" value="male" checked={gender === 'male'} onChange={() => setGender('male')} className="form-radio text-brand-cyan bg-brand-dark focus:ring-brand-cyan" />
                                    <span className="text-white">ذكر</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="gender" value="female" checked={gender === 'female'} onChange={() => setGender('female')} className="form-radio text-brand-cyan bg-brand-dark focus:ring-brand-cyan" />
                                    <span className="text-white">أنثى</span>
                                </label>
                            </div>
                        </div>
                    </div>
                     <div className="mb-4">
                        <label htmlFor="activityLevel" className="block text-brand-light mb-2">مستوى النشاط البدني</label>
                        <select id="activityLevel" value={activityLevel} onChange={e => setActivityLevel(e.target.value)} required className={inputClasses}>
                            {activityLevels.map(level => (
                                <option key={level.value} value={level.value}>{level.text}</option>
                            ))}
                        </select>
                    </div>
                    {error && <p className="text-red-400 text-center mb-4">{error}</p>}
                    <button type="submit" className="w-full bg-brand-cyan text-brand-dark font-bold py-3 px-6 rounded-lg hover:bg-opacity-80 transition-colors">احسب الآن</button>
                </form>
            </div>

            {results && (
                <div ref={resultsRef} className="mt-6 bg-brand-blue border border-brand-mid rounded-lg p-6 animate-fade-in">
                    <h4 className="text-2xl font-bold text-white text-center mb-4">نتائج التحليل</h4>
                    
                     <ResultSection title="المدخلات">
                        <p>
                            <strong>الوزن:</strong> {results.weight} كغم &nbsp;&nbsp;&nbsp; 
                            <strong>الطول:</strong> {results.height} م &nbsp;&nbsp;&nbsp; 
                            <strong>العمر:</strong> {results.age} سنة &nbsp;&nbsp;&nbsp; 
                            <strong>الجنس:</strong> {results.gender === 'male' ? 'ذكر' : 'أنثى'}
                        </p>
                    </ResultSection>

                    <ResultSection title="فحص السعرات الحرارية">
                        <p>معدل الأيض الأساسي لجسمك (BMR) في حالة الراحة التامة <ResultValue>{results.bmr}</ResultValue> سعر حراري.</p>
                        <p>أنت تحتاج لتناول أغذية تحتوي على <ResultValue>{results.maintenanceCalories}</ResultValue> سعر حراري يومياً للحفاظ على وزنك كما هو في مستوى النشاط: {results.activityLevelText}.</p>
                    </ResultSection>

                    <ResultSection title="فحص مؤشر كتلة الجسم (BMI)">
                        <p>يظهر لدينا أن مؤشر كتلة الجسم لديك يساوي <ResultValue>{results.bmi}</ResultValue> وهو يشير إلى حالة <ResultValue>{results.bmiCategory}</ResultValue>.</p>
                        <p>وبناءً على ذلك فإن مدى وزنك الطبيعي المناسب لطولك يجب أن لا يقل عن <ResultValue>{results.minNormalWeight}</ResultValue> كغم وأن لا يزيد عن <ResultValue>{results.maxNormalWeight}</ResultValue> كغم.</p>
                        {results.isOverweight && <p>للوصول إلى مدى الوزن الطبيعي يجب عليك انقاص وزنك حوالي <ResultValue>{results.weightToLose}</ResultValue> كغم.</p>}
                        {results.isUnderweight && <p>للوصول إلى مدى الوزن الطبيعي يجب عليك زيادة وزنك حوالي <ResultValue>{results.weightToGain}</ResultValue> كغم.</p>}
                        {!results.isOverweight && !results.isUnderweight && <p>أنت ضمن المدى الطبيعي للوزن. حافظ على عاداتك الصحية!</p>}
                    </ResultSection>

                    {results.isOverweight && (
                        <ResultSection title="خطط انقاص الوزن المناسبة لجسمك">
                            <div className="space-y-3">
                                <PlanCard title="الخطة الأولى:">
                                    يمكنك انقاص وزنك حوالي <strong>0.25</strong> كغم أسبوعياً عن طريق تناول <ResultValue>{results.plan1Calories}</ResultValue> سعر حراري.
                                </PlanCard>
                                <PlanCard title="الخطة الثانية:">
                                    يمكنك انقاص وزنك حوالي <strong>0.5</strong> كغم أسبوعياً عن طريق تناول <ResultValue>{results.plan2Calories}</ResultValue> سعر حراري.
                                </PlanCard>
                                <PlanCard title="الخطة الثالثة:">
                                    يمكنك انقاص وزنك حوالي <strong>1</strong> كغم أسبوعياً عن طريق تناول <ResultValue>{results.plan3Calories}</ResultValue> سعر حراري.
                                </PlanCard>
                            </div>
                        </ResultSection>
                    )}
                    
                </div>
            )}
        </div>
    );
};

export default CalorieCalculatorTool;
