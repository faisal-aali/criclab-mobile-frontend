import { authFetch, clearTokens, getStoredRefreshToken, publicFetch, type TokenBundle } from './http'

export type { AuthUser, TokenBundle } from './http'

export type PendingVerification = { status: 'pending_verification'; message: string; email: string }
export type SignInResult = ({ status: 'ok' } & TokenBundle) | PendingVerification

export const auth = {
  signUp: (name: string, email: string, password: string) =>
    publicFetch<PendingVerification>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),

  signIn: (email: string, password: string) =>
    publicFetch<SignInResult>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  verifyEmail: (email: string, code: string) =>
    publicFetch<{ status: string } & TokenBundle>('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    }),

  resendOtp: (email: string, purpose: 'verify_email' | 'reset_password' = 'verify_email') =>
    publicFetch<{ status: string; message: string }>('/auth/resend-otp', {
      method: 'POST',
      body: JSON.stringify({ email, purpose }),
    }),

  forgotPassword: (email: string) =>
    publicFetch<{ status: string; message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  resetPassword: (email: string, code: string, password: string) =>
    publicFetch<{ status: string; message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, code, password }),
    }),

  me: () => authFetch<{ user: import('./http').AuthUser }>('/auth/me'),

  changePassword: (current_password: string, new_password: string) =>
    authFetch<{ status: string; sessions_ended: number } & import('./http').TokenBundle>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ current_password, new_password }),
    }),

  signOutEverywhere: () => authFetch<{ status: string }>('/auth/logout-all', { method: 'POST' }),

  signOut: async () => {
    const stored = await getStoredRefreshToken()
    if (stored) {
      try {
        await publicFetch('/auth/logout', {
          method: 'POST',
          body: JSON.stringify({ refresh_token: stored }),
        })
      } catch {
        /* local session ends regardless */
      }
    }
    await clearTokens()
  },
}
