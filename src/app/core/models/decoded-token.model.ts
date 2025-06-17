export interface DecodedToken {
  sub: string;        // Subject (user ID or identifier)
  email: string;      // User email
  exp: number;        // Expiration time (Unix timestamp in seconds)
  iss: string;        // Issuer
  aud: string;        // Audience
}
