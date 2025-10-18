
import { GoogleGenAI, GenerateContentResponse, Modality, Type } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY environment variable not set. Gemini API calls will fail.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

const handleApiError = (error: unknown, context: string): string => {
  console.error(`Error in ${context}:`, error);
  if (error instanceof Error) {
    return `An error occurred while ${context}: ${error.message}`;
  }
  return `An unknown error occurred while ${context}.`;
};

export interface AiNewsArticle {
  title: string;
  summary: string;
  sourceName: string;
  url: string;
  sourceTitle: string;
}

export const getAiNews = async (): Promise<AiNewsArticle[]> => {
  if (!API_KEY) {
    // Return dummy data if API key is not set
    return Promise.resolve([
      { title: 'الذكاء الاصطناعي يغير قواعد اللعبة في الطب', summary: 'اكتشف كيف تساهم الخوارزميات الجديدة في تشخيص الأمراض بشكل أسرع وأكثر دقة.', sourceName: 'Tech News', url: '#', sourceTitle: 'Tech News Today' },
      { title: 'إطلاق نموذج لغوي جديد يتفوق على المنافسين', summary: 'أعلنت شركة AI Corp عن نموذجها الثوري الذي يفهم السياق بشكل غير مسبوق.', sourceName: 'AI Weekly', url: '#', sourceTitle: 'AI Weekly Insights' },
      { title: 'مخاوف أخلاقية جديدة تحيط بالذكاء الاصطناعي التوليدي', summary: 'خبراء يدعون إلى تنظيمات أشد صرامة لضمان استخدام مسؤول للتكنولوجيا.', sourceName: 'Future Tech', url: '#', sourceTitle: 'Future of Technology' },
      { title: 'الفن والموسيقى المولدة بالذكاء الاصطناعي: إبداع أم تقليد؟', summary: 'نقاش حاد في الأوساط الفنية حول دور الذكاء الاصطناعي في الإبداع.', sourceName: 'Creative World', url: '#', sourceTitle: 'Creative World Magazine' },
      { title: 'كيف سيؤثر الذكاء الاصطناعي على سوق العمل بحلول 2030', summary: 'تقرير جديد يتوقع تحولات جذرية في الوظائف المطلوبة ويدعو إلى إعادة تأهيل المهارات.', sourceName: 'Economics Today', url: '#', sourceTitle: 'Economics Today Report' },
      { title: 'استخدامات مدهشة للذكاء الاصطناعي في استكشاف الفضاء', summary: 'من تحليل بيانات التلسكوبات إلى التحكم في المركبات الفضائية، الذكاء الاصطناعي يفتح آفاقًا جديدة.', sourceName: 'Space Journal', url: '#', sourceTitle: 'The Space Journal' },
    ]);
  }
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `You are an AI news aggregator. Find the top 6 latest and most important news articles in Arabic about Artificial Intelligence from the past week. 
      For each article, provide a concise title, a brief summary (2-3 sentences), and the primary source name.
      Format the output as a JSON array of objects, where each object has "title", "summary", and "sourceName" keys.
      Respond with ONLY the JSON array, without any markdown formatting or extra text.`,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.2,
      },
    });

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const urls = groundingChunks?.map(chunk => ({ uri: chunk.web?.uri || '#', title: chunk.web?.title || '' })) || [];
    
    // Clean the response: remove markdown fences and trim whitespace.
    const jsonText = response.text.trim().replace(/^```json\s*/, '').replace(/```$/, '');
    const articlesFromAI = JSON.parse(jsonText);

    if (!Array.isArray(articlesFromAI)) {
      throw new Error("AI response is not a JSON array.");
    }
    
    // Merge AI-generated content with grounded URLs
    const mergedArticles: AiNewsArticle[] = articlesFromAI.slice(0, 6).map((article, index) => ({
      title: article.title || 'لا يوجد عنوان',
      summary: article.summary || 'لا يوجد ملخص',
      sourceName: article.sourceName || (urls[index]?.title ? new URL(urls[index].uri).hostname : 'مصدر غير معروف'),
      url: urls[index]?.uri || '#', // Associate by index, a best-effort approach
      sourceTitle: urls[index]?.title || article.sourceName || 'مصدر غير معروف',
    }));

    return mergedArticles;

  } catch (error) {
    console.error("Error fetching AI news:", error);
    const errorMessage = handleApiError(error, "fetching AI news");
    throw new Error(errorMessage);
  }
};


