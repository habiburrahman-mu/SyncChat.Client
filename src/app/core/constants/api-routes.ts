import { environment } from "@environments/environment";

export const BASE_URL = environment.apiBaseUrl;

export const API_ROUTES = {
  Auth: {
    Register: `${BASE_URL}/auth/register` as const,
    Login: `${BASE_URL}/auth/login` as const,
    Refresh: `${BASE_URL}/auth/refresh` as const,
    Logout: `${BASE_URL}/auth/logout` as const,
    LogoutAll: `${BASE_URL}/auth/logoutAll` as const,
    GoogleAuth: `${BASE_URL}/auth/googleAuth` as const,
    PasswordResetRequest: `${BASE_URL}/auth/passwordResetRequest` as const,
    PasswordResetVerify: `${BASE_URL}/auth/passwordResetVerify` as const,
    PasswordResetComplete: `${BASE_URL}/auth/passwordResetComplete` as const,
  },
  User: {
    GetUserByUserName: `${BASE_URL}/user/GetByUserName` as const,
    GetDetail: `${BASE_URL}/user/getDetail` as const,
    Update: `${BASE_URL}/user/update` as const,
    GetMetaData: `${BASE_URL}/user/getMetaData` as const,
  },
  Conversation: {
    Create: `${BASE_URL}/conversation/create` as const,
    GetList: `${BASE_URL}/conversation/getList` as const,
    GetLastMessage: `${BASE_URL}/conversation/getLastMessage` as const,
    MarkMessageAsSeen: `${BASE_URL}/conversation/markMessageAsSeen` as const,
    GetDetail: `${BASE_URL}/conversation/getDetail` as const,
  },
  ConversationMember: {
    GetList: `${BASE_URL}/conversationMember/getList` as const,
    Add: `${BASE_URL}/conversationMember/add` as const,
    Remove: `${BASE_URL}/conversationMember/remove` as const,
    MakeAdmin: `${BASE_URL}/conversationMember/makeAdmin` as const,
    RemoveAdminStatus: `${BASE_URL}/conversationMember/removeAdminStatus` as const,
  },
  Message: {
    GetList: `${BASE_URL}/message/getList` as const,
    Send: `${BASE_URL}/message/send` as const,
    SendMedia: `${BASE_URL}/message/sendMedia` as const,
  },
  Media: {
    InitiateUpload: `${BASE_URL}/media/initiateUpload` as const,
    ConfirmUpload: `${BASE_URL}/media/confirmUpload` as const,
    GetAccessUrl: `${BASE_URL}/media/getAccessUrl` as const,
    GetState: `${BASE_URL}/media/getState` as const,
  }
};
