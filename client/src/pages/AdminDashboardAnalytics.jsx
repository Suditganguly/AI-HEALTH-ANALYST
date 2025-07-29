import React from 'react';
import { useUser } from '../context/UserContext';

const AdminDashboardAnalytics = () => {
  const { userData } = useUser();
  const {
    users = [],
    articles = [],
    doctors = [],
    analytics = {},
    userAnalytics = {
      goals: {},
      medications: {},
      activities: {},
      healthScore: { history: [] },
      mood: { history: [] },
      insights: []
    }
  } = userData || {};

  // Calculate doctor specialties distribution
  const specialtyCounts = (doctors || []).reduce((acc, doctor) => {
    acc[doctor.specialty] = (acc[doctor.specialty] || 0) + 1;
    return acc;
  }, {});

  // Calculate average user health metrics
  const averageHealthScore = users.length ? Math.round((users || []).reduce((sum, user) => sum + (user.healthScore || 75), 0) / users.length) : 0;
  const averageGoalCompletion = Math.round((userAnalytics.goals?.completionRate || 0));
  const averageMedicationAdherence = Math.round((userAnalytics.medications?.adherence || 0));
  const averageSteps = Math.round((userAnalytics.activities?.steps?.average || 0));

  // Calculate user activity trends
  const activeUsers = (users || []).filter(user => user.status === 'active').length;
  const userActivityRate = users.length ? Math.round((activeUsers / users.length) * 100) : 0;

  return (
    <div className="animate-slideInUp w-full max-w-5xl mx-auto px-2 md:px-6 py-4">
      <h2 className="text-2xl font-bold text-primary mb-6">Analytics Dashboard</h2>
      
      {/* System Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="card card-stat animate-slideInUp" style={{animationDelay: '0.1s'}}>
          <div className="stat-value">{analytics?.totalUsers || users.length}</div>
          <div className="stat-label">Total Users</div>
        </div>
        <div className="card card-stat animate-slideInUp" style={{animationDelay: '0.2s'}}>
          <div className="stat-value">{analytics?.totalArticles || articles.length}</div>
          <div className="stat-label">Blog Articles</div>
        </div>
        <div className="card card-stat animate-slideInUp" style={{animationDelay: '0.3s'}}>
          <div className="stat-value">{analytics?.totalReminders || users.reduce((a, b) => a + (b.reminders || 0), 0)}</div>
          <div className="stat-label">Total Reminders</div>
        </div>
        <div className="card card-stat animate-slideInUp" style={{animationDelay: '0.4s'}}>
          <div className="stat-value">{analytics?.totalDoctors || doctors.length}</div>
          <div className="stat-label">Doctors</div>
        </div>
      </div>

      {/* User Health Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card glass-card animate-slideInUp md:col-span-2" style={{animationDelay: '0.5s'}}>
          <div className="card-header">
            <h3 className="card-title">User Health Analytics</h3>
          </div>
          <div className="p-4">
            <div className="mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-neutral-700">Average Health Score</span>
                <span className="text-primary font-semibold">{averageHealthScore}/100</span>
              </div>
              <div className="progress-bar">
                <div className="progress-value" style={{width: `${averageHealthScore}%`}}></div>
              </div>
            </div>
            <div className="mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-neutral-700">Goal Completion Rate</span>
                <span className="text-primary font-semibold">{averageGoalCompletion}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-value" style={{width: `${averageGoalCompletion}%`}}></div>
              </div>
            </div>
            <div className="mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-neutral-700">Medication Adherence</span>
                <span className="text-primary font-semibold">{averageMedicationAdherence}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-value" style={{width: `${averageMedicationAdherence}%`}}></div>
              </div>
            </div>
            <div className="mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-neutral-700">Average Daily Steps</span>
                <span className="text-primary font-semibold">{averageSteps.toLocaleString()}</span>
              </div>
              <div className="progress-bar">
                <div className="progress-value" style={{width: `${Math.min((averageSteps / 10000) * 100, 100)}%`}}></div>
              </div>
            </div>
          </div>
        </div>
        <div className="card animate-slideInUp" style={{animationDelay: '0.6s'}}>
          <div className="card-header">
            <h3 className="card-title">User Activity Status</h3>
          </div>
          <ul className="list">
            <li className="list-item">Active Users: {activeUsers}</li>
            <li className="list-item">Inactive Users: {users.length - activeUsers}</li>
            <li className="list-item">Activity Rate: {userActivityRate}%</li>
            <li className="list-item">Avg Sleep: {userAnalytics.activities.sleep.average}h</li>
            <li className="list-item">Avg Exercise: {userAnalytics.activities.exercise.total}min/week</li>
            <li className="list-item">Avg Water: {userAnalytics.activities.water.average} glasses</li>
          </ul>
        </div>
      </div>

      {/* Health Trends and Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="card animate-slideInUp" style={{animationDelay: '0.7s'}}>
          <div className="card-header">
            <h3 className="card-title">Health Score Trend</h3>
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#2563eb', marginBottom: 8 }}>
            {userAnalytics.healthScore.current}
          </div>
          <div style={{ color: '#4b5563', fontSize: 16 }}>
            {userAnalytics.healthScore.trend === 'up' ? '+' : ''}
            {((userAnalytics.healthScore.current - userAnalytics.healthScore.previous) / userAnalytics.healthScore.previous * 100).toFixed(1)}% 
            vs last period
          </div>
          <div className="mt-4">
            <div className="text-sm text-neutral-600 mb-2">Weekly Progress:</div>
            <div className="flex gap-1">
              {userAnalytics.healthScore.history.map((score, index) => (
                <div 
                  key={index}
                  className="flex-1 bg-blue-200 rounded"
                  style={{ 
                    height: '20px',
                    background: `linear-gradient(to top, #3b82f6 ${score}%, #e5e7eb ${score}%)`
                  }}
                  title={`Day ${index + 1}: ${score}`}
                ></div>
              ))}
            </div>
          </div>
        </div>
        <div className="card animate-slideInUp" style={{animationDelay: '0.8s'}}>
          <div className="card-header">
            <h3 className="card-title">Mood & Wellness</h3>
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#10b981', marginBottom: 8 }}>
            {userAnalytics.mood.average}/10
          </div>
          <div style={{ color: '#4b5563', fontSize: 16 }}>
            Average mood score ({userAnalytics.mood.trend} trend)
          </div>
          <div className="mt-4">
            <div className="text-sm text-neutral-600 mb-2">Weekly Mood:</div>
            <div className="flex gap-1">
              {userAnalytics.mood.history.map((mood, index) => (
                <div 
                  key={index}
                  className="flex-1 bg-purple-200 rounded"
                  style={{ 
                    height: '20px',
                    background: `linear-gradient(to top, #8b5cf6 ${mood * 10}%, #e5e7eb ${mood * 10}%)`
                  }}
                  title={`Day ${index + 1}: ${mood}/10`}
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* User Insights and Recommendations */}
      <div className="card animate-slideInUp mb-8" style={{animationDelay: '0.9s'}}>
        <div className="card-header">
          <h3 className="card-title">User Health Insights & Recommendations</h3>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userAnalytics.insights.map((insight, index) => (
              <div key={index} className={`p-3 rounded-lg border-l-4 ${
                insight.type === 'positive' ? 'bg-green-50 border-green-500' :
                insight.type === 'warning' ? 'bg-yellow-50 border-yellow-500' :
                'bg-blue-50 border-blue-500'
              }`}>
                <div className={`font-medium ${
                  insight.type === 'positive' ? 'text-green-800' :
                  insight.type === 'warning' ? 'text-yellow-800' :
                  'text-blue-800'
                }`}>
                  {insight.type === 'positive' ? '✅ Positive Trend' : 
                   insight.type === 'warning' ? '⚠️ Attention Needed' : '💡 Suggestion'}
                </div>
                <div className={`text-sm ${
                  insight.type === 'positive' ? 'text-green-700' :
                  insight.type === 'warning' ? 'text-yellow-700' :
                  'text-blue-700'
                }`}>
                  {insight.message}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card animate-slideInUp" style={{animationDelay: '1.0s'}}>
          <div className="card-header">
            <h3 className="card-title">User Growth</h3>
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#2563eb', marginBottom: 8 }}>
            +{analytics?.userGrowthRate || 12}%
          </div>
          <div style={{ color: '#4b5563', fontSize: 16 }}>Growth in the last 30 days</div>
        </div>
        <div className="card animate-slideInUp" style={{animationDelay: '1.1s'}}>
          <div className="card-header">
            <h3 className="card-title">Article Engagement</h3>
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#10b981', marginBottom: 8 }}>
            +{analytics?.articleEngagementRate || 8}%
          </div>
          <div style={{ color: '#4b5563', fontSize: 16 }}>More articles read this week</div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardAnalytics;
