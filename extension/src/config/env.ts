const isDev = import.meta.env.DEV;

export const API_BASE_URL = isDev
  ? 'http://localhost:8080'
  : 'http://120.55.2.225';
