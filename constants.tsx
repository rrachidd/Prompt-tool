import { Tool, ToolCategory } from './types';
import { TextToolIcon } from './components/icons/TextToolIcon';
import { ImageToolIcon } from './components/icons/ImageToolIcon';
import { VideoToolIcon } from './components/icons/VideoToolIcon';
import { YoutubeIcon } from './components/icons/YoutubeIcon';
import { BarcodeScanIcon } from './components/icons/BarcodeScanIcon';
import { MagicWandIcon } from './components/icons/MagicWandIcon';
import { PromptCheckIcon } from './components/icons/PromptCheckIcon';
import { AiDetectorIcon } from './components/icons/AiDetectorIcon';
import { RephraseIcon } from './components/icons/RephraseIcon';
import { OcrIcon } from './components/icons/OcrIcon';
import { PaintBrushIcon } from './components/icons/PaintBrushIcon';
import { TshirtIcon } from './components/icons/TshirtIcon';
import { RestoreIcon } from './components/icons/RestoreIcon';
import { MergeIcon } from './components/icons/MergeIcon';
import { MiscToolIcon } from './components/icons/MiscToolIcon';
import { GlobeIcon } from './components/icons/GlobeIcon';
import { VideoGeneratorIcon } from './components/icons/VideoGeneratorIcon';

export const NAV_LINKS = [
  { name: 'الرئيسية', path: '/' },
  { name: 'من نحن', path: '/about' },
  { name: 'الخدمات', path: '/services' },
  { name: 'المدونة', path: '/blog' },
  { name: 'اتصل بنا', path: '/contact' },
];

