/** @param {{ config: import('expo/config').ExpoConfig }} ctx */
module.exports = ({ config }) => {
  const raw = (process.env.APP_ENV || process.env.EXPO_PUBLIC_APP_ENV || 'development').toLowerCase()
  const appEnv = raw === 'production' || raw === 'prod' ? 'production' : 'development'
  const isProd = appEnv === 'production'

  const strip = (value) => value?.trim().replace(/\/$/, '') || ''
  const apiBase = strip(
    isProd
      ? process.env.EXPO_PUBLIC_API_BASE_PROD
      : process.env.EXPO_PUBLIC_API_BASE_DEV || process.env.EXPO_PUBLIC_API_BASE,
  )

  process.env.EXPO_PUBLIC_APP_ENV = appEnv
  if (apiBase) process.env.EXPO_PUBLIC_API_BASE = apiBase

  return {
    ...config,
    name: isProd ? 'CricLab' : 'CricLab Dev',
    extra: {
      ...config.extra,
      appEnv,
      apiBase: apiBase || config.extra?.apiBase || null,
    },
  }
}
