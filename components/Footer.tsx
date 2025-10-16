import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from './icons/Logo';

const SocialIcon: React.FC<{ href: string; children: React.ReactNode }> = ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-[#FDE7FC] hover:text-brand-cyan transition-colors duration-300">
        {children}
    </a>
);

const FooterLink: React.FC<{ to: string; children: React.ReactNode }> = ({ to, children }) => (
    <Link to={to} className="text-[#FDE7FC] hover:text-brand-cyan transition-colors duration-200">
        {children}
    </Link>
);


const Footer: React.FC = () => {
    return (
        <footer className="bg-brand-blue border-t border-brand-mid mt-16">
            <div className="container mx-auto px-6 py-12 text-center">
                {/* Row 1: Brand Info */}
                <div className="mb-8">
                    <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse">
                        <Logo className="h-10 w-10 text-brand-cyan" />
                        <h2 className="text-2xl font-bold text-white">PromptTools</h2>
                    </div>
                    <p className="mt-4 text-[#FDE7FC] max-w-md mx-auto">
                        تمكين المبدعين والمطورين بأدوات ذكاء اصطناعي متقدمة لتحويل الأفكار إلى واقع ملموس.
                    </p>
                </div>

                {/* Row 2: Navigation Links */}
                <nav className="mb-8 flex flex-wrap justify-center gap-x-6 gap-y-3">
                    <FooterLink to="/">الرئيسية</FooterLink>
                    <FooterLink to="/about">من نحن</FooterLink>
                    <FooterLink to="/services">الخدمات</FooterLink>
                    <FooterLink to="/blog">المدونة</FooterLink>
                    <FooterLink to="/contact">اتصل بنا</FooterLink>
                    <FooterLink to="/tools">مركز الأدوات</FooterLink>
                    <FooterLink to="/privacy">سياسة الخصوصية</FooterLink>
                </nav>

                {/* Row 3: Social & Copyright */}
                <div>
                    <div className="flex justify-center space-x-4 rtl:space-x-reverse mb-8">
                        <SocialIcon href="#">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg>
                        </SocialIcon>
                        <SocialIcon href="#">
                           <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.71v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>
                        </SocialIcon>
                         <SocialIcon href="#">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm-1 15v-5h-2v-2h2v-1.5c0-2.21 1.002-3.5 3.5-3.5 1.003 0 1.5.08 1.5.08v2h-1c-1.103 0-1.25.522-1.25 1.25V12h2.25l-.25 2h-2v5h-2z" /></svg>
                        </SocialIcon>
                    </div>
                    <div className="border-t border-brand-mid pt-6 text-[#FDE7FC]">
                        <p>&copy; {new Date().getFullYear()} PromptTools. جميع الحقوق محفوظة.</p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;