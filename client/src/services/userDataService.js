import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  serverTimestamp,
  setDoc 
} from 'firebase/firestore';
import { db } from '../firebase';

// Collection names
const USERS_COLLECTION = 'users';
const VITALS_COLLECTION = 'vitals';
const GOALS_COLLECTION = 'goals';
const REMINDERS_COLLECTION = 'reminders';
const ANALYTICS_COLLECTION = 'analytics';
const ARTICLES_COLLECTION = 'articles';

// Get or create user profile
export const getUserProfile = async (email) => {
  try {
    const userRef = doc(db, USERS_COLLECTION, email);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return userSnap.data();
    } else {
      // Create default profile for new user
      const defaultProfile = {
        email: email,
        name: email.split('@')[0], // Use email prefix as default name
        age: 25,
        weight: 70,
        height: 175,
        bloodType: 'O+',
        lastCheckup: new Date().toISOString().split('T')[0],
        healthScore: 75,
        role: 'user',
        // Extended profile fields
        phone: '',
        dateOfBirth: '',
        gender: '',
        // Medical information
        allergies: [],
        chronicConditions: [],
        currentMedications: [],
        medicalHistory: '',
        // Emergency contact
        emergencyContact: {
          name: '',
          relationship: '',
          phone: ''
        },
        // Preferences
        notifications: {
          reminders: true,
          tips: true,
          updates: true
        },
        units: 'metric',
        // Health goals
        healthGoals: {
          targetWeight: '',
          dailySteps: '',
          sleepHours: '',
          waterIntake: ''
        },
        hasDefaultVitals: false, // Prevent duplicate default vitals
        hasDefaultGoals: false,  // Prevent duplicate default goals
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      await setDoc(userRef, defaultProfile);
      return defaultProfile;
    }
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

// Update user profile
export const updateUserProfile = async (email, updates) => {
  try {
    const userRef = doc(db, USERS_COLLECTION, email);
    
    // First check if the document exists
    const docSnap = await getDoc(userRef);
    if (!docSnap.exists()) {
      throw new Error(`User document not found for email: ${email}`);
    }
    
    await updateDoc(userRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    
    return { email, ...updates };
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Get user vitals
export const getUserVitals = async (email) => {
  try {
    const userRef = doc(db, USERS_COLLECTION, email);
    const userSnap = await getDoc(userRef);
    let hasDefaultVitals = false;
    if (userSnap.exists()) {
      hasDefaultVitals = userSnap.data().hasDefaultVitals;
    }
    const q = query(
      collection(db, VITALS_COLLECTION),
      where('userEmail', '==', email)
    );
    
    const querySnapshot = await getDocs(q);
    const vitals = [];
    
    querySnapshot.forEach((doc) => {
      vitals.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Sort in memory instead of using orderBy
    vitals.sort((a, b) => {
      const aTime = a.createdAt?.toDate?.() || a.createdAt || new Date(0);
      const bTime = b.createdAt?.toDate?.() || b.createdAt || new Date(0);
      return bTime - aTime;
    });
    
    // Return default vitals if none exist and not already created
    if (vitals.length === 0 && !hasDefaultVitals) {
      const defaultVitals = [
        { name: 'Heart Rate', value: 72, unit: 'bpm', status: 'normal', icon: '💓' },
        { name: 'Blood Pressure', value: '120/80', unit: 'mmHg', status: 'normal', icon: '🩸' },
        { name: 'Temperature', value: 98.6, unit: '°F', status: 'normal', icon: '🌡️' },
        { name: 'Weight', value: 70, unit: 'kg', status: 'stable', icon: '⚖️' },
      ];
      // Create default vitals for the user
      for (const vital of defaultVitals) {
        await addVital(email, vital);
      }
      // Set the flag in the user profile
      await updateUserProfile(email, { hasDefaultVitals: true });
      return defaultVitals.map((vital, index) => ({
        id: `default-${index}`,
        userEmail: email,
        ...vital,
        createdAt: serverTimestamp()
      }));
    }
    return vitals;
  } catch (error) {
    console.error('Error getting user vitals:', error);
    throw error;
  }
};

// Add new vital
export const addVital = async (email, vitalData) => {
  try {
    const vitalWithMetadata = {
      userEmail: email,
      ...vitalData,
      createdAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, VITALS_COLLECTION), vitalWithMetadata);
    // Fetch the full vital object from Firestore
    const vitalSnap = await getDoc(docRef);
    return vitalSnap.exists() ? { id: docRef.id, ...vitalSnap.data() } : { id: docRef.id, ...vitalData };
  } catch (error) {
    console.error('Error adding vital:', error);
    throw error;
  }
};

// Update vital
export const updateVital = async (vitalId, updates) => {
  try {
    const vitalRef = doc(db, VITALS_COLLECTION, vitalId);
    await updateDoc(vitalRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    // Fetch the full vital object from Firestore
    const vitalSnap = await getDoc(vitalRef);
    return vitalSnap.exists() ? { id: vitalId, ...vitalSnap.data() } : { id: vitalId, ...updates };
  } catch (error) {
    console.error('Error updating vital:', error);
    throw error;
  }
};

// Get user goals
export const getUserGoals = async (email) => {
  try {
    const userRef = doc(db, USERS_COLLECTION, email);
    const userSnap = await getDoc(userRef);
    let hasDefaultGoals = false;
    if (userSnap.exists()) {
      hasDefaultGoals = userSnap.data().hasDefaultGoals;
    }
    const q = query(
      collection(db, GOALS_COLLECTION),
      where('userEmail', '==', email)
    );
    
    const querySnapshot = await getDocs(q);
    const goals = [];
    
    querySnapshot.forEach((doc) => {
      goals.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Sort in memory instead of using orderBy
    goals.sort((a, b) => {
      const aTime = a.createdAt?.toDate?.() || a.createdAt || new Date(0);
      const bTime = b.createdAt?.toDate?.() || b.createdAt || new Date(0);
      return bTime - aTime;
    });
    // Return default goals if none exist and not already created
    if (goals.length === 0 && !hasDefaultGoals) {
      const defaultGoals = [
        { text: 'Walk 10,000 steps', done: false, progress: 0, target: 10000 },
        { text: 'Drink 8 glasses of water', done: false, progress: 0, target: 8 },
        { text: 'Sleep at least 7 hours', done: false, progress: 0, target: 7 },
        { text: 'Meditate for 15 minutes', done: false, progress: 0, target: 15 },
        { text: 'Eat 5 servings of fruits/vegetables', done: false, progress: 0, target: 5 },
      ];
      // Create default goals for the user
      for (const goal of defaultGoals) {
        await addGoal(email, goal);
      }
      // Set the flag in the user profile
      await updateUserProfile(email, { hasDefaultGoals: true });
      return defaultGoals.map((goal, index) => ({
        id: `default-${index}`,
        userEmail: email,
        ...goal,
        createdAt: serverTimestamp()
      }));
    }
    return goals;
  } catch (error) {
    console.error('Error getting user goals:', error);
    throw error;
  }
};

// Add new goal
export const addGoal = async (email, goalData) => {
  try {
    const goalWithMetadata = {
      userEmail: email,
      ...goalData,
      createdAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, GOALS_COLLECTION), goalWithMetadata);
    return {
      id: docRef.id,
      ...goalData
    };
  } catch (error) {
    console.error('Error adding goal:', error);
    throw error;
  }
};

// Update goal
export const updateGoal = async (goalId, updates) => {
  try {
    const goalRef = doc(db, GOALS_COLLECTION, goalId);
    await updateDoc(goalRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    return { id: goalId, ...updates };
  } catch (error) {
    console.error('Error updating goal:', error);
    throw error;
  }
};

// Delete goal
export const deleteGoal = async (goalId) => {
  try {
    const goalRef = doc(db, GOALS_COLLECTION, goalId);
    await deleteDoc(goalRef);
    return goalId;
  } catch (error) {
    console.error('Error deleting goal:', error);
    throw error;
  }
};

// Get user reminders
export const getUserReminders = async (email) => {
  try {
    const q = query(
      collection(db, REMINDERS_COLLECTION),
      where('userEmail', '==', email)
    );
    
    const querySnapshot = await getDocs(q);
    const reminders = [];
    
    querySnapshot.forEach((doc) => {
      reminders.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Sort in memory instead of using orderBy
    reminders.sort((a, b) => {
      const aTime = a.time || '00:00';
      const bTime = b.time || '00:00';
      return aTime.localeCompare(bTime);
    });
    
    // Return default reminders if none exist
    if (reminders.length === 0) {
      const defaultReminders = [
        { name: 'Vitamin D', time: '09:00', notes: 'After breakfast', taken: false, frequency: 'Daily' },
        { name: 'Blood Pressure Med', time: '20:00', notes: 'Before dinner', taken: false, frequency: 'Daily' },
        { name: 'Omega-3', time: '12:00', notes: 'With lunch', taken: false, frequency: 'Daily' },
        { name: 'Calcium', time: '22:00', notes: 'Before bed', taken: false, frequency: 'Daily' },
      ];
      
      // Create default reminders for the user
      for (const reminder of defaultReminders) {
        await addReminder(email, reminder);
      }
      
      return defaultReminders.map((reminder, index) => ({
        id: `default-${index}`,
        userEmail: email,
        ...reminder,
        createdAt: serverTimestamp()
      }));
    }
    
    return reminders;
  } catch (error) {
    console.error('Error getting user reminders:', error);
    throw error;
  }
};

// Add new reminder
export const addReminder = async (email, reminderData) => {
  try {
    const reminderWithMetadata = {
      userEmail: email,
      ...reminderData,
      createdAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, REMINDERS_COLLECTION), reminderWithMetadata);
    return {
      id: docRef.id,
      ...reminderData
    };
  } catch (error) {
    console.error('Error adding reminder:', error);
    throw error;
  }
};

// Update reminder
export const updateReminder = async (reminderId, updates) => {
  try {
    const reminderRef = doc(db, REMINDERS_COLLECTION, reminderId);
    await updateDoc(reminderRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    return { id: reminderId, ...updates };
  } catch (error) {
    console.error('Error updating reminder:', error);
    throw error;
  }
};

// Delete reminder
export const deleteReminder = async (reminderId) => {
  try {
    const reminderRef = doc(db, REMINDERS_COLLECTION, reminderId);
    await deleteDoc(reminderRef);
    return reminderId;
  } catch (error) {
    console.error('Error deleting reminder:', error);
    throw error;
  }
};

// Get user analytics
export const getUserAnalytics = async (email) => {
  try {
    const analyticsRef = doc(db, ANALYTICS_COLLECTION, email);
    const analyticsSnap = await getDoc(analyticsRef);
    
    if (analyticsSnap.exists()) {
      return analyticsSnap.data();
    } else {
      // Create default analytics for new user
      const defaultAnalytics = {
        userEmail: email,
        healthScore: {
          current: 75,
          previous: 75,
          trend: 'stable',
          history: [75]
        },
        vitals: {
          weight: {
            current: 70,
            target: 68,
            history: [70],
            unit: 'kg'
          },
          bloodPressure: {
            systolic: [120],
            diastolic: [80]
          },
          heartRate: {
            resting: [72],
            average: 72
          }
        },
        activities: {
          steps: {
            daily: [0],
            target: 10000,
            average: 0
          },
          exercise: {
            minutes: [0],
            target: 150,
            total: 0
          },
          sleep: {
            hours: [7],
            target: 8,
            average: 7
          },
          water: {
            glasses: [0],
            target: 8,
            average: 0
          }
        },
        medications: {
          adherence: 0,
          missed: 0,
          taken: 0,
          total: 0
        },
        mood: {
          average: 7,
          history: [7],
          trend: 'stable'
        },
        goals: {
          completed: 0,
          total: 0,
          completionRate: 0
        },
        insights: [
          { type: 'info', message: 'Welcome! Start tracking your health data to get personalized insights.' }
        ],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      await setDoc(analyticsRef, defaultAnalytics);
      return defaultAnalytics;
    }
  } catch (error) {
    console.error('Error getting user analytics:', error);
    throw error;
  }
};

// Update user analytics
export const updateUserAnalytics = async (email, updates) => {
  try {
    const analyticsRef = doc(db, ANALYTICS_COLLECTION, email);
    await updateDoc(analyticsRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    return { userEmail: email, ...updates };
  } catch (error) {
    console.error('Error updating user analytics:', error);
    throw error;
  }
};

// Load all user data
export const loadAllUserData = async (email) => {
  try {
    const [profile, vitals, goals, reminders, analytics] = await Promise.all([
      getUserProfile(email),
      getUserVitals(email),
      getUserGoals(email),
      getUserReminders(email),
      getUserAnalytics(email)
    ]);
    
    return {
      profile,
      vitals,
      goals,
      reminders,
      analytics
    };
  } catch (error) {
    console.error('Error loading all user data:', error);
    throw error;
  }
};

// Get all users for admin dashboard
export const getAllUsers = async () => {
  try {
    const q = query(collection(db, USERS_COLLECTION));
    const querySnapshot = await getDocs(q);
    const users = [];
    
    querySnapshot.forEach((doc) => {
      const userData = doc.data();
      users.push({
        id: doc.id,
        email: doc.id, // Document ID is the email
        name: userData.name || userData.email?.split('@')[0] || 'Unknown',
        role: userData.role || 'user',
        status: userData.status || 'active',
        healthScore: userData.healthScore || 75,
        reminders: userData.reminders || 0,
        registered: userData.createdAt?.toDate?.() || userData.createdAt || new Date(),
        lastLogin: userData.lastLogin?.toDate?.() || userData.lastLogin || null,
        phone: userData.phone || '',
        dateOfBirth: userData.dateOfBirth || '',
        gender: userData.gender || '',
        bloodType: userData.bloodType || '',
        weight: userData.weight || 0,
        height: userData.height || 0,
        allergies: userData.allergies || [],
        chronicConditions: userData.chronicConditions || [],
        currentMedications: userData.currentMedications || [],
        emergencyContact: userData.emergencyContact || { name: '', relationship: '', phone: '' },
        notifications: userData.notifications || { reminders: true, tips: true, updates: true },
        units: userData.units || 'metric',
        healthGoals: userData.healthGoals || { targetWeight: '', dailySteps: '', sleepHours: '', waterIntake: '' },
        updatedAt: userData.updatedAt?.toDate?.() || userData.updatedAt || new Date()
      });
    });
    
    // Sort users by registration date (newest first)
    users.sort((a, b) => {
      const aTime = a.registered?.getTime?.() || a.registered || 0;
      const bTime = b.registered?.getTime?.() || b.registered || 0;
      return bTime - aTime;
    });
    
    return users;
  } catch (error) {
    console.error('Error getting all users:', error);
    throw error;
  }
};

// Update user status (for admin)
export const updateUserStatus = async (email, status) => {
  try {
    const userRef = doc(db, USERS_COLLECTION, email);
    await updateDoc(userRef, {
      status: status,
      updatedAt: serverTimestamp()
    });
    return { email, status };
  } catch (error) {
    console.error('Error updating user status:', error);
    throw error;
  }
};

// Update user role (for admin)
export const updateUserRole = async (email, role) => {
  try {
    const userRef = doc(db, USERS_COLLECTION, email);
    await updateDoc(userRef, {
      role: role,
      updatedAt: serverTimestamp()
    });
    return { email, role };
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
};

// Articles Management
export const getAllArticles = async () => {
  try {
    const q = query(collection(db, ARTICLES_COLLECTION));
    const querySnapshot = await getDocs(q);
    const articles = [];
    
    querySnapshot.forEach((doc) => {
      const articleData = doc.data();
      articles.push({
        id: doc.id,
        title: articleData.title || '',
        summary: articleData.summary || '',
        content: articleData.content || '',
        author: articleData.author || 'Unknown Author',
        category: articleData.category || 'general',
        tags: articleData.tags || [],
        status: articleData.status || 'draft',
        views: articleData.views || 0,
        likes: articleData.likes || 0,
        saved: articleData.saved || 0,
        date: articleData.date || new Date().toISOString().split('T')[0],
        createdAt: articleData.createdAt?.toDate?.() || articleData.createdAt || new Date(),
        updatedAt: articleData.updatedAt?.toDate?.() || articleData.updatedAt || new Date()
      });
    });
    
    // Sort articles by creation date (newest first)
    articles.sort((a, b) => {
      const aTime = a.createdAt?.getTime?.() || a.createdAt || 0;
      const bTime = b.createdAt?.getTime?.() || b.createdAt || 0;
      return bTime - aTime;
    });
    
    return articles;
  } catch (error) {
    console.error('Error getting all articles:', error);
    throw error;
  }
};

export const getPublishedArticles = async () => {
  try {
    const q = query(
      collection(db, ARTICLES_COLLECTION),
      where('status', '==', 'published')
    );
    const querySnapshot = await getDocs(q);
    const articles = [];
    
    querySnapshot.forEach((doc) => {
      const articleData = doc.data();
      articles.push({
        id: doc.id,
        title: articleData.title || '',
        summary: articleData.summary || '',
        content: articleData.content || '',
        author: articleData.author || 'Unknown Author',
        category: articleData.category || 'general',
        tags: articleData.tags || [],
        status: articleData.status || 'published',
        views: articleData.views || 0,
        likes: articleData.likes || 0,
        saved: articleData.saved || 0,
        date: articleData.date || new Date().toISOString().split('T')[0],
        createdAt: articleData.createdAt?.toDate?.() || articleData.createdAt || new Date(),
        updatedAt: articleData.updatedAt?.toDate?.() || articleData.updatedAt || new Date()
      });
    });
    
    // Sort articles by creation date (newest first)
    articles.sort((a, b) => {
      const aTime = a.createdAt?.getTime?.() || a.createdAt || 0;
      const bTime = b.createdAt?.getTime?.() || b.createdAt || 0;
      return bTime - aTime;
    });
    
    return articles;
  } catch (error) {
    console.error('Error getting published articles:', error);
    throw error;
  }
};

export const addArticleDB = async (articleData) => {
  try {
    const articleWithMetadata = {
      ...articleData,
      views: 0,
      likes: 0,
      saved: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, ARTICLES_COLLECTION), articleWithMetadata);
    return {
      id: docRef.id,
      ...articleData
    };
  } catch (error) {
    console.error('Error adding article:', error);
    throw error;
  }
};

export const updateArticleDB = async (articleId, updates) => {
  try {
    const articleRef = doc(db, ARTICLES_COLLECTION, articleId);
    await updateDoc(articleRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    return { id: articleId, ...updates };
  } catch (error) {
    console.error('Error updating article:', error);
    throw error;
  }
};

export const deleteArticleDB = async (articleId) => {
  try {
    const articleRef = doc(db, ARTICLES_COLLECTION, articleId);
    await deleteDoc(articleRef);
    return articleId;
  } catch (error) {
    console.error('Error deleting article:', error);
    throw error;
  }
};

// --- Doctor Management ---
export const getAllDoctors = async () => {
  try {
    const q = query(collection(db, 'doctors'));
    const querySnapshot = await getDocs(q);
    const doctors = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      doctors.push({
        id: doc.id,
        name: data.name || '',
        specialty: data.specialty || '',
        location: data.location || '',
        rating: data.rating || 0,
        reviews: data.reviews || 0,
        status: data.status || 'active',
        experience: data.experience || '5 years',
        languages: data.languages || ['English'],
        consultationFee: data.consultationFee || 500
      });
    });
    return doctors;
  } catch (error) {
    console.error('Error getting all doctors:', error);
    throw error;
  }
};

export const addDoctorDB = async (doctorData) => {
  try {
    const fullDoctor = {
      name: doctorData.name || '',
      specialty: doctorData.specialty || '',
      location: doctorData.location || '',
      rating: doctorData.rating || 0,
      reviews: doctorData.reviews || 0,
      status: doctorData.status || 'active',
      experience: doctorData.experience || '5 years',
      languages: doctorData.languages || ['English'],
      consultationFee: doctorData.consultationFee || 500
    };
    const docRef = await addDoc(collection(db, 'doctors'), fullDoctor);
    return { id: docRef.id, ...fullDoctor };
  } catch (error) {
    console.error('Error adding doctor:', error);
    throw error;
  }
};

export const updateDoctorDB = async (doctorId, updates) => {
  try {
    const doctorRef = doc(db, 'doctors', doctorId);
    await updateDoc(doctorRef, updates);
    return { id: doctorId, ...updates };
  } catch (error) {
    console.error('Error updating doctor:', error);
    throw error;
  }
};

export const deleteDoctorDB = async (doctorId) => {
  try {
    const doctorRef = doc(db, 'doctors', doctorId);
    await deleteDoc(doctorRef);
    return doctorId;
  } catch (error) {
    console.error('Error deleting doctor:', error);
    throw error;
  }
}; 