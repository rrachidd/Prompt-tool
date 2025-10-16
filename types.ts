import React from 'react';

export enum ToolCategory {
  TEXT = 'أدوات النصوص',
  IMAGE = 'أدوات الصور',
  VIDEO = 'أدوات الفيديو',
  PDF = 'أدوات pdf',
  MISC = 'أدوات مختلفة',
}

export interface Tool {
  id: string;
  name: string;
  description: string;
  path: string;
  category: ToolCategory;
  icon: React.ComponentType<{ className?: string }>;
}