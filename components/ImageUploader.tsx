import React, { useRef } from 'react';
import { Upload, X, CheckCircle, AlertCircle, Loader2, Trash2 } from 'lucide-react';
import { useImageUpload } from '../hooks/useImageUpload';
import { formatFileSize } from '../utils/fileValidation';

interface ImageUploaderProps {
  productId: string;
  onUploadComplete?: (urls: string[]) => void;
  maxFiles?: number;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  productId,
  onUploadComplete,
  maxFiles = 10,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    files,
    addFiles,
    removeFile,
    cancelUpload,
    cancelAllUploads,
    uploadFiles,
    clearCompleted,
    isUploading,
    overallProgress,
  } = useImageUpload();

  const [isDragging, setIsDragging] = React.useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      await addFiles(e.target.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files) {
      await addFiles(e.dataTransfer.files);
    }
  };

  const handleUpload = async () => {
    await uploadFiles(productId);
    
    // Get successful uploads
    const successfulUrls = files
      .filter(f => f.status === 'success' && f.url)
      .map(f => f.url!);

    if (successfulUrls.length > 0 && onUploadComplete) {
      onUploadComplete(successfulUrls);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case 'uploading':
        return <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />;
      case 'cancelled':
        return <X className="h-5 w-5 text-gray-600" />;
      default:
        return <Upload className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 border-green-300';
      case 'error':
        return 'bg-red-100 border-red-300';
      case 'uploading':
        return 'bg-blue-100 border-blue-300';
      case 'cancelled':
        return 'bg-gray-100 border-gray-300';
      default:
        return 'bg-white border-gray-300';
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${isDragging ? 'border-emerald-500 bg-emerald-50' : 'border-gray-300 bg-gray-50'}
          ${files.length >= maxFiles ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-emerald-400'}
        `}
        onClick={() => files.length < maxFiles && fileInputRef.current?.click()}
      >
        <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <p className="text-lg font-medium text-gray-700 mb-2">
          {isDragging ? 'Solte as imagens aqui' : 'Arraste imagens ou clique para selecionar'}
        </p>
        <p className="text-sm text-gray-500">
          Formatos aceitos: JPG, PNG, GIF, WEBP (máx. 5MB cada)
        </p>
        <p className="text-xs text-gray-400 mt-2">
          {files.length} / {maxFiles} arquivos
        </p>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
          onChange={handleFileSelect}
          className="hidden"
          disabled={files.length >= maxFiles}
        />
      </div>

      {/* Overall Progress */}
      {isUploading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-900">
              Progresso Geral
            </span>
            <span className="text-sm text-blue-700">
              {Math.round(overallProgress)}%
            </span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700">
              Arquivos ({files.length})
            </h3>
            <div className="flex gap-2">
              {files.some(f => f.status === 'success') && (
                <button
                  onClick={clearCompleted}
                  className="text-xs text-gray-600 hover:text-gray-800"
                >
                  Limpar Concluídos
                </button>
              )}
              {isUploading && (
                <button
                  onClick={cancelAllUploads}
                  className="text-xs text-red-600 hover:text-red-800"
                >
                  Cancelar Todos
                </button>
              )}
            </div>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {files.map((uploadFile) => (
              <div
                key={uploadFile.id}
                className={`border rounded-lg p-3 ${getStatusColor(uploadFile.status)}`}
              >
                <div className="flex items-start gap-3">
                  {/* Thumbnail */}
                  {uploadFile.thumbnail && (
                    <img
                      src={uploadFile.thumbnail}
                      alt={uploadFile.file.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                  )}

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {getStatusIcon(uploadFile.status)}
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {uploadFile.file.name}
                      </p>
                    </div>
                    
                    <p className="text-xs text-gray-600">
                      {formatFileSize(uploadFile.file.size)}
                    </p>

                    {/* Error Message */}
                    {uploadFile.error && (
                      <p className="text-xs text-red-600 mt-1">
                        {uploadFile.error}
                      </p>
                    )}

                    {/* Progress Bar */}
                    {uploadFile.status === 'uploading' && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-600">
                            Enviando...
                          </span>
                          <span className="text-xs text-gray-600">
                            {Math.round(uploadFile.progress)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${uploadFile.progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1">
                    {uploadFile.status === 'uploading' && (
                      <button
                        onClick={() => cancelUpload(uploadFile.id)}
                        className="p-1 hover:bg-red-100 rounded transition-colors"
                        title="Cancelar upload"
                      >
                        <X className="h-4 w-4 text-red-600" />
                      </button>
                    )}
                    {uploadFile.status !== 'uploading' && (
                      <button
                        onClick={() => removeFile(uploadFile.id)}
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                        title="Remover arquivo"
                      >
                        <Trash2 className="h-4 w-4 text-gray-600" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Button */}
      {files.some(f => f.status === 'pending') && (
        <button
          onClick={handleUpload}
          disabled={isUploading}
          className="w-full py-3 px-4 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {isUploading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Upload className="h-5 w-5" />
              Enviar Imagens
            </>
          )}
        </button>
      )}
    </div>
  );
};
