import React, { useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';
import { uploadImage } from '../../lib/supabase';

interface FileUploadProps {
  onFileSelect: (url: string) => void;
  accept?: string;
  previewUrl?: string;
  onClear?: () => void;
  label?: string;
  bucket?: string;
  folder?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  accept = "image/*",
  previewUrl,
  onClear,
  label = "Selecionar arquivo",
  bucket = "images",
  folder
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(previewUrl || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      setError(null);

      // Upload to Supabase Storage and get public URL
      const publicUrl = await uploadImage(file, bucket, folder);
      
      // Update preview and notify parent
      setPreview(publicUrl);
      onFileSelect(publicUrl);
    } catch (err) {
      console.error('Upload error:', err);
      setError('Erro ao fazer upload da imagem');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setPreview(null);
    setError(null);
    onClear?.();
  };

  return (
    <div className="relative">
      {error && (
        <div className="bg-red-50 text-red-500 p-2 rounded-md mb-2 text-sm">
          {error}
        </div>
      )}

      {preview ? (
        <div className="relative">
          <img 
            src={preview} 
            alt="Preview" 
            className="w-full h-48 object-cover rounded-lg"
          />
          <button
            type="button"
            onClick={handleClear}
            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div 
          className={`border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          onClick={() => !loading && fileInputRef.current?.click()}
        >
          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">{loading ? 'Enviando...' : label}</p>
          <p className="text-xs text-gray-500 mt-1">
            {loading ? 'Aguarde...' : 'Clique para selecionar'}
          </p>
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
        disabled={loading}
      />
    </div>
  );
};

export default FileUpload;