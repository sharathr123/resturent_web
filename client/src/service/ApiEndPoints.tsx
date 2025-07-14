export const ENV_URL = '/api';
export const REGEX_URL = '';
export const BASE_URL = ENV_URL + REGEX_URL;
export const LogoutLink = '';
export const PAGINATE_BY = 10;

//follow the below example to add your url endpoints

// EXAMPLE : export const getUserDetails = BASE_URL + 'account/get-user-details';
export const RegisterApiUrl = BASE_URL + '/auth/register'
export const LoginApiUrl = BASE_URL + '/auth/login'
export const LogoutApiUrl = BASE_URL + '/auth/logout'
export const AccessTokenApiUrl = BASE_URL + '/identity-manager/generate-access-token'
export const GenderApiUrl = BASE_URL + '/identity-manager/genders'
export const MaritalStatusApiUrl = BASE_URL + '/identity-manager/marital-statuses'
export const EmployeeCreateApiUrl = BASE_URL + '/identity-manager/user'
