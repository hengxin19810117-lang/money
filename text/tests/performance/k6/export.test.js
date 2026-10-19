/**
 * Export Performance Test - 数据导出性能测试 (k6)
 *
 * 测试目标: 验证数据导出接口的性能
 *
 * 场景:
 * 1. 20并发导出请求
 * 2. 测试不同数据量的导出时间
 * 3. 验证内存使用和响应时间
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const errorRate = new Rate('errors');
const exportDuration = new Trend('export_duration');

export const options = {
  stages: [
    { duration: '20s', target: 5 },
    { duration: '1m', target: 20 },
    { duration: '30s', target: 20 },
    { duration: '20s', target: 0 },
  ],
  thresholds: {
    'export_duration': ['p(95)<5000', 'p(99)<10000'], // 95%<5s, 99%<10s
    'errors': ['rate<0.1'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export function setup() {
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
  const headers = {
    'Authorization': `Bearer ${data.token}`,
  };

  // 测试不同日期范围的导出
  const dateRanges = [
    { startDate: '2024-01-01', endDate: '2024-01-31', label: 'month' },
    { startDate: '2024-01-01', endDate: '2024-06-30', label: 'half_year' },
    { startDate: '2023-01-01', endDate: '2024-12-31', label: 'year' },
  ];

  const range = dateRanges[Math.floor(Math.random() * dateRanges.length)];

  const start = Date.now();
  const res = http.get(
    `${BASE_URL}/api/records/export?startDate=${range.startDate}&endDate=${range.endDate}&format=xlsx`,
    { headers }
  );
  exportDuration.add(Date.now() - start);

  const success = check(res, {
    'export status 200': (r) => r.status === 200,
    'has content': (r) => r.body && r.body.length > 0,
    'response time < 10s': (r) => r.timings.duration < 10000,
  });

  errorRate.add(!success);

  sleep(2);
}

export function handleSummary(data) {
  return {
    'reports/performance/export_summary.json': JSON.stringify(data, null, 2),
  };
}
