const express = require('express');
const router = express.Router();
const RecordController = require('../controllers/recordController');
const { authMiddleware } = require('../middleware/auth');

// 所有路由都需要认证
router.use(authMiddleware);

router.post('/', RecordController.create);
router.get('/', RecordController.list);
router.get('/today', RecordController.getToday);
router.get('/stats/monthly', RecordController.getMonthlyStats);
router.get('/stats/daily', RecordController.getDailyTrend);
router.get('/export', RecordController.export);
router.put('/:id', RecordController.update);
router.delete('/:id', RecordController.delete);

module.exports = router;
