
import React, { useState } from 'react';
import { generateShortVideo, VideoPromptOptions } from '../services/geminiService';

const moodOptions = ["غامضة ومليئة بالترقب", "هادئة ومفعمة بالسلام", "درامية ومتوترة", "سعيدة ومبهجة", "ملحمية ومهيبة", "حزينة وتأملية"];
const lightingOptions = ["أضواء القمر الباردة مع توهج أخضر خافت", "إضاءة غروب الشمس الدافئة والذهبية", "إضاءة نيون مستقبلية ومشرقة", "إضاءة كلاسيكية من نافذة", "إضاءة خافتة وغموضة (Chiaroscuro)"];
const openingShotOptions = ["لقطة بصرية علوية (aerial view) تتحرك ببطء", "لقطة مقربة جدًا (macro shot) على تفصيل", "لقطة بانورامية واسعة (wide shot)", "لقطة تتحرك ببطء نحو الداخل (slow dolly-in)"];
const cameraMotionOptions = ["تحريك أفقي بطيء (slow pan)", "دوران حول العنصر (orbit)", "حركة رأسية صاعدة (vertical rise)", "حركة غير مستقرة (handheld shake) للتوتر", "حركة سلسة على قضيب (crane shot)"];
const secondaryElementOptions = ["جسيمات غبار تطفو في الهواء", "قطرات مطر تتساقط", "أوراق شجر متساقطة", "ثلج يتساقط", "دخان يتصاعد ببطء"];
const dofOptions = ["تركيز ضحل (shallow focus) لعزل العنصر الرئيسي", "تركيز عميق (deep focus) لإظهار كل التفاصيل", "تركيز على العدسة المكبرة (macro cinematic lens)", "انتقال سلس للتركيز (rack focus)"];
const dynamicElementOptions = ["فقاعات هواء", "تموجات على سطح الماء", "لهب نار يتراقص", "شعر يطير في الهواء", "ستائر تتحرك بفعل الريح"];
const warmLightOptions = ["ذهبية من الأعلى اليسار", "دافئة من الأسفل (uplighting)", "من الخلف (backlight) لخلق هالة", "من الجانب الأيمن"];
const coolLightOptions = ["زرقاء من الجانب الأيمن", "من الأعلى مباشرة (top light)", "باردة من النافذة الجانبية", "من الأسفل لخلق ظلال غريبة"];
const colorSchemeOptions = ["درجات الزمردي والأزرق العميق", "أحمر Ruby والأزرق الداكن مع ألوان محايدة", "ألوان ترابية دافئة (بني، بيج)", "أبيض وأسود مع لمسة لون واحدة", "ألوان الباستل الناعمة"];
const musicOptions = ["موسيقى أوركسترالية جوية", "موسيقى إلكترونية حديثة", "نغمات طبيعية تحت الماء", "موسيقى بيانو حزينة", "موسيقى تصويرية ملحمية"];
const sfxOptions = ["حفيف أوراق الشجر وصوت ريح خفيف", "صوت أمواج البحر الهادئة", "أصداء خطوات في ممر فارغ", "طنين إلكتروني خفيف", "صوت مطر على زجاج النافذة"];
const endingOptions = ["تلاشي بطيء على عين العنصر", "انعكاس ضوء", "تأثير الإزهار (bloom effect)", "لقطة مقربة على شعار", "لقطة نهائية للسماء"];


const initialOptions: VideoPromptOptions = {
    mainScene: '', mainSubject: '', mood: moodOptions[0],
    lighting: lightingOptions[0], openingShot: openingShotOptions[0],
    cameraMotions: cameraMotionOptions[0], secondaryElements: secondaryElementOptions[0],
    dof: dofOptions[0], dynamicElements: dynamicElementOptions[0],
    warmLight: warmLightOptions[0], coolLight: coolLightOptions[0],
    colorScheme: colorSchemeOptions[0], music: musicOptions[0],
    sfx: sfxOptions[0], ending: endingOptions[0],
};

const FormSelect: React.FC<{ label: string; name: keyof VideoPromptOptions; value: string; options: string[]; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; }> = ({ label, name, value, options, onChange }) => (
    <div className="form-group">
        <label htmlFor={name} className="block mb-2 font-semibold text-brand-light">{label}:</label>
        <select id={name} name={name} value={value} onChange={onChange} required className="w-full bg-brand-dark border border-brand-mid rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-cyan">
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
    </div>
);

