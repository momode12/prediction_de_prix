import api from "@/lib/api";
import {
  LoginPayload,
  RegisterPayload,
  UpdateProfilePayload,
  ChangePasswordPayload,
  LoginResponse,
  RegisterResponse,
  ProfileResponse,
  TOKEN_KEYS,
} from "@/types";

const AuthService = {
  // ════════════════════════════════════════
  // REGISTER
  // ════════════════════════════════════════
  register: async (payload: RegisterPayload): Promise<RegisterResponse> => {
    const { data } = await api.post<RegisterResponse>(
      "/auth/register",
      payload,
    );
    return data;
  },

  // ════════════════════════════════════════
  // LOGIN
  // ════════════════════════════════════════
  login: async (payload: LoginPayload): Promise<LoginResponse> => {
    const { data } = await api.post<LoginResponse>("/auth/login", payload);

    // ── Stockage tokens + user dans localStorage
    localStorage.setItem(TOKEN_KEYS.ACCESS, data.access_token);
    localStorage.setItem(TOKEN_KEYS.REFRESH, data.refresh_token);
    localStorage.setItem(TOKEN_KEYS.USER, JSON.stringify(data.user));

    return data;
  },

  // ════════════════════════════════════════
  // LOGOUT — nettoyage localStorage
  // ════════════════════════════════════════
  logout: (): void => {
    localStorage.removeItem(TOKEN_KEYS.ACCESS);
    localStorage.removeItem(TOKEN_KEYS.REFRESH);
    localStorage.removeItem(TOKEN_KEYS.USER);
  },

  // ════════════════════════════════════════
  // REFRESH TOKEN
  // ════════════════════════════════════════
  refresh: async (): Promise<string> => {
    const refreshToken = localStorage.getItem(TOKEN_KEYS.REFRESH);
    const { data } = await api.post<{ access_token: string }>(
      "/auth/refresh",
      {},
      {
        headers: {
          Authorization: `Bearer ${refreshToken}`,
        },
      },
    );
    localStorage.setItem(TOKEN_KEYS.ACCESS, data.access_token);
    return data.access_token;
  },

  // ════════════════════════════════════════
  // VERIFY EMAIL
  // ════════════════════════════════════════
  verifyEmail: async (token: string): Promise<{ message: string }> => {
    const { data } = await api.get<{ success: boolean; message: string }>(
      `/auth/verify/${token}`,
    );
    return data;
  },

  // ════════════════════════════════════════
  // RESEND VERIFICATION
  // ════════════════════════════════════════
  resendVerification: async (email?: string): Promise<{ message: string }> => {
    const { data } = await api.post<{ success: boolean; message: string }>(
      "/auth/resend-verification",
      email ? { email } : {},
    );
    return data;
  },

  // ════════════════════════════════════════
  // GET PROFIL
  // ════════════════════════════════════════
  getProfile: async (): Promise<ProfileResponse> => {
    const { data } = await api.get<ProfileResponse>("/auth/me");
    return data;
  },

  // ════════════════════════════════════════
  // UPDATE PROFIL
  // ════════════════════════════════════════
  updateProfile: async (
    payload: UpdateProfilePayload,
  ): Promise<ProfileResponse> => {
    const { data } = await api.patch<ProfileResponse>("/auth/me", payload);

    // ── Mettre à jour le user dans localStorage
    const stored = localStorage.getItem(TOKEN_KEYS.USER);
    if (stored) {
      const current = JSON.parse(stored);
      localStorage.setItem(
        TOKEN_KEYS.USER,
        JSON.stringify({ ...current, ...data.user }),
      );
    }

    return data;
  },

  // ════════════════════════════════════════
  // CHANGE PASSWORD
  // ════════════════════════════════════════
  changePassword: async (
    payload: ChangePasswordPayload,
  ): Promise<{ message: string }> => {
    const { data } = await api.patch<{ success: boolean; message: string }>(
      "/auth/me/password",
      payload,
    );
    return data;
  },

  // ════════════════════════════════════════
  // DELETE COMPTE
  // ════════════════════════════════════════
  deleteAccount: async (): Promise<{ message: string }> => {
    const { data } = await api.delete<{ success: boolean; message: string }>(
      "/auth/me",
    );

    // ── Vider localStorage après suppression
    localStorage.removeItem(TOKEN_KEYS.ACCESS);
    localStorage.removeItem(TOKEN_KEYS.REFRESH);
    localStorage.removeItem(TOKEN_KEYS.USER);

    return data;
  },

  // ════════════════════════════════════════
  // GET USER DEPUIS LOCALSTORAGE
  // ════════════════════════════════════════
  getStoredUser: () => {
    const stored = localStorage.getItem(TOKEN_KEYS.USER);
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  },

  // ════════════════════════════════════════
  // VERIFIER SI CONNECTE
  // ════════════════════════════════════════
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem(TOKEN_KEYS.ACCESS);
  },
};

export default AuthService;
