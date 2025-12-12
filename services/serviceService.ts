import { supabase } from './supabaseClient';
import { Service, ApiResponse } from '../types';

/**
 * Create a new service
 */
export const createService = async (serviceData: Omit<Service, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Service>> => {
  try {
    const { data, error } = await supabase
      .from('services')
      .insert([serviceData])
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
 * Get service by ID
 */
export const getServiceById = async (id: string): Promise<ApiResponse<Service>> => {
  try {
    const { data, error } = await supabase
      .from('services')
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
 * List all services with optional filters
 */
export const listServices = async (
  category?: string,
  limit: number = 50,
  offset: number = 0
): Promise<ApiResponse<Service[]>> => {
  try {
    let query = supabase
      .from('services')
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
 * Search services by name or description
 */
export const searchServices = async (searchTerm: string): Promise<ApiResponse<Service[]>> => {
  try {
    const { data, error } = await supabase
      .from('services')
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
 * Get services by category
 */
export const getServicesByCategory = async (category: string): Promise<ApiResponse<Service[]>> => {
  try {
    const { data, error } = await supabase
      .from('services')
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
 * Update service
 */
export const updateService = async (id: string, updates: Partial<Service>): Promise<ApiResponse<Service>> => {
  try {
    const { data, error } = await supabase
      .from('services')
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
 * Delete service
 */
export const deleteService = async (id: string): Promise<ApiResponse<void>> => {
  try {
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', id);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
};
