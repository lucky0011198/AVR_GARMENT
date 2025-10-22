// services/authService.ts
import { supabase } from '@/lib/supabase';
import type { 
  UserRole, 
  UserProfile, 
  LoginCredentials,
} from '../types/auth.types';


class AuthService {

  async canAccessUserList(): Promise<boolean> {
    try {
      const user = await this.getCurrentUser();
      return user ? this.hasAnyRole(user, ['admin', 'distributor']) : false;
    } catch (error) {
      return false;
    }
  }
  /**
   * Sign up a new user - roles stored in user_metadata
   */
  async signup({ email, password }: LoginCredentials): Promise<UserProfile> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            roles: ['users'] // Store default role in user_metadata
          }
        }
      });

      if (error) throw error;
      if (!data.user) throw new Error('User creation failed');

      return {
        id: data.user.id,
        email: data.user.email!,
        roles: data.user.user_metadata?.roles || ['users'],
        created_at: data.user.created_at,
        email_confirmed: data.user.email_confirmed_at ? true : false,
      };
    } catch (error) {
      console.error('Signup error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Login user - roles come from user_metadata
   */
  async login({ email, password }: LoginCredentials): Promise<UserProfile> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      if (!data.user || !data.session) throw new Error('Login failed');

      return {
        id: data.user.id,
        email: data.user.email!,
        roles: data.user.user_metadata?.roles || ['users'],
        created_at: data.user.created_at,
        email_confirmed: data.user.email_confirmed_at ? true : false,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get currently logged-in user
   */
  async getCurrentUser(): Promise<UserProfile | null> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error) throw error;
      if (!user) return null;

      return {
        id: user.id,
        email: user.email!,
        roles: user.user_metadata?.roles || ['users'],
        created_at: user.created_at,
        email_confirmed: user.email_confirmed_at ? true : false,
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update user roles (admin only)
   */
  async updateUserRoles(userId: string, roles: UserRole[]): Promise<void> {
    try {
      const { error } = await supabase.auth.admin.updateUserById(userId, {
        user_metadata: { roles }
      });

      if (error) throw error;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Add role to user (admin only)
   */
  async addRoleToUser(userId: string, role: UserRole): Promise<void> {
    try {
      // Get current user
      const { data: { user }, error: getUserError } = await supabase.auth.admin.getUserById(userId);
      
      if (getUserError) throw getUserError;
      if (!user) throw new Error('User not found');

      const currentRoles = user.user_metadata?.roles || ['users'];
      
      // Add role if not already present
      if (!currentRoles.includes(role)) {
        const newRoles = [...currentRoles, role];
        await this.updateUserRoles(userId, newRoles);
      }
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Remove role from user (admin only)
   */
  async removeRoleFromUser(userId: string, role: UserRole): Promise<void> {
    try {
      const { data: { user }, error: getUserError } = await supabase.auth.admin.getUserById(userId);
      
      if (getUserError) throw getUserError;
      if (!user) throw new Error('User not found');

      const currentRoles = user.user_metadata?.roles || ['users'];
      const newRoles = currentRoles.filter((r: UserRole) => r !== role);
      
      // Ensure at least one role remains
      if (newRoles.length === 0) {
        throw new Error('User must have at least one role');
      }
      
      await this.updateUserRoles(userId, newRoles);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get all users with their roles (admin only)
   */
// services/authService.ts

/**
 * Get all users (admin and distributor can access)
 * Reads roles directly from user_metadata
 */
/**
 * Get all users - check access from user metadata roles
 */
async getAllUsers(): Promise<UserProfile[]> {
  try {
    // Get current user and check roles from metadata
    const currentUser = await this.getCurrentUser();
    console.log('Current User:', currentUser);
    
    if (!currentUser) {
      throw new Error('Not authenticated');
    }

    // Check if user has admin or distributor role in their metadata
    const hasAccess = currentUser.roles.includes('admin') || 
                      currentUser.roles.includes('distributor');
    
    if (!hasAccess) {
      throw new Error('Access denied: Only admins and distributors can view user list');
    }

    // Call RPC function to get all users
    const { data, error } = await supabase.rpc('get_all_users_list');
    
    if (error) {
      throw new Error(`Failed to fetch users: ${error.message}`);
    }

    // Map and return users with roles from metadata
    return (data || []).map((user: any) => ({
      id: user.user_id,
      email: user.email,
      roles: Array.isArray(user.roles) ? user.roles : ['users'],
      created_at: user.created_at,
      email_confirmed: user.email_confirmed_at ? true : false,
    }));
  } catch (error) {
    console.error('getAllUsers error:', error);
    throw this.handleError(error);
  }
}


  /**
   * Get all users emails only
   */
  async getAllUsersEmails(): Promise<Array<{ id: string; email: string }>> {
    try {
      const users = await this.getAllUsers();
      return users.map(user => ({
        id: user.id,
        email: user.email,
      }));
    } catch (error) {
      console.error('getAllUsersEmails error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Search users by email
   */
  async searchUsersByEmail(emailQuery: string): Promise<UserProfile[]> {
    try {
      const allUsers = await this.getAllUsers();
      return allUsers.filter(user => 
        user.email.toLowerCase().includes(emailQuery.toLowerCase())
      );
    } catch (error) {
      console.error('searchUsersByEmail error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Check if user has specific role
   */
  hasRole(userProfile: UserProfile | null, role: UserRole): boolean {
    if (!userProfile) return false;
    return userProfile.roles.includes(role);
  }

  /**
   * Check if user has any of the specified roles
   */
  hasAnyRole(userProfile: UserProfile | null, roles: UserRole[]): boolean {
    if (!userProfile) return false;
    return roles.some(role => userProfile.roles.includes(role));
  }

  /**
   * Check if user has all specified roles
   */
  hasAllRoles(userProfile: UserProfile | null, roles: UserRole[]): boolean {
    if (!userProfile) return false;
    return roles.every(role => userProfile.roles.includes(role));
  }

  /**
   * Listen to auth state changes
   */
  onAuthStateChange(callback: (user: UserProfile | null) => void) {
    return supabase.auth.onAuthStateChange(async (_, session) => {
      if (session?.user) {
        callback({
          id: session.user.id,
          email: session.user.email!,
          roles: session.user.user_metadata?.roles || ['users'],
          created_at: session.user.created_at,
          email_confirmed: session.user.email_confirmed_at ? true : false,
        });
      } else {
        callback(null);
      }
    });
  }

  /**
   * Handle errors consistently
   */
  private handleError(error: any): Error {
    if (error instanceof Error) return error;
    if (typeof error === 'string') return new Error(error);
    if (error?.message) return new Error(error.message);
    return new Error('An unexpected error occurred');
  }
}

export const authService = new AuthService();
