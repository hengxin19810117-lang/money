/**
 * Login Performance Test - 登录性能测试 (k6)
 *
 * 测试目标: 验证登录接口在高并发下的性能
 *
 * 场景:
 * 1. 100并发用户登录
 * 2. 持续5分钟压测
 * 3. 验证响应时间和吞吐量
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// 自定义指标
const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '30s', target: 20 },   // 预热: 30秒内升到20并发
    { duration: '1m', target: 50 },    // 正式测试: 1分钟内升到50并发
    { duration: '2m', target: 100 },   // 压力测试: 2分钟内升到100并发
    { duration: '1m', target: 100 },   // 持续100并发1分钟
    { duration: '30s', target: 0 },    // 下降阶段
  ],
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'], // 95%请求<500ms, 99%<1000ms
    errors: ['rate<0.1'], // 错误率<10%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const TEST_USERS = [
  { username: 'perf_test_1', password: 'TestPassword123!' },
  { username: 'perf_test_2', password: 'TestPassword123!' },
  { username: 'perf_test_3', password: 'TestPassword123!' },
];

export function setup() {
  // 准备测试数据 - 确保用户存在
  TEST_USERS.forEach(user => {
    http.post(`${BASE_URL}/api/auth/register`, JSON.stringify(user), {
      headers: { 'Content-Type': 'application/json' },
    });
  });
  return { users: TEST_USERS };
}

export default function(data) {
  const user = data.users[Math.floor(Math.random() * data.users.length)];

  const res = http.post(
    `${BASE_URL}/api/auth/login`,
    JSON.stringify({
      username: user.username,
      password: user.password,
    }),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );

  // 检查响应
  const success = check(res, {
    'status is 200': (r) => r.status === 200,
    'has token': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.success && body.data && body.data.token;
      } catch (e) {
        return false;
      }
    },
    'response time < 500ms': (r) => r.timings.duration < 500,
  });

  errorRate.add(!success);

  sleep(1);
}

export function handleSummary(data) {
  return {
    'reports/performance/login_summary.json': JSON.stringify(data, null, 2),
  };
}
