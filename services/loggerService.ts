import { supabase } from './supabaseClient';
import { errorHandler } from '../utils/errorHandler';

export interface UserActivityLog {
  id: string;
  user_id: string;
  action: string;
  details: any;
  created_at: string;
}

export const loggerService = {
  /**
   * Logs a user activity.
   * @param userId The ID of the user (from public.users table).
   * @param action A string describing the action (e.g., 'LOGIN', 'VIEW_PRODUCT').
   * @param details Optional JSON object with additional details.
   */
  async logActivity(userId: string, action: string, details: any = {}) {
    try {
      const { error } = await supabase
        .from('user_activity_logs')
        .insert({
          user_id: userId,
          action,
          details
        });

      if (error) {
        errorHandler.handle(error, 'loggerService.logActivity');
      }
    } catch (err) {
      errorHandler.handle(err as Error, 'loggerService.logActivity.catch');
    }
  },

  /**
   * Logs a user login event.
   */
  async logLogin(userId: string) {
    await this.logActivity(userId, 'LOGIN', {
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    });
  },

  /**
   * Logs a user logout event.
   */
  async logLogout(userId: string) {
    await this.logActivity(userId, 'LOGOUT', {
      timestamp: new Date().toISOString()
    });
  }
};
