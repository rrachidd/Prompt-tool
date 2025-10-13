import React from 'react';
import { HashRouter, Routes, Route, Outlet } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ServicesPage from './pages/ServicesPage';
import ToolHubPage from './pages/ToolHubPage';
import ContactPage from './pages/ContactPage';
import PrivacyPage from './pages/PrivacyPage';
import BlogPage from './pages/BlogPage';
import PromptGeneratorTool from './tools/PromptGeneratorTool';
import ImageToPromptTool from './tools/ImageToPromptTool';
import VideoScriptTool from './tools/VideoScriptTool';
import YoutubeTitleGeneratorTool from './tools/YoutubeTitleGeneratorTool';
import YoutubeDescriptionGeneratorTool from './tools/YoutubeDescriptionGeneratorTool';
import YoutubeNicheSearchTool from './tools/YoutubeNicheSearchTool';
import PromptCheckerTool from './tools/PromptCheckerTool';
import AiDetectorTool from './tools/AiDetectorTool';
import HumanRephraseTool from './tools/HumanRephraseTool';
import ImageFusionTool from './tools/ImageFusionTool';
import OcrTool from './tools/OcrTool';
import BarcodeReaderTool from './tools/BarcodeReaderTool';
import BarcodeGeneratorTool from './tools/BarcodeGeneratorTool';
import ColoringPageGeneratorTool from './tools/ColoringPageGeneratorTool';
import RemoveBgTool from './tools/RemoveBgTool';
import PrintOnDemandTool from './tools/PrintOnDemandTool';
import PhotoRestoreTool from './tools/PhotoRestoreTool';
import MergePhotosTool from './tools/MergePhotosTool';
import WheelOfFortuneTool from './tools/WheelOfFortuneTool';
import WorldClockTool from './tools/WorldClockTool';
import VideoGeneratorTool from './tools/VideoGeneratorTool';


const AppLayout: React.FC = () => (
  <div className="bg-brand-dark text-brand-extralight min-h-screen flex flex-col font-cairo">
    <Header />
    <main className="flex-grow">
      <Outlet />
    </main>
    <Footer />
  </div>
);

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<HomePage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="blog" element={<BlogPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="privacy" element={<PrivacyPage />} />
          <Route path="tools" element={<ToolHubPage />}>
            <Route index element={<PromptGeneratorTool />} />
            <Route path="prompt-generator" element={<PromptGeneratorTool />} />
            <Route path="image-to-prompt" element={<ImageToPromptTool />} />
            <Route path="video-script" element={<VideoScriptTool />} />
            <Route path="youtube-title-generator" element={<YoutubeTitleGeneratorTool />} />
            <Route path="youtube-description-generator" element={<YoutubeDescriptionGeneratorTool />} />
            <Route path="youtube-niche-search" element={<YoutubeNicheSearchTool />} />
            <Route path="video-generator" element={<VideoGeneratorTool />} />
            <Route path="prompt-checker" element={<PromptCheckerTool />} />
            <Route path="ai-detector" element={<AiDetectorTool />} />
            <Route path="human-rephrase" element={<HumanRephraseTool />} />
            <Route path="image-fusion" element={<ImageFusionTool />} />
            <Route path="remove-background" element={<RemoveBgTool />} />
            <Route path="photo-restore" element={<PhotoRestoreTool />} />
            <Route path="ocr" element={<OcrTool />} />
            <Route path="barcode-reader" element={<BarcodeReaderTool />} />
            <Route path="barcode-generator" element={<BarcodeGeneratorTool />} />
            <Route path="coloring-page-generator" element={<ColoringPageGeneratorTool />} />
            <Route path="pod-generator" element={<PrintOnDemandTool />} />
            <Route path="merge-photos" element={<MergePhotosTool />} />
            <Route path="wheel-of-fortune" element={<WheelOfFortuneTool />} />
            <Route path="world-clock" element={<WorldClockTool />} />
          </Route>
        </Route>
      </Routes>
    </HashRouter>
  );
};

export default App;