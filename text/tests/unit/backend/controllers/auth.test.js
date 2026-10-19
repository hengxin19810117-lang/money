/**
 * Auth Controller Unit Test - 认证控制器单元测试
 *
 * 测试目标: 验证认证控制器的所有业务逻辑
 *
 * 测试内容:
 * 1. 用户注册逻辑
 * 2. 用户登录逻辑
 * 3. 密码强度验证
 * 4. 用户名唯一性检查
 * 5. Token生成和返回
 * 6. 错误处理
 */

const authController = require('../../../../backend/controllers/authController');
const User = require('../../../../backend/models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

jest.mock('../../../../backend/models/User');

describe('Auth Controller', () => {
  const mockReq = (body = {}) => ({
    body: body
  });
  const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    test('should register new user successfully', async () => {
      const req = mockReq({
        username: 'newuser',
        password: 'Password123!',
        nickname: '新用户'
      });
      const res = mockRes();

      User.findByUsername.mockResolvedValue(null);
      User.create.mockResolvedValue({
        id: 'user_new',
        username: 'newuser'
      });

      await authController.register(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            token: expect.any(String),
            user: expect.objectContaining({ id: 'user_new' })
          })
        })
      );
    });

    test('should reject duplicate username', async () => {
      const req = mockReq({
        username: 'existinguser',
        password: 'Password123!'
      });
      const res = mockRes();

      User.findByUsername.mockResolvedValue({ id: 'existing' });

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining('已存在')
        })
      );
    });

    test('should reject weak password', async () => {
      const req = mockReq({
        username: 'newuser',
        password: '123' // Too short and simple
      });
      const res = mockRes();

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining('密码')
        })
      );
    });

    test('should reject missing username', async () => {
      const req = mockReq({
        password: 'Password123!'
      });
      const res = mockRes();

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('login', () => {
    test('should login successfully with correct credentials', async () => {
      const hashedPassword = await bcrypt.hash('CorrectPassword123', 10);
      const req = mockReq({
        username: 'testuser',
        password: 'CorrectPassword123'
      });
      const res = mockRes();

      User.findByUsername.mockResolvedValue({
        id: 'user_123',
        username: 'testuser',
        password: hashedPassword
      });

      await authController.login(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            token: expect.any(String),
            user: expect.objectContaining({ id: 'user_123' })
          })
        })
      );
    });

    test('should reject invalid password', async () => {
      const hashedPassword = await bcrypt.hash('CorrectPassword123', 10);
      const req = mockReq({
        username: 'testuser',
        password: 'WrongPassword'
      });
      const res = mockRes();

      User.findByUsername.mockResolvedValue({
        id: 'user_123',
        username: 'testuser',
        password: hashedPassword
      });

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: '用户名或密码错误'
        })
      );
    });

    test('should reject non-existent user', async () => {
      const req = mockReq({
        username: 'nonexistent',
        password: 'Password123'
      });
      const res = mockRes();

      User.findByUsername.mockResolvedValue(null);

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: '用户名或密码错误'
        })
      );
    });
  });

  describe('getUser', () => {
    test('should return user data without password', async () => {
      const req = mockReq({});
      req.userId = 'user_123';
      const res = mockRes();

      User.findById.mockResolvedValue({
        id: 'user_123',
        username: 'testuser',
        password: 'hashed_password_should_not_be_sent',
        nickname: '测试'
      });

      await authController.getUser(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            id: 'user_123',
            password: undefined // Password should not be included
          })
        })
      );
    });
  });
});
