// src/utils/auth.ts
export const getToken = (): string | null => {
  return localStorage.getItem('jwt');
};
