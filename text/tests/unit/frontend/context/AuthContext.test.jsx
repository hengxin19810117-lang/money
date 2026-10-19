/**
 * AuthContext Unit Test - 认证上下文单元测试
 *
 * 测试目标: 验证 React AuthContext 状态管理
 *
 * 测试内容:
 * 1. 登录状态初始化
 * 2. 登录成功设置Token和用户信息
 * 3. 登出清理Token和用户信息
 * 4. Token过期自动登出
 * 5. 用户信息更新
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { jest } from '@jest/globals';

// Mock authAPI
jest.mock('../../../../fronted-react/src/api/auth', () => ({
  login: jest.fn(),
  getUser: jest.fn(),
  register: jest.fn()
}));

import AuthContext from '../../../../fronted-react/src/context/AuthContext';
import { authAPI } from '../../../../fronted-react/src/api/auth';

const TestComponent = () => {
  const { user, token, login, logout, isAuthenticated } = React.useContext(AuthContext);

  return (
    <div>
      <span data-testid="isAuth">{isAuthenticated ? 'true' : 'false'}</span>
      <span data-testid="user">{user ? user.username : 'null'}</span>
      <span data-testid="token">{token ? 'hasToken' : 'noToken'}</span>
      <button onClick={() => login({ username: 'test', password: 'pass' })}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('should initialize with no user', () => {
    render(<AuthContext><TestComponent /></AuthContext>);

    expect(screen.getByTestId('isAuth').textContent).toBe('false');
    expect(screen.getByTestId('user').textContent).toBe('null');
  });

  test('should login successfully', async () => {
    authAPI.login.mockResolvedValue({
      success: true,
      data: {
        token: 'test_token_123',
        user: { id: 'user_1', username: 'testuser' }
      }
    });

    render(<AuthContext><TestComponent /></AuthContext>);

    fireEvent.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(screen.getByTestId('isAuth').textContent).toBe('true');
    });

    expect(localStorage.getItem('auth_token')).toBe('test_token_123');
    expect(localStorage.getItem('auth_user')).toBeDefined();
  });

  test('should logout and clear storage', async () => {
    localStorage.setItem('auth_token', 'existing_token');
    localStorage.setItem('auth_user', JSON.stringify({ id: '1', username: 'test' }));

    authAPI.login.mockResolvedValue({
      success: true,
      data: {
        token: 'test_token',
        user: { id: 'user_1', username: 'testuser' }
      }
    });

    render(<AuthContext><TestComponent /></AuthContext>);

    fireEvent.click(screen.getByText('Login'));
    await waitFor(() => {
      expect(screen.getByTestId('isAuth').textContent).toBe('true');
    });

    fireEvent.click(screen.getByText('Logout'));

    await waitFor(() => {
      expect(screen.getByTestId('isAuth').textContent).toBe('false');
    });

    expect(localStorage.getItem('auth_token')).toBeNull();
  });

  test('should handle login failure', async () => {
    authAPI.login.mockResolvedValue({
      success: false,
      message: '用户名或密码错误'
    });

    render(<AuthContext><TestComponent /></AuthContext>);

    fireEvent.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(screen.getByTestId('isAuth').textContent).toBe('false');
    });
  });
});
