import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { TOOLS_CONFIG } from '../constants';
import { ToolCategory } from '../types';

const Sidebar: React.FC = () => {
    const categories = [ToolCategory.TEXT, ToolCategory.IMAGE, ToolCategory.VIDEO, ToolCategory.MISC];

    return (
        <aside className="w-full md:w-72 bg-brand-blue border-l border-brand-mid p-6 flex-shrink-0">
            <h2 className="text-2xl font-bold text-white mb-6">الأدوات</h2>
            <nav className="space-y-6">
                {categories.map(category => (
                    <div key={category}>
                        <h3 className="text-brand-cyan font-semibold mb-3">{category}</h3>
                        <ul className="space-y-2">
                            {TOOLS_CONFIG.filter(tool => tool.category === category).map(tool => (
                                <li key={tool.id}>
                                    <NavLink 
                                        to={tool.path}
                                        className={({ isActive }) => `flex items-center space-x-3 p-2 rounded-md transition-colors duration-200 ${isActive ? 'bg-brand-cyan text-brand-dark' : 'text-brand-light hover:bg-brand-mid hover:text-white'}`}
                                    >
                                        <tool.icon className="w-5 h-5" />
                                        <span>{tool.name}</span>
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </nav>
        </aside>
    );
}

const ToolHubPage: React.FC = () => {
    return (
        <div className="container mx-auto px-6 py-8">
             <div className="text-center md:text-right mb-8">
                <h1 className="text-4xl md:text-5xl font-extrabold text-white">مركز الأدوات</h1>
                <p className="mt-2 text-lg text-brand-light">
                    كل ما تحتاجه من أدوات الذكاء الاصطناعي في مكان واحد.
                </p>
            </div>
            <div className="flex flex-col md:flex-row bg-brand-dark rounded-xl shadow-2xl overflow-hidden border border-brand-mid">
                <div className="flex-grow p-4 sm:p-8">
                    <Outlet />
                </div>
                <Sidebar />
            </div>
        </div>
    );
};

export default ToolHubPage;