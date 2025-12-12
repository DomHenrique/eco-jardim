import { supabase } from './supabaseClient';
import { Budget, BudgetStatus, Order, ApiResponse, CartItem } from '../types';
import { emailService } from './emailService';

/**
 * Create a new budget/estimate
 */
export const createBudget = async (
  budgetData: Omit<Budget, 'id' | 'created_at' | 'updated_at'>
): Promise<ApiResponse<Budget>> => {
  try {
    const { data, error } = await supabase
      .from('budgets')
      .insert([budgetData])
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    // Send budget notification email
    await emailService.sendBudgetNotification(data);

    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
};

/**
 * Get budget by ID
 */
export const getBudgetById = async (id: string): Promise<ApiResponse<Budget>> => {
  try {
    const { data, error } = await supabase
      .from('budgets')
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
 * List budgets with optional filters
 */
export const listBudgets = async (
  customerId?: string,
  status?: BudgetStatus,
  limit: number = 50,
  offset: number = 0
): Promise<ApiResponse<Budget[]>> => {
  try {
    let query = supabase
      .from('budgets')
      .select('*');

    if (customerId) {
      query = query.eq('customer_id', customerId);
    }

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
 * Update budget status
 */
export const updateBudgetStatus = async (
  id: string,
  status: BudgetStatus,
  updatedBy: string
): Promise<ApiResponse<Budget>> => {
  try {
    // Get current budget to check status transition validity
    const currentBudgetResponse = await getBudgetById(id);
    if (!currentBudgetResponse.success || !currentBudgetResponse.data) {
      return { success: false, error: 'Budget not found' };
    }
    
    const currentBudget = currentBudgetResponse.data;
    
    // Validate status transition
    const isValidTransition = validateBudgetStatusTransition(currentBudget.status, status);
    if (!isValidTransition) {
      return { success: false, error: `Invalid status transition from ${currentBudget.status} to ${status}` };
    }

    const { data, error } = await supabase
      .from('budgets')
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
    await logBudgetStatusChange(id, currentBudget.status, status, updatedBy);

    // Send status update email
    await emailService.sendBudgetStatusUpdate(data);

    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
};

/**
 * Update budget details
 */
export const updateBudget = async (
  id: string,
  updates: Partial<Budget>
): Promise<ApiResponse<Budget>> => {
  try {
    const { data, error } = await supabase
      .from('budgets')
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
 * Delete budget
 */
export const deleteBudget = async (id: string): Promise<ApiResponse<void>> => {
  try {
    const { error } = await supabase
      .from('budgets')
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
 * Convert budget to order
 */
export const convertBudgetToOrder = async (
  budgetId: string,
  userId: string,
  userInfo: any,
  updatedBy: string
): Promise<ApiResponse<Order>> => {
  try {
    // Get the budget
    const budgetResponse = await getBudgetById(budgetId);
    if (!budgetResponse.success || !budgetResponse.data) {
      return { success: false, error: 'Budget not found' };
    }

    const budget = budgetResponse.data;
    
    // Validate that the budget can be converted
    if (budget.status !== 'accepted') {
      return { success: false, error: 'Only accepted budgets can be converted to orders' };
    }

    // Create order from budget
    const orderData = {
      user_id: userId,
      items: budget.items as CartItem[],
      total: budget.total,
      userInfo,
      status: 'confirmed' as any, // Changed from 'confirmed' to 'confirmed' status
      date: new Date().toISOString(),
      budget_id: budgetId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
      .single();

    if (orderError) {
      return { success: false, error: orderError.message };
    }

    // Update the budget status to indicate it's been converted
    await updateBudgetStatus(budgetId, 'accepted', updatedBy);

    // Log the budget to order conversion
    await logBudgetConversion(budgetId, order.id, updatedBy);

    return { success: true, data: order };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
};

/**
 * Validate budget status transition
 */
const validateBudgetStatusTransition = (currentStatus: BudgetStatus, newStatus: BudgetStatus): boolean => {
  const validTransitions: Record<BudgetStatus, BudgetStatus[]> = {
    draft: [BudgetStatus.SENT, BudgetStatus.EXPIRED],
    sent: [BudgetStatus.ACCEPTED, BudgetStatus.REJECTED, BudgetStatus.EXPIRED],
    accepted: [BudgetStatus.ACCEPTED], // Final state, no further transitions needed
    rejected: [BudgetStatus.REJECTED], // Final state
    expired: [BudgetStatus.EXPIRED]    // Final state
  };

  return validTransitions[currentStatus]?.includes(newStatus) || false;
};

/**
 * Log budget status change for audit purposes
 */
const logBudgetStatusChange = async (
  budgetId: string,
  oldStatus: BudgetStatus,
  newStatus: BudgetStatus,
  changedBy: string
): Promise<void> => {
  try {
    const auditLog = {
      table_name: 'budgets',
      record_id: budgetId,
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
    console.error('Error logging budget status change:', err);
  }
};

/**
 * Log budget to order conversion
 */
const logBudgetConversion = async (
  budgetId: string,
  orderId: string,
  convertedBy: string
): Promise<void> => {
  try {
    const auditLog = {
      table_name: 'budgets_to_orders',
      record_id: budgetId,
      action: 'CONVERSION',
      old_data: { budget_id: budgetId },
      new_data: { order_id: orderId },
      changed_by: convertedBy,
      created_at: new Date().toISOString()
    };

    await supabase
      .from('audit_logs')
      .insert([auditLog]);
  } catch (err) {
    console.error('Error logging budget conversion:', err);
  }
};

/**
 * Get budgets by status
 */
export const getBudgetsByStatus = async (status: BudgetStatus): Promise<ApiResponse<Budget[]>> => {
  try {
    const { data, error } = await supabase
      .from('budgets')
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
 * Get expired budgets
 */
export const getExpiredBudgets = async (): Promise<ApiResponse<Budget[]>> => {
  try {
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .lt('valid_until', new Date().toISOString())
      .neq('status', 'accepted')  // Don't include already accepted budgets
      .neq('status', 'rejected')  // Don't include already rejected budgets
      .order('valid_until', { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    // Update expired budgets status
    if (data && data.length > 0) {
      const expiredBudgetIds = data.map(b => b.id);
      await supabase
        .from('budgets')
        .update({ status: BudgetStatus.EXPIRED })
        .in('id', expiredBudgetIds);
    }

    return { success: true, data: data || [] };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
};