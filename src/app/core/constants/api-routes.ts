import { environment } from "@environments/environment";

const BASE_URL = environment.apiBaseUrl;

export const API_ROUTES = {
  Auth: {
    Register: `${BASE_URL}/auth/register`,
    Token: `${BASE_URL}/auth/token`,
  },
  User: {
    GetUserByUserName: `${BASE_URL}/user/GetByUserName`
  },
  Conversation: {
    Create: `${BASE_URL}/conversation/create`,
    GetList: `${BASE_URL}/conversation/getList`,
  }
};
