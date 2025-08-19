import { environment } from "@environments/environment";

export const BASE_URL = environment.apiBaseUrl;

export const API_ROUTES = {
  Auth: {
    Register: `${BASE_URL}/auth/register` as const,
    Token: `${BASE_URL}/auth/token` as const,
  },
  User: {
    GetUserByUserName: `${BASE_URL}/user/GetByUserName` as const
  },
  Conversation: {
    Create: `${BASE_URL}/conversation/create` as const,
    GetList: `${BASE_URL}/conversation/getList` as const,
    GetLastMessage: `${BASE_URL}/conversation/getLastMessage` as const,
    MarkMessageAsSeen: `${BASE_URL}/conversation/markMessageAsSeen` as const,
  },
  Message: {
    GetList: `${BASE_URL}/message/getList` as const,
    Send: `${BASE_URL}/message/send` as const,
  }
};
