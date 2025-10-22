// types/auth.types.ts
export type UserRole = 'admin' | 'cutting' | 'distributor' | 'users';

export interface UserProfile {
  id: string;
  email: string;
  roles: UserRole[];
  created_at: string;
  email_confirmed: boolean | null;
}

export interface AuthState {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
  roles?: UserRole[];
}

export interface SignupCredentials extends LoginCredentials {
  roles?: UserRole[];
}