export const TOOLS_CONFIG: Tool[] = [
  {
    id: 'prompt-generator',
    name: 'توليد أوامر النصوص',
    description: 'احصل على أوامر ذكية ومحسّنة لتحقيق أفضل النتائج من نماذج اللغة.',
    path: '/tools/prompt-generator',
    category: ToolCategory.TEXT,
    icon: TextToolIcon,
  },
  {
    id: 'prompt-checker',
    name: 'فحص الأوامر',
    description: 'قيّم جودة الأمر الخاص بك قبل استخدامه واحصل على اقتراحا للتحسين.',
    path: '/tools/prompt-checker',
    category: ToolCategory.TEXT,
    icon: PromptCheckIcon,
  },
  {
    id: 'ai-detector',
    name: 'كاشف نصوص الذكاء الاصطناعي',
    description: 'اكتشف المحتوى الذي تم إنشاؤه بواسطة الذكاء الاصطناعي بدقة فائقة.',
    path: '/tools/ai-detector',
    category: ToolCategory.TEXT,
    icon: AiDetectorIcon,
  },
  {
    id: 'human-rephrase',
    name: 'إعادة صياغة بشرية',
    description: 'حوّل النصوص الآلية إلى نصوص طبيعية وإنسانية تعكس أسلوبك الخاص.',
    path: '/tools/human-rephrase',
    category: ToolCategory.TEXT,
    icon: RephraseIcon,
  },
  {
    id: 'image-to-prompt',
    name: 'محول الصور إلى أوامر',
    description: 'ارفع صورة واحصل على وصف نصي (Prompt) يمكن استخدامه لإعادة إنشاء صور مشابهة.',
    path: '/tools/image-to-prompt',
    category: ToolCategory.IMAGE,
    icon: ImageToolIcon,
  },
  {
    id: 'image-fusion',
    name: 'دمج صورتين في أمر',
    description: 'ادمج مفاهيم صورتين مختلفتين في أمر واحد لإنتاج صور فريدة.',
    path: '/tools/image-fusion',
    category: ToolCategory.IMAGE,
    icon: ImageToolIcon,
  },
    {
    id: 'merge-photos',
    name: 'دمج صورتين في واحدة',
    description: 'ادمج شخصًا من صورة في صورة جماعية أخرى بشكل طبيعي واحترافي.',
    path: '/tools/merge-photos',
    category: ToolCategory.IMAGE,
    icon: MergeIcon,
  },
  {
    id: 'remove-background',
    name: 'إزالة خلفية الصور',
    description: 'قم بإزالة خلفية أي صورة بنقرة واحدة.',
    path: '/tools/remove-background',
    category: ToolCategory.IMAGE,
    icon: MagicWandIcon,
  },
  {
    id: 'photo-restore',
    name: 'ترميم وتلوين الصور',
    description: 'أصلح الصور القديمة والتالفة وأضف إليها الألوان.',
    path: '/tools/photo-restore',
    category: ToolCategory.IMAGE,
    icon: RestoreIcon,
  },
  {
    id: 'ocr',
    name: 'تحويل الصورة إلى نص (OCR)',
    description: 'استخرج النصوص من الصور بدقة وكفاءة عاليتين.',
    path: '/tools/ocr',
    category: ToolCategory.IMAGE,
    icon: OcrIcon,
  },
  {
    id: 'barcode-reader',
    name: 'قارئ البار كود',
    description: 'امسح صورة باركود أو QR Code واستخرج البيانات المضمنة فيه.',
    path: '/tools/barcode-reader',
    category: ToolCategory.IMAGE,
    icon: BarcodeScanIcon,
  },
  {
    id: 'barcode-generator',
    name: 'مولد البار كود',
    description: 'أدخل نصًا أو رابطًا لإنشاء صورة QR Code خاصة بك قابلة للتحميل.',
    path: '/tools/barcode-generator',
    category: ToolCategory.IMAGE,
    icon: BarcodeScanIcon,
  },
  {
    id: 'coloring-page-generator',
    name: 'انتاج صور للتلوين',
    description: 'إنتاج صور تلوين عالية الجودة باستخدام أحدث تقنيات الذكاء الاصطناعي.',
    path: '/tools/coloring-page-generator',
    category: ToolCategory.IMAGE,
    icon: PaintBrushIcon,
  },
  {
    id: 'pod-generator',
    name: 'مولد صور للطباعة',
    description: 'أنشئ صور عالية الجودة للتيشيرتات والطباعة باستخدام الذكاء الاصطناعي.',
    path: '/tools/pod-generator',
    category: ToolCategory.IMAGE,
    icon: TshirtIcon,
  },
  {
    id: 'video-script',
    name: 'إنتاج سكريبتات ليوتيوب',
    description: 'احصل على أفكار لعناوين جذابة وسيناريوهات كاملة لفيديوهاتك.',
    path: '/tools/video-script',
    category: ToolCategory.VIDEO,
    icon: VideoToolIcon,
  },
  {
    id: 'youtube-title-generator',
    name: 'توليد عناوين فيديو يوتيوب',
    description: 'احصل على 10 عناوين جذابة ومحسّنة لفيديوهاتك بناءً على أفضل الممارسات.',
    path: '/tools/youtube-title-generator',
    category: ToolCategory.VIDEO,
    icon: YoutubeIcon,
  },
  {
    id: 'youtube-description-generator',
    name: 'توليد وصف لفيديو يوتيوب',
    description: 'أنشئ وصفًا كاملاً ومُحسَّنًا لمحركات البحث (SEO) لفيديو يوتيوب الخاص بك.',
    path: '/tools/youtube-description-generator',
    category: ToolCategory.VIDEO,
    icon: YoutubeIcon,
  },
  {
    id: 'youtube-niche-search',
    name: 'بحث فيديوهات يوتيوب الرائجة',
    description: 'اكتشف الفيديوهات الأكثر مشاهدة في مجالك أو تخصصك.',
    path: '/tools/youtube-niche-search',
    category: ToolCategory.VIDEO,
    icon: YoutubeIcon,
  },
  {
    id: 'video-generator',
    name: 'توليد فيديوهات قصيرة',
    description: 'أنشئ فيديوهات سينمائية قصيرة من خلال وصف تفصيلي.',
    path: '/tools/video-generator',
    category: ToolCategory.VIDEO,
    icon: VideoGeneratorIcon,
  },
  {
    id: 'wheel-of-fortune',
    name: 'عجلة الحظ',
    description: 'عجلة أسماء تفاعلية لاختيار فائز عشوائي من قائمة.',
    path: '/tools/wheel-of-fortune',
    category: ToolCategory.MISC,
    icon: MiscToolIcon,
  },
  {
    id: 'world-clock',
    name: 'ساعات العالم',
    description: 'اعرض الوقت الحالي في مدن مختلفة حول العالم.',
    path: '/tools/world-clock',
    category: ToolCategory.MISC,
    icon: GlobeIcon,
  },
];