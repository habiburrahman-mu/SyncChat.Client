import { environment } from "@environments/environment";

const BASE_URL = environment.apiBaseUrl;

export const API_ROUTES = {
  Auth: {
    Register: `${BASE_URL}/auth/register`,
    Token: `${BASE_URL}/auth/token`,
  },
};
