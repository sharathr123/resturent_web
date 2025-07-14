// src/services/localStorageService.ts

const USER_DETAILS = 'USER_DETAILS';
const COMPANY_DETAILS = 'COMPANY_DETAILS';
const LANGUAGE_DETAILS = 'LANGUAGE_DETAILS';

export const getToken = (): string | null => {
  try {
    const json = localStorage.getItem("token");
    if (!json || json === 'undefined') return null;
    return JSON.parse(json);
  } catch (err) {
    console.error('Error parsing token from localStorage:', err);
    return null;
  }
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
  try {
    const user = localStorage.getItem(USER_DETAILS);
    if (!user || user === 'undefined') return null; // Prevent parsing invalid JSON
    return JSON.parse(user);
  } catch (err) {
    console.error('Error parsing user from localStorage:', err);
    return null;
  }
};


export const removeUserDetails = () => {
  localStorage.removeItem(USER_DETAILS);
};

export const setCompanyDetails = (data: any) => {
  localStorage.setItem(COMPANY_DETAILS, JSON.stringify(data));
};

export const getCompanyDetails = (): any | null => {
  try {
    const json = localStorage.getItem(COMPANY_DETAILS);
    if (!json || json === 'undefined') return null;
    return JSON.parse(json);
  } catch (err) {
    console.error('Error parsing company details from localStorage:', err);
    return null;
  }
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

