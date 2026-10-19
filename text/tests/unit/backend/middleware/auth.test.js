/**
 * Auth Middleware Unit Test - 认证中间件单元测试
 *
 * 测试目标: 验证 JWT 认证中间件的所有功能
 *
 * 测试内容:
 * 1. Token生成 (jwt.sign)
 * 2. Token验证 (jwt.verify)
 * 3. Token过期处理
 * 4. 非法Token处理
 * 5. 缺失Token处理
 * 6. 用户ID提取
 */

const jwt = require('jsonwebtoken');
const authMiddleware = require('../../../../backend/middleware/auth');

describe('Auth Middleware', () => {
  const mockReq = (headers = {}) => ({
    headers: headers
  });
  const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };
  const mockNext = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateToken', () => {
    test('should generate valid JWT token', () => {
      const user = { id: 'user_123', username: 'testuser' };
      const token = authMiddleware.generateToken(user);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    test('should include user data in token payload', () => {
      const user = { id: 'user_123', username: 'testuser' };
      const token = authMiddleware.generateToken(user);
      const decoded = jwt.decode(token);

      expect(decoded.id).toBe('user_123');
      expect(decoded.username).toBe('testuser');
    });
  });

  describe('verifyToken', () => {
    test('should verify valid token', () => {
      const user = { id: 'user_123', username: 'testuser' };
      const token = authMiddleware.generateToken(user);
      const decoded = authMiddleware.verifyToken(token);

      expect(decoded.id).toBe('user_123');
      expect(decoded.username).toBe('testuser');
    });

    test('should throw error for invalid token', () => {
      expect(() => {
        authMiddleware.verifyToken('invalid.token.here');
      }).toThrow();
    });

    test('should throw error for expired token', () => {
      // 创建一个已过期的token (使用过期的expiration)
      const expiredToken = jwt.sign(
        { id: 'user_123' },
        process.env.JWT_SECRET || 'finance_butler_secret_key_2024',
        { expiresIn: '-1s' } // Already expired
      );

      expect(() => {
        authMiddleware.verifyToken(expiredToken);
      }).toThrow('jwt expired');
    });

    test('should throw error for tampered token', () => {
      const user = { id: 'user_123', username: 'testuser' };
      const token = authMiddleware.generateToken(user);
      const tamperedToken = token.slice(0, -5) + 'xxxxx'; // Modify last characters

      expect(() => {
        authMiddleware.verifyToken(tamperedToken);
      }).toThrow();
    });
  });

  describe('authenticate', () => {
    test('should call next() with valid token', () => {
      const user = { id: 'user_123', username: 'testuser' };
      const token = authMiddleware.generateToken(user);
      const req = mockReq({ authorization: `Bearer ${token}` });
      const res = mockRes();

      authMiddleware.authenticate(req, res, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(req.userId).toBe('user_123');
    });

    test('should return 401 without authorization header', () => {
      const req = mockReq({});
      const res = mockRes();

      authMiddleware.authenticate(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false })
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should return 401 with invalid token format', () => {
      const req = mockReq({ authorization: 'InvalidFormat token' });
      const res = mockRes();

      authMiddleware.authenticate(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should return 401 with malformed token', () => {
      const req = mockReq({ authorization: 'Bearer invalid.token' });
      const res = mockRes();

      authMiddleware.authenticate(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('adminAuth', () => {
    test('should call next() with valid admin token', () => {
      const admin = { id: 'admin_001', username: 'admin', isAdmin: true };
      const token = authMiddleware.generateToken(admin);
      const req = mockReq({ authorization: `Bearer ${token}` });
      const res = mockRes();

      authMiddleware.adminAuth(req, res, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(req.adminId).toBe('admin_001');
    });

    test('should return 403 for non-admin user', () => {
      const user = { id: 'user_123', username: 'testuser', isAdmin: false };
      const token = authMiddleware.generateToken(user);
      const req = mockReq({ authorization: `Bearer ${token}` });
      const res = mockRes();

      authMiddleware.adminAuth(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false, message: '权限不足' })
      );
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
