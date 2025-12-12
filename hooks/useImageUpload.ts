import { useState, useCallback, useRef } from 'react';
import { uploadProductImage } from '../services/storageService';
import {
  validateImageFile,
  generateThumbnail,
  formatFileSize,
  DEFAULT_UPLOAD_CONFIG,
  FileValidationConfig,
} from '../utils/fileValidation';

export interface UploadFile {
  id: string;
  file: File;
  thumbnail?: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error' | 'cancelled';
  error?: string;
  url?: string;
  abortController?: AbortController;
}

interface UseImageUploadReturn {
  files: UploadFile[];
  addFiles: (newFiles: FileList | File[]) => Promise<void>;
  removeFile: (id: string) => void;
  cancelUpload: (id: string) => void;
  cancelAllUploads: () => void;
  uploadFiles: (productId: string) => Promise<void>;
  clearCompleted: () => void;
  isUploading: boolean;
  overallProgress: number;
}

export const useImageUpload = (
  config: FileValidationConfig = DEFAULT_UPLOAD_CONFIG
): UseImageUploadReturn => {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const uploadStartTime = useRef<number>(0);

  /**
   * Add files to upload queue
   */
  const addFiles = useCallback(async (newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);

    // Validate and process each file
    const processedFiles: UploadFile[] = [];

    for (const file of fileArray) {
      // Validate file
      const validation = validateImageFile(file, config);
      
      if (!validation.valid) {
        // Add file with error status
        processedFiles.push({
          id: `${file.name}-${Date.now()}-${Math.random()}`,
          file,
          progress: 0,
          status: 'error',
          error: validation.error,
        });
        continue;
      }

      // Generate thumbnail
      try {
        const thumbnail = await generateThumbnail(file, config.thumbnailSize);
        processedFiles.push({
          id: `${file.name}-${Date.now()}-${Math.random()}`,
          file,
          thumbnail,
          progress: 0,
          status: 'pending',
        });
      } catch (error) {
        processedFiles.push({
          id: `${file.name}-${Date.now()}-${Math.random()}`,
          file,
          progress: 0,
          status: 'error',
          error: 'Falha ao gerar miniatura',
        });
      }
    }

    setFiles(prev => [...prev, ...processedFiles]);
  }, [config]);

  /**
   * Remove file from queue
   */
  const removeFile = useCallback((id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  }, []);

  /**
   * Cancel ongoing upload
   */
  const cancelUpload = useCallback((id: string) => {
    setFiles(prev =>
      prev.map(f => {
        if (f.id === id && f.status === 'uploading') {
          f.abortController?.abort();
          return { ...f, status: 'cancelled' as const, progress: 0 };
        }
        return f;
      })
    );
  }, []);

  /**
   * Cancel all ongoing uploads
   */
  const cancelAllUploads = useCallback(() => {
    setFiles(prev =>
      prev.map(f => {
        if (f.status === 'uploading') {
          f.abortController?.abort();
          return { ...f, status: 'cancelled' as const, progress: 0 };
        }
        return f;
      })
    );
    setIsUploading(false);
  }, []);

  /**
   * Upload all pending files
   */
  const uploadFiles = useCallback(async (productId: string) => {
    setIsUploading(true);
    uploadStartTime.current = Date.now();

    const pendingFiles = files.filter(f => f.status === 'pending');

    for (const uploadFile of pendingFiles) {
      // Create abort controller for this upload
      const abortController = new AbortController();

      // Update file status to uploading
      setFiles(prev =>
        prev.map(f =>
          f.id === uploadFile.id
            ? { ...f, status: 'uploading' as const, abortController }
            : f
        )
      );

      try {
        // Upload file with progress tracking
        const result = await uploadProductImage(
          uploadFile.file,
          productId,
          (progress) => {
            setFiles(prev =>
              prev.map(f =>
                f.id === uploadFile.id ? { ...f, progress } : f
              )
            );
          }
        );

        if (result.success && result.url) {
          setFiles(prev =>
            prev.map(f =>
              f.id === uploadFile.id
                ? { ...f, status: 'success' as const, progress: 100, url: result.url }
                : f
            )
          );
        } else {
          setFiles(prev =>
            prev.map(f =>
              f.id === uploadFile.id
                ? {
                    ...f,
                    status: 'error' as const,
                    progress: 0,
                    error: result.error || 'Falha no upload',
                  }
                : f
            )
          );
        }
      } catch (error) {
        // Check if it was cancelled
        if (error instanceof Error && error.name === 'AbortError') {
          // Already handled in cancelUpload
          continue;
        }

        setFiles(prev =>
          prev.map(f =>
            f.id === uploadFile.id
              ? {
                  ...f,
                  status: 'error' as const,
                  progress: 0,
                  error: error instanceof Error ? error.message : 'Erro desconhecido',
                }
              : f
          )
        );
      }
    }

    setIsUploading(false);
  }, [files]);

  /**
   * Clear completed uploads
   */
  const clearCompleted = useCallback(() => {
    setFiles(prev => prev.filter(f => f.status !== 'success'));
  }, []);

  /**
   * Calculate overall progress
   */
  const overallProgress =
    files.length > 0
      ? files.reduce((sum, f) => sum + f.progress, 0) / files.length
      : 0;

  return {
    files,
    addFiles,
    removeFile,
    cancelUpload,
    cancelAllUploads,
    uploadFiles,
    clearCompleted,
    isUploading,
    overallProgress,
  };
};