const VideoGeneratorTool: React.FC = () => {
    const [options, setOptions] = useState<VideoPromptOptions>(initialOptions);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [error, setError] = useState('');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setOptions(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        if (!options.mainScene.trim() || !options.mainSubject.trim()) {
            setError('الرجاء ملء وصف المشهد والعنصر الرئيسي.');
            return;
        }

        setIsLoading(true);
        setError('');
        setVideoUrl(null);
        
        try {
            const resultUrl = await generateShortVideo(options, setLoadingMessage);
            setVideoUrl(resultUrl);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(errorMessage);
            console.error(err);
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    };

    return (
        <div className="h-full flex flex-col">
            <h2 className="text-3xl font-bold text-white mb-2">مولد الفيديو السينمائي</h2>
            <p className="text-brand-light mb-6">املأ النموذج لإنشاء فيديو سينمائي مخصص باستخدام الذكاء الاصطناعي.</p>
            
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Form */}
                <form onSubmit={handleSubmit} className="lg:w-1/2 space-y-4">
                    <div>
                        <label htmlFor="main-scene" className="block mb-2 font-semibold text-brand-light">وصف المشهد الرئيسي:</label>
                        <textarea id="main-scene" name="mainScene" value={options.mainScene} onChange={handleInputChange} placeholder="مثال: غابة مطيرة في الليل، مغطاة بالضباب" required className="w-full bg-brand-dark border border-brand-mid rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-cyan min-h-[80px] resize-y" />
                    </div>
                    <div>
                        <label htmlFor="main-subject" className="block mb-2 font-semibold text-brand-light">العنصر الرئيسي:</label>
                        <input type="text" id="main-subject" name="mainSubject" value={options.mainSubject} onChange={handleInputChange} placeholder="مثال: نمر أبيض نادر" required className="w-full bg-brand-dark border border-brand-mid rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-cyan" />
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-brand-mid">
                        <FormSelect label="الأجواء/المشاعر" name="mood" value={options.mood} options={moodOptions} onChange={handleInputChange} />
                        <FormSelect label="نمط الإضاءة" name="lighting" value={options.lighting} options={lightingOptions} onChange={handleInputChange} />
                        <FormSelect label="اللقطة الافتتاحية" name="openingShot" value={options.openingShot} options={openingShotOptions} onChange={handleInputChange} />
                        <FormSelect label="حركة الكاميرا" name="cameraMotions" value={options.cameraMotions} options={cameraMotionOptions} onChange={handleInputChange} />
                        <FormSelect label="عناصر ثانوية" name="secondaryElements" value={options.secondaryElements} options={secondaryElementOptions} onChange={handleInputChange} />
                        <FormSelect label="عمق الميدان" name="dof" value={options.dof} options={dofOptions} onChange={handleInputChange} />
                        <FormSelect label="عناصر ديناميكية" name="dynamicElements" value={options.dynamicElements} options={dynamicElementOptions} onChange={handleInputChange} />
                        <FormSelect label="اتجاه الإضاءة الدافئة" name="warmLight" value={options.warmLight} options={warmLightOptions} onChange={handleInputChange} />
                        <FormSelect label="اتجاه الإضاءة الباردة" name="coolLight" value={options.coolLight} options={coolLightOptions} onChange={handleInputChange} />
                        <FormSelect label="اللوحة اللونية" name="colorScheme" value={options.colorScheme} options={colorSchemeOptions} onChange={handleInputChange} />
                        <FormSelect label="نمط الموسيقى" name="music" value={options.music} options={musicOptions} onChange={handleInputChange} />
                        <FormSelect label="تأثيرات صوتية" name="sfx" value={options.sfx} options={sfxOptions} onChange={handleInputChange} />
                        <FormSelect label="العنصر الختامي" name="ending" value={options.ending} options={endingOptions} onChange={handleInputChange} />
                    </div>

                    <button type="submit" disabled={isLoading} className="w-full bg-brand-cyan text-brand-dark font-bold py-3 px-6 rounded-lg hover:bg-opacity-80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4">
                        {isLoading ? '...جاري الإنشاء' : 'إنشاء الفيديو'}
                    </button>
                </form>

                {/* Result */}
                <div className="lg:w-1/2 flex flex-col items-center justify-center bg-brand-dark border border-brand-mid rounded-lg p-4 min-h-[400px]">
                    {isLoading && (
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-cyan mx-auto"></div>
                            <p className="mt-4 text-brand-light font-semibold">{loadingMessage}</p>
                            <p className="mt-2 text-brand-mid text-sm">قد تستغرق هذه العملية عدة دقائق...</p>
                        </div>
                    )}
                    {error && <p className="text-red-400 text-center">{error}</p>}
                    {!isLoading && videoUrl && (
                        <div className="w-full">
                            <h3 className="text-xl font-bold text-white mb-3 text-center">تم إنشاء الفيديو بنجاح!</h3>
                            <video src={videoUrl} controls autoPlay className="w-full rounded-lg" />
                            <a href={videoUrl} download={`generated-video-${Date.now()}.mp4`} className="block w-full text-center mt-4 bg-brand-mid text-white font-bold py-3 px-6 rounded-lg hover:bg-brand-light transition-colors">
                                تحميل الفيديو
                            </a>
                        </div>
                    )}
                    {!isLoading && !videoUrl && !error && (
                        <p className="text-brand-light m-auto">ستظهر نتيجة الفيديو هنا.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VideoGeneratorTool;