export const generatePrompt = async (topic: string): Promise<string> => {
  if (!API_KEY) {
    return Promise.resolve(`API Key not configured. For now, here is a dummy prompt for "${topic}".
    
    **Example Prompt:**
    Generate a detailed and vivid description of a futuristic cityscape at sunset. Include details about the architecture, transportation, and the overall atmosphere. The tone should be awe-inspiring and slightly melancholic.`);
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are a creative assistant specialized in generating high-quality prompts for AI models.
      Based on the following topic, create a detailed and effective prompt that can be used to generate text or images.
      The prompt should be clear, specific, and provide enough context for an AI to produce a great result.

      Topic: "${topic}"
      
      Generated Prompt:`,
       config: {
        temperature: 0.7,
        topP: 0.95,
      }
    });
    return response.text;
  } catch (error) {
    return handleApiError(error, "generating the prompt");
  }
};

export const generatePromptFromImage = async (mimeType: string, imageBase64: string): Promise<string> => {
   if (!API_KEY) {
    return Promise.resolve(`API Key not configured. This is a dummy description for the uploaded image.`);
  }
  try {
    const imagePart = {
      inlineData: {
        mimeType,
        data: imageBase64,
      },
    };
    const textPart = {
      text: "Describe this image in detail. What objects are present, what is the style (e.g., photorealistic, cartoon, watercolor), what are the dominant colors, what is the lighting like, and what is the overall composition? This description will be used as a prompt for an image generation AI."
    };
    
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, textPart] },
    });
    
    return response.text;
  } catch (error) {
    return handleApiError(error, "generating prompt from image");
  }
};

export const generateVideoScript = async (topic: string): Promise<string> => {
  if (!API_KEY) {
    return Promise.resolve(`API Key not configured. Here is a dummy script for a video about "${topic}".

**Title:** The Ultimate Guide to ${topic}

**Script:**
**(Intro Music)**
**Host:** Hello and welcome back to our channel! Today, we're diving deep into the world of ${topic}.
...
**(Outro Music)**
`);
  }
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are an expert YouTube scriptwriter. Your task is to generate a catchy title and a complete video script based on the provided topic.
      The script should be engaging and well-structured, including:
      1.  An introduction to hook the viewer.
      2.  Main content broken down into clear sections.
      3.  A conclusion that summarizes the key points and includes a call to action (e.g., "like, share, and subscribe").
      
      Format the output clearly with a "Title:" section and a "Script:" section.
      
      Topic: "${topic}"
      `,
      config: {
        temperature: 0.8,
        topP: 0.95,
      }
    });
    return response.text;
  } catch (error) {
    return handleApiError(error, "generating video script");
  }
};

export const generateYoutubeTitles = async (topic: string): Promise<string[]> => {
    if (!API_KEY) {
        return Array.from({ length: 10 }, (_, i) => `العنوان المقترح رقم ${i + 1} للموضوع: "${topic}" (مفتاح API غير متوفر)`);
    }
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `You are an expert YouTube title creator. Your task is to generate 10 compelling and clickable video titles in Arabic based on the provided topic.

            Each title must follow these critical rules:
            1.  **Clarity First:** The title must clearly state what the video is about.
            2.  **Arouse Curiosity:** Use questions or promise a result to make people want to click, but do not be misleading (no clickbait).
            3.  **Use Keywords:** Include keywords that people would search for in Arabic.
            4.  **Ideal Length:** Keep titles between 50 and 65 characters.
            5.  **Unique Value:** Highlight what makes the video special (e.g., "أسهل طريقة", "السر الذي لم يخبرك به أحد").
            6.  **Use Numbers/Dates:** Incorporate numbers, lists, or a relevant year (e.g., 2025) to grab attention.
            7.  **Thumbnail Harmony:** Create titles that would work well with a visual thumbnail (e.g., a title poses a question, the thumbnail shows the result).

            Topic: "${topic}"
            `,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        titles: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.STRING,
                                description: 'A compelling YouTube video title in Arabic.'
                            },
                            description: 'An array of 10 generated YouTube titles.'
                        }
                    },
                    required: ["titles"],
                }
            }
        });

        // Clean the response: remove markdown fences and trim whitespace.
        const jsonText = response.text.trim().replace(/^```json\s*/, '').replace(/```$/, '');
        const result = JSON.parse(jsonText);

        if (result && Array.isArray(result.titles)) {
            // Ensure all items in the array are strings before returning.
            // This prevents rendering [object Object] in React if the API returns an array of objects.
            return result.titles.filter((item: unknown) => typeof item === 'string');
        }

        throw new Error("The API returned an unexpected format for YouTube titles.");

    } catch (error) {
        const errorMessage = handleApiError(error, "generating YouTube titles");
        throw new Error(errorMessage);
    }
};

