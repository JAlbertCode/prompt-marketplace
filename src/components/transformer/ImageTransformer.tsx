'use client';

import React, { useState, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { transformImage } from '@/lib/gptApi';
import { useCreditStore } from '@/store/useCreditStore';
import Button from '@/components/shared/Button';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import { Prompt } from '@/types';

interface ImageTransformerProps {
  prompt: Prompt;
  onComplete?: (imageUrl: string) => void;
  onCancel?: () => void;
}

const ImageTransformer: React.FC<ImageTransformerProps> = ({
  prompt,
  onComplete,
  onCancel
}) => {
  const { credits, deductCredits } = useCreditStore();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [transformedImageUrl, setTransformedImageUrl] = useState<string | null>(null);
  const [customStyle, setCustomStyle] = useState<string>('');
  const [selectedStyle, setSelectedStyle] = useState<string>('');
  const [isTransforming, setIsTransforming] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Combine preset styles with default styles if needed
  const styleOptions = prompt.presetStyles || [
    "Lego Character", 
    "Studio Ghibli", 
    "Disney Pixar", 
    "Watercolor Painting", 
    "Comic Book Style", 
    "Minecraft", 
    "Oil Painting",
    "Cyberpunk",
    "Anime Character"
  ];
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      
      // Reset transformed image if a new image is uploaded
      setTransformedImageUrl(null);
    }
  };
  
  const handleStyleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStyle(e.target.value);
    setCustomStyle('');
  };
  
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result as string;
        // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64 = base64String.split(',')[1];
        resolve(base64);
      };
      reader.onerror = (error) => {
        reject(error);
      };
    });
  };
  
  const handleTransform = async () => {
    if (!selectedImage) {
      toast.error('Please upload an image first');
      return;
    }
    
    // Validate style selection
    const style = customStyle || selectedStyle;
    if (!style) {
      toast.error('Please select or enter a transformation style');
      return;
    }
    
    // Check if user has enough credits
    if (credits < prompt.creditCost) {
      toast.error(`Not enough credits to transform this image. You need ${prompt.creditCost} credits.`);
      return;
    }
    
    // Construct the transformation prompt
    // This now just needs to clearly specify the style
    // The backend handles the detailed image description
    const transformationPrompt = prompt.transformationType === 'character'
      ? `Transform this person into a ${style} character.`
      : prompt.transformationType === 'scene'
      ? `Transform this scene into ${style} style.`
      : `Transform this image into ${style} style.`;
    
    setIsTransforming(true);
    
    try {
      // Convert the image to base64
      const base64Image = await convertToBase64(selectedImage);
      
      // Log transformation details for debugging
      console.log(`Starting transformation with style: ${style}`);
      console.log(`Using model: ${prompt.model}`);
      
      // Call the transformation API
      const imageUrl = await transformImage(
        base64Image,
        transformationPrompt,
        prompt.model as any
      );
      
      // Set the transformed image URL
      setTransformedImageUrl(imageUrl);
      
      // Deduct credits
      deductCredits(prompt.creditCost, 'Image transformation', prompt.id);
      
      // Call onComplete callback if provided
      if (onComplete) {
        onComplete(imageUrl);
      }
      
      toast.success(`Image transformed successfully! -${prompt.creditCost} credits.`);
    } catch (error) {
      console.error('Error transforming image:', error);
      toast.error('Failed to transform image. AI image generation sometimes has difficulties with certain styles. Try a different style or image.');
    } finally {
      setIsTransforming(false);
    }
  };
  
  const handleDownload = () => {
    if (!transformedImageUrl) return;
    
    // Create a link element and trigger download
    const link = document.createElement('a');
    link.href = transformedImageUrl;
    link.download = `transformed-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Image downloaded successfully');
  };
  
  const handleReset = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setTransformedImageUrl(null);
    setSelectedStyle('');
    setCustomStyle('');
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">{prompt.title}</h2>
        <p className="text-sm text-gray-600 mt-1">{prompt.description}</p>
        
        <div className="mt-2 flex items-center">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            Image Transformation
          </span>
          <span className="ml-2 text-sm text-gray-500">
            Cost: <span className="font-semibold">{prompt.creditCost} credits</span>
          </span>
        </div>
      </div>
      
      <div className="p-4">
        {isTransforming ? (
          <div className="flex flex-col items-center justify-center py-8">
            <LoadingIndicator size="lg" />
            <p className="mt-4 text-sm text-gray-600">
              Transforming your image... This may take a few moments.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Image upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload an image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                ref={fileInputRef}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
            
            {/* Image preview */}
            {previewUrl && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preview
                </label>
                <div className="border border-gray-200 rounded-md p-2 bg-gray-50">
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="max-w-full max-h-64 mx-auto"
                  />
                </div>
              </div>
            )}
            
            {/* Transformation style */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select transformation style
              </label>
              <select
                value={selectedStyle}
                onChange={handleStyleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="">Select a style</option>
                {styleOptions.map((style) => (
                  <option key={style} value={style}>
                    {style}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Custom style input (if allowed) */}
            {prompt.allowCustomStyles && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Or enter a custom style
                </label>
                <input
                  type="text"
                  value={customStyle}
                  onChange={(e) => {
                    setCustomStyle(e.target.value);
                    setSelectedStyle('');
                  }}
                  placeholder="e.g., Renaissance painting, Steampunk, Vaporwave"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
            )}
            
            {/* Credit warning */}
            {credits < prompt.creditCost && (
              <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Not enough credits! You need {prompt.creditCost} credits but have {credits} credits.
              </div>
            )}
            
            {/* Buttons */}
            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={handleReset}
                disabled={isTransforming || (!selectedImage && !transformedImageUrl)}
              >
                Reset
              </Button>
              
              <div className="flex space-x-3">
                {onCancel && (
                  <Button
                    variant="outline"
                    onClick={onCancel}
                  >
                    Cancel
                  </Button>
                )}
                
                <Button
                  onClick={handleTransform}
                  disabled={
                    isTransforming || 
                    !selectedImage || 
                    (!selectedStyle && !customStyle) || 
                    credits < prompt.creditCost
                  }
                >
                  {isTransforming ? (
                    <span className="flex items-center">
                      <LoadingIndicator size="sm" className="mr-2" />
                      Transforming...
                    </span>
                  ) : (
                    'Transform Image'
                  )}
                </Button>
              </div>
            </div>
            
            {/* Transformed image result */}
            {transformedImageUrl && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Transformed Image</h3>
                <div className="border border-gray-200 rounded-md p-2 bg-gray-50">
                  <img 
                    src={transformedImageUrl} 
                    alt="Transformed" 
                    className="max-w-full max-h-96 mx-auto"
                  />
                </div>
                
                <div className="flex justify-end mt-4">
                  <Button onClick={handleDownload}>
                    Download Image
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageTransformer;