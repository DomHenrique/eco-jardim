import { supabase } from './supabaseClient';
import { logger } from '../utils/logger';
import { errorHandler } from '../utils/errorHandler';
import { maskEmail } from '../utils/sanitize';
import { BRAND, CONTACT, EMAIL } from '../config';

const log = logger.withContext('emailService');
import { Order, CartItem } from '../types';
import {
  getWelcomeEmailTemplate,
  getOrderConfirmationTemplate,
  getOrderStatusUpdateTemplate,
  getAbandonedCartTemplate,
  getBudgetNotificationTemplate,
  getBudgetStatusUpdateTemplate
} from '../utils/emailTemplates';
import { Budget } from '../types';
import { loggerService } from './loggerService';

// Email configuration
const EMAIL_FROM = `${process.env.VITE_EMAIL_FROM_NAME || BRAND.companyName} <${process.env.VITE_SMTP_USER || CONTACT.emailNoreply}>`;

/**
 * Validates email format
 */
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Fetch customer email from customer_id
 */
const getCustomerEmail = async (customerId: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('email')
      .eq('id', customerId)
      .single();

    if (error || !data) {
      log.error(`Failed to fetch customer email for ID: ${customerId}`);
      return null;
    }

    return data.email;
  } catch (error) {
    log.error('Error fetching customer email:', error);
    return null;
  }
};