export const generateYoutubeDescription = async (videoTitle: string): Promise<string> => {
  if (!API_KEY) {
    return Promise.resolve(`API Key not configured. Here is a dummy description for a video titled "${videoTitle}".`);
  }
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are a YouTube SEO and content expert. Your task is to write a comprehensive and engaging video description in Arabic based on the provided video title. The description must be structured perfectly to attract viewers and satisfy the YouTube algorithm.

      Follow these rules strictly:
      1.  **First Two Lines:** Start with 1-2 compelling sentences that summarize the video's core value and include the most important keywords from the title. This is what appears in search results.
      2.  **SEO Keywords:** Naturally integrate keywords related to the title throughout the description, especially in the first paragraph. Do not stuff keywords unnaturally.
      3.  **Value Summary:** After the initial hook, write a short paragraph (2-3 sentences) explaining what the viewer will learn or gain from watching the video.
      4.  **Timestamps (Chapters):** Include a list of timestamps with descriptive titles. This is crucial for user experience. Create logical chapters based on the likely structure of a video with this title.
          Example format:
          00:00 المقدمة
          01:15 النقطة الأولى
          03:40 النقطة الثانية
          ...
      5.  **Useful Links & CTA:** Add a section for useful links. Include placeholders for social media and a clear Call to Action (CTA) encouraging viewers to subscribe and watch another video.
          Example format:
          
          ---
          
          🔗 روابط مفيدة:
          شاهد الفيديو السابق: [ضع الرابط هنا]
          تابعنا على انستغرام: [ضع الرابط هنا]
          
          لا تنسَ الاشتراك في القناة وتفعيل الجرس ليصلك كل جديد!
      6.  **Hashtags:** Conclude with 3 to 5 highly relevant hashtags.

      **Video Title:** "${videoTitle}"
      `,
       config: {
        temperature: 0.7,
        topP: 0.95,
      }
    });
    return response.text;
  } catch (error) {
    return handleApiError(error, "generating YouTube description");
  }
};


export const checkPromptQuality = async (prompt: string): Promise<string> => {
  if (!API_KEY) {
    return Promise.resolve(`API Key not configured. Prompt quality check is unavailable.`);
  }
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are a prompt engineering expert. Analyze the following prompt for its quality and effectiveness for an AI image or text generation model.
      Provide a concise evaluation covering clarity, specificity, and creative potential.
      Then, offer concrete suggestions for improvement. Format your response clearly with sections for "Evaluation" and "Suggestions".

      Prompt: "${prompt}"
      `,
    });
    return response.text;
  } catch (error) {
    return handleApiError(error, "checking prompt quality");
  }
};

export const detectAiText = async (text: string): Promise<string> => {
  if (!API_KEY) {
    return Promise.resolve(`API Key not configured. AI detection is unavailable.`);
  }
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analyze the following text and determine the likelihood that it was generated by an AI.
      Provide a percentage likelihood and a brief justification for your analysis, pointing out any specific patterns, phrasing, or characteristics that support your conclusion.

      Text: "${text}"
      `,
    });
    return response.text;
  } catch (error) {
    return handleApiError(error, "detecting AI text");
  }
};

export const rephraseText = async (text: string): Promise<string> => {
  if (!API_KEY) {
    return Promise.resolve(`API Key not configured. Rephrasing is unavailable.`);
  }
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Rewrite the following text to make it sound more natural, engaging, and human-like.
      Preserve the core meaning but improve the tone, flow, and word choice. Avoid jargon and overly formal language unless it's essential to the context.

      Original Text: "${text}"

      Rephrased Text:
      `,
    });
    return response.text;
  } catch (error) {
    return handleApiError(error, "rephrasing text");
  }
};


