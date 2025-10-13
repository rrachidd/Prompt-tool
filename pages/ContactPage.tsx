
import React, { useState } from 'react';

const ContactPage: React.FC = () => {
    const [status, setStatus] = useState('');

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setStatus('sending');
        // Simulate form submission
        setTimeout(() => {
            setStatus('sent');
        }, 2000);
    };

    return (
        <div className="container mx-auto px-6 py-16">
            <div className="text-center mb-16">
                <h1 className="text-4xl md:text-5xl font-extrabold text-white">اتصل بنا</h1>
                <p className="mt-4 text-lg text-brand-light">نحن هنا للمساعدة. تواصل معنا لأي استفسار.</p>
            </div>

            <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 bg-brand-blue p-8 rounded-lg shadow-xl border border-brand-mid">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-4">أرسل لنا رسالة</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label htmlFor="name" className="block text-brand-light mb-2">الاسم</label>
                            <input type="text" id="name" required className="w-full bg-brand-dark border border-brand-mid rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-brand-cyan" />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="email" className="block text-brand-light mb-2">البريد الإلكتروني</label>
                            <input type="email" id="email" required className="w-full bg-brand-dark border border-brand-mid rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-brand-cyan" />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="message" className="block text-brand-light mb-2">الرسالة</label>
                            <textarea id="message" rows={5} required className="w-full bg-brand-dark border border-brand-mid rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-brand-cyan"></textarea>
                        </div>
                        <button type="submit" disabled={status === 'sending'} className="w-full bg-brand-cyan text-brand-dark font-bold py-3 px-6 rounded-lg hover:bg-opacity-80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                            {status === 'sending' ? 'جار الإرسال...' : 'إرسال الرسالة'}
                        </button>
                        {status === 'sent' && <p className="text-green-400 mt-4">تم استلام رسالتك بنجاح، سنتواصل معك قريباً.</p>}
                    </form>
                </div>
                <div className="space-y-8">
                    <div>
                        <h3 className="text-xl font-bold text-white">معلومات التواصل</h3>
                        <p className="text-brand-light mt-2">contact@prompttools.com</p>
                        <p className="text-brand-light">+966 12 345 6789</p>
                    </div>
                     <div>
                        <h3 className="text-xl font-bold text-white">مقر الشركة</h3>
                        <p className="text-brand-light mt-2">1234 طريق الإبداع،<br />الرياض، المملكة العربية السعودية</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;
