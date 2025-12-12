import { supabase } from './supabaseClient';
import { Order, OrderStatus, ApiResponse } from '../types';
import { emailService } from './emailService';

/**
 * Create a new order
 */
export const createOrder = async (orderData: Omit<Order, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Order>> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    // Send order confirmation email
    await emailService.sendOrderConfirmation(data);

    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
};

/**
 * Get order by ID
 */
export const getOrderById = async (id: string): Promise<ApiResponse<Order>> => {
  try {
    const { data, error } = await supabase
      .from('orders')
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
 * List all orders with optional pagination
 */
export const listOrders = async (
  status?: OrderStatus,
  limit: number = 50,
  offset: number = 0
): Promise<ApiResponse<Order[]>> => {
  try {
    let query = supabase
      .from('orders')
      .select('*');

    if (status) {
      query = query.eq('status', status);
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
 * Get orders by user ID
 */
export const getUserOrders = async (userId: string): Promise<ApiResponse<Order[]>> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
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
 * Validate order status transition
 */
const validateOrderStatusTransition = (currentStatus: OrderStatus, newStatus: OrderStatus): boolean => {
  const validTransitions: Record<OrderStatus, OrderStatus[]> = {
    pending: [OrderStatus.QUOTATION, OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
    quotation: [OrderStatus.QUOTED, OrderStatus.REJECTED, OrderStatus.CANCELLED],
    quoted: [OrderStatus.CONFIRMED, OrderStatus.REJECTED, OrderStatus.CANCELLED],
    confirmed: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
    processing: [OrderStatus.READY, OrderStatus.CANCELLED],
    ready: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
    shipped: [OrderStatus.DELIVERED],
    delivered: [OrderStatus.DELIVERED], // Final state
    cancelled: [OrderStatus.CANCELLED], // Final state
    rejected: [OrderStatus.REJECTED]    // Final state
  };

  return validTransitions[currentStatus]?.includes(newStatus) || false;
};

/**
 * Log order status change for audit purposes
 */
const logOrderStatusChange = async (
  orderId: string,
  oldStatus: OrderStatus,
  newStatus: OrderStatus,
  changedBy: string
): Promise<void> => {
  try {
    const auditLog = {
      table_name: 'orders',
      record_id: orderId,
      action: 'UPDATE',
      old_data: { status: oldStatus },
      new_data: { status: newStatus },
      changed_by: changedBy,
      created_at: new Date().toISOString()
    };

    await supabase
      .from('audit_logs')
      .insert([auditLog]);
  } catch (err) {
    console.error('Error logging order status change:', err);
  }
};

/**
 * Update order status with validation and audit logging
 */
export const updateOrderStatus = async (
  id: string,
  status: OrderStatus,
  updatedBy: string
): Promise<ApiResponse<Order>> => {
  try {
    // Get current order to check status transition validity
    const currentOrderResponse = await getOrderById(id);
    if (!currentOrderResponse.success || !currentOrderResponse.data) {
      return { success: false, error: 'Order not found' };
    }

    const currentOrder = currentOrderResponse.data;

    // Validate status transition
    const isValidTransition = validateOrderStatusTransition(currentOrder.status, status);
    if (!isValidTransition) {
      return { success: false, error: `Invalid status transition from ${currentOrder.status} to ${status}` };
    }

    const { data, error } = await supabase
      .from('orders')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    // Log the status change for auditing
    await logOrderStatusChange(id, currentOrder.status, status, updatedBy);

    // Send status update email
    await emailService.sendOrderStatusUpdate(data);

    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
};

/**
 * Update order
 */
export const updateOrder = async (id: string, updates: Partial<Order>): Promise<ApiResponse<Order>> => {
  try {
    const { data, error } = await supabase
      .from('orders')
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
 * Delete order
 */
export const deleteOrder = async (id: string): Promise<ApiResponse<void>> => {
  try {
    const { error } = await supabase
      .from('orders')
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

/**
 * Get orders by status
 */
export const getOrdersByStatus = async (status: OrderStatus): Promise<ApiResponse<Order[]>> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('status', status)
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
 * Get orders within a date range
 */
export const getOrdersByDateRange = async (startDate: string, endDate: string): Promise<ApiResponse<Order[]>> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .order('created_at', { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
};