export const imageFusionPrompt = async (
  image1: { mimeType: string; imageBase64: string },
  image2: { mimeType: string; imageBase64: string }
): Promise<string> => {
  if (!API_KEY) {
    return Promise.resolve(`API Key not configured. Image fusion is unavailable.`);
  }
  try {
    const imagePart1 = { inlineData: { mimeType: image1.mimeType, data: image1.imageBase64 } };
    const imagePart2 = { inlineData: { mimeType: image2.mimeType, data: image2.imageBase64 } };
    const textPart = {
      text: "You are an expert in creating prompts for AI image generation models. Analyze these two images. Create a single, detailed text prompt that creatively combines the key subjects, styles, colors, and concepts from both images. The goal is to generate a new, unique image that is a fusion of the two. Describe the desired composition, lighting, and artistic style clearly."
    };

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [textPart, imagePart1, imagePart2] },
    });

    return response.text;
  } catch (error) {
    return handleApiError(error, "fusing images into a prompt");
  }
};

export const removeImageBackground = async (mimeType: string, imageBase64: string): Promise<{ base64: string, mimeType: string }> => {
  if (!API_KEY) {
    throw new Error("API Key not configured. Background removal is unavailable.");
  }
  try {
    const imagePart = {
      inlineData: {
        mimeType,
        data: imageBase64,
      },
    };
    const textPart = {
      text: "Remove the background from this image. The new background should be transparent. Output only the resulting image with a transparent background."
    };

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [imagePart, textPart] },
      // FIX: The `responseModalities` for `gemini-2.5-flash-image` must be an array with a single `Modality.IMAGE` element.
      config: {
          responseModalities: [Modality.IMAGE],
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData && part.inlineData.mimeType.startsWith('image/')) {
        return { base64: part.inlineData.data, mimeType: part.inlineData.mimeType };
      }
    }
    
    const textResponse = response.text?.trim();
    if (textResponse) {
        throw new Error(`API returned a text response instead of an image: "${textResponse}"`);
    }

    throw new Error("The API did not return an image. It might have refused the request due to safety policies.");

  } catch (error) {
     console.error(`Error in removing image background:`, error);
     if (error instanceof Error) {
        throw new Error(`An error occurred while removing image background: ${error.message}`);
     }
     throw new Error(`An unknown error occurred while removing image background.`);
  }
};

export const extractTextFromImage = async (mimeType: string, imageBase64: string): Promise<string> => {
  if (!API_KEY) {
    return Promise.resolve(`API Key not configured. OCR is unavailable.`);
  }
  try {
    const imagePart = {
      inlineData: {
        mimeType,
        data: imageBase64,
      },
    };
    const textPart = {
      text: "Perform OCR on this image. Extract all text content accurately. Preserve the original line breaks and formatting as much as possible. If there is no text, respond with 'No text found in the image.'."
    };
    
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, textPart] },
    });
    
    return response.text;
  } catch (error) {
    return handleApiError(error, "extracting text from image (OCR)");
  }
};

export const readBarcodeFromImage = async (mimeType: string, imageBase64: string): Promise<string> => {
  if (!API_KEY) {
    return Promise.resolve(`API Key not configured. Barcode reading is unavailable.`);
  }
  try {
    const imagePart = {
      inlineData: {
        mimeType,
        data: imageBase64,
      },
    };
    const textPart = {
      text: "Analyze this image. If it contains a barcode or a QR code, decode it and return only the raw data it contains (e.g., a URL or plain text). Do not add any extra explanation. If no barcode or QR code is found, return the string 'No barcode or QR code found.'."
    };
    
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, textPart] },
    });
    
    return response.text;
  } catch (error) {
    return handleApiError(error, "reading barcode from image");
  }
};

