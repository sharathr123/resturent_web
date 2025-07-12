// src/services/localStorageService.ts

const USER_DETAILS = 'USER_DETAILS';
const COMPANY_DETAILS = 'COMPANY_DETAILS';
const LANGUAGE_DETAILS = 'LANGUAGE_DETAILS';

export const getToken = (): string | null => {
  const json = localStorage.getItem("token");
  return json ? JSON.parse(json) : null;
};

export const setToken = (data: any) => {
  return localStorage.setItem("token", JSON.stringify(data));
};

export const removeToken = () => {
  return localStorage.removeItem('token');
};

export const setUserDetails = (data: any) => {
  localStorage.setItem(USER_DETAILS, JSON.stringify(data));
};

export const getUserDetails = (): any | null => {
  const json = localStorage.getItem(USER_DETAILS);
  return json ? JSON.parse(json) : null;
};

export const removeUserDetails = () => {
  localStorage.removeItem(USER_DETAILS);
};

export const setCompanyDetails = (data: any) => {
  localStorage.setItem(COMPANY_DETAILS, JSON.stringify(data));
};

export const getCompanyDetails = (): any | null => {
  const json = localStorage.getItem(COMPANY_DETAILS);
  return json ? JSON.parse(json) : null;
};

export const removeCompanyDetails = () => {
  localStorage.removeItem(COMPANY_DETAILS);
};

export const setLanguageDetails = (langId: number) => {
  localStorage.setItem(LANGUAGE_DETAILS, langId.toString());
};

export const getLanguageDetails = (): number => {
  const lang = localStorage.getItem(LANGUAGE_DETAILS);
  return lang ? parseInt(lang, 10) : 1; // Default to English
};

export const removeLanguageDetails = () => {
  localStorage.removeItem(LANGUAGE_DETAILS);
};

// ------------------
// ✅ remove All
// ------------------
export const removeAllStorage = () => {
  localStorage.remove();
};

