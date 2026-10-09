const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');

// 公开路由
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

// 需要认证的路由
router.get('/user', authMiddleware, AuthController.getCurrentUser);
router.put('/profile', authMiddleware, AuthController.updateProfile);
router.put('/password', authMiddleware, AuthController.changePassword);

module.exports = router;