export const emailService = {
  /**
   * Generic function to send an email
   * Note: This is a client-side mock. In production, you should call a backend API endpoint
   * that handles the actual email sending using nodemailer or another service.
   */
  async sendEmail(to: string, subject: string, html: string): Promise<boolean> {
    try {
      // Validate email format
      if (!isValidEmail(to)) {
        log.error(`Invalid email format: ${maskEmail(to)}`);
        errorHandler.handle(new Error(`Invalid email format: ${to}`), 'emailService.sendEmail');
        return false;
      }

      log.log('Sending email to', maskEmail(to));
      log.log('Subject:', subject);
      log.log('From:', EMAIL_FROM);

      // TODO: In production, call your backend API endpoint to send emails
      // Example:
      /*
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, subject, html, from: EMAIL_FROM })
      });
      
      if (!response.ok) {
        throw new Error('Failed to send email');
      }
      */

      // For now, we just log the email (development mode)
      log.log('[EmailService] Email would be sent (mock mode)');
      log.log('[EmailService] Configure a backend API endpoint to send real emails');
      
      return true;
    } catch (error) {
      errorHandler.handle(error as Error, 'emailService.sendEmail');
      throw error;
    }
  },

  /**
   * Send welcome email to new user
   */
  async sendWelcomeEmail(user: { email: string; name: string; id: string }): Promise<boolean> {
    try {
      const html = getWelcomeEmailTemplate(user.name);
      const success = await this.sendEmail(user.email, `Bem-vindo à ${BRAND.companyName}!`, html);
      
      if (success) {
        await loggerService.logActivity(user.id, 'EMAIL_SENT', { type: 'WELCOME' });
      }
      
      return success;
    } catch (error) {
      errorHandler.handle(error as Error, 'emailService.sendWelcomeEmail');
      return false;
    }
  },

  /**
   * Send order confirmation email
   */
  async sendOrderConfirmation(order: Order): Promise<boolean> {
    try {
      const html = getOrderConfirmationTemplate(order);
      const success = await this.sendEmail(order.userInfo.email, `Confirmação do Pedido #${order.id}`, html);
      
      if (success) {
        await loggerService.logActivity(order.user_id, 'EMAIL_SENT', { type: 'ORDER_CONFIRMATION', orderId: order.id });
      }

      return success;
    } catch (error) {
      errorHandler.handle(error as Error, 'emailService.sendOrderConfirmation');
      return false;
    }
  },

  /**
   * Send order status update email
   */
  async sendOrderStatusUpdate(order: Order): Promise<boolean> {
    try {
      const html = getOrderStatusUpdateTemplate(order);
      const success = await this.sendEmail(order.userInfo.email, `Atualização do Pedido #${order.id}`, html);
      
      if (success) {
        await loggerService.logActivity(order.user_id, 'EMAIL_SENT', { type: 'ORDER_STATUS_UPDATE', orderId: order.id, status: order.status });
      }

      return success;
    } catch (error) {
      errorHandler.handle(error as Error, 'emailService.sendOrderStatusUpdate');
      return false;
    }
  },

  /**
   * Send abandoned cart alert
   */
  async sendAbandonedCartEmail(user: { email: string; name: string; id: string }, items: CartItem[]): Promise<boolean> {
    try {
      const checkoutUrl = `${window.location.origin}/cart`;
      const html = getAbandonedCartTemplate(items, checkoutUrl);
      const success = await this.sendEmail(user.email, 'Você esqueceu itens no seu carrinho!', html);
      
      if (success) {
        await loggerService.logActivity(user.id, 'EMAIL_SENT', { type: 'ABANDONED_CART' });
      }

      return success;
    } catch (error) {
      errorHandler.handle(error as Error, 'emailService.sendAbandonedCartEmail');
      return false;
    }
  },

  /**
   * Check for abandoned carts and send emails
   * This should ideally be run by a backend cron job or scheduled task
   */
  async checkAndSendAbandonedCartEmails() {
    try {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

      const { data: carts, error } = await supabase
        .from('carts')
        .select('*, users(name, email)')
        .eq('status', 'active')
        .lt('updated_at', oneDayAgo)
        .gt('updated_at', twoDaysAgo)
        .limit(100) // Limit to prevent memory issues
        .order('updated_at', { ascending: false });

      if (error) {
        errorHandler.handle(error, 'emailService.checkAndSendAbandonedCartEmails - fetching carts');
        return;
      }

      if (carts && carts.length > 0) {
        log.log(`Found ${carts.length} abandoned carts`);
        
        for (const cart of carts) {
          if (cart.users) {
            // @ts-ignore
            const user = { id: cart.user_id, email: cart.users.email, name: cart.users.name };
            await this.sendAbandonedCartEmail(user, cart.items as CartItem[]);
          }
        }
      }
    } catch (error) {
      console.error('Error checking abandoned carts:', error);
    }
  },

  /**
   * Send budget notification email
   */
  async sendBudgetNotification(budget: Budget) {
    try {
      // Get customer email from customer_id
      const customerEmail = await getCustomerEmail(budget.customer_id);
      
      if (!customerEmail) {
        log.error(`Cannot send budget notification: No email found for customer ${budget.customer_id}`);
        return false;
      }

      const html = getBudgetNotificationTemplate(budget);
      const success = await this.sendEmail(
        customerEmail,
        `Orçamento #${budget.id.substring(0, 8)} criado`,
        html
      );

      if (success && budget.created_by) {
        await loggerService.logActivity(budget.created_by, 'EMAIL_SENT', {
          type: 'BUDGET_NOTIFICATION',
          budgetId: budget.id,
          customerId: budget.customer_id,
          customerEmail: maskEmail(customerEmail)
        });
      }

      return success;
    } catch (error) {
      errorHandler.handle(error as Error, 'emailService.sendBudgetNotification');
      return false;
    }
  },

  /**
   * Send budget status update email
   */
  async sendBudgetStatusUpdate(budget: Budget) {
    try {
      // Get customer email from customer_id
      const customerEmail = await getCustomerEmail(budget.customer_id);
      
      if (!customerEmail) {
        log.error(`Cannot send budget status update: No email found for customer ${budget.customer_id}`);
        return false;
      }

      const html = getBudgetStatusUpdateTemplate(budget);
      const success = await this.sendEmail(
        customerEmail,
        `Atualização de Orçamento #${budget.id.substring(0, 8)}`,
        html
      );

      if (success && budget.created_by) {
        await loggerService.logActivity(budget.created_by, 'EMAIL_SENT', {
          type: 'BUDGET_STATUS_UPDATE',
          budgetId: budget.id,
          status: budget.status,
          customerId: budget.customer_id,
          customerEmail: maskEmail(customerEmail)
        });
      }

      return success;
    } catch (error) {
      errorHandler.handle(error as Error, 'emailService.sendBudgetStatusUpdate');
      return false;
    }
  }
};
