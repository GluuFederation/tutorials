export type User = {
  iss: string; // Issuer
  sub: string; // Subject (user identifier)
  aud: string | string[]; // Audience
  exp: number; // Expiration time (seconds since epoch)
  iat: number; // Issued at (seconds since epoch)
  auth_time?: number; // Authentication time
  nonce?: string; // Nonce to mitigate replay attacks
  azp?: string; // Authorized party
  at_hash?: string; // Access token hash
  c_hash?: string; // Code hash
  email?: string; // User email
  email_verified?: boolean; // Email verification status
  name?: string; // User name
  picture?: string; // User profile picture
  [claim: string]: unknown; // Additional custom claims
  role?: string[]; // User roles
};
