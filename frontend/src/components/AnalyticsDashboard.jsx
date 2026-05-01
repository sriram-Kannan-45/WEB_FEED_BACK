/**
 * Analytics Dashboard Component
 * Real-time analytics with KPI cards and charts
 * Admin only
 */

import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useAnalytics } from '../hooks/useRealTime';
import '../styles/AnalyticsDashboard.css';

// KPI Card Component
const KPICard = ({ title, value, subtitle, icon, color }) => (
  <div className={`kpi-card kpi-${color}`}>
    <div className="kpi-icon">{icon}</div>
    <div className="kpi-content">
      <p className="kpi-title">{title}</p>
      <p className="kpi-value">{value}</p>
      {subtitle && <p className="kpi-subtitle">{subtitle}</p>}
    </div>
  </div>
);

// Analytics Dashboard
const AnalyticsDashboard = () => {
  const {
    analytics,
    enrollmentTrend,
    trainerPerformance,
    loading,
    error,
    fetchDashboardAnalytics,
    fetchEnrollmentTrend,
    fetchTrainerPerformance,
  } = useAnalytics();

  const [dateRange, setDateRange] = useState('30');
  const [period, setPeriod] = useState('daily');

  // Fetch data when date range changes
  useEffect(() => {
    fetchDashboardAnalytics({
      days: parseInt(dateRange),
      period,
    });
  }, [dateRange, period, fetchDashboardAnalytics]);

  if (loading && !analytics) {
    return <div className="analytics-loading">Loading analytics...</div>;
  }

  if (error) {
    return <div className="analytics-error">⚠️ Error: {error}</div>;
  }

  if (!analytics) {
    return <div className="analytics-empty">No analytics data available</div>;
  }

  const {
    userMetrics,
    enrollmentMetrics,
    recentActivities,
  } = analytics;

  const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

  return (
    <div className="analytics-dashboard">
      <div className="analytics-header">
        <h1>📊 Analytics Dashboard</h1>
        <div className="analytics-controls">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="date-range-select"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="period-select"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <KPICard
          title="Total Users"
          value={userMetrics?.totalUsers || 0}
          subtitle={`${userMetrics?.activeUsers || 0} active`}
          icon="👥"
          color="blue"
        />
        <KPICard
          title="Active Users"
          value={userMetrics?.activeUsers || 0}
          subtitle={`${userMetrics?.inactiveUsers || 0} inactive`}
          icon="🟢"
          color="green"
        />
        <KPICard
          title="Total Enrollments"
          value={enrollmentMetrics?.totalEnrollments || 0}
          subtitle={`${enrollmentMetrics?.completionRate || 0}% completion`}
          icon="📚"
          color="purple"
        />
        <KPICard
          title="Drop Rate"
          value={`${enrollmentMetrics?.dropRate || 0}%`}
          subtitle={`${enrollmentMetrics?.cancelledEnrollments || 0} cancelled`}
          icon="📉"
          color="red"
        />
      </div>

      {/* Charts Section */}
      <div className="charts-grid">
        {/* Enrollment Trend Chart */}
        {enrollmentTrend && enrollmentTrend.length > 0 && (
          <div className="chart-container">
            <h2>📈 Enrollment Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={enrollmentTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Enrollments"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Trainer Performance Chart */}
        {trainerPerformance && trainerPerformance.length > 0 && (
          <div className="chart-container">
            <h2>⭐ Trainer Performance</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={trainerPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="trainerName" />
                <YAxis yAxisId="left" label={{ value: 'Rating', angle: -90, position: 'insideLeft' }} />
                <YAxis yAxisId="right" orientation="right" label={{ value: 'Enrollments', angle: 90, position: 'insideRight' }} />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="avgRating" fill="#f59e0b" name="Avg Rating" />
                <Bar yAxisId="right" dataKey="totalEnrollments" fill="#3b82f6" name="Total Enrollments" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* User Distribution Pie Chart */}
        {userMetrics?.usersByRole && userMetrics.usersByRole.length > 0 && (
          <div className="chart-container">
            <h2>👤 User Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={userMetrics.usersByRole}
                  dataKey="count"
                  nameKey="role"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {userMetrics.usersByRole.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Enrollment Status Pie Chart */}
        {enrollmentMetrics && (
          <div className="chart-container">
            <h2>📊 Enrollment Status</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Active', value: enrollmentMetrics.activeEnrollments },
                    { name: 'Completed', value: enrollmentMetrics.completedEnrollments },
                    { name: 'Cancelled', value: enrollmentMetrics.cancelledEnrollments },
                  ]}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  <Cell fill="#3b82f6" />
                  <Cell fill="#10b981" />
                  <Cell fill="#ef4444" />
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Recent Activities */}
      {recentActivities && recentActivities.length > 0 && (
        <div className="recent-activities">
          <h2>📋 Recent Activities</h2>
          <div className="activities-list">
            {recentActivities.slice(0, 5).map((activity, index) => (
              <div key={index} className="activity-row">
                <span className="activity-user">{activity.userName}</span>
                <span className="activity-action">{activity.action}</span>
                <span className="activity-timestamp">
                  {new Date(activity.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Metrics Summary */}
      <div className="metrics-summary">
        <div className="metric">
          <p className="metric-label">Completion Rate</p>
          <p className="metric-value">{enrollmentMetrics?.completionRate || 0}%</p>
        </div>
        <div className="metric">
          <p className="metric-label">New Enrollments (this period)</p>
          <p className="metric-value">{enrollmentMetrics?.newEnrollments || 0}</p>
        </div>
        <div className="metric">
          <p className="metric-label">Recent Signups</p>
          <p className="metric-value">{userMetrics?.recentSignups || 0}</p>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
