import React, { useState, useRef } from 'react';
import { mergePhotos } from '../services/geminiService';

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = error => reject(error);
    });
};

interface ImageUploaderProps {
    id: string;
    title: string;
    description: string;
    onFileChange: (file: File) => void;
    onDescriptionChange: (text: string) => void;
    descriptionValue: string;
    imagePreview: string | null;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ id, title, description, onFileChange, onDescriptionChange, descriptionValue, imagePreview }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleFileSelect = (file: File | null) => {
        if (!file) return;
        if (!file.type.startsWith('image/')) return;
        onFileChange(file);
    };

    const onDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragging(true); };
    const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragging(false); };
    const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    };

    return (
        <div className="flex flex-col gap-3">
            <h3 className="text-xl font-bold text-white">{title}</h3>
            <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
                className={`w-full h-48 flex items-center justify-center bg-brand-dark border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isDragging ? 'border-brand-cyan bg-brand-mid/20' : 'border-brand-mid hover:border-brand-light'}`}
            >
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileSelect(e.target.files?.[0] || null)} />
                {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="max-h-full max-w-full object-contain rounded-md" />
                ) : (
                    <div className="text-center text-brand-light">
                        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                        <p className="mt-2 text-sm">اسحب الصورة أو انقر للاختيار</p>
                    </div>
                )}
            </div>
             <textarea
                value={descriptionValue}
                onChange={(e) => onDescriptionChange(e.target.value)}
                placeholder={description}
                rows={2}
                className="w-full bg-brand-dark border border-brand-mid rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-brand-cyan resize-none"
             />
        </div>
    );
};

const MergePhotosTool: React.FC = () => {
    const [groupFile, setGroupFile] = useState<File | null>(null);
    const [groupPreview, setGroupPreview] = useState<string | null>(null);
    const [groupDesc, setGroupDesc] = useState('');
    
    const [personFile, setPersonFile] = useState<File | null>(null);
    const [personPreview, setPersonPreview] = useState<string | null>(null);
    const [personDesc, setPersonDesc] = useState('');

    const [mergedImage, setMergedImage] = useState<{ base64: string; mimeType: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleMerge = async () => {
        if (!groupFile || !personFile || !groupDesc.trim() || !personDesc.trim()) {
            setError('الرجاء رفع الصورتين وإضافة وصف لكل منهما.');
            return;
        }
        setIsLoading(true);
        setError('');
        setMergedImage(null);

        try {
            const [groupBase64, personBase64] = await Promise.all([
                fileToBase64(groupFile),
                fileToBase64(personFile),
            ]);
            
            const groupImage = { mimeType: groupFile.type, imageBase64: groupBase64 };
            const personImage = { mimeType: personFile.type, imageBase64: personBase64 };

            const result = await mergePhotos(groupImage, personImage, groupDesc, personDesc);
            setMergedImage(result);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(errorMessage);
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleDownload = () => {
        if (!mergedImage) return;
        const link = document.createElement('a');
        link.href = `data:${mergedImage.mimeType};base64,${mergedImage.base64}`;
        link.download = `merged-photo.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="h-full flex flex-col">
            <h2 className="text-3xl font-bold text-white mb-2">دمج صورتين في واحدة</h2>
            <p className="text-brand-light mb-6">ادمج شخصًا من صورة في صورة جماعية أخرى بشكل طبيعي واحترافي.</p>

            <div className="flex-grow grid md:grid-cols-2 gap-8">
                {/* Inputs Column */}
                <div className="flex flex-col gap-6">
                    <ImageUploader 
                        id="group-uploader"
                        title="1. الصورة الأساسية (الجماعية)"
                        description="مثال: صورة لعائلتي في الحديقة"
                        imagePreview={groupPreview}
                        onFileChange={(file) => { setGroupFile(file); setGroupPreview(URL.createObjectURL(file)); }}
                        descriptionValue={groupDesc}
                        onDescriptionChange={setGroupDesc}
                    />
                     <ImageUploader 
                        id="person-uploader"
                        title="2. صورة الشخص المُراد إضافته"
                        description="مثال: أخي أحمد يبتسم للكاميرا"
                        imagePreview={personPreview}
                        onFileChange={(file) => { setPersonFile(file); setPersonPreview(URL.createObjectURL(file)); }}
                        descriptionValue={personDesc}
                        onDescriptionChange={setPersonDesc}
                    />
                    <button 
                        onClick={handleMerge}
                        disabled={isLoading || !groupFile || !personFile || !groupDesc || !personDesc}
                        className="w-full bg-brand-cyan text-brand-dark font-bold py-3 px-8 rounded-lg hover:bg-opacity-80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-auto"
                    >
                         {isLoading ? '...جاري الدمج' : '✨ دمج الصورتين'}
                    </button>
                    {error && <p className="text-red-400 text-center">{error}</p>}
                </div>

                {/* Output Column */}
                <div className="flex flex-col">
                     <h3 className="text-xl font-bold text-white mb-3">النتيجة</h3>
                     <div className="flex-grow bg-brand-dark border border-brand-mid rounded-lg p-2 relative min-h-[400px] flex flex-col items-center justify-center">
                        {isLoading && (
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-cyan mx-auto"></div>
                                <p className="mt-4 text-brand-light">جاري الدمج... قد يستغرق الأمر دقيقة.</p>
                            </div>
                        )}
                        {!isLoading && mergedImage && (
                            <>
                                <img src={`data:${mergedImage.mimeType};base64,${mergedImage.base64}`} alt="Merged" className="max-w-full max-h-full object-contain rounded" />
                                <div className="absolute top-3 left-3 flex gap-2">
                                    <button onClick={handleDownload} className="bg-brand-mid text-white p-2 rounded-md hover:bg-brand-light" title="تحميل الصورة">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                    </button>
                                </div>
                            </>
                        )}
                        {!isLoading && !mergedImage && (
                             <p className="text-brand-light text-center">ستظهر الصورة المدمجة هنا.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MergePhotosTool;
