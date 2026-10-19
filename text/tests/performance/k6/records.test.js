/**
 * Records Performance Test - 记账记录性能测试 (k6)
 *
 * 测试目标: 验证记账记录接口在各种负载下的性能
 *
 * 场景:
 * 1. 100并发查询
 * 2. 50并发创建记录
 * 3. 大数据量分页查询
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const errorRate = new Rate('errors');
const queryDuration = new Trend('query_duration');
const createDuration = new Trend('create_duration');

export const options = {
  stages: [
    { duration: '30s', target: 50 },
    { duration: '2m', target: 100 },
    { duration: '1m', target: 100 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    'query_duration': ['p(95)<200', 'p(99)<500'],
    'create_duration': ['p(95)<300', 'p(99)<800'],
    'errors': ['rate<0.05'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

let authToken;

export function setup() {
  // 登录获取token
  const res = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify({
    username: 'perf_test_1',
    password: 'TestPassword123!',
  }), {
    headers: { 'Content-Type': 'application/json' },
  });

  const body = JSON.parse(res.body);
  return { token: body.data.token };
}

export default function(data) {
  authToken = data.token;
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${authToken}`,
  };

  // 场景1: 查询记录 (70% 流量)
  if (Math.random() < 0.7) {
    const start = Date.now();
    const res = http.get(`${BASE_URL}/api/records?page=1&pageSize=20`, { headers });
    queryDuration.add(Date.now() - start);

    const success = check(res, {
      'query status 200': (r) => r.status === 200,
      'has records': (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.success && Array.isArray(body.data.records);
        } catch (e) {
          return false;
        }
      },
    });
    errorRate.add(!success);
  }
  // 场景2: 创建记录 (30% 流量)
  else {
    const start = Date.now();
    const res = http.post(
      `${BASE_URL}/api/records`,
      JSON.stringify({
        type: Math.random() > 0.3 ? 'expense' : 'income',
        amount: Math.floor(Math.random() * 1000) + 10,
        category_id: Math.random() > 0.5 ? 'cat_exp_餐饮' : 'cat_inc_工资',
        note: `Perf test ${Date.now()}`,
        record_date: new Date().toISOString().split('T')[0],
      }),
      { headers }
    );
    createDuration.add(Date.now() - start);

    const success = check(res, {
      'create status 201': (r) => r.status === 201,
    });
    errorRate.add(!success);
  }

  sleep(0.5);
}

export function handleSummary(data) {
  return {
    'reports/performance/records_summary.json': JSON.stringify(data, null, 2),
  };
}
