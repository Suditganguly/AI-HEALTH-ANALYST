import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';

const HealthJournal = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeTab, setActiveTab] = useState('symptoms');
  const [journalEntries, setJournalEntries] = useState({});
  
  // Use centralized user data
  const { userData, updateVitals, updateProfile } = useUser();

  // Initialize today's entry if it doesn't exist
  useEffect(() => {
    if (!journalEntries[selectedDate]) {
      setJournalEntries(prev => ({
        ...prev,
        [selectedDate]: {
          symptoms: [],
          mood: { rating: 5, notes: '' },
          meals: [],
          exercise: [],
          vitals: {
            weight: '',
            bloodPressure: '',
            heartRate: '',
            temperature: '',
            bloodSugar: ''
          },
          sleep: {
            bedtime: '',
            wakeTime: '',
            quality: 5,
            notes: ''
          },
          medications: [],
          notes: ''
        }
      }));
    }
  }, [selectedDate, journalEntries]);

  const currentEntry = journalEntries[selectedDate] || {};

  const updateEntry = (section, data) => {
    setJournalEntries(prev => ({
      ...prev,
      [selectedDate]: {
        ...prev[selectedDate],
        [section]: data
      }
    }));
  };

  // Update vitals in centralized context when recorded in journal
  const updateVitalsInContext = (vitalIndex, value) => {
    updateVitals(vitalIndex, value);
    
    // Also update the journal entry
    const vitalNames = ['weight', 'bloodPressure', 'heartRate', 'temperature'];
    const vitalName = vitalNames[vitalIndex];
    if (vitalName) {
      updateEntry('vitals', { ...currentEntry.vitals, [vitalName]: value });
    }
  };

  const addSymptom = (symptom) => {
    if (symptom.name && symptom.severity) {
      const newSymptoms = [...(currentEntry.symptoms || []), {
        ...symptom,
        id: Date.now(),
        time: new Date().toLocaleTimeString()
      }];
      updateEntry('symptoms', newSymptoms);
    }
  };

  const removeSymptom = (id) => {
    const updatedSymptoms = currentEntry.symptoms.filter(s => s.id !== id);
    updateEntry('symptoms', updatedSymptoms);
  };

  const addMeal = (meal) => {
    if (meal.name) {
      const newMeals = [...(currentEntry.meals || []), {
        ...meal,
        id: Date.now(),
        time: meal.time || new Date().toLocaleTimeString()
      }];
      updateEntry('meals', newMeals);
    }
  };

  const removeMeal = (id) => {
    const updatedMeals = currentEntry.meals.filter(m => m.id !== id);
    updateEntry('meals', updatedMeals);
  };

  const addExercise = (exercise) => {
    if (exercise.activity && exercise.duration) {
      const newExercise = [...(currentEntry.exercise || []), {
        ...exercise,
        id: Date.now(),
        time: exercise.time || new Date().toLocaleTimeString()
      }];
      updateEntry('exercise', newExercise);
    }
  };

  const removeExercise = (id) => {
    const updatedExercise = currentEntry.exercise.filter(e => e.id !== id);
    updateEntry('exercise', updatedExercise);
  };

  const addMedication = (medication) => {
    if (medication.name && medication.time) {
      const newMedications = [...(currentEntry.medications || []), {
        ...medication,
        id: Date.now(),
        taken: false
      }];
      updateEntry('medications', newMedications);
    }
  };

  const toggleMedication = (id) => {
    const updatedMedications = currentEntry.medications.map(med =>
      med.id === id ? { ...med, taken: !med.taken } : med
    );
    updateEntry('medications', updatedMedications);
  };

  const removeMedication = (id) => {
    const updatedMedications = currentEntry.medications.filter(m => m.id !== id);
    updateEntry('medications', updatedMedications);
  };

  const tabs = [
    { id: 'symptoms', label: 'Symptoms', icon: '🤒' },
    { id: 'mood', label: 'Mood', icon: '😊' },
    { id: 'meals', label: 'Meals', icon: '🍽️' },
    { id: 'exercise', label: 'Exercise', icon: '💪' },
    { id: 'vitals', label: 'Vitals', icon: '📊' },
    { id: 'sleep', label: 'Sleep', icon: '😴' },
    { id: 'medications', label: 'Medications', icon: '💊' },
    { id: 'notes', label: 'Notes', icon: '📝' }
  ];

  const moodEmojis = ['😢', '😟', '😐', '🙂', '😊', '😄', '🤩', '😍', '🥳', '🌟'];
  const severityLevels = ['Mild', 'Moderate', 'Severe'];
  const sleepQualityLabels = ['Terrible', 'Poor', 'Fair', 'Good', 'Excellent'];

  return (
    <div className="w-full flex justify-center items-start p-4 md:p-8">
      <div className="card card-gradient w-full max-w-6xl mt-8 p-4 md:p-8 health-journal-mobile-card">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h2 className="text-primary text-2xl md:text-3xl font-bold mb-4 md:mb-0">Health Journal</h2>
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium">Date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="input input-dark"
            />
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-neutral-200">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2 rounded-t-lg font-medium transition-all text-sm ${
                activeTab === tab.id 
                  ? 'bg-primary text-white border-b-2 border-primary' 
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              <span className="mr-1">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Symptoms Tab */}
        {activeTab === 'symptoms' && (
          <div className="space-y-4">
            <SymptomForm onAdd={addSymptom} />
            <div className="space-y-2">
              {currentEntry.symptoms?.map(symptom => (
                <div key={symptom.id} className="card card-alt p-3 flex justify-between items-center">
                  <div>
                    <div className="font-medium">{symptom.name}</div>
                    <div className="text-sm text-neutral-600">
                      Severity: {symptom.severity} | Time: {symptom.time}
                    </div>
                    {symptom.notes && <div className="text-sm text-neutral-500">{symptom.notes}</div>}
                  </div>
                  <button 
                    onClick={() => removeSymptom(symptom.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mood Tab */}
        {activeTab === 'mood' && (
          <div className="space-y-4">
            <div className="card card-alt p-4">
              <h3 className="text-lg font-semibold mb-3">How are you feeling today?</h3>
              <div className="flex justify-center gap-2 mb-4">
                {moodEmojis.map((emoji, index) => (
                  <button
                    key={index}
                    onClick={() => updateEntry('mood', { ...currentEntry.mood, rating: index + 1 })}
                    className={`text-3xl p-2 rounded-lg transition-all ${
                      currentEntry.mood?.rating === index + 1 
                        ? 'bg-primary text-white scale-110' 
                        : 'hover:bg-neutral-100'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              <div className="text-center mb-4">
                <span className="text-lg font-medium">
                  Rating: {currentEntry.mood?.rating || 5}/10
                </span>
              </div>
              <textarea
                value={currentEntry.mood?.notes || ''}
                onChange={(e) => updateEntry('mood', { ...currentEntry.mood, notes: e.target.value })}
                placeholder="How are you feeling? Any specific thoughts or emotions?"
                rows={3}
                className="input input-dark w-full"
              />
            </div>
          </div>
        )}

        {/* Meals Tab */}
        {activeTab === 'meals' && (
          <div className="space-y-4">
            <MealForm onAdd={addMeal} />
            <div className="space-y-2">
              {currentEntry.meals?.map(meal => (
                <div key={meal.id} className="card card-alt p-3 flex justify-between items-center">
                  <div>
                    <div className="font-medium">{meal.name}</div>
                    <div className="text-sm text-neutral-600">
                      Time: {meal.time} | Calories: {meal.calories || 'N/A'}
                    </div>
                    {meal.notes && <div className="text-sm text-neutral-500">{meal.notes}</div>}
                  </div>
                  <button 
                    onClick={() => removeMeal(meal.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Exercise Tab */}
        {activeTab === 'exercise' && (
          <div className="space-y-4">
            <ExerciseForm onAdd={addExercise} />
            <div className="space-y-2">
              {currentEntry.exercise?.map(exercise => (
                <div key={exercise.id} className="card card-alt p-3 flex justify-between items-center">
                  <div>
                    <div className="font-medium">{exercise.activity}</div>
                    <div className="text-sm text-neutral-600">
                      Duration: {exercise.duration} min | Intensity: {exercise.intensity}
                    </div>
                    {exercise.notes && <div className="text-sm text-neutral-500">{exercise.notes}</div>}
                  </div>
                  <button 
                    onClick={() => removeExercise(exercise.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Vitals Tab */}
        {activeTab === 'vitals' && (
          <div className="space-y-4">
            <div className="card card-alt p-4">
              <h3 className="text-lg font-semibold mb-3">Record Your Vitals</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    value={userData.vitals[0]?.value || ''}
                    onChange={(e) => updateVitalsInContext(0, e.target.value)}
                    className="input input-dark w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Blood Pressure</label>
                  <input
                    type="text"
                    placeholder="120/80"
                    value={userData.vitals[1]?.value || ''}
                    onChange={(e) => updateVitalsInContext(1, e.target.value)}
                    className="input input-dark w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Heart Rate (bpm)</label>
                  <input
                    type="number"
                    value={userData.vitals[2]?.value || ''}
                    onChange={(e) => updateVitalsInContext(2, e.target.value)}
                    className="input input-dark w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Temperature (°F)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={userData.vitals[3]?.value || ''}
                    onChange={(e) => updateVitalsInContext(3, e.target.value)}
                    className="input input-dark w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Blood Sugar (mg/dL)</label>
                  <input
                    type="number"
                    value={currentEntry.vitals?.bloodSugar || ''}
                    onChange={(e) => updateEntry('vitals', { ...currentEntry.vitals, bloodSugar: e.target.value })}
                    className="input input-dark w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sleep Tab */}
        {activeTab === 'sleep' && (
          <div className="space-y-4">
            <div className="card card-alt p-4">
              <h3 className="text-lg font-semibold mb-3">Sleep Tracking</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Bedtime</label>
                  <input
                    type="time"
                    value={currentEntry.sleep?.bedtime || ''}
                    onChange={(e) => updateEntry('sleep', { ...currentEntry.sleep, bedtime: e.target.value })}
                    className="input input-dark w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Wake Time</label>
                  <input
                    type="time"
                    value={currentEntry.sleep?.wakeTime || ''}
                    onChange={(e) => updateEntry('sleep', { ...currentEntry.sleep, wakeTime: e.target.value })}
                    className="input input-dark w-full"
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Sleep Quality</label>
                <div className="flex justify-center gap-2 mb-2">
                  {[1, 2, 3, 4, 5].map(rating => (
                    <button
                      key={rating}
                      onClick={() => updateEntry('sleep', { ...currentEntry.sleep, quality: rating })}
                      className={`px-3 py-1 rounded-lg text-sm ${
                        currentEntry.sleep?.quality === rating 
                          ? 'bg-primary text-white' 
                          : 'bg-neutral-100 hover:bg-neutral-200'
                      }`}
                    >
                      {sleepQualityLabels[rating - 1]}
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                value={currentEntry.sleep?.notes || ''}
                onChange={(e) => updateEntry('sleep', { ...currentEntry.sleep, notes: e.target.value })}
                placeholder="How did you sleep? Any dreams or disturbances?"
                rows={3}
                className="input input-dark w-full"
              />
            </div>
          </div>
        )}

        {/* Medications Tab */}
        {activeTab === 'medications' && (
          <div className="space-y-4">
            <MedicationForm onAdd={addMedication} />
            <div className="space-y-2">
              {currentEntry.medications?.map(medication => (
                <div key={medication.id} className="card card-alt p-3 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={medication.taken}
                      onChange={() => toggleMedication(medication.id)}
                      className="checkbox"
                    />
                    <div>
                      <div className="font-medium">{medication.name}</div>
                      <div className="text-sm text-neutral-600">
                        Time: {medication.time} | Dosage: {medication.dosage || 'N/A'}
                      </div>
                      {medication.notes && <div className="text-sm text-neutral-500">{medication.notes}</div>}
                    </div>
                  </div>
                  <button 
                    onClick={() => removeMedication(medication.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes Tab */}
        {activeTab === 'notes' && (
          <div className="space-y-4">
            <div className="card card-alt p-4">
              <h3 className="text-lg font-semibold mb-3">Daily Notes</h3>
              <textarea
                value={currentEntry.notes || ''}
                onChange={(e) => updateEntry('notes', e.target.value)}
                placeholder="Write about your day, any health observations, or general thoughts..."
                rows={8}
                className="input input-dark w-full"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper Components
const SymptomForm = ({ onAdd }) => {
  const [symptom, setSymptom] = useState({ name: '', severity: '', notes: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(symptom);
    setSymptom({ name: '', severity: '', notes: '' });
  };

  return (
    <form onSubmit={handleSubmit} className="card card-alt p-4">
      <h3 className="text-lg font-semibold mb-3">Add Symptom</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
        <input
          type="text"
          placeholder="Symptom name"
          value={symptom.name}
          onChange={(e) => setSymptom({ ...symptom, name: e.target.value })}
          className="input input-dark"
          required
        />
        <select
          value={symptom.severity}
          onChange={(e) => setSymptom({ ...symptom, severity: e.target.value })}
          className="input input-dark"
          required
        >
          <option value="">Select severity</option>
          <option value="Mild">Mild</option>
          <option value="Moderate">Moderate</option>
          <option value="Severe">Severe</option>
        </select>
        <input
          type="text"
          placeholder="Notes (optional)"
          value={symptom.notes}
          onChange={(e) => setSymptom({ ...symptom, notes: e.target.value })}
          className="input input-dark"
        />
      </div>
      <button type="submit" className="btn btn-primary">Add Symptom</button>
    </form>
  );
};

const MealForm = ({ onAdd }) => {
  const [meal, setMeal] = useState({ name: '', time: '', calories: '', notes: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(meal);
    setMeal({ name: '', time: '', calories: '', notes: '' });
  };

  return (
    <form onSubmit={handleSubmit} className="card card-alt p-4">
      <h3 className="text-lg font-semibold mb-3">Add Meal</h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
        <input
          type="text"
          placeholder="Meal/Food"
          value={meal.name}
          onChange={(e) => setMeal({ ...meal, name: e.target.value })}
          className="input input-dark"
          required
        />
        <input
          type="time"
          value={meal.time}
          onChange={(e) => setMeal({ ...meal, time: e.target.value })}
          className="input input-dark"
        />
        <input
          type="number"
          placeholder="Calories"
          value={meal.calories}
          onChange={(e) => setMeal({ ...meal, calories: e.target.value })}
          className="input input-dark"
        />
        <input
          type="text"
          placeholder="Notes"
          value={meal.notes}
          onChange={(e) => setMeal({ ...meal, notes: e.target.value })}
          className="input input-dark"
        />
      </div>
      <button type="submit" className="btn btn-primary">Add Meal</button>
    </form>
  );
};

const ExerciseForm = ({ onAdd }) => {
  const [exercise, setExercise] = useState({ activity: '', duration: '', intensity: '', notes: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(exercise);
    setExercise({ activity: '', duration: '', intensity: '', notes: '' });
  };

  return (
    <form onSubmit={handleSubmit} className="card card-alt p-4">
      <h3 className="text-lg font-semibold mb-3">Add Exercise</h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
        <input
          type="text"
          placeholder="Activity"
          value={exercise.activity}
          onChange={(e) => setExercise({ ...exercise, activity: e.target.value })}
          className="input input-dark"
          required
        />
        <input
          type="number"
          placeholder="Duration (min)"
          value={exercise.duration}
          onChange={(e) => setExercise({ ...exercise, duration: e.target.value })}
          className="input input-dark"
          required
        />
        <select
          value={exercise.intensity}
          onChange={(e) => setExercise({ ...exercise, intensity: e.target.value })}
          className="input input-dark"
        >
          <option value="">Intensity</option>
          <option value="Low">Low</option>
          <option value="Moderate">Moderate</option>
          <option value="High">High</option>
        </select>
        <input
          type="text"
          placeholder="Notes"
          value={exercise.notes}
          onChange={(e) => setExercise({ ...exercise, notes: e.target.value })}
          className="input input-dark"
        />
      </div>
      <button type="submit" className="btn btn-primary">Add Exercise</button>
    </form>
  );
};

const MedicationForm = ({ onAdd }) => {
  const [medication, setMedication] = useState({ name: '', time: '', dose: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(medication);
    setMedication({ name: '', time: '', dose: '' });
  };

  return (
    <form onSubmit={handleSubmit} className="card card-alt p-4">
      <h3 className="text-lg font-semibold mb-3">Add Medication</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
        <input
          type="text"
          placeholder="Medication name"
          value={medication.name}
          onChange={(e) => setMedication({ ...medication, name: e.target.value })}
          className="input input-dark"
          required
        />
        <input
          type="time"
          value={medication.time}
          onChange={(e) => setMedication({ ...medication, time: e.target.value })}
          className="input input-dark"
          required
        />
        <input
          type="text"
          placeholder="Dose"
          value={medication.dose}
          onChange={(e) => setMedication({ ...medication, dose: e.target.value })}
          className="input input-dark"
        />
      </div>
      <button type="submit" className="btn btn-primary">Add Medication</button>
    </form>
  );
};

export default HealthJournal;