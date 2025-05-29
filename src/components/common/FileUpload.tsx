
import React, { useRef, useState } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { useSupabase } from '../../contexts/SupabaseContext';

interface FileUploadProps {
  onFileSelect: (file: File, publicUrl?: string) => void;
  accept?: string;
  previewUrl?: string;
  onClear?: () => void;
  label?: string;
  bucket?: 'teams' | 'players';
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  accept = "image/*",
  previewUrl,
  onClear,
  label = "Selecionar arquivo",
  bucket = 'teams'
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(previewUrl || null);
  const [isUploading, setIsUploading] = useState(false);
  const { uploadImage, isConnected } = useSupabase();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      let publicUrl: string | undefined;

      if (isConnected) {
        // Upload to Supabase Storage and get public URL
        publicUrl = await uploadImage(file, bucket);
        setPreview(publicUrl);
      } else {
        // Fallback to blob URL for local mode
        const blobUrl = URL.createObjectURL(file);
        setPreview(blobUrl);
      }

      onFileSelect(file, publicUrl);
    } catch (error) {
      console.error('Error uploading file:', error);
      // Fallback to blob URL if upload fails
      const blobUrl = URL.createObjectURL(file);
      setPreview(blobUrl);
      onFileSelect(file);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClear = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setPreview(null);
    onClear?.();
  };

  return (
    <div className="relative">
      {preview ? (
        <div className="relative">
          <img 
            src={preview} 
            alt="Preview" 
            className="w-full h-48 object-cover rounded-lg"
          />
          {!isUploading && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          {isUploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
              <div className="flex items-center text-white">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                <span>Enviando...</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div 
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">{label}</p>
          <p className="text-xs text-gray-500 mt-1">Clique para selecionar</p>
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading}
      />
    </div>
  );
};

export default FileUpload;
