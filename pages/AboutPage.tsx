
import React from 'react';

const AboutPage: React.FC = () => {
    return (
        <div className="container mx-auto px-6 py-16">
            <div className="text-center">
                <h1 className="text-4xl md:text-5xl font-extrabold text-white">عن PromptTools</h1>
                <p className="mt-4 text-lg text-brand-light">نحن نربط بين الإمكانيات التقنية والتطبيقات العملية</p>
            </div>

            <div className="mt-16 max-w-4xl mx-auto text-center">
                <h2 className="text-3xl font-bold text-brand-cyan">قصتنا</h2>
                <p className="mt-4 text-brand-extralight leading-relaxed">
                    تأسست PromptTools على يد مجموعة من المطورين والمبدعين الذين أدركوا الفجوة بين الإمكانيات الهائلة للذكاء الاصطناعي وصعوبة استخدامه بفعالية من قبل غير المتخصصين. لقد رأينا التحدي الذي يواجهه الكثيرون في صياغة الأوامر المثالية للحصول على النتائج المرجوة. من هنا، انطلقنا في مهمة لإنشاء منصة تجعل من تكنولوجيا الذكاء الاصطناعي أداة بسيطة وبديهية في يد الجميع.
                </p>
            </div>

            <div className="mt-20 grid md:grid-cols-2 gap-12 items-center">
                <div>
                    <h3 className="text-3xl font-bold text-brand-cyan mb-4">مهمتنا</h3>
                    <p className="text-brand-extralight text-lg">
                        "تمكين المبدعين والمطورين والشركات بأدوات ذكاء اصطناعي متقدمة وسهلة الاستخدام، لتحويل الأفكار إلى واقع ملموس وتسريع وتيرة الابتكار."
                    </p>
                </div>
                <div>
                    <h3 className="text-3xl font-bold text-brand-cyan mb-4">رؤيتنا</h3>
                    <p className="text-brand-extralight text-lg">
                        "أن نكون الشريك الموثوق عالمياً في رحلة الإبداع المدعوم بالذكاء الاصطناعي، وجسراً يربط بين الإمكانيات التقنية والتطبيقات العملية."
                    </p>
                </div>
            </div>

            <div className="mt-20">
                <h2 className="text-3xl font-bold text-center text-white mb-12">فريق القيادة</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div className="text-center">
                        <img className="w-40 h-40 mx-auto rounded-full object-cover border-4 border-brand-mid" src="https://picsum.photos/200/200?random=4" alt="Founder 1" />
                        <h4 className="mt-4 text-xl font-bold text-white">أحمد عبدالله</h4>
                        <p className="text-brand-cyan">المؤسس والرئيس التنفيذي</p>
                    </div>
                     <div className="text-center">
                        <img className="w-40 h-40 mx-auto rounded-full object-cover border-4 border-brand-mid" src="https://picsum.photos/200/200?random=5" alt="Founder 2" />
                        <h4 className="mt-4 text-xl font-bold text-white">فاطمة علي</h4>
                        <p className="text-brand-cyan">المديرة التقنية</p>
                    </div>
                     <div className="text-center">
                        <img className="w-40 h-40 mx-auto rounded-full object-cover border-4 border-brand-mid" src="https://picsum.photos/200/200?random=6" alt="Founder 3" />
                        <h4 className="mt-4 text-xl font-bold text-white">يوسف خالد</h4>
                        <p className="text-brand-cyan">رئيس قسم المنتجات</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutPage;