export const restoreAndColorizePhoto = async (mimeType: string, imageBase64: string): Promise<{ base64: string, mimeType: string }> => {
  if (!API_KEY) {
    throw new Error("API Key not configured. Photo restoration is unavailable.");
  }
  try {
    const imagePart = {
      inlineData: {
        mimeType,
        data: imageBase64,
      },
    };
    const textPart = {
      text: "Restore this old, heavily damaged photo by removing all visible scratches, dents, folds, and stains. Reconstruct missing or distorted facial features naturally and realistically while preserving the original identity and expressions of the person. Maintain the authentic vintage look, but enhance clarity, sharpness, and detail to look like a high-quality modern photo. If the photo is black and white, convert it to realistic color based on skin tone, hair, eyes, and background elements, ensuring the result looks natural and historically appropriate."
    };

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [imagePart, textPart] },
      // FIX: The `responseModalities` for `gemini-2.5-flash-image` must be an array with a single `Modality.IMAGE` element.
      config: {
          responseModalities: [Modality.IMAGE],
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData && part.inlineData.mimeType.startsWith('image/')) {
        return { base64: part.inlineData.data, mimeType: part.inlineData.mimeType };
      }
    }
    
    const textResponse = response.text?.trim();
    if (textResponse) {
        throw new Error(`API returned a text response instead of an image: "${textResponse}"`);
    }

    throw new Error("The API did not return an image. It might have refused the request due to safety policies.");

  } catch (error) {
     console.error(`Error in restoring and colorizing photo:`, error);
     if (error instanceof Error) {
        throw new Error(`An error occurred while restoring and colorizing photo: ${error.message}`);
     }
     throw new Error(`An unknown error occurred while restoring and colorizing photo.`);
  }
};

export const mergePhotos = async (
  groupImage: { mimeType: string; imageBase64: string },
  personImage: { mimeType: string; imageBase64: string },
  groupDescription: string,
  personDescription: string
): Promise<{ base64: string, mimeType: string }> => {
  if (!API_KEY) {
    throw new Error("API Key not configured. Photo merging is unavailable.");
  }
  try {
    const groupImagePart = { inlineData: { mimeType: groupImage.mimeType, data: groupImage.imageBase64 } };
    const personImagePart = { inlineData: { mimeType: personImage.mimeType, data: personImage.imageBase64 } };
    
    const textPrompt = `Merge two separate photos into one (a single, high-quality picture). The first photo is of: ${groupDescription}, and the second is of ${personDescription}. Naturally place the person from the second photo into the first photo, making sure all facial expressions, lighting, skin tones, and clothing details are preserved to look authentic. Ensure the smile appears warm and genuine, and the overall image radiates love, joy, and emotional connection. Maintain the original look, posture, and identity of each person. Blend backgrounds seamlessly or use a soft, neutral background that enhances the focus on the group. The final image should look like a professionally captured real photo, not edited or artificial.`;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [groupImagePart, personImagePart, { text: textPrompt }] },
      // FIX: The `responseModalities` for `gemini-2.5-flash-image` must be an array with a single `Modality.IMAGE` element.
      config: {
          responseModalities: [Modality.IMAGE],
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData && part.inlineData.mimeType.startsWith('image/')) {
        return { base64: part.inlineData.data, mimeType: part.inlineData.mimeType };
      }
    }
    
    const textResponse = response.text?.trim();
    if (textResponse) {
        throw new Error(`API returned a text response instead of an image: "${textResponse}"`);
    }

    throw new Error("The API did not return an image. It might have refused the request due to safety policies.");

  } catch (error) {
     console.error(`Error in merging photos:`, error);
     if (error instanceof Error) {
        throw new Error(`An error occurred while merging photos: ${error.message}`);
     }
     throw new Error(`An unknown error occurred while merging photos.`);
  }
};

export interface VideoPromptOptions {
    mainScene: string;
    mainSubject: string;
    mood: string;
    lighting: string;
    openingShot: string;
    cameraMotions: string;
    secondaryElements: string;
    dof: string;
    dynamicElements: string;
    warmLight: string;
    coolLight: string;
    colorScheme: string;
    music: string;
    sfx: string;
    ending: string;
}

