import React, { useState } from 'react';
import { useUser } from '../context/UserContext';

const defaultGoals = [
  'Drink 8 glasses of water',
  'Walk 30 minutes',
  'Eat 5 servings of fruits/vegetables',
  'Take deep breaths for 5 minutes',
  'Sleep at least 7 hours'
];

const staticTips = [
  'Stay hydrated throughout the day.',
  'Take regular breaks from screens.',
  'Incorporate more whole foods into your diet.',
  'Practice mindfulness or meditation.',
  'Maintain a consistent sleep schedule.'
];

const HealthTips = () => {
  const [user, setUser] = useState({ name: '', age: '', gender: '' });
  const [newGoal, setNewGoal] = useState({ text: '', target: '' });
  
  // Use centralized user data
  const { userData, addGoal, toggleGoal, deleteGoal, updateProfile } = useUser();

  const handleUserChange = e => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
    // Update profile in centralized context
    updateProfile({ [name]: value });
  };

  const handleToggleGoal = (goalId) => {
    toggleGoal(goalId);
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

  const handleDeleteGoal = (goalId) => {
    deleteGoal(goalId);
  };

  return (
    <div style={{ width: '100%', minHeight: 'calc(100vh - 60px)', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '20px' }}>
      <div className="card card-gradient" style={{ maxWidth: 600, width: '100%', marginTop: 32, minHeight: '520px', padding: '24px' }}>
        <h2 style={{ marginBottom: 24, color: '#1976d2', letterSpacing: 1, fontSize: '28px' }}>Personalized Health Tips & Goals</h2>
        {userData.profile.name && (
          <div style={{ fontSize: 20, marginBottom: 24, color: '#333', padding: '16px', background: '#f0f8ff', borderRadius: '12px', border: '1px solid #e3f2fd' }}>Hello, <b>{userData.profile.name}</b>! Here are your wellness tips for today:</div>
        )}
        <form style={{ marginBottom: 24, display: 'flex', gap: 10, flexWrap: 'nowrap', alignItems: 'center', background: '#f5f7fa', borderRadius: 10, padding: 10, justifyContent: 'flex-start' }}>
          <input name="name" value={userData.profile.name || ''} onChange={handleUserChange} placeholder="Name" className="input input-dark" style={{ width: 300, minWidth: 180, maxWidth: 300, height: '32px', fontSize: '15px', padding: '4px 10px' }} />
          <input name="age" value={userData.profile.age || ''} onChange={handleUserChange} placeholder="Age" type="number" className="input input-dark" style={{ width: 80, minWidth: 60, maxWidth: 100, height: '32px', fontSize: '15px', padding: '4px 10px' }} />
          <select name="gender" value={userData.profile.gender || ''} onChange={handleUserChange} className="input input-dark" style={{ width: 120, minWidth: 90, maxWidth: 120, padding: '4px 10px', borderRadius: 8, border: '1px solid #bfc7d1', background: userData.profile.gender ? '#fff' : '#f5f7fa', color: userData.profile.gender ? '#222' : '#bfc7d1', height: '32px', fontSize: '15px' }}>
            <option value="" disabled>Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </form>
        <hr style={{ border: 'none', borderTop: '2px solid #e3e3e3', margin: '32px 0 24px 0' }} />
        <div style={{ marginBottom: 20, minHeight: '180px' }}>
          <h3 style={{ color: '#1976d2', marginBottom: 12, fontSize: '20px' }}>Today's Health Tips</h3>
          <ul style={{ paddingLeft: 18, margin: 0 }}>
            {staticTips.map((tip, idx) => (
              <li key={idx} style={{ marginBottom: 8, color: '#444', fontSize: 16, lineHeight: '1.4', padding: '4px 0' }}>{tip}</li>
            ))}
          </ul>
        </div>
        <hr style={{ border: 'none', borderTop: '2px solid #e3e3e3', margin: '24px 0 24px 0' }} />
        <div style={{ minHeight: '220px' }}>
          <h3 style={{ color: '#1976d2', marginBottom: 12, fontSize: '20px' }}>Daily Wellness Goals</h3>
          
          {/* Add new goal form */}
          <div style={{ marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              type="text"
              value={newGoal.text}
              onChange={(e) => setNewGoal({...newGoal, text: e.target.value})}
              placeholder="New goal..."
              className="input input-dark"
              style={{ flex: 1, height: '32px', fontSize: '15px', padding: '4px 10px' }}
            />
            <input
              type="number"
              value={newGoal.target}
              onChange={(e) => setNewGoal({...newGoal, target: e.target.value})}
              placeholder="Target"
              className="input input-dark"
              style={{ width: 80, height: '32px', fontSize: '15px', padding: '4px 10px' }}
            />
            <button 
              onClick={handleAddGoal} 
              className="button"
              style={{ height: '32px', padding: '0 16px', fontSize: '15px', backgroundColor: '#1976d2' }}
            >
              Add
            </button>
            <button 
              onClick={() => setNewGoal({ text: '', target: '' })} 
              className="button"
              style={{ height: '32px', padding: '0 16px', fontSize: '15px', backgroundColor: '#6c757d' }}
            >
              Clear
            </button>
          </div>
          
          <ul style={{ paddingLeft: 0, listStyle: 'none', margin: 0 }}>
            {userData.goals.map((goal, idx) => (
              <li key={goal.id} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', background: goal.done ? '#e3f6e8' : '#f7f7f7', borderRadius: 10, padding: '10px 14px', transition: 'background 0.2s, transform 0.2s', minHeight: '40px' }} onMouseOver={(e) => e.target.style.transform = 'translateY(-1px)'} onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}>
                  <input 
                    type="checkbox" 
                    checked={goal.done} 
                    onChange={() => handleToggleGoal(goal.id)} 
                    style={{ marginRight: 10, accentColor: '#1976d2', width: 16, height: 16 }} 
                  />
                  <span style={{ textDecoration: goal.done ? 'line-through' : 'none', color: goal.done ? '#1976d2' : '#222', fontWeight: 500, fontSize: 16, lineHeight: '1.4', flex: 1 }}>{goal.text}</span>
                  <div style={{ marginRight: 10, fontSize: '12px', color: '#666' }}>
                    {goal.progress}/{goal.target}
                  </div>
                  <button 
                    onClick={() => handleDeleteGoal(goal.id)}
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      color: '#d32f2f', 
                      fontWeight: 600, 
                      fontSize: 14, 
                      cursor: 'pointer', 
                      padding: '4px 8px', 
                      borderRadius: '4px', 
                      transition: 'background-color 0.2s' 
                    }} 
                    onMouseOver={(e) => e.target.style.backgroundColor = '#ffebee'} 
                    onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    ✕
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HealthTips;