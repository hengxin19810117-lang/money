/**
 * DashboardPage Unit Test - 仪表盘页面单元测试
 *
 * 测试目标: 验证仪表盘页面的所有功能
 *
 * 测试内容:
 * 1. 数据加载状态
 * 2. 统计数据展示 (用户数、记录数等)
 * 3. 图表渲染
 * 4. 趋势数据处理
 * 5. 错误状态处理
 */

import { render, screen, waitFor } from '@testing-library/react';
import { jest } from '@jest/globals';
import { BrowserRouter } from 'react-router-dom';

// Mock authAPI
jest.mock('../../../../fronted-react/src/api/auth', () => ({
  getDashboard: jest.fn()
}));

import DashboardPage from '../../../../fronted-react/src/pages/DashboardPage';
import { authAPI } from '../../../../fronted-react/src/api/auth';

const renderDashboardPage = () => {
  render(
    <BrowserRouter>
      <DashboardPage />
    </BrowserRouter>
  );
};

describe('DashboardPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should show loading state initially', () => {
    authAPI.getDashboard.mockImplementation(() => new Promise(() => {})); // Never resolves

    renderDashboardPage();

    expect(screen.getByText('加载中...')).toBeInTheDocument();
  });

  test('should display dashboard data after loading', async () => {
    authAPI.getDashboard.mockResolvedValue({
      success: true,
      data: {
        totalUsers: 100,
        totalRecords: 500,
        monthlyNewUsers: 10,
        monthlyRecords: 50,
        userTrend: [
          { date: '2024-01-01', count: 5 },
          { date: '2024-01-02', count: 8 }
        ],
        recordTrend: [
          { date: '2024-01-01', count: 20 },
          { date: '2024-01-02', count: 30 }
        ]
      }
    });

    renderDashboardPage();

    await waitFor(() => {
      expect(screen.getByText('总用户数')).toBeInTheDocument();
      expect(screen.getByText('总记录数')).toBeInTheDocument();
    });

    expect(screen.getByText('100')).toBeInTheDocument(); // totalUsers
    expect(screen.getByText('500')).toBeInTheDocument(); // totalRecords
  });

  test('should display charts', async () => {
    authAPI.getDashboard.mockResolvedValue({
      success: true,
      data: {
        totalUsers: 10,
        totalRecords: 20,
        monthlyNewUsers: 0,
        monthlyRecords: 0,
        userTrend: [],
        recordTrend: []
      }
    });

    renderDashboardPage();

    await waitFor(() => {
      expect(screen.getByText('近7日用户增长趋势')).toBeInTheDocument();
      expect(screen.getByText('近7日记账趋势')).toBeInTheDocument();
    });
  });

  test('should handle API error', async () => {
    authAPI.getDashboard.mockResolvedValue({
      success: false,
      message: '获取数据失败'
    });

    renderDashboardPage();

    await waitFor(() => {
      expect(screen.getByText('获取数据失败')).toBeInTheDocument();
    });
  });

  test('should display monthly stats', async () => {
    authAPI.getDashboard.mockResolvedValue({
      success: true,
      data: {
        totalUsers: 10,
        totalRecords: 20,
        monthlyNewUsers: [{ month: '2024-01', count: 5 }],
        monthlyRecords: [{ month: '2024-01', count: 15 }],
        userTrend: [],
        recordTrend: []
      }
    });

    renderDashboardPage();

    await waitFor(() => {
      expect(screen.getByText('本月新增用户')).toBeInTheDocument();
      expect(screen.getByText('本月记账数')).toBeInTheDocument();
    });
  });
});
