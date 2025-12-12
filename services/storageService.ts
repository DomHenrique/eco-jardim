import AWS from 'aws-sdk';
import { ImageStorageType } from '../types';
import { loggerService } from './loggerService';
import { logger } from '../utils/logger';
import { errorHandler } from '../utils/errorHandler';

const log = logger.withContext('storageService');

// Configure AWS SDK for MinIO
const s3Client = new AWS.S3({
  endpoint: import.meta.env.VITE_MINIO_ENDPOINT || 'http://localhost:9000',
  accessKeyId: import.meta.env.VITE_MINIO_ACCESS_KEY || '',
  secretAccessKey: import.meta.env.VITE_MINIO_SECRET_KEY || '',
  s3ForcePathStyle: true, // Required for MinIO
  signatureVersion: 'v4',
  sslEnabled: import.meta.env.VITE_MINIO_USE_SSL === 'true',
});

const BUCKET_NAME = import.meta.env.VITE_MINIO_BUCKET || 'ecojardim-products';

/**
 * Initialize MinIO bucket if it doesn't exist
 */
export const initializeBucket = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    // Check if bucket exists
    await s3Client.headBucket({ Bucket: BUCKET_NAME }).promise();
    return { success: true };
  } catch (error: any) {
    // If bucket doesn't exist, create it
    if (error.code === 'NotFound' || error.statusCode === 404) {
      try {
        await s3Client.createBucket({ Bucket: BUCKET_NAME }).promise();
        
        // Set bucket policy to allow public read access
        const policy = {
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { AWS: ['*'] },
              Action: ['s3:GetObject'],
              Resource: [`arn:aws:s3:::${BUCKET_NAME}/*`],
            },
          ],
        };
        
        await s3Client.putBucketPolicy({
          Bucket: BUCKET_NAME,
          Policy: JSON.stringify(policy),
        }).promise();
        
        return { success: true };
      } catch (createError) {
        errorHandler.handle(createError as Error, 'storageService.initializeBucket.create');
        return { 
          success: false, 
          error: createError instanceof Error ? createError.message : 'Failed to create storage bucket' 
        };
      }
    }
    
    errorHandler.handle(error as Error, 'storageService.initializeBucket.check');
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to access storage bucket' 
    };
  }
};

/**
 * Upload product image to MinIO
 * @param file - File to upload
 * @param productId - Product ID for organizing files
 * @returns Public URL of uploaded image
 */
export const uploadProductImage = async (
  file: File,
  productId: string,
  onProgress?: (progress: number) => void
): Promise<{ success: boolean; url?: string; error?: string }> => {
  try {
    // Ensure bucket exists
    const bucketInit = await initializeBucket();
    if (!bucketInit.success) {
      return { success: false, error: bucketInit.error };
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `products/${productId}_${timestamp}.${fileExtension}`;

    // Convert File to ArrayBuffer then to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload file with progress tracking
    const upload = s3Client.upload({
      Bucket: BUCKET_NAME,
      Key: fileName,
      Body: buffer,
      ContentType: file.type,
      ACL: 'public-read', // Make file publicly accessible
    });

    // Track upload progress
    if (onProgress) {
      upload.on('httpUploadProgress', (progress) => {
        const percentage = Math.round((progress.loaded / progress.total) * 100);
        onProgress(percentage);
      });
    }

    await upload.promise();

    // Generate public URL
    const endpoint = import.meta.env.VITE_MINIO_ENDPOINT || 'http://localhost:9000';
    const url = `${endpoint}/${BUCKET_NAME}/${fileName}`;

    return { success: true, url };
  } catch (error) {
    errorHandler.handle(error as Error, 'storageService.uploadProductImage');
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to upload image' 
    };
  }
};

/**
 * Delete product image from MinIO
 * @param imageUrl - Full URL of the image to delete
 */
export const deleteProductImage = async (
  imageUrl: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Extract filename from URL
    const urlParts = imageUrl.split('/');
    const bucketIndex = urlParts.indexOf(BUCKET_NAME);
    
    if (bucketIndex === -1) {
      return { success: false, error: 'Invalid MinIO URL' };
    }

    const fileName = urlParts.slice(bucketIndex + 1).join('/');

    // Delete file
    await s3Client.deleteObject({
      Bucket: BUCKET_NAME,
      Key: fileName,
    }).promise();

    return { success: true };
  } catch (error) {
    errorHandler.handle(error as Error, 'storageService.deleteProductImage');
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete image' 
    };
  }
};

/**
 * Get public URL for a stored image
 * @param fileName - Name of the file in MinIO
 */
export const getImageUrl = (fileName: string): string => {
  const endpoint = import.meta.env.VITE_MINIO_ENDPOINT || 'http://localhost:9000';
  return `${endpoint}/${BUCKET_NAME}/${fileName}`;
};

/**
 * Check if URL is from MinIO storage
 * @param url - Image URL to check
 */
export const isMinioUrl = (url: string): boolean => {
  const endpoint = import.meta.env.VITE_MINIO_ENDPOINT || 'http://localhost:9000';
  return url.startsWith(endpoint) && url.includes(BUCKET_NAME);
};

/**
 * Determine storage type from URL
 * @param url - Image URL
 */
export const getStorageType = (url: string): ImageStorageType => {
  if (!url) {
    return ImageStorageType.PLACEHOLDER;
  }
  
  if (isMinioUrl(url)) {
    return ImageStorageType.MINIO;
  }
  
  return ImageStorageType.EXTERNAL;
};

