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
 * Sign up a new user
 * @param name User's name
 * @param email User's email
 * @param password User's password
 * @param role User's role (optional, defaults to 'customer').
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
    log.log('Starting login process for:', maskEmail(email)); // Updated message

    log.debug('Attempting signInWithPassword with Supabase Auth...'); // Added debug log

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    log.debug('signInWithPassword call returned.'); // Added debug log

    if (error) {
      log.error('Supabase authentication failed:', error.message); // Updated error log message
      // Check for specific error codes that might inform the user
      if (error.message.includes('email not confirmed') || error.status === 400) {
        return {
          success: false,
          error: 'Por favor, confirme seu email antes de fazer login. Verifique sua caixa de spam ou entre em contato conosco se o problema persistir.'
        };
      }
      errorHandler.handle(error, 'authService.loginWithEmail');
      return { success: false, error: errorHandler.getUserMessage(error) || 'Falha na autenticação. Verifique suas credenciais.' }; // Enhanced generic auth failure message
    }

    if (!data.user) {
      const error = new Error('No user returned after successful authentication'); // Updated error message
      errorHandler.handle(error, 'authService.loginWithEmail');
      return { success: false, error: 'Usuário não encontrado ou problema interno no servidor.' }; // Enhanced user-friendly message
    }

    log.log('Supabase authentication successful, user ID:', maskId(data.user.id));

    // Fetch role and name from public.users table
    log.debug('Fetching user data from public.users with auth_user_id:', data.user.id);
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, role, name')
      .eq('auth_user_id', data.user.id)
      .single();

    if (userError) {
      log.error('Error fetching user data from public.users:', userError);
      // This could be an RLS policy issue.
      errorHandler.handle(userError, 'authService.loginWithEmail.fetchUserData');
      return { success: false, error: 'Falha ao carregar dados do perfil do usuário. Verifique as permissões do banco de dados (RLS).' };
    }

    if (!userData) {
      log.warn('No user record found in public.users for auth_user_id:', data.user.id);
      return { success: false, error: 'Perfil de usuário não encontrado. Entre em contato com o suporte.' };
    }
    
    log.debug('User data from public.users fetched successfully:', userData);

    const authUser: AuthUser = {
      id: data.user.id,
      dbId: userData?.id,
      email: data.user.email || email,
      role: userData?.role || 'customer',
      name: userData?.name
    };

    if (authUser.dbId) {
      try {
        // Do not await this call. Let it run in the background.
        loggerService.logLogin(authUser.dbId);
      } catch (logError) {
        errorHandler.handle(logError as Error, 'authService.loginWithEmail.logActivity');
      }
    }

    return { success: true, data: authUser };
  } catch (err) {
    log.error('An unexpected error occurred during the login process:', err); // Updated error log message
    // Provide a more user-friendly error message for unexpected errors
    return {
      success: false,
      error: 'Ocorreu um erro inesperado durante o login. Por favor, tente novamente mais tarde ou entre em contato com o suporte.'
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
