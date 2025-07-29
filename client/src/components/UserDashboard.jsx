import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import './UserDashboard.css';

const UserDashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedMetric, setSelectedMetric] = useState('steps');
  const [editingProfile, setEditingProfile] = useState(false);
  const [editingVitals, setEditingVitals] = useState(false);
  const [newGoal, setNewGoal] = useState({ text: '', target: '' });
  
  // Use centralized user data
  const { 
    userData, 
    derivedData,
    updateProfile, 
    updateVitals, 
    addGoal, 
    toggleGoal, 
    deleteGoal,
    toggleReminder,
    updateHealthScore,
    updateActivityData,
    loadUserAppointments
  } = useUser();

  // Get analytics data from centralized context
  const { userAnalytics } = userData;

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Load appointments when component mounts
  useEffect(() => {
    if (userData.profile.email) {
      loadUserAppointments(userData.profile.email);
    }
  }, [userData.profile.email, loadUserAppointments]);

  // Handler functions
  const handleUserUpdate = (field, value) => {
    updateProfile({ [field]: value });
  };

  const handleVitalUpdate = (index, value) => {
    updateVitals(index, value);
  };

  const handleAddGoal = () => {
    if (newGoal.text && newGoal.target) {
      addGoal({
        text: newGoal.text,
        target: parseInt(newGoal.target)
      });
      setNewGoal({ text: '', target: '' });
    }
  };

  const handleToggleGoal = (goalId) => {
    toggleGoal(goalId);
    // Update analytics when goals are completed
    const updatedGoals = userData.goals.map(goal => 
      goal.id === goalId ? { ...goal, done: !goal.done } : goal
    );
    const completedGoals = updatedGoals.filter(goal => goal.done).length;
    const completionRate = Math.round((completedGoals / updatedGoals.length) * 100);
    
    // Update health score based on goal completion
    const newHealthScore = Math.min(100, userData.profile.healthScore + (completionRate > 75 ? 2 : 0));
    updateHealthScore(newHealthScore);
  };

  const handleDeleteGoal = (goalId) => {
    deleteGoal(goalId);
  };

  const handleToggleReminder = (reminderId) => {
    toggleReminder(reminderId);
  };

  const getBMI = () => {
    const heightInM = userData.profile.height / 100;
    return (userData.profile.weight / (heightInM * heightInM)).toFixed(1);
  };

  const getHealthScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getActivityIcon = (type) => {
    switch(type) {
      case 'medicine': return '💊';
      case 'goal': return '🎯';
      case 'vital': return '📊';
      case 'exercise': return '💪';
      case 'missed': return '⚠️';
      default: return '📝';
    }
  };

  // Use centralized analytics data instead of local mock data
  const weeklyStats = {
    steps: userAnalytics.activities.steps.daily,
    water: userAnalytics.activities.water.glasses,
    sleep: userAnalytics.activities.sleep.hours,
    exercise: userAnalytics.activities.exercise.minutes
  };

  // Use centralized health insights
  const healthInsights = userAnalytics.insights;

  // Show all appointments without filtering
  const upcomingAppointments = userData.appointments;

  const CARD_MIN_HEIGHT = '320px'; // You can adjust this value for your preferred height

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6">
      {/* Welcome and stats below layout header */}
      <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-2xl md:text-3xl font-bold text-primary">Welcome back, {userData.profile.name}! 👋</h2>
          </div>
          <p style={{ color: '#fff', fontWeight: 600, textShadow: '0 1px 4px #000' }} className="text-sm md:text-base">
            {currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <p style={{ color: '#b3e5fc', fontWeight: 600, textShadow: '0 1px 4px #000' }} className="text-xs">
            Current time: {currentTime.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex gap-3">
          <div
            className={`text-xl md:text-2xl font-bold flex items-center justify-center shadow-lg border-2 ${getHealthScoreColor(userAnalytics.healthScore.current)}`}
            style={{
              background: 'rgba(30, 30, 30, 0.85)',
              borderRadius: '1rem',
              borderColor: '#fff',
              color: '#fff',
              minWidth: '70px',
              minHeight: '50px',
              padding: '0.4rem 1rem',
              textShadow: '0 2px 8px #000, 0 0 2px #fff',
              boxShadow: '0 4px 24px 0 rgba(0,0,0,0.25), 0 1.5px 0 #fff inset',
              letterSpacing: '1px',
              fontWeight: 900,
              fontSize: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2
            }}
          >
            {userAnalytics.healthScore.current}/100
          </div>
        </div>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 user-dashboard-cards">
        <div className="card card-stat p-3 flex flex-col items-center">
          <div className="text-sm font-semibold">BMI</div>
          <div className="text-xl font-bold">{getBMI()}</div>
          <div className="text-xs text-neutral-500">Height: {userData.profile.height}cm, Weight: {userAnalytics.vitals.weight.current}kg</div>
        </div>
        <div className="card card-stat p-3 flex flex-col items-center">
          <div className="text-sm font-semibold">Blood Type</div>
          <div className="text-xl font-bold">{userData.profile.bloodType}</div>
          <div className="text-xs text-neutral-500">Universal donor</div>
        </div>
        <div className="card card-stat p-3 flex flex-col items-center">
          <div className="text-sm font-semibold">Goals Completed</div>
          <div className="text-xl font-bold">{userData.goals.filter(g => g.done).length}/{userData.goals.length}</div>
          <div className="text-xs text-neutral-500">{userData.goals.length > 0 ? Math.round(userData.goals.filter(g => g.done).length / userData.goals.length * 100) : 0}% success rate</div>
        </div>
        <div className="card card-stat p-3 flex flex-col items-center">
          <div className="text-sm font-semibold">Med Adherence</div>
          <div className="text-xl font-bold">{userData.reminders.filter(r => r.taken).length}/{userData.reminders.length}</div>
          <div className="text-xs text-neutral-500">{userData.reminders.length > 0 ? Math.round(userData.reminders.filter(r => r.taken).length / userData.reminders.length * 100) : 0}% taken</div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="user-dashboard-main-grid">
        <div className="dashboard-six-boxes-grid">
        {/* Vital Signs */}
        <div className="w-full h-full">
          <div className="card h-full" style={{background: 'linear-gradient(135deg, #dbeafe 0%, #93c5fd 100%)', border: '1px solid #bfdbfe', minHeight: CARD_MIN_HEIGHT, padding: '20px'}}>
            <div className="card-header mb-3">
              <h3 className="card-title">Vital Signs</h3>
              <button 
                onClick={() => setEditingVitals(!editingVitals)}
                className="btn btn-outline btn-xs"
                style={{padding: '2px 10px', fontSize: '13px', height: '28px'}}
              >
                {editingVitals ? 'Save' : 'Edit'}
              </button>
            </div>
            <div
              className="grid vitals-grid"
              style={{
                gridTemplateColumns: '1fr 1fr',
                gridTemplateRows: '1fr 1fr',
                gap: '16px',
                width: '100%',
                minWidth: '260px'
              }}
            >
              {derivedData.filteredVitals.map((vital, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center justify-center rounded-xl shadow-md p-4 min-h-[110px]"
                  style={{ background: '#fff' }}
                >
                  <div className="text-2xl mb-1">{vital.icon}</div>
                  <div className="font-semibold text-sm mb-1">{vital.name}</div>
                  {editingVitals ? (
                    <input
                      type="text"
                      value={vital.value}
                      onChange={(e) => handleVitalUpdate(index, e.target.value)}
                      className="input input-xs text-center"
                      style={{fontSize: '15px', padding: '4px 8px'}}
                    />
                  ) : (
                    <div className="text-lg font-bold text-primary mb-1">
                      {vital.value} {vital.unit}
                    </div>
                  )}
                  <div className={`text-xs ${vital.status === 'normal' ? 'text-green-600' : 'text-yellow-600'}`}>{vital.status}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Health Goals */}
        <div className="w-full h-full">
          <div className="card h-full" style={{background: 'linear-gradient(135deg, #dcfce7 0%, #6ee7b7 100%)', border: '1px solid #bbf7d0', minHeight: CARD_MIN_HEIGHT}}>
            <div className="card-header">
              <h3 className="card-title">Health Goals</h3>
            </div>
            <div className="space-y-7">
              {userData.goals.length === 0 ? (
                <div className="text-xs text-neutral-400 text-center py-4">No health goals set.</div>
              ) : (
                userData.goals.map((goal, idx) => (
                  <div
                    key={goal.id}
                    style={{ background: '#fff', borderRadius: '14px', boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)', padding: '6px 10px', marginBottom: idx !== userData.goals.length - 1 ? '18px' : 0 }}
                    className="flex items-center gap-2"
                  >
                    <input
                      type="checkbox"
                      checked={goal.done}
                      onChange={() => handleToggleGoal(goal.id)}
                      className="checkbox"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-sm">{goal.text}</div>
                      <div className="text-xs text-neutral-500">
                        Progress: {goal.progress}/{goal.target}
                      </div>
                      <div className="w-full bg-neutral-200 rounded-full h-1.5 mt-1">
                        <div 
                          className="bg-primary h-1.5 rounded-full" 
                          style={{width: `${Math.min((goal.progress / goal.target) * 100, 100)}%`}}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        {/* Medicine Reminders */}
        <div className="w-full h-full">
          <div className="card h-full" style={{background: 'linear-gradient(135deg, #ede9fe 0%, #a5b4fc 100%)', border: '1px solid #ddd6fe', minHeight: CARD_MIN_HEIGHT}}>
            <div className="card-header">
              <h3 className="card-title">Medicine Reminders</h3>
            </div>
            <div className="space-y-7">
              {userData.reminders.length === 0 ? (
                <div className="text-xs text-neutral-400 text-center py-4">No reminders yet.</div>
              ) : (
                userData.reminders.map((reminder, idx) => (
                  <div
                    key={reminder.id}
                    style={{ background: '#fff', borderRadius: '14px', boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)', padding: '6px 10px', marginBottom: idx !== userData.reminders.length - 1 ? '18px' : 0 }}
                    className="flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={reminder.taken}
                        onChange={() => handleToggleReminder(reminder.id)}
                        className="checkbox"
                      />
                      <div>
                        <div className="font-semibold text-sm">{reminder.name}</div>
                        <div className="text-xs text-neutral-500">{reminder.time} • {reminder.frequency}</div>
                      </div>
                    </div>
                    <div className="text-xs text-neutral-400">{reminder.notes}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        {/* Recent Activity */}
        <div className="w-full h-full">
          <div className="card h-full" style={{background: 'linear-gradient(135deg, #fef9c3 0%, #fde68a 100%)', border: '1px solid #fef08a', minHeight: CARD_MIN_HEIGHT}}>
            <div className="card-header">
              <h3 className="card-title">Recent Activity</h3>
            </div>
            <div className="space-y-1">
              {derivedData.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center gap-2 p-1">
                  <span className="text-base">{getActivityIcon(activity.type)}</span>
                  <div className="flex-1">
                    <div className="text-xs">{activity.desc}</div>
                    <div className="text-xs text-neutral-500">{activity.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Health Insights */}
        <div className="w-full h-full">
          <div className="card h-full" style={{background: 'linear-gradient(135deg, #fce7f3 0%, #f9a8d4 100%)', border: '1px solid #fbcfe8', minHeight: CARD_MIN_HEIGHT}}>
            <div className="card-header">
              <h3 className="card-title">Health Insights</h3>
            </div>
            <div className="space-y-1">
              {healthInsights.map((insight, index) => (
                <div key={index} className={`p-2 rounded text-xs ${
                  insight.type === 'positive' ? 'bg-green-50 text-green-800' :
                  insight.type === 'warning' ? 'bg-yellow-50 text-yellow-800' :
                  'bg-blue-50 text-blue-800'
                }`}>
                  {insight.message}
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Upcoming Appointments */}
        <div className="w-full h-full">
          <div className="card h-full" style={{background: 'linear-gradient(135deg, #cffafe 0%, #67e8f9 100%)', border: '1px solid #a5f3fc', minHeight: CARD_MIN_HEIGHT}}>
            <div className="card-header">
              <h3 className="card-title">Upcoming Appointments</h3>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {upcomingAppointments.length === 0 ? (
                <div className="text-xs text-neutral-400 text-center py-4">No upcoming appointments.</div>
              ) : (
                upcomingAppointments.map((apt) => (
                  <div key={apt.id} className="p-2 bg-neutral-50 rounded-lg">
                    <div className="font-semibold text-sm">{apt.doctorName}</div>
                    <div className="text-xs text-neutral-600">{apt.specialty}</div>
                    <div className="text-xs text-neutral-500">
                      📅 {apt.date} at {apt.time}
                    </div>
                    <div className="text-xs text-neutral-500">📝 {apt.reason}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;