/**
 * Validate image file
 * @param file - File to validate
 */
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  // Check file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (!validTypes.includes(file.type)) {
    return { 
      valid: false, 
      error: 'Tipo de arquivo inválido. Use JPEG, PNG, WebP ou GIF.' 
    };
  }

  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return { 
      valid: false, 
      error: 'Arquivo muito grande. Tamanho máximo: 5MB.' 
    };
  }

  return { valid: true };
};

/**
 * Create a folder (simulated with a 0-byte object ending in /)
 * @param folderPath - Path of the folder to create
 * @param userId - ID of the user performing the action (for audit)
 */
export const createFolder = async (
  folderPath: string,
  userId?: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const key = folderPath.endsWith('/') ? folderPath : `${folderPath}/`;
    
    await s3Client.putObject({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: '',
    }).promise();

    if (userId) {
      await loggerService.logActivity(userId, 'CREATE_FOLDER', { folderPath: key });
    }

    return { success: true };
  } catch (error) {
    errorHandler.handle(error as Error, 'storageService.createFolder');
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create folder' 
    };
  }
};

/**
 * Upload a generic file with metadata
 * @param file - File to upload
 * @param path - Path where to upload the file
 * @param metadata - Optional metadata
 * @param userId - ID of the user performing the action (for audit)
 */
export const uploadFile = async (
  file: File,
  path: string,
  metadata: Record<string, string> = {},
  userId?: string,
  onProgress?: (progress: number) => void
): Promise<{ success: boolean; url?: string; error?: string }> => {
  try {
    const bucketInit = await initializeBucket();
    if (!bucketInit.success) {
      return { success: false, error: bucketInit.error };
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const upload = s3Client.upload({
      Bucket: BUCKET_NAME,
      Key: path,
      Body: buffer,
      ContentType: file.type,
      Metadata: metadata,
      ACL: 'public-read',
    });

    if (onProgress) {
      upload.on('httpUploadProgress', (progress) => {
        const percentage = Math.round((progress.loaded / progress.total) * 100);
        onProgress(percentage);
      });
    }

    await upload.promise();

    if (userId) {
      await loggerService.logActivity(userId, 'UPLOAD_FILE', { path, metadata });
    }

    const endpoint = import.meta.env.VITE_MINIO_ENDPOINT || 'http://localhost:9000';
    const url = `${endpoint}/${BUCKET_NAME}/${path}`;

    return { success: true, url };
  } catch (error) {
    errorHandler.handle(error as Error, 'storageService.uploadFile');
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to upload file' 
    };
  }
};

/**
 * List files and folders in a path
 * @param prefix - Path prefix to list
 */
export const listFiles = async (
  prefix: string = ''
): Promise<{ success: boolean; files?: any[]; folders?: any[]; error?: string }> => {
  try {
    const data = await s3Client.listObjectsV2({
      Bucket: BUCKET_NAME,
      Prefix: prefix,
      Delimiter: '/',
    }).promise();

    const files = data.Contents?.map(item => ({
      key: item.Key,
      lastModified: item.LastModified,
      size: item.Size,
      etag: item.ETag,
    })) || [];

    const folders = data.CommonPrefixes?.map(item => ({
      prefix: item.Prefix,
    })) || [];

    return { success: true, files, folders };
  } catch (error) {
    errorHandler.handle(error as Error, 'storageService.listFiles');
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to list files' 
    };
  }
};

/**
 * Delete a file
 * @param path - Path of the file to delete
 * @param userId - ID of the user performing the action (for audit)
 */
export const deleteFile = async (
  path: string,
  userId?: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    await s3Client.deleteObject({
      Bucket: BUCKET_NAME,
      Key: path,
    }).promise();

    if (userId) {
      await loggerService.logActivity(userId, 'DELETE_FILE', { path });
    }

    return { success: true };
  } catch (error) {
    errorHandler.handle(error as Error, 'storageService.deleteFile');
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete file' 
    };
  }
};

/**
 * Get file metadata
 * @param path - Path of the file
 */
export const getFileMetadata = async (
  path: string
): Promise<{ success: boolean; metadata?: Record<string, string>; error?: string }> => {
  try {
    const data = await s3Client.headObject({
      Bucket: BUCKET_NAME,
      Key: path,
    }).promise();

    return { success: true, metadata: data.Metadata };
  } catch (error) {
    errorHandler.handle(error as Error, 'storageService.getFileMetadata');
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to get file metadata' 
    };
  }
};

/**
 * Update file metadata (requires copying the object to itself)
 * @param path - Path of the file
 * @param metadata - New metadata to merge or replace
 * @param userId - ID of the user performing the action (for audit)
 */
export const updateFileMetadata = async (
  path: string,
  metadata: Record<string, string>,
  userId?: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // First get existing metadata to merge if needed, or just replace.
    // S3 ReplaceMetadata strategy replaces all metadata.
    
    await s3Client.copyObject({
      Bucket: BUCKET_NAME,
      CopySource: `${BUCKET_NAME}/${path}`,
      Key: path,
      Metadata: metadata,
      MetadataDirective: 'REPLACE',
    }).promise();

    if (userId) {
      await loggerService.logActivity(userId, 'UPDATE_METADATA', { path, metadata });
    }

    return { success: true };
  } catch (error) {
    errorHandler.handle(error as Error, 'storageService.updateFileMetadata');
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update file metadata' 
    };
  }
};
