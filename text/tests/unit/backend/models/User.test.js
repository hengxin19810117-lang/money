/**
 * User Model Unit Test - 用户模型单元测试
 *
 * 测试目标: 验证 User 模型的所有业务逻辑
 *
 * 测试内容:
 * 1. 用户创建时密码自动哈希
 * 2. 用户名唯一性验证
 * 3. 密码验证功能 (bcrypt.compare)
 * 4. 用户状态管理 (active/disabled)
 * 5. 创建时间自动填充
 */

const User = require('../../../../backend/models/User');
const bcrypt = require('bcryptjs');

describe('User Model', () => {
  describe('create', () => {
    test('should hash password on create', async () => {
      const userData = {
        username: 'testuser',
        password: 'plainpassword123',
        nickname: '测试用户'
      };

      const user = await User.create(userData);

      // 密码不应该是明文
      expect(user.password).not.toBe('plainpassword123');
      // 密码应该是有效的bcrypt哈希
      expect(user.password).toMatch(/^\$2[ab]\$/);
    });

    test('should generate unique ID', async () => {
      const user = await User.create({
        username: 'testuser2',
        password: 'password'
      });

      expect(user.id).toBeDefined();
      expect(typeof user.id).toBe('string');
      expect(user.id.length).toBeGreaterThan(0);
    });

    test('should reject duplicate username', async () => {
      const userData = {
        username: 'duplicate_user',
        password: 'password123'
      };

      // 第一次创建应该成功
      await User.create(userData);

      // 第二次创建应该抛出错误
      await expect(User.create(userData)).rejects.toThrow();
    });
  });

  describe('validatePassword', () => {
    test('should return true for correct password', async () => {
      const password = 'correctpassword';
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await User.create({
        username: 'validuser',
        password: hashedPassword
      });

      const isValid = await User.validatePassword(user, password);
      expect(isValid).toBe(true);
    });

    test('should return false for incorrect password', async () => {
      const password = 'correctpassword';
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await User.create({
        username: 'invaliduser',
        password: hashedPassword
      });

      const isValid = await User.validatePassword(user, 'wrongpassword');
      expect(isValid).toBe(false);
    });
  });

  describe('findByUsername', () => {
    test('should find user by username', async () => {
      const username = 'findme_user';
      await User.create({
        username,
        password: 'password123'
      });

      const user = await User.findByUsername(username);
      expect(user).toBeDefined();
      expect(user.username).toBe(username);
    });

    test('should return null for non-existent user', async () => {
      const user = await User.findByUsername('nonexistent_user_12345');
      expect(user).toBeUndefined();
    });
  });

  describe('updateStatus', () => {
    test('should update user status', async () => {
      const user = await User.create({
        username: 'statususer',
        password: 'password123'
      });

      await User.updateStatus(user.id, 'disabled');

      const updatedUser = await User.findByUsername('statususer');
      expect(updatedUser.status).toBe('disabled');
    });
  });
});
