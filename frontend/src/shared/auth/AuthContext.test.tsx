import { renderHook, act } from '@testing-library/react';
import { type ReactNode } from 'react';
import { AuthProvider, useAuthContext } from './AuthContext';

const TOKEN_KEY = 'polleria_token';

// JWT con payload { sub:1, email:'admin@test.com', exp: año 2300 }
const VALID_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
  btoa(JSON.stringify({ sub: 1, email: 'admin@test.com', exp: 10413792000 })).replace(
    /={1,2}$/,
    '',
  ) +
  '.signature';

const wrapper = ({ children }: { children: ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

beforeEach(() => localStorage.clear());

describe('AuthContext', () => {
  it('starts unauthenticated when no token in storage', () => {
    const { result } = renderHook(() => useAuthContext(), { wrapper });
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it('login stores token in localStorage and sets user', () => {
    const { result } = renderHook(() => useAuthContext(), { wrapper });
    act(() => result.current.login(VALID_TOKEN));
    expect(localStorage.getItem(TOKEN_KEY)).toBe(VALID_TOKEN);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user?.email).toBe('admin@test.com');
  });

  it('logout clears token from localStorage and sets user to null', () => {
    const { result } = renderHook(() => useAuthContext(), { wrapper });
    act(() => result.current.login(VALID_TOKEN));
    act(() => result.current.logout());
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it('rejects expired tokens on init', () => {
    const expiredToken =
      'eyJhbGciOiJIUzI1NiJ9.' +
      btoa(JSON.stringify({ sub: 1, email: 'admin@test.com', exp: 1 })).replace(/={1,2}$/, '') +
      '.sig';
    localStorage.setItem(TOKEN_KEY, expiredToken);
    const { result } = renderHook(() => useAuthContext(), { wrapper });
    expect(result.current.isAuthenticated).toBe(false);
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
  });
});
