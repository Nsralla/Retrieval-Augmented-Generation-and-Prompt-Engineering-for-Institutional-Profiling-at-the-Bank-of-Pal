// src/utils/auth.ts   ← or .tsx if you really need JSX here
import { jwtDecode, JwtPayload } from 'jwt-decode';

export function isTokenExpired(token: string | null | undefined): boolean {
  if (!token) {
    // no token → treat as expired
    return true;
  }

  try {
    // decode with a known interface
    const { exp } = jwtDecode<JwtPayload>(token);

    // if there’s no exp field on the payload, assume expired
    if (!exp) return true;

    // current time in seconds since epoch
    const now = Date.now() / 1000;

    return exp < now;
  } catch (err) {
    // malformed token → expired
    return true;
  }
}
