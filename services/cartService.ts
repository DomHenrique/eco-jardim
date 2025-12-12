import { supabase } from './supabaseClient';
import { CartItem } from '../types';
import { errorHandler } from '../utils/errorHandler';
import { emailService } from './emailService';

export const cartService = {
  /**
   * Saves the cart to the database.
   * @param userId The ID of the user (from public.users table).
   * @param items The cart items to save.
   */
  async saveCart(userId: string, items: CartItem[]) {
    try {
      // Check if user already has a cart
      const { data: existingCart } = await supabase
        .from('carts')
        .select('id')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      if (existingCart) {
        // Update existing cart
        await supabase
          .from('carts')
          .update({ items: items, updated_at: new Date().toISOString() })
          .eq('id', existingCart.id);
      } else {
        // Create new cart
        await supabase
          .from('carts')
          .insert({
            user_id: userId,
            items: items,
            status: 'active'
          });
      }
    } catch (err) {
      errorHandler.handle(err as Error, 'cartService.saveCart');
    }
  },

  /**
   * Loads the active cart for a user.
   * @param userId The ID of the user.
   * @returns The cart items or null if no active cart found.
   */
  async loadCart(userId: string): Promise<CartItem[] | null> {
    try {
      const { data } = await supabase
        .from('carts')
        .select('items')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      if (data && data.items) {
        return data.items as CartItem[];
      }
      return null;
    } catch (err) {
      errorHandler.handle(err as Error, 'cartService.loadCart');
      return null;
    }
  },

  /**
   * Clears (empties) the cart for a user by marking it as completed.
   * @param userId The ID of the user.
   */
  async clearCart(userId: string) {
    try {
      // Get the active cart
      const { data: cart } = await supabase
        .from('carts')
        .select('id')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      if (cart) {
        // Mark cart as completed
        await supabase
          .from('carts')
          .update({ status: 'completed', updated_at: new Date().toISOString() })
          .eq('id', cart.id);
      }
    } catch (err) {
      errorHandler.handle(err as Error, 'cartService.clearCart');
    }
  },

  /**
   * Mark cart as abandoned and send notification email.
   * Should be called when cart has been inactive for a set period.
   * @param userId The ID of the user.
   */
  async markAndNotifyAbandonedCart(userId: string) {
    try {
      // Get the active cart with user info
      const { data: cartData } = await supabase
        .from('carts')
        .select('id, items, users(id, name, email)')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      if (!cartData) {
        return;
      }

      // Mark cart as abandoned
      await supabase
        .from('carts')
        .update({ status: 'abandoned', updated_at: new Date().toISOString() })
        .eq('id', cartData.id);

      // Send abandoned cart email notification
      // @ts-ignore - Supabase relation returns user data
      if (cartData.users && cartData.items && cartData.items.length > 0) {
        const users = Array.isArray(cartData.users) ? cartData.users[0] : cartData.users;
        const user = {
          id: users.id,
          name: users.name,
          email: users.email
        };
        await emailService.sendAbandonedCartEmail(user, cartData.items as CartItem[]);
      }
    } catch (err) {
      errorHandler.handle(err as Error, 'cartService.markAndNotifyAbandonedCart');
    }
  }
};