export const generateShortVideo = async (options: VideoPromptOptions, onProgress?: (message: string) => void): Promise<string> => {
    if (!API_KEY) {
        throw new Error("API Key not configured. Video generation is unavailable.");
    }

    const prompt = `A 30-second cinematic, ultra-realistic video in 16:9 aspect ratio.
Scene: ${options.mainScene}.
Subject: ${options.mainSubject}.
Mood: ${options.mood}.
Lighting: ${options.lighting}, with dramatic contrast between ${options.warmLight} and ${options.coolLight}. Include realistic reflections, shadows, and caustic light behavior.
Camera: Starts with ${options.openingShot}, and smoothly transitions through motions like ${options.cameraMotions}. Use a ${options.dof} for focus.
Visual Effects: The subject is surrounded by ${options.secondaryElements}. The environment has subtle dynamic elements like ${options.dynamicElements}.
Color Palette: ${options.colorScheme}.
Important: No distracting elements, text, or logos. No human faces unless described.
Audio: The background music should be ${options.music}, with sound effects like ${options.sfx}.
Ending: The final shot fades out slowly on ${options.ending}.
Overall Tone: The video must be ultra high resolution, with realistic detail, professional composition, and a luxurious tone.`;

    try {
        onProgress?.('🚀 Starting video generation...');
        let operation = await ai.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt: prompt,
            config: {
                numberOfVideos: 1
            }
        });
        
        onProgress?.('⏳ Processing request... this may take several minutes.');
        let checks = 0;
        const progressMessages = [
            '🎨 Composing scenes...',
            '🎬 Rendering frames...',
            '🔊 Syncing audio...',
            '✨ Applying final touches...'
        ];

        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 10000)); // Poll every 10 seconds
            const message = progressMessages[checks % progressMessages.length];
            onProgress?.(`⏳ ${message}`);
            operation = await ai.operations.getVideosOperation({ operation: operation });
            checks++;
        }
        
        onProgress?.('✅ Finalizing video...');
        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;

        if (!downloadLink) {
            throw new Error("Video generation completed, but no download link was provided by the API.");
        }

        onProgress?.('⬇️ Downloading generated video...');
        const response = await fetch(`${downloadLink}&key=${API_KEY}`);
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to download video. Status: ${response.status}. Message: ${errorText}`);
        }

        const videoBlob = await response.blob();
        const videoUrl = URL.createObjectURL(videoBlob);
        
        onProgress?.(''); // Clear message
        return videoUrl;

    } catch (error) {
        console.error("Error generating short video:", error);
        const errorMessage = handleApiError(error, "generating short video");
        throw new Error(errorMessage);
    }
};

export interface ArticleGenerationParams {
  title: string;
  keyword: string;
  description: string;
  category: string;
  tone: string;
  length: 'short' | 'medium' | 'long' | 'very-long';
  intent: string;
  audience: string;
  additionalInfo?: string;
}

export const generateProfessionalArticle = async (params: ArticleGenerationParams): Promise<any> => {
  if (!API_KEY) {
    throw new Error("API Key not configured. Article generation is unavailable.");
  }

  const lengthInWords = {
    short: '300-500 words',
    medium: '500-800 words',
    long: '800-1200 words',
    'very-long': '1200+ words',
  }[params.length] || '500-800 words';

  const prompt = `Based on the following parameters, generate a comprehensive, unique, and SEO-optimized article in Arabic. The article must be well-structured with headings (h2, h3), paragraphs (p), and lists (ul/ol).

Parameters:
- Article Title: ${params.title}
- Main Keyword: ${params.keyword}
- Brief Description: ${params.description}
- Category: ${params.category}
- Tone of Voice: ${params.tone}
- Desired Length: ${lengthInWords}
- Search Intent: ${params.intent}
- Target Audience: ${params.audience}
- Additional Info: ${params.additionalInfo || 'None'}

