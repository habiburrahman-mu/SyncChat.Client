import { Environment } from './environment.model';

export const environment: Environment = {
  production: false,
  apiBaseUrl: '/api',
  notificationHubUrl: '/hub/notifications',
  googleClientId: '' // Add your Google Client ID here for development
};
