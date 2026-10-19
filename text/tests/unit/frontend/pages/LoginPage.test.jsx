/**
 * LoginPage Unit Test - 登录页面单元测试
 *
 * 测试目标: 验证登录页面的所有功能
 *
 * 测试内容:
 * 1. 表单渲染
 * 2. 用户名输入验证
 * 3. 密码输入验证
 * 4. 登录按钮状态
 * 5. 登录成功跳转
 * 6. 登录失败错误提示
 * 7. 加载状态显示
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { jest } from '@jest/globals';
import { BrowserRouter } from 'react-router-dom';

// Mock authAPI
jest.mock('../../../../fronted-react/src/api/auth', () => ({
  login: jest.fn()
}));

import LoginPage from '../../../../fronted-react/src/pages/LoginPage';
import { authAPI } from '../../../../fronted-react/src/api/auth';

const renderLoginPage = () => {
  render(
    <BrowserRouter>
      <LoginPage />
    </BrowserRouter>
  );
};

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render login form', () => {
    renderLoginPage();

    expect(screen.getByPlaceholderText('请输入管理员用户名')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('请输入密码')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /登录/i })).toBeInTheDocument();
  });

  test('should show validation error for empty username', async () => {
    renderLoginPage();

    fireEvent.click(screen.getByRole('button', { name: /登录/i }));

    await waitFor(() => {
      expect(screen.getByText('请输入用户名和密码')).toBeInTheDocument();
    });
  });

  test('should call login API with correct data', async () => {
    authAPI.login.mockResolvedValue({
      success: true,
      data: {
        token: 'test_token',
        user: { id: '1', username: 'admin' }
      }
    });

    renderLoginPage();

    fireEvent.change(screen.getByPlaceholderText('请输入管理员用户名'), {
      target: { value: 'admin' }
    });
    fireEvent.change(screen.getByPlaceholderText('请输入密码'), {
      target: { value: 'admin123' }
    });

    fireEvent.click(screen.getByRole('button', { name: /登录/i }));

    await waitFor(() => {
      expect(authAPI.login).toHaveBeenCalledWith({
        username: 'admin',
        password: 'admin123'
      });
    });
  });

  test('should show error on login failure', async () => {
    authAPI.login.mockResolvedValue({
      success: false,
      message: '用户名或密码错误'
    });

    renderLoginPage();

    fireEvent.change(screen.getByPlaceholderText('请输入管理员用户名'), {
      target: { value: 'wronguser' }
    });
    fireEvent.change(screen.getByPlaceholderText('请输入密码'), {
      target: { value: 'wrongpass' }
    });

    fireEvent.click(screen.getByRole('button', { name: /登录/i }));

    await waitFor(() => {
      expect(screen.getByText('用户名或密码错误')).toBeInTheDocument();
    });
  });

  test('should show loading state during login', async () => {
    authAPI.login.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({
      success: true,
      data: { token: 'token', user: {} }
    }), 1000));

    renderLoginPage();

    fireEvent.change(screen.getByPlaceholderText('请输入管理员用户名'), {
      target: { value: 'admin' }
    });
    fireEvent.change(screen.getByPlaceholderText('请输入密码'), {
      target: { value: 'admin123' }
    });

    fireEvent.click(screen.getByRole('button', { name: /登录/i }));

    expect(screen.getByText('验证中...')).toBeInTheDocument();
  });
});