Please provide the output in a structured JSON format. The htmlContent should be a single string of well-formed HTML.
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            generatedTitle: { type: Type.STRING, description: 'The final, SEO-optimized title of the article.' },
            htmlContent: { type: Type.STRING, description: 'The full article content as a single HTML string, including h2, h3, p, ul, ol, and li tags.' },
            metaDescription: { type: Type.STRING, description: 'A compelling meta description between 150-160 characters.' },
            urlSlug: { type: Type.STRING, description: 'A short, URL-friendly slug in Arabic.' },
            suggestedKeywords: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'An array of 5-7 related LSI keywords.'
            },
            wordCount: { type: Type.INTEGER, description: 'The total word count of the generated article.' }
          },
          required: ["generatedTitle", "htmlContent", "metaDescription", "urlSlug", "suggestedKeywords", "wordCount"]
        }
      }
    });

    const jsonText = response.text.trim();
    const articleData = JSON.parse(jsonText);
    
    // Add some calculated metrics
    const keywordRegex = new RegExp(params.keyword, 'gi');
    const keywordMatches = (articleData.htmlContent.match(keywordRegex) || []).length;
    articleData.keywordDensity = articleData.wordCount > 0 ? ((keywordMatches / articleData.wordCount) * 100).toFixed(2) : '0.00';
    articleData.readingTime = Math.ceil(articleData.wordCount / 200);

    return articleData;

  } catch (error) {
    const errorMessage = handleApiError(error, "generating professional article");
    throw new Error(errorMessage);
  }
};

export interface VideoTranscriptResult {
    title: string;
    description: string;
    transcript: string;
}

export const transcribeYoutubeVideo = async (url: string, language: string): Promise<VideoTranscriptResult> => {
    if (!API_KEY) {
        return Promise.resolve({
            title: 'عنوان فيديو تجريبي',
            description: 'هذا وصف تجريبي لأن مفتاح API غير مهيأ.',
            transcript: `هذا نص تجريبي مترجم إلى ${language}.`
        });
    }

    try {
        const languageName = new Intl.DisplayNames(['ar'], { type: 'language' }).of(language) || language;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: `1. Use the website youtubetranscript.com to find and extract the full transcript for the YouTube video at this URL: ${url}.
2. From the YouTube page itself, get the original title and description of the video.
3. Translate the entire transcript you found in step 1 into the language: "${languageName}".

Respond ONLY with a JSON object containing three keys: "title", "description", and "transcript".
- "title" should be the video's original title.
- "description" should be the video's original description.
- "transcript" should be the translated text.
If a transcript cannot be found, the "transcript" value should be a message indicating that, but still return the title and description if available.`,
            config: {
                tools: [{ googleSearch: {} }],
            },
        });
        
        const text = response.text;
        if (!text || typeof text !== 'string') {
            throw new Error("لم يتمكن الذكاء الاصطناعي من توليد استجابة نصية. قد يكون هذا بسبب سياسات المحتوى أو عدم العثور على المعلومات المطلوبة.");
        }

        const jsonText = text.trim().replace(/^```json\s*/, '').replace(/```$/, '');
        
        if (!jsonText) {
             throw new Error("استجابة الذكاء الاصطناعي كانت فارغة بعد التنظيف.");
        }

        const resultJson = JSON.parse(jsonText);

        return {
            title: resultJson.title || 'لم يتم العثور على عنوان',
            description: resultJson.description || 'لم يتم العثور على وصف',
            transcript: resultJson.transcript || 'لم يتمكن الذكاء الاصطناعي من العثور على نص للفيديو أو ترجمته.',
        };

    } catch (error) {
        console.error("Error in transcribeYoutubeVideo:", error);
        
        if (error instanceof SyntaxError) { // This handles JSON.parse errors
            const userFriendlyError = 'فشل في تحليل استجابة الذكاء الاصطناعي. قد يكون التنسيق غير صحيح. يرجى المحاولة مرة أخرى.';
            throw new Error(userFriendlyError);
        }

        if (error instanceof Error && error.message.includes("الذكاء الاصطناعي")) {
            throw error; // re-throw our custom error
        }
        
        const userFriendlyError = 'فشل في تفريغ الفيديو. قد لا يحتوي الفيديو على نص أو ترجمة متاحة، أو قد تكون هناك مشكلة مؤقتة في الخدمة. يرجى محاولة فيديو آخر.';
        throw new Error(userFriendlyError);
    }
};
