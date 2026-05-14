import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('../../shared/api/http', () => ({
  http: { post: vi.fn() },
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

const mockLogin = vi.fn();
vi.mock('../../shared/auth/AuthContext', () => ({
  useAuthContext: () => ({ login: mockLogin, logout: vi.fn(), user: null, isAuthenticated: false }),
}));

import { http } from '../../shared/api/http';
import { useLogin } from './useLogin';

describe('useLogin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('llama a POST /api/auth/login con email y password', async () => {
    (http.post as ReturnType<typeof vi.fn>).mockResolvedValue({ data: { access_token: 'jwt-abc' } });

    const { result } = renderHook(() => useLogin());

    await act(async () => {
      await result.current.submit('owner@polleria.com', 'admin1234');
    });

    expect(http.post).toHaveBeenCalledWith('/api/auth/login', {
      email: 'owner@polleria.com',
      password: 'admin1234',
    });
  });

  it('guarda el token en AuthContext al recibir access_token', async () => {
    (http.post as ReturnType<typeof vi.fn>).mockResolvedValue({ data: { access_token: 'jwt-abc' } });

    const { result } = renderHook(() => useLogin());

    await act(async () => {
      await result.current.submit('owner@polleria.com', 'admin1234');
    });

    expect(mockLogin).toHaveBeenCalledWith('jwt-abc');
  });

  it('expone error cuando la petición falla', async () => {
    (http.post as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('401'));

    const { result } = renderHook(() => useLogin());

    await act(async () => {
      await result.current.submit('owner@polleria.com', 'wrongpass');
    });

    expect(result.current.error).toBeTruthy();
    expect(mockLogin).not.toHaveBeenCalled();
  });
});
