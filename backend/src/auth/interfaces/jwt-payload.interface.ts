export interface JwtPayload {
  id: number;
  email: string;
  type: string;
  expirationTime: number;
}
