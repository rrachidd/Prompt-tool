
import React from 'react';
import { Link } from 'react-router-dom';
import { TextToolIcon } from '../components/icons/TextToolIcon';
import { ImageToolIcon } from '../components/icons/ImageToolIcon';
import { VideoToolIcon } from '../components/icons/VideoToolIcon';
import { TOOLS_CONFIG } from '../constants';
import { Tool } from '../types';

const HeroSection: React.FC = () => (
    <div className="bg-brand-blue py-20 sm:py-32">
        <div className="container mx-auto px-6 text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-brand-cyan">
                    شكّل مستوى
                </span>
                <br />
                الإبداع التالي بالذكاء الاصطناعي.
            </h1>
            <p className="mt-6 text-lg md:text-xl text-brand-light max-w-2xl mx-auto">
                منصة PromptTools توفر لك كل ما تحتاجه من أدوات النصوص، الصور، والفيديو لتعزيز إنتاجيتك.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
                <Link
                    to="/tools"
                    className="w-full sm:w-auto bg-brand-cyan text-brand-dark font-bold py-3 px-8 rounded-lg hover:bg-opacity-80 transition-transform transform hover:scale-105"
                >
                    جرب الأدوات الآن
                </Link>
                <Link
                    to="/services"
                    className="w-full sm:w-auto bg-brand-mid text-white font-bold py-3 px-8 rounded-lg hover:bg-brand-light transition-transform transform hover:scale-105"
                >
                    استكشف الخدمات
                </Link>
            </div>
        </div>
    </div>
);

const ServiceCard: React.FC<{ icon: React.ReactNode, title: string, description: string }> = ({ icon, title, description }) => (
    <div className="bg-brand-blue p-8 rounded-xl shadow-lg hover:shadow-brand-cyan/20 border border-brand-mid hover:border-brand-cyan transition-all duration-300 transform hover:-translate-y-2">
        <div className="text-brand-cyan mb-4">{icon}</div>
        <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
        <p className="text-brand-light">{description}</p>
    </div>
);

const ServicesHighlight: React.FC = () => (
    <div className="py-24">
        <div className="container mx-auto px-6">
            <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-white">نظرة سريعة على خدماتنا</h2>
                <p className="text-brand-light mt-4">أدوات قوية مصممة لتبسيط سير عملك الإبداعي.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
                <ServiceCard 
                    icon={<TextToolIcon className="w-12 h-12" />}
                    title="أدوات النصوص"
                    description="توليد، فحص، وإعادة صياغة النصوص لضمان الأصالة والتأثير القوي."
                />
                <ServiceCard 
                    icon={<ImageToolIcon className="w-12 h-12" />}
                    title="أدوات الصور"
                    description="حوّل أفكارك إلى صور مذهلة باستخدام أوامر دقيقة ومبتكرة."
                />
                <ServiceCard 
                    icon={<VideoToolIcon className="w-12 h-12" />}
                    title="أدوات الفيديو"
                    description="أنشئ محتوى فيديو احترافي من الأوامر النصية إلى السكريبتات الكاملة."
                />
            </div>
        </div>
    </div>
);

const ToolCard: React.FC<{ tool: Tool }> = ({ tool }) => (
  <Link to={tool.path} className="flex flex-col text-center bg-brand-blue p-6 rounded-xl shadow-lg hover:shadow-brand-cyan/20 border border-brand-mid hover:border-brand-cyan transition-all duration-300 transform hover:-translate-y-2">
    <div className="flex-shrink-0 flex justify-center mb-4">
      <tool.icon className="w-16 h-16 text-brand-cyan" />
    </div>
    <div className="flex-grow flex flex-col justify-center">
        <h3 className="text-xl font-bold text-white mb-2">{tool.name}</h3>
        <p className="text-brand-light text-sm flex-grow">{tool.description}</p>
    </div>
  </Link>
);


const FeaturedTools: React.FC = () => (
    <div className="py-24 bg-brand-dark">
        <div className="container mx-auto px-6">
            <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-white">اكتشف جميع أدواتنا</h2>
                <p className="text-brand-light mt-4 max-w-2xl mx-auto">أكثر من 20 أداة ذكية لتعزيز إبداعك وإنتاجيتك، كلها في مكان واحد.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {TOOLS_CONFIG.map(tool => (
                    <ToolCard key={tool.id} tool={tool} />
                ))}
            </div>
             <div className="text-center mt-12">
                <Link
                    to="/tools"
                    className="bg-brand-cyan text-brand-dark font-bold py-3 px-8 rounded-lg hover:bg-opacity-80 transition-transform transform hover:scale-105"
                >
                    الذهاب لمركز الأدوات
                </Link>
            </div>
        </div>
    </div>
);

const TestimonialCard: React.FC<{ quote: string; name: string; company: string; image: string; }> = ({ quote, name, company, image }) => (
    <div className="bg-brand-blue p-8 rounded-lg shadow-md border border-brand-mid flex-shrink-0 w-full sm:w-96">
        <p className="text-brand-extralight italic">"{quote}"</p>
        <div className="flex items-center mt-6">
            <img src={image} alt={name} className="w-12 h-12 rounded-full object-cover"/>
            <div className="mr-4">
                <p className="font-bold text-white">{name}</p>
                <p className="text-brand-light text-sm">{company}</p>
            </div>
        </div>
    </div>
);

const Testimonials: React.FC = () => (
    <div className="py-24 bg-brand-blue">
         <div className="container mx-auto px-6">
            <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-white">ماذا يقول عملاؤنا</h2>
            </div>
            <div className="flex overflow-x-auto space-x-8 pb-4">
                <TestimonialCard quote="أدوات PromptTools غيرت طريقة عملنا تمامًا. وفرنا ساعات لا تحصى في إنشاء المحتوى." name="علياء محمد" company="مديرة تسويق, Creative Minds" image="https://picsum.photos/100/100?random=1" />
                <TestimonialCard quote="الدقة والكفاءة في أدوات تحليل النصوص مذهلة. أصبحت جزءًا أساسيًا من أدواتنا اليومية." name="خالد أحمد" company="مطور برمجيات, Tech Solutions" image="https://picsum.photos/100/100?random=2" />
                <TestimonialCard quote="من السهل جدًا تحويل فكرة بسيطة إلى prompt احترافي للصور. النتائج تتحدث عن نفسها." name="سارة حسين" company="مصممة جرافيك, Visionary Arts" image="https://picsum.photos/100/100?random=3" />
            </div>
        </div>
    </div>
);

const NewsletterSignup: React.FC = () => (
    <div className="py-24">
        <div className="container mx-auto px-6 text-center bg-brand-blue p-12 rounded-xl border border-brand-mid shadow-lg">
            <h2 className="text-3xl font-bold text-white">ابق على اطلاع</h2>
            <p className="text-brand-light mt-2 mb-6">اشترك في نشرتنا البريدية للحصول على نصائح وعروض حصرية.</p>
            <form className="max-w-md mx-auto flex flex-col sm:flex-row gap-4">
                <input type="email" placeholder="بريدك الإلكتروني" className="flex-grow bg-brand-dark border border-brand-mid rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-cyan" />
                <button type="submit" className="bg-brand-cyan text-brand-dark font-bold py-3 px-6 rounded-lg hover:bg-opacity-80 transition-colors">
                    اشتراك
                </button>
            </form>
        </div>
    </div>
);


const HomePage: React.FC = () => {
  return (
    <div>
        <HeroSection />
        <ServicesHighlight />
        <FeaturedTools />
        <Testimonials />
        <NewsletterSignup />
    </div>
  );
};

export default HomePage;
