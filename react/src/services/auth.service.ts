import api from '../lib/api';
import type {
  AuthResponse,
  LoginCredentials,
  RegisterCredentials,
  User,
  ApiResponse,
} from '../types';

export const authService = {
  // Inscription
  async register(data: RegisterCredentials): Promise<ApiResponse<{ user_id: string }>> {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  // Connexion
  async login(data: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  // Rafraîchir le token
  async refresh(refreshToken: string): Promise<{ access_token: string }> {
    const response = await api.post('/auth/refresh', {}, {
      headers: { Authorization: `Bearer ${refreshToken}` },
    });
    return response.data;
  },

  // Vérifier l'email
  async verifyEmail(token: string): Promise<ApiResponse> {
    const response = await api.get(`/auth/verify/${token}`);
    return response.data;
  },

  // Renvoyer l'email de vérification
  async resendVerification(): Promise<ApiResponse> {
    const response = await api.post('/auth/resend-verification');
    return response.data;
  },

  // Obtenir le profil
  async getProfile(): Promise<{ user: User }> {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Modifier le profil
  async updateProfile(data: Partial<Pick<User, 'username' | 'email'>>): Promise<{ user: User }> {
    const response = await api.patch('/auth/me', data);
    return response.data;
  },

  // Changer le mot de passe
  async changePassword(oldPassword: string, newPassword: string): Promise<ApiResponse> {
    const response = await api.patch('/auth/me/password', {
      old_password: oldPassword,
      new_password: newPassword,
    });
    return response.data;
  },

  // Supprimer le compte
  async deleteAccount(): Promise<ApiResponse> {
    const response = await api.delete('/auth/me');
    return response.data;
  },

  // Déconnexion (côté client uniquement)
  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },
};