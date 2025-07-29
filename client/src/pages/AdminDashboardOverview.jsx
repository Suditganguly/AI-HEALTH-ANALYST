import React from 'react';

const AdminDashboardOverview = ({ summaryCards, analytics, recentActivity }) => (
  <div className="dashboard-content-wrapper w-full max-w-5xl mx-auto px-2 md:px-6 py-4">
    <h2 className="text-2xl font-bold text-primary mb-6">Overview</h2>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {summaryCards.map((card, idx) => (
        <div
          key={idx}
          className="card card-stat animate-slideInUp flex flex-col items-center justify-center"
          style={{ animationDelay: `${0.1 * idx}s` }}
        >
          <div className="stat-value">{card.value}</div>
          <div className="stat-label">{card.label}</div>
        </div>
      ))}
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="card card-accent animate-slideInUp md:col-span-2" style={{animationDelay: '0.5s'}}>
        <div className="card-header">
          <h3 className="card-title">Recent Activity</h3>
        </div>
        <ul className="list">
          {recentActivity && recentActivity.map((activity, idx) => (
            <li key={idx} className="list-item">{activity}</li>
          ))}
        </ul>
      </div>
      <div className="card animate-slideInUp" style={{animationDelay: '0.6s'}}>
        <div className="card-header">
          <h3 className="card-title">System Health</h3>
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex justify-between">
            <span>Server Status</span>
            <span className="badge badge-success">{analytics?.systemHealth?.serverStatus || 'Online'}</span>
          </div>
          <div className="flex justify-between">
            <span>API Response</span>
            <span className="badge badge-primary">{analytics?.systemHealth?.apiResponse || '120ms'}</span>
          </div>
          <div className="flex justify-between">
            <span>Database</span>
            <span className="badge badge-success">{analytics?.systemHealth?.database || 'Connected'}</span>
          </div>
          <div className="flex justify-between">
            <span>Storage Used</span>
            <span className="badge badge-warning">{analytics?.systemHealth?.storageUsed || '68%'}</span>
          </div>
        </div>
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="card animate-slideInUp" style={{animationDelay: '0.7s'}}>
        <div className="card-header">
          <h3 className="card-title">Active Users</h3>
        </div>
        <div className="text-3xl font-bold text-blue-600 mb-2">
          {analytics?.activeUsers || 0}
        </div>
        <div className="text-gray-500 text-base">Users active in the last 24 hours</div>
      </div>
      <div className="card animate-slideInUp" style={{animationDelay: '0.8s'}}>
        <div className="card-header">
          <h3 className="card-title">User Growth</h3>
        </div>
        <div className="text-3xl font-bold text-green-500 mb-2">
          +{analytics?.userGrowthRate || 0}%
        </div>
        <div className="text-gray-500 text-base">Growth in the last 30 days</div>
      </div>
    </div>
  </div>
);

export default AdminDashboardOverview;
