import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const AnalyticsDashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [selectedMetric, setSelectedMetric] = useState('all');
  const [quickLog, setQuickLog] = useState({ steps: '', water: '', sleep: '', exercise: '', mood: '', medication: '' });
  const {
    userData = {},
    addActivityLogEntry,
    addReminder,
    updateVitals,
    addGoal,
    toggleGoal,
    // Add any other relevant context methods
  } = useUser();

  // Guard: If userData is missing, show loading
  if (!userData || Object.keys(userData).length === 0) {
    return <div className="w-full flex justify-center items-center p-8 text-lg">Loading analytics...</div>;
  }

  // Helper: get activity log entries for a type and period (default: last 7 days)
  const getActivityLogStats = (type, days = 7) => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - (days - 1));
    return (userData.activityLog || []).filter(entry =>
      entry.type === type &&
      new Date(entry.date) >= start &&
      new Date(entry.date) <= now
    );
  };
  const sumActivity = (type, days = 7) => getActivityLogStats(type, days).reduce((sum, entry) => sum + Number(entry.value), 0);
  const avgActivity = (type, days = 7) => {
    const entries = getActivityLogStats(type, days);
    return entries.length ? (entries.reduce((sum, entry) => sum + Number(entry.value), 0) / entries.length) : 0;
  };
  // For mood and weight trend charts, get last 7 values
  const lastNActivity = (type, n = 7) => {
    const entries = (userData.activityLog || []).filter(entry => entry.type === type);
    return entries.slice(-n).map(e => Number(e.value));
  };

  // Goals and Med Adherence
  const goalsCompleted = (userData.goals || []).filter(g => g.done).length;
  const totalGoals = (userData.goals || []).length;
  const goalsCompletionRate = totalGoals ? Math.round((goalsCompleted / totalGoals) * 100) : 0;

  const medsTaken = (userData.reminders || []).filter(r => r.taken).length;
  const totalMeds = (userData.reminders || []).length;
  const medAdherence = totalMeds ? Math.round((medsTaken / totalMeds) * 100) : 0;

  // Weight trend (last 7 days)
  const weightHistory = (userData.vitals || []).filter(v => v.name === 'weight').slice(-7).map(v => Number(v.value));
  const weightTarget = userData.profile?.healthGoals?.targetWeight || '';
  const weightCurrent = weightHistory.length ? weightHistory[weightHistory.length - 1] : '';

  // Centralized quick log handlers
  const handleQuickLogChange = (field, value) => {
    setQuickLog(prev => ({ ...prev, [field]: value }));
  };
  const handleQuickLogSubmit = (field) => {
    if (!quickLog[field]) return;
    let value = parseFloat(quickLog[field]);
    if (isNaN(value)) value = 0;
    // Update main data for the field
    if (field === 'steps' || field === 'water' || field === 'sleep' || field === 'exercise') {
      // Use updateActivityData to log activity (this should update the main activity log, not just analytics)
      addActivityLogEntry({ type: field, value: value, date: new Date().toISOString() });
    }
    if (field === 'mood') {
      // Add a new mood entry to the Health Journal (or wherever mood is tracked)
      // For demo: add a goal with mood as text (replace with real mood logging logic)
      addGoal({ text: `Mood: ${value}`, target: 1 });
    }
    if (field === 'medication') {
      // Add a new medication reminder (or mark as taken)
      // For demo: add a reminder (replace with real medication logging logic)
      addReminder({ name: 'Medication', time: new Date().toLocaleTimeString(), notes: '', frequency: 'Once', taken: true });
    }
    setQuickLog(prev => ({ ...prev, [field]: '' }));
  };

  // Helper to get labels for selected period
  const getPeriodLabels = () => {
    if (selectedPeriod === 'week') {
      return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    } else if (selectedPeriod === 'month') {
      const now = new Date();
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      return Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString());
    }
    return [];
  };
  // Helper to get daily values for a metric for the selected period
  const getPeriodData = (type) => {
    const labels = getPeriodLabels();
    const now = new Date();
    let start;
    if (selectedPeriod === 'week') {
      // Start from last Monday
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      start = new Date(now.setDate(diff));
    } else if (selectedPeriod === 'month') {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
    }
    return labels.map((label, idx) => {
      let date;
      if (selectedPeriod === 'week') {
        date = new Date(start);
        date.setDate(start.getDate() + idx);
      } else if (selectedPeriod === 'month') {
        date = new Date(start);
        date.setDate(idx + 1);
      }
      const entry = (userData.activityLog || []).find(e => {
        const entryDate = new Date(e.date);
        return e.type === type && entryDate.toDateString() === date.toDateString();
      });
      return entry ? Number(entry.value) : 0;
    });
  };

  const periods = [
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' }
  ];

  const metrics = [
    { value: 'all', label: 'All Metrics' },
    { value: 'vitals', label: 'Vitals' },
    { value: 'activities', label: 'Activities' },
    { value: 'mood', label: 'Mood & Wellness' },
    { value: 'medications', label: 'Medications' }
  ];

  const getTrendIcon = (trend) => {
    switch(trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      case 'stable': return '➡️';
      default: return '📊';
    }
  };

  const getTrendColor = (trend) => {
    switch(trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      case 'stable': return 'text-blue-600';
      default: return 'text-neutral-600';
    }
  };

  const calculatePercentageChange = (current, previous) => {
    return ((current - previous) / previous * 100).toFixed(1);
  };

  const getProgressColor = (current, target) => {
    const percentage = (current / target) * 100;
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 75) return 'bg-blue-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Update health score when user completes goals or activities
  const handleActivityUpdate = (activityType, value) => {
    // This function is no longer needed as activity updates are handled by addActivityLogEntry
  };

  return (
    <div className="w-full flex justify-center items-start p-4 md:p-8">
      <div className="card card-gradient w-full max-w-7xl mt-8 p-4 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h2 className="text-primary text-2xl md:text-3xl font-bold mb-4 md:mb-0">Health Analytics</h2>
          <div className="flex gap-4">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="input input-dark"
            >
              {periods.map(period => (
                <option key={period.value} value={period.value}>{period.label}</option>
              ))}
            </select>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="input input-dark"
            >
              {metrics.map(metric => (
                <option key={metric.value} value={metric.value}>{metric.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Health Score Overview */}
        <div className="card card-alt p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-primary">Overall Health Score</h3>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-primary">{userData.healthScore?.current ?? 0}</span>
              <span className="text-lg text-neutral-500">/100</span>
            </div>
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <span className={getTrendColor(userData.healthScore?.trend)}>
                {getTrendIcon(userData.healthScore?.trend)}
              </span>
              <span className={`font-medium ${getTrendColor(userData.healthScore?.trend)}`}>
                {calculatePercentageChange(userData.healthScore?.current ?? 0, userData.healthScore?.previous ?? 0)}%
              </span>
              <span className="text-neutral-500">vs last period</span>
            </div>
          </div>
          <div className="w-full bg-neutral-200 rounded-full h-3">
            <div 
              className="bg-primary h-3 rounded-full transition-all duration-500"
              style={{ width: `${userData.healthScore?.current ?? 0}%` }}
            ></div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Steps */}
          <div className="card card-alt p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-primary">Daily Steps</h4>
              <span className="text-2xl">👟</span>
            </div>
            <div className="text-2xl font-bold mb-1">{avgActivity('steps')}</div>
            <div className="text-sm text-neutral-600 mb-2">
              Target: {userData.profile?.healthGoals?.targetSteps || 'N/A'}
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${getProgressColor(avgActivity('steps'), userData.profile?.healthGoals?.targetSteps || 0)}`}
                style={{ width: `${Math.min((avgActivity('steps') / (userData.profile?.healthGoals?.targetSteps || 0)) * 100, 100)}%` }}
              ></div>
            </div>
            <Line data={{ labels: getPeriodLabels(), datasets: [{ label: 'Steps', data: getPeriodData('steps'), borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.2)' }] }} options={{ responsive: true, plugins: { legend: { display: false } } }} />
          </div>

          {/* Sleep */}
          <div className="card card-alt p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-primary">Sleep Quality</h4>
              <span className="text-2xl">😴</span>
            </div>
            <div className="text-2xl font-bold mb-1">{avgActivity('sleep')}h</div>
            <div className="text-sm text-neutral-600 mb-2">
              Target: {userData.profile?.healthGoals?.targetSleep || 'N/A'}h
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${getProgressColor(avgActivity('sleep'), userData.profile?.healthGoals?.targetSleep || 0)}`}
                style={{ width: `${Math.min((avgActivity('sleep') / (userData.profile?.healthGoals?.targetSleep || 0)) * 100, 100)}%` }}
              ></div>
            </div>
            <Line data={{ labels: getPeriodLabels(), datasets: [{ label: 'Sleep', data: getPeriodData('sleep'), borderColor: '#8b5cf6', backgroundColor: 'rgba(139,92,246,0.2)' }] }} options={{ responsive: true, plugins: { legend: { display: false } } }} />
          </div>

          {/* Medication Adherence */}
          <div className="card card-alt p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-primary">Med Adherence</h4>
              <span className="text-2xl">💊</span>
            </div>
            <div className="text-2xl font-bold mb-1">{medAdherence}%</div>
            <div className="text-sm text-neutral-600 mb-2">
              {medsTaken}/{totalMeds} taken
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${getProgressColor(medAdherence, 100)}`}
                style={{ width: `${medAdherence}%` }}
              ></div>
            </div>
            <Line data={{ labels: getPeriodLabels(), datasets: [{ label: 'Medication', data: getPeriodData('medication'), borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.2)' }] }} options={{ responsive: true, plugins: { legend: { display: false } } }} />
          </div>

          {/* Goal Completion */}
          <div className="card card-alt p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-primary">Goals</h4>
              <span className="text-2xl">🎯</span>
            </div>
            <div className="text-2xl font-bold mb-1">{goalsCompletionRate}%</div>
            <div className="text-sm text-neutral-600 mb-2">
              {goalsCompleted}/{totalGoals} completed
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${getProgressColor(goalsCompletionRate, 100)}`}
                style={{ width: `${goalsCompletionRate}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Detailed Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Weight Trend */}
          <div className="card card-alt p-6">
            <h3 className="text-lg font-semibold mb-4 text-primary">Weight Trend</h3>
            <div className="flex items-end h-40 gap-2">
              {weightHistory.map((weight, idx) => {
                const maxWeight = Math.max(...weightHistory);
                const minWeight = Math.min(...weightHistory);
                const height = ((weight - minWeight) / (maxWeight - minWeight)) * 100 + 20;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center">
                    <div className="text-xs text-neutral-600 mb-1">{weight}kg</div>
                    <div 
                      className="bg-gradient-to-t from-primary to-secondary rounded-md w-full transition-all duration-500" 
                      style={{ height: `${height}px` }}
                    ></div>
                    <div className="text-neutral-500 text-xs mt-1">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][idx]}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 text-center">
              <span className="text-sm text-neutral-600">
                Target: {weightTarget}kg | 
                Current: {weightCurrent}kg
              </span>
            </div>
          </div>

          {/* Mood Tracking */}
          <div className="card card-alt p-6">
            <h3 className="text-lg font-semibold mb-4 text-primary">Mood Tracking</h3>
            <div className="flex items-end h-40 gap-2">
              {lastNActivity('mood', 7).map((mood, idx) => {
                const height = (mood / 10) * 100;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center">
                    <div className="text-xs text-neutral-600 mb-1">{mood}/10</div>
                    <div 
                      className="bg-gradient-to-t from-purple-400 to-purple-600 rounded-md w-full transition-all duration-500" 
                      style={{ height: `${height}px` }}
                    ></div>
                    <div className="text-neutral-500 text-xs mt-1">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][idx]}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 text-center">
              <span className="text-sm text-neutral-600">
                Average: {userData.mood?.average ?? '-'}/10 | 
                Trend: {userData.mood?.trend}
              </span>
            </div>
          </div>
        </div>

        {/* Activity Summary */}
        <div className="card card-alt p-6">
          <h3 className="text-lg font-semibold mb-4 text-primary">Weekly Activity Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-2">🚶‍♂️</div>
              <div className="text-2xl font-bold text-primary">{sumActivity('steps')}</div>
              <div className="text-sm text-neutral-600">Total Steps</div>
              <div className="flex gap-2 mt-2">
                <input type="number" min="0" value={quickLog.steps} onChange={e => handleQuickLogChange('steps', e.target.value)} placeholder="Log steps" className="input input-dark w-20" />
                <button className="btn btn-primary" onClick={() => handleQuickLogSubmit('steps')}>Add</button>
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">💪</div>
              <div className="text-2xl font-bold text-primary">{sumActivity('exercise')}</div>
              <div className="text-sm text-neutral-600">Exercise Minutes</div>
              <div className="flex gap-2 mt-2">
                <input type="number" min="0" value={quickLog.exercise} onChange={e => handleQuickLogChange('exercise', e.target.value)} placeholder="Log min" className="input input-dark w-20" />
                <button className="btn btn-primary" onClick={() => handleQuickLogSubmit('exercise')}>Add</button>
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">💧</div>
              <div className="text-2xl font-bold text-primary">{sumActivity('water')}</div>
              <div className="text-sm text-neutral-600">Glasses of Water</div>
              <div className="flex gap-2 mt-2">
                <input type="number" min="0" value={quickLog.water} onChange={e => handleQuickLogChange('water', e.target.value)} placeholder="Log glass" className="input input-dark w-20" />
                <button className="btn btn-primary" onClick={() => handleQuickLogSubmit('water')}>Add</button>
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">😴</div>
              <div className="text-2xl font-bold text-primary">{avgActivity('sleep', 7).toFixed(1)}</div>
              <div className="text-sm text-neutral-600">Hours of Sleep</div>
              <div className="flex gap-2 mt-2">
                <input type="number" min="0" value={quickLog.sleep} onChange={e => handleQuickLogChange('sleep', e.target.value)} placeholder="Log hr" className="input input-dark w-20" />
                <button className="btn btn-primary" onClick={() => handleQuickLogSubmit('sleep')}>Add</button>
              </div>
            </div>
          </div>
        </div>
        {/* Mood & Medication Quick Log */}
        <div className="card card-alt p-6 mt-6">
          <h3 className="text-lg font-semibold mb-4 text-primary">Quick Log: Mood & Medication</h3>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 flex flex-col items-center">
              <div className="text-3xl mb-2">🙂</div>
              <div className="text-sm text-neutral-600 mb-2">Mood (1-10)</div>
              <input type="number" min="1" max="10" value={quickLog.mood} onChange={e => handleQuickLogChange('mood', e.target.value)} placeholder="Mood" className="input input-dark w-20 mb-2" />
              <button className="btn btn-primary w-20" onClick={() => handleQuickLogSubmit('mood')}>Add</button>
            </div>
            <div className="flex-1 flex flex-col items-center">
              <div className="text-3xl mb-2">💊</div>
              <div className="text-sm text-neutral-600 mb-2">Medication Taken</div>
              <input type="number" min="0" value={quickLog.medication} onChange={e => handleQuickLogChange('medication', e.target.value)} placeholder="Count" className="input input-dark w-20 mb-2" />
              <button className="btn btn-primary w-20" onClick={() => handleQuickLogSubmit('medication')}>Add</button>
            </div>
          </div>
        </div>

        {/* Health Insights */}
        <div className="card card-alt p-6">
          <h3 className="text-lg font-semibold mb-4 text-primary">Health Insights & Recommendations</h3>
          <div className="space-y-3">
            {(userData.insights || []).map((insight, index) => (
              <div key={index} className={`flex items-start gap-3 p-3 rounded-lg border-l-4 ${
                insight.type === 'positive' ? 'bg-green-50 border-green-500' :
                insight.type === 'warning' ? 'bg-yellow-50 border-yellow-500' :
                'bg-blue-50 border-blue-500'
              }`}>
                <span className={`text-xl ${
                  insight.type === 'positive' ? 'text-green-600' :
                  insight.type === 'warning' ? 'text-yellow-600' :
                  'text-blue-600'
                }`}>
                  {insight.type === 'positive' ? '✅' : insight.type === 'warning' ? '⚠️' : '💡'}
                </span>
                <div>
                  <div className={`font-medium ${
                    insight.type === 'positive' ? 'text-green-800' :
                    insight.type === 'warning' ? 'text-yellow-800' :
                    'text-blue-800'
                  }`}>
                    {insight.type === 'positive' ? 'Great Progress!' : 
                     insight.type === 'warning' ? 'Attention Needed' : 'Suggestion'}
                  </div>
                  <div className={`text-sm ${
                    insight.type === 'positive' ? 'text-green-700' :
                    insight.type === 'warning' ? 'text-yellow-700' :
                    'text-blue-700'
                  }`}>
                    {insight.message}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;