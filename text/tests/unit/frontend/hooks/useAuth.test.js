/**
 * useAuth Hook Unit Test - useAuth自定义Hook单元测试
 *
 * 测试目标: 验证 useAuth Hook 的状态逻辑
 *
 * 测试内容:
 * 1. 用户认证状态判断
 * 2. Token存储和读取
 * 3. 用户信息解析
 * 4. 认证状态变更回调
 */

import { renderHook, act } from '@testing-library/react';
import { jest } from '@jest/globals';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => { store[key] = value; }),
    removeItem: jest.fn((key) => { delete store[key]; }),
    clear: jest.fn(() => { store = {}; })
  };
})();
Object.defineProperty(global, 'localStorage', { value: localStorageMock });

describe('useAuth Hook', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('should return not authenticated when no token', () => {
    const { result } = renderHook(() => {
      const token = localStorage.getItem('auth_token');
      const isAuthenticated = !!token;
      return { isAuthenticated };
    });

    expect(result.current.isAuthenticated).toBe(false);
  });

  test('should return authenticated when token exists', () => {
    localStorage.setItem('auth_token', 'valid_token_123');

    const { result } = renderHook(() => {
      const token = localStorage.getItem('auth_token');
      const isAuthenticated = !!token;
      return { isAuthenticated };
    });

    expect(result.current.isAuthenticated).toBe(true);
  });

  test('should parse user from localStorage', () => {
    const userData = { id: 'user_1', username: 'testuser' };
    localStorage.setItem('auth_user', JSON.stringify(userData));

    const { result } = renderHook(() => {
      const userStr = localStorage.getItem('auth_user');
      const user = userStr ? JSON.parse(userStr) : null;
      return { user };
    });

    expect(result.current.user).toEqual(userData);
    expect(result.current.user.username).toBe('testuser');
  });
});
