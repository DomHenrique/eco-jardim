import { supabase } from './supabaseClient';
import { Session } from '@supabase/supabase-js';
import { loggerService } from './loggerService';
import { emailService } from './emailService';
import { ApiResponse } from '../types';
import { logger } from '../utils/logger';
import { errorHandler } from '../utils/errorHandler';
import { maskEmail, maskId } from '../utils/sanitize';

const log = logger.withContext('authService');

export interface AuthUser {
  id: string; // Supabase Auth ID
  dbId?: string; // public.users ID
  email: string;
  role?: string;
  name?: string;
}

/**
 * Validate admin token from environment
 * @param token The token to validate
 * @returns true if token is valid, false otherwise
 */
export const validateAdminToken = (token: string): boolean => {
  const adminToken = import.meta.env.VITE_ADMIN_TOKEN;
  
  if (!adminToken) {
    log.warn('Admin token not configured in environment');
    return false;
  }
  
  const isValid = token === adminToken && token.trim() !== '';
  
  if (!isValid) {
    log.warn('Invalid admin token attempt');
  }
  
  return isValid;
};

/**
 * Sign up a new user
 * @param name User's name
 * @param email User's email
 * @param password User's password
 * @param role User's role (optional, defaults to 'customer'). For 'employee' or 'admin', adminToken is required
 * @param adminToken Admin token for creating employee/admin accounts (required if role is not 'customer')
 */
export const signUp = async (
  name: string,
  email: string,
  password: string,
  role?: string,
  adminToken?: string
): Promise<ApiResponse<AuthUser>> => {
  try {
    log.log('Starting signup process for:', maskEmail(email));
    
    // Determine user role - default to 'customer'
    const userRole = role || 'customer';
    
    // Validate admin token if trying to create employee or admin
    if ((userRole === 'employee' || userRole === 'admin') && !adminToken) {
      const error = 'Token administrativo obrigatório para criar usuário de funcionário';
      log.warn('Signup attempt without admin token for role:', userRole);
      return { success: false, error };
    }
    
    if ((userRole === 'employee' || userRole === 'admin') && !validateAdminToken(adminToken!)) {
      const error = 'Token administrativo inválido';
      log.warn('Signup attempt with invalid admin token for role:', userRole);
      return { success: false, error };
    }
    
    // 1. Sign up with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });

    if (error) {
      errorHandler.handle(error, 'authService.signUp');
      return { success: false, error: errorHandler.getUserMessage(error) };
    }

    if (!data.user) {
      const error = new Error('No user returned from Supabase');
      errorHandler.handle(error, 'authService.signUp');
      return { success: false, error: 'Falha ao criar conta' };
    }

    log.log('User created in auth:', maskId(data.user.id));

    // 2. Create user in public.users table
    // Check if user already exists (in case of previous partial signup)
    log.log('Checking for existing user in public.users...');
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('auth_user_id', data.user.id)
      .single();

    let dbId = existingUser?.id;

    if (!existingUser) {
      log.log('Creating new user in public.users...');
      const { data: newUser, error: dbError } = await supabase
        .from('users')
        .insert({
          auth_user_id: data.user.id,
          name: name,
          email: email,
          role: userRole
        })
        .select()
        .single();

      if (dbError) {
        errorHandler.handle(dbError, 'authService.signUp.createUser');
        return { success: false, error: 'Erro ao criar perfil de usuário' };
      }
      log.log('User created in public.users:', maskId(newUser.id));
      dbId = newUser.id;
    } else {
      log.log('User already exists in public.users:', maskId(existingUser.id));
    }

    const authUser: AuthUser = {
      id: data.user.id,
      dbId: dbId,
      email: data.user.email || email,
      role: userRole,
      name: name
    };

    // Log login (signup implies login in many flows, but Supabase might require email confirmation. 
    // If session is established, we log it. If not, we don't.)
    if (data.session && authUser.dbId) {
        loggerService.logLogin(authUser.dbId);
        // Send welcome email (don't block signup if email fails)
        try {
          await emailService.sendWelcomeEmail({ 
            email: authUser.email, 
            name: authUser.name || 'Cliente', 
            id: authUser.dbId 
          });
        } catch (emailError) {
          errorHandler.handle(emailError as Error, 'authService.signUp.sendWelcomeEmail');
        }
    }

    return { success: true, data: authUser };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Erro desconhecido',
    };
  }
};

