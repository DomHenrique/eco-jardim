import { supabase } from './supabaseClient';
import { Product, ProductCategory, ApiResponse, ImageStorageType } from '../types';
import { uploadProductImage, getStorageType } from './storageService';

/**
 * Create a new product
 */
export const createProduct = async (
  productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>,
  imageFile?: File
): Promise<ApiResponse<Product>> => {
  try {
    let finalImageUrl = productData.imageUrl;
    let storageType = ImageStorageType.PLACEHOLDER;

    // Handle file upload if provided
    if (imageFile) {
      const tempId = `temp-${Date.now()}`;
      const uploadResult = await uploadProductImage(imageFile, tempId);
      
      if (!uploadResult.success) {
        return { success: false, error: uploadResult.error };
      }
      
      finalImageUrl = uploadResult.url || '';
      storageType = ImageStorageType.MINIO;
    } else if (productData.imageUrl) {
      // Determine storage type from URL
      storageType = getStorageType(productData.imageUrl);
    }

    const { data, error } = await supabase
      .from('products')
      .insert([{
        ...productData,
        imageUrl: finalImageUrl,
        imageStorageType: storageType
      }])
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
};

/**
 * Get product by ID
 */
export const getProductById = async (id: string): Promise<ApiResponse<Product>> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
};

/**
 * List all products with optional filters
 */
export const listProducts = async (
  category?: ProductCategory,
  limit: number = 50,
  offset: number = 0
): Promise<ApiResponse<Product[]>> => {
  try {
    let query = supabase
      .from('products')
      .select('*');

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
};

/**
 * Search products by name, description, or tags
 */
export const searchProducts = async (searchTerm: string): Promise<ApiResponse<Product[]>> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
};

/**
 * Get products by tags
 */
export const getProductsByTags = async (tags: string[]): Promise<ApiResponse<Product[]>> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .contains('tags', tags);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
};

/**
 * Update product
 */
export const updateProduct = async (id: string, updates: Partial<Product>): Promise<ApiResponse<Product>> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
};

/**
 * Delete product
 */
export const deleteProduct = async (id: string): Promise<ApiResponse<void>> => {
  try {
    // First, get the product to check if it has a MinIO image
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('imageUrl, imageStorageType')
      .eq('id', id)
      .single();

    if (fetchError) {
      return { success: false, error: fetchError.message };
    }

    // Delete from database
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      return { success: false, error: error.message };
    }

    // Delete image from MinIO if applicable
    if (product?.imageStorageType === ImageStorageType.MINIO && product.imageUrl) {
      const { deleteProductImage } = await import('./storageService');
      await deleteProductImage(product.imageUrl);
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
};

/**
 * Get products by category
 */
export const getProductsByCategory = async (category: ProductCategory): Promise<ApiResponse<Product[]>> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category', category)
      .order('name', { ascending: true });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
};

/**
 * Bulk create products
 */
export const bulkCreateProducts = async (
  productsData: Omit<Product, 'id' | 'created_at' | 'updated_at'>[]
): Promise<ApiResponse<Product[]>> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .insert(productsData)
      .select();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
};
