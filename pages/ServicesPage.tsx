import React from 'react';
import { TextToolIcon } from '../components/icons/TextToolIcon';
import { ImageToolIcon } from '../components/icons/ImageToolIcon';
import { VideoToolIcon } from '../components/icons/VideoToolIcon';
import { Link } from 'react-router-dom';
import { TOOLS_CONFIG } from '../constants';
import { ToolCategory } from '../types';

interface ServiceItemProps {
    title: string;
    description: string;
}

const ServiceItem: React.FC<ServiceItemProps> = ({ title, description }) => (
    <div className="bg-brand-blue p-6 rounded-lg border border-brand-mid">
        <h4 className="font-bold text-white text-lg">{title}</h4>
        <p className="text-brand-light mt-2">{description}</p>
    </div>
);

interface ServiceCategoryProps {
    icon: React.ReactNode;
    title: string;
    children: React.ReactNode;
}

const ServiceCategory: React.FC<ServiceCategoryProps> = ({ icon, title, children }) => (
    <div className="mb-16">
        <div className="flex items-center mb-8">
            <div className="text-brand-cyan">{icon}</div>
            <h2 className="text-3xl font-bold text-white mr-4">{title}</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
            {children}
        </div>
    </div>
);

const ServicesPage: React.FC = () => {
    const toolsByCategory = {
        [ToolCategory.TEXT]: TOOLS_CONFIG.filter(tool => tool.category === ToolCategory.TEXT),
        [ToolCategory.IMAGE]: TOOLS_CONFIG.filter(tool => tool.category === ToolCategory.IMAGE),
        [ToolCategory.VIDEO]: TOOLS_CONFIG.filter(tool => tool.category === ToolCategory.VIDEO),
    };

    return (
        <div className="container mx-auto px-6 py-16">
            <div className="text-center mb-16">
                <h1 className="text-4xl md:text-5xl font-extrabold text-white">خدماتنا</h1>
                <p className="mt-4 text-lg text-brand-light max-w-2xl mx-auto">
                    نقدم مجموعة شاملة من الأدوات المدعومة بالذكاء الاصطناعي لتحسين كل جانب من جوانب عملك الإبداعي.
                </p>
            </div>

            <ServiceCategory icon={<TextToolIcon className="w-12 h-12" />} title={ToolCategory.TEXT}>
                {toolsByCategory[ToolCategory.TEXT].map(tool => (
                    <ServiceItem key={tool.id} title={tool.name} description={tool.description} />
                ))}
            </ServiceCategory>
            
            <ServiceCategory icon={<ImageToolIcon className="w-12 h-12" />} title={ToolCategory.IMAGE}>
                {toolsByCategory[ToolCategory.IMAGE].map(tool => (
                     <ServiceItem key={tool.id} title={tool.name} description={tool.description} />
                ))}
            </ServiceCategory>

            <ServiceCategory icon={<VideoToolIcon className="w-12 h-12" />} title={ToolCategory.VIDEO}>
                 {toolsByCategory[ToolCategory.VIDEO].map(tool => (
                     <ServiceItem key={tool.id} title={tool.name} description={tool.description} />
                ))}
            </ServiceCategory>

            <div className="text-center mt-20">
                <Link to="/tools" className="bg-brand-cyan text-brand-dark font-bold py-4 px-12 text-lg rounded-lg hover:bg-opacity-80 transition-transform transform hover:scale-105">
                    اذهب إلى مركز الأدوات
                </Link>
            </div>
        </div>
    );
};

export default ServicesPage;
