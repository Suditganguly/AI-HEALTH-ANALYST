import React, { useState, useRef } from 'react';
import { useUser } from '../context/UserContext';

const MedicineReminder = () => {
  const { userData, addReminder, deleteReminder, updateReminder } = useUser();
  const [form, setForm] = useState({ name: '', time: '', notes: '', frequency: 'Daily' });
  const [editingId, setEditingId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const timerRefs = useRef([]);

  // Request notification permission on mount
  React.useEffect(() => {
    if (Notification && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
    return () => {
      // Clear all timers on unmount
      timerRefs.current.forEach(timer => clearTimeout(timer));
    };
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = e => {
    e.preventDefault();
    if (!form.name || !form.time) return;
    
    if (isEditing && editingId) {
      // Update existing reminder
      const updatedReminder = {
        id: editingId,
        name: form.name,
        time: form.time,
        notes: form.notes,
        frequency: form.frequency,
        taken: userData.reminders.find(r => r.id === editingId)?.taken || false
      };
      
      updateReminder(editingId, updatedReminder);
      setIsEditing(false);
      setEditingId(null);
    } else {
      // Add new reminder
      const newReminder = {
        id: Date.now(),
        name: form.name,
        time: form.time,
        notes: form.notes,
        frequency: form.frequency,
        taken: false
      };
      
      addReminder(newReminder);
      scheduleNotification(newReminder);
    }
    
    setForm({ name: '', time: '', notes: '', frequency: 'Daily' });
  };

  const handleEdit = (reminder) => {
    setForm({
      name: reminder.name,
      time: reminder.time,
      notes: reminder.notes || '',
      frequency: reminder.frequency || 'Daily'
    });
    setEditingId(reminder.id);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setForm({ name: '', time: '', notes: '', frequency: 'Daily' });
    setEditingId(null);
    setIsEditing(false);
  };

  const scheduleNotification = reminder => {
    const now = new Date();
    const [h, m] = reminder.time.split(':');
    const target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0, 0);
    let delay = target - now;
    if (delay < 0) delay += 24 * 60 * 60 * 1000; // If time passed, schedule for next day
    const timer = setTimeout(() => {
      if (Notification.permission === 'granted') {
        new Notification('Medicine Reminder', {
          body: `${reminder.name}${reminder.notes ? ' - ' + reminder.notes : ''}`,
        });
      }
    }, delay);
    timerRefs.current.push(timer);
  };

  const handleDelete = id => {
    deleteReminder(id);
  };

  return (
    <div style={{ width: '100%', minHeight: 'calc(100vh - 60px)', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '20px' }}>
      <div className="card card-alt" style={{ maxWidth: 900, width: '100%', marginTop: 32, minHeight: '600px', padding: '32px' }}>
        <h2 style={{ color: '#1976d2', marginBottom: 24, fontSize: '28px' }}>
          {isEditing ? 'Edit Medicine Reminder' : 'Medicine Reminder'}
        </h2>
        <form onSubmit={handleAdd} style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center', background: '#f5f7fa', borderRadius: 12, padding: 24, marginBottom: 32 }}>
          <input name="name" value={form.name} onChange={handleChange} placeholder="Medicine Name" className="input input-dark" style={{ flex: 2, minWidth: 160, height: '48px', fontSize: '16px' }} />
          <input name="time" value={form.time} onChange={handleChange} type="time" placeholder="Time" className="input input-dark" style={{ width: 140, height: '48px', fontSize: '16px' }} />
          <select name="frequency" value={form.frequency} onChange={handleChange} className="input input-dark" style={{ width: 120, height: '48px', fontSize: '16px' }}>
            <option value="Daily">Daily</option>
            <option value="Twice Daily">Twice Daily</option>
            <option value="Weekly">Weekly</option>
            <option value="As Needed">As Needed</option>
          </select>
          <input name="notes" value={form.notes} onChange={handleChange} placeholder="Notes (optional)" className="input input-dark" style={{ flex: 3, minWidth: 180, height: '48px', fontSize: '16px' }} />
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" className="button" style={{ height: '48px', padding: '0 24px', fontSize: '16px', backgroundColor: isEditing ? '#ff9800' : '#1976d2' }}>
              {isEditing ? 'Update' : 'Add'}
            </button>
            {isEditing && (
              <button 
                type="button" 
                onClick={handleCancelEdit}
                className="button" 
                style={{ height: '48px', padding: '0 24px', fontSize: '16px', backgroundColor: '#6c757d' }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
        <div style={{ minHeight: '400px' }}>
          <h3 style={{ color: '#1976d2', marginBottom: 20, fontSize: '22px' }}>Your Reminders</h3>
          {userData.reminders.length === 0 ? (
            <div style={{ color: '#888', fontStyle: 'italic', fontSize: '18px', textAlign: 'center', padding: '40px 0' }}>No reminders yet. Add your first medicine reminder above.</div>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {userData.reminders.map(rem => (
                <li key={rem.id} style={{ 
                  background: rem.id === editingId ? '#fff3cd' : '#f7f7f7', 
                  borderRadius: 12, 
                  marginBottom: 16, 
                  padding: '20px 24px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  minHeight: '80px',
                  border: rem.id === editingId ? '2px solid #ffc107' : '1px solid #e0e0e0'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 18, marginBottom: '8px' }}>{rem.name}</div>
                    <div style={{ color: '#1976d2', fontSize: 16, marginBottom: '4px' }}>Time: {rem.time} • {rem.frequency}</div>
                    {rem.notes && <div style={{ color: '#555', fontSize: 15 }}>Notes: {rem.notes}</div>}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button 
                      onClick={() => handleEdit(rem)} 
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        color: '#1976d2', 
                        fontWeight: 600, 
                        fontSize: 16, 
                        cursor: 'pointer', 
                        padding: '8px 16px', 
                        borderRadius: '6px', 
                        transition: 'background-color 0.2s' 
                      }} 
                      onMouseOver={(e) => e.target.style.backgroundColor = '#e3f2fd'} 
                      onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(rem.id)} 
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        color: '#d32f2f', 
                        fontWeight: 600, 
                        fontSize: 16, 
                        cursor: 'pointer', 
                        padding: '8px 16px', 
                        borderRadius: '6px', 
                        transition: 'background-color 0.2s' 
                      }} 
                      onMouseOver={(e) => e.target.style.backgroundColor = '#ffebee'} 
                      onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default MedicineReminder;