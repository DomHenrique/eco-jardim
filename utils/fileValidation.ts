/**
 * File Validation Utilities
 * Provides validation and helper functions for file uploads
 */

export interface FileValidationConfig {
  maxFileSize: number; // in bytes
  allowedTypes: string[];
  maxFiles: number;
  thumbnailSize: number;
}

export const DEFAULT_UPLOAD_CONFIG: FileValidationConfig = {
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  maxFiles: 10,
  thumbnailSize: 150,
};

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate if file is an allowed image type and within size limit
 */
export const validateImageFile = (
  file: File,
  config: FileValidationConfig = DEFAULT_UPLOAD_CONFIG
): ValidationResult => {
  // Check file type
  if (!config.allowedTypes.includes(file.type)) {
    const allowedExtensions = config.allowedTypes
      .map(type => type.split('/')[1])
      .join(', ');
    return {
      valid: false,
      error: `Tipo de arquivo não permitido. Formatos aceitos: ${allowedExtensions}`,
    };
  }

  // Check file size
  if (file.size > config.maxFileSize) {
    return {
      valid: false,
      error: `Arquivo muito grande. Tamanho máximo: ${formatFileSize(config.maxFileSize)}`,
    };
  }

  return { valid: true };
};

/**
 * Format file size in bytes to human-readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Generate thumbnail from image file
 */
export const generateThumbnail = (
  file: File,
  maxSize: number = DEFAULT_UPLOAD_CONFIG.thumbnailSize
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions while maintaining aspect ratio
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL(file.type));
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

/**
 * Get image dimensions
 */
export const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

/**
 * Check if files array contains duplicates
 */
export const hasDuplicateFiles = (files: File[]): boolean => {
  const fileNames = files.map(f => `${f.name}-${f.size}-${f.lastModified}`);
  return new Set(fileNames).size !== fileNames.length;
};

/**
 * Remove duplicate files from array
 */
export const removeDuplicateFiles = (files: File[]): File[] => {
  const seen = new Set<string>();
  return files.filter(file => {
    const key = `${file.name}-${file.size}-${file.lastModified}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
};

/**
 * Calculate upload speed in bytes per second
 */
export const calculateUploadSpeed = (
  bytesUploaded: number,
  startTime: number
): number => {
  const elapsedSeconds = (Date.now() - startTime) / 1000;
  return elapsedSeconds > 0 ? bytesUploaded / elapsedSeconds : 0;
};

/**
 * Estimate remaining time in seconds
 */
export const estimateRemainingTime = (
  bytesUploaded: number,
  totalBytes: number,
  uploadSpeed: number
): number => {
  if (uploadSpeed === 0) return 0;
  const remainingBytes = totalBytes - bytesUploaded;
  return remainingBytes / uploadSpeed;
};

/**
 * Format time in seconds to human-readable format
 */
export const formatTime = (seconds: number): string => {
  if (seconds < 60) {
    return `${Math.round(seconds)}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);
  return `${minutes}m ${remainingSeconds}s`;
};