export const loginWithEmail = async (email: string, password: string): Promise<ApiResponse<AuthUser>> => {
  try {
    log.log('Starting login for:', maskEmail(email));

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      log.error('Supabase auth error:', error);
      // Check for specific error codes that might inform the user
      if (error.message.includes('email not confirmed') || error.status === 400) {
        // This might indicate email confirmation is required
        return {
          success: false,
          error: 'Por favor, confirme seu email antes de fazer login. Se você não recebeu o email de confirmação, verifique sua caixa de spam ou entre em contato conosco.'
        };
      }
      errorHandler.handle(error, 'authService.loginWithEmail');
      return { success: false, error: errorHandler.getUserMessage(error) };
    }

    if (!data.user) {
      const error = new Error('No user returned');
      errorHandler.handle(error, 'authService.loginWithEmail');
      return { success: false, error: 'Usuário não encontrado' };
    }

    log.log('Auth successful, user ID:', maskId(data.user.id));

    // Fetch role and name from public.users table
    log.log('Fetching user data from public.users...');
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, role, name')
      .eq('auth_user_id', data.user.id)
      .single();

    if (userError) {
      log.error('Error fetching user data from public.users:', userError);
      errorHandler.handle(userError, 'authService.loginWithEmail.fetchUserData');
      // Don't fail login if we can't fetch user data, use defaults
      const authUser: AuthUser = {
        id: data.user.id,
        dbId: undefined,
        email: data.user.email || email,
        role: 'customer',
        name: data.user.email?.split('@')[0]
      };
      return { success: true, data: authUser };
    }

    log.log('User data fetched successfully');

    const authUser: AuthUser = {
      id: data.user.id,
      dbId: userData?.id,
      email: data.user.email || email,
      role: userData?.role || 'customer',
      name: userData?.name
    };

    if (authUser.dbId) {
      try {
        await loggerService.logLogin(authUser.dbId);
      } catch (logError) {
        errorHandler.handle(logError as Error, 'authService.loginWithEmail.logActivity');
      }
    }

    return { success: true, data: authUser };
  } catch (err) {
    log.error('Unexpected error during login:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Erro desconhecido',
    };
  }
};

export const logout = async (): Promise<void> => {
  // We might want to log logout here, but we need the user ID. 
  // Ideally, the caller should handle logging before calling this, or we fetch the user first.
  // For simplicity, we'll rely on the client-side context to handle the logout logging if possible, 
  // or just accept that logout might not be logged if session is already gone.
  await supabase.auth.signOut();
};

export const getCurrentUser = async (): Promise<AuthUser | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, role, name')
      .eq('auth_user_id', user.id)
      .single();

    const authUser: AuthUser = {
      id: user.id,
      dbId: userData?.id,
      email: user.email || '',
      role: userData?.role || 'customer',
      name: userData?.name
    };

    return authUser;
  } catch (error) {
    return null;
  }
};

export const onAuthStateChange = (callback: (user: AuthUser | null) => void) => {
  return supabase.auth.onAuthStateChange(async (event, session) => {
    if (session?.user) {
      const { data: userData } = await supabase
        .from('users')
        .select('id, role, name')
        .eq('auth_user_id', session.user.id)
        .single();

      const authUser: AuthUser = {
        id: session.user.id,
        dbId: userData?.id,
        email: session.user.email || '',
        role: userData?.role || 'customer',
        name: userData?.name
      };
      callback(authUser);
    } else {
      callback(null);
    }
  });
};

export const isEmployee = (user: AuthUser): boolean => {
  return user.role === 'employee' || user.role === 'admin';
};
