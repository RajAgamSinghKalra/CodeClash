"use client"
import { useState, useRef, ChangeEvent } from 'react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Card, CardContent } from './ui/card';
import Image from 'next/image';

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  isLoading?: boolean;
}

export function ImageUpload({ onImageSelect, isLoading = false }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    onImageSelect(file);
    
    // Create preview
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    
    // Clean up previous preview URL
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="image" className="text-base">Upload Image</Label>
            <div className="flex flex-col items-center gap-4">
              <input
                ref={fileInputRef}
                id="image"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={isLoading}
                className="cursor-pointer file:cursor-pointer file:bg-purple-600 file:text-white file:border-0 file:rounded file:px-3 file:py-1 file:hover:bg-purple-700 file:transition-colors bg-transparent border border-purple-400/30 rounded-md p-2 text-purple-300 w-full"
              />
              
              {preview ? (
                <div className="relative w-full h-64 border rounded-md overflow-hidden">
                  <Image 
                    src={preview} 
                    alt="Preview" 
                    fill
                    className="object-contain"
                  />
                </div>
              ) : (
                <div className="w-full h-64 border-2 border-dashed rounded-md flex items-center justify-center bg-muted/50">
                  <p className="text-muted-foreground">No image selected</p>
                </div>
              )}
              
              <Button 
                type="button" 
                onClick={handleButtonClick}
                disabled={isLoading}
                className="w-full max-w-xs"
              >
                {isLoading ? 'Loading...' : preview ? 'Change Image' : 'Select Image'}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 