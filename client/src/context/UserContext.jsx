import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { 
  createAppointment, 
  getUserAppointments, 
  updateAppointment as updateAppointmentDB, 
  deleteAppointment as deleteAppointmentDB 
} from '../services/appointmentService';
import {
  loadAllUserData,
  updateUserProfile,
  updateVital as updateVitalDB,
  addGoal as addGoalDB,
  updateGoal as updateGoalDB,
  deleteGoal as deleteGoalDB,
  addReminder as addReminderDB,
  updateReminder as updateReminderDB,
  deleteReminder as deleteReminderDB,
  updateUserAnalytics as updateUserAnalyticsDB,
  getAllUsers,
  updateUserStatus,
  updateUserRole,
  getAllArticles,
  getPublishedArticles,
  addArticleDB,
  updateArticleDB,
  deleteArticleDB,
  getAllDoctors,
  addDoctorDB,
  updateDoctorDB,
  deleteDoctorDB,
} from '../services/userDataService';

// Initial empty state - all data will be loaded from database
const initialData = {
  profile: null,
  vitals: [],
  goals: [],
  reminders: [],
  userAnalytics: null,
  appointments: [],
  // Keep static data for non-user-specific content
  articles: [
    {
      id: 1,
      title: '5 Simple Ways to Boost Your Immune System',
      summary: 'Discover easy lifestyle changes to strengthen your bodys natural defenses and stay healthy year-round.',
      content: 'Full article content here...',
      date: '2024-05-01',
      author: 'Dr. Health Expert',
      category: 'wellness',
      tags: ['immunity', 'health', 'lifestyle'],
      status: 'published',
      views: 1250,
      likes: 89,
      saved: 45
    },
    {
      id: 2,
      title: 'The Importance of Regular Exercise',
      summary: 'Learn how daily physical activity can improve your mood, energy, and overall well-being.',
      content: 'Full article content here...',
      date: '2024-04-28',
      author: 'Fitness Coach',
      category: 'fitness',
      tags: ['exercise', 'fitness', 'wellness'],
      status: 'published',
      views: 980,
      likes: 67,
      saved: 32
    },
    {
      id: 3,
      title: 'Healthy Eating on a Budget',
      summary: 'Tips and tricks for maintaining a nutritious diet without breaking the bank.',
      content: 'Full article content here...',
      date: '2024-04-25',
      author: 'Nutritionist',
      category: 'nutrition',
      tags: ['diet', 'budget', 'nutrition'],
      status: 'published',
      views: 756,
      likes: 54,
      saved: 28
    },
    {
      id: 4,
      title: 'Managing Stress in a Busy World',
      summary: 'Explore practical strategies to reduce stress and improve your mental health.',
      content: 'Full article content here...',
      date: '2024-04-20',
      author: 'Mental Health Expert',
      category: 'mental-health',
      tags: ['stress', 'mental-health', 'wellness'],
      status: 'draft',
      views: 0,
      likes: 0,
      saved: 0
    },
    {
      id: 5,
      title: 'Why Sleep Matters: The Science of Rest',
      summary: 'Understand the crucial role of sleep in your health and how to get better rest.',
      content: 'Full article content here...',
      date: '2024-04-15',
      author: 'Sleep Specialist',
      category: 'sleep',
      tags: ['sleep', 'health', 'wellness'],
      status: 'published',
      views: 1120,
      likes: 78,
      saved: 41
    },
  ],
  doctors: [
    {
      id: 1,
      name: 'Dr. Priya Sharma',
      specialty: 'General Physician',
      location: 'Kolkata',
      rating: 4.8,
      reviews: 32,
      status: 'active',
      experience: '15 years',
      languages: ['English', 'Hindi', 'Bengali'],
      consultationFee: 800
    },
    {
      id: 2,
      name: 'Dr. Arjun Mehta',
      specialty: 'Cardiologist',
      location: 'Delhi',
      rating: 4.6,
      reviews: 21,
      status: 'active',
      experience: '12 years',
      languages: ['English', 'Hindi'],
      consultationFee: 1200
    },
    {
      id: 3,
      name: 'Dr. Sneha Kapoor',
      specialty: 'Dermatologist',
      location: 'Mumbai',
      rating: 4.9,
      reviews: 40,
      status: 'active',
      experience: '8 years',
      languages: ['English', 'Hindi', 'Marathi'],
      consultationFee: 1000
    },
    {
      id: 4,
      name: 'Dr. Rahul Verma',
      specialty: 'Pediatrician',
      location: 'Bangalore',
      rating: 4.7,
      reviews: 28,
      status: 'active',
      experience: '10 years',
      languages: ['English', 'Hindi', 'Kannada'],
      consultationFee: 900
    },
    {
      id: 5,
      name: 'Dr. Anjali Singh',
      specialty: 'Gynecologist',
      location: 'Chennai',
      rating: 4.5,
      reviews: 19,
      status: 'active',
      experience: '14 years',
      languages: ['English', 'Hindi', 'Tamil'],
      consultationFee: 1100
    },
  ],
  systemUsers: [],
  analytics: {
    totalUsers: 0,
    activeUsers: 0,
    totalArticles: 5,
    publishedArticles: 4,
    totalDoctors: 5,
    totalAppointments: 0,
    totalReminders: 0,
    reminderCompletionRate: 0,
    userEngagementRate: 0,
    articleReadershipRate: 48,
    userGrowthRate: 0,
    articleEngagementRate: 8,
    systemHealth: {
      serverStatus: 'Online',
      apiResponse: '120ms',
      database: 'Connected',
      storageUsed: '68%'
    }
  }
};

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userData, setUserData] = useState(initialData);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); // Start with loading true
  const [authChecked, setAuthChecked] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [allArticles, setAllArticles] = useState([]);
  const [publishedArticles, setPublishedArticles] = useState([]);
  const [articlesLoading, setArticlesLoading] = useState(false);
  const [doctorsLoading, setDoctorsLoading] = useState(false);

  // Derived data calculations
  const derivedData = {
    bmi: userData.profile ? (userData.profile.weight / Math.pow(userData.profile.height / 100, 2)).toFixed(1) : '0',
    remindersTaken: userData.reminders.filter(r => r.taken).length,
    remindersMissed: userData.reminders.filter(r => !r.taken).length,
    goalsCompleted: userData.goals.filter(g => g.done).length,
    totalGoals: userData.goals.length,
    nextReminder: userData.reminders.find(r => !r.taken) || userData.reminders[0],
    upcomingAppointments: userData.appointments.filter(apt => 
      new Date(apt.date) > new Date() && apt.status !== 'cancelled'
    ),
    recentActivity: [
      { time: '09:00', desc: 'Took Vitamin D', type: 'medicine' },
      { time: '08:30', desc: 'Completed: Walk 10,000 steps', type: 'goal' },
      { time: '08:00', desc: 'Logged weight: 70kg', type: 'vital' },
      { time: 'Yesterday 22:30', desc: 'Completed: Sleep 7.5 hours', type: 'goal' },
      { time: 'Yesterday 20:00', desc: 'Missed: Blood Pressure Med', type: 'missed' },
      { time: 'Yesterday 18:00', desc: 'Completed workout: 45 minutes', type: 'exercise' },
    ],
    // Filter vitals to show only the most recent for each name
    filteredVitals: (() => {
      const vitalsByName = {};
      for (const vital of userData.vitals) {
        // Use updatedAt if present, otherwise createdAt
        const vitalTime = (vital.updatedAt?.toDate?.() ? vital.updatedAt.toDate() : vital.updatedAt) || (vital.createdAt?.toDate?.() ? vital.createdAt.toDate() : vital.createdAt) || new Date(0);
        const prev = vitalsByName[vital.name];
        const prevTime = prev ? ((prev.updatedAt?.toDate?.() ? prev.updatedAt.toDate() : prev.updatedAt) || (prev.createdAt?.toDate?.() ? prev.createdAt.toDate() : prev.createdAt) || new Date(0)) : new Date(0);
        if (!prev || vitalTime > prevTime) {
          vitalsByName[vital.name] = vital;
        }
      }
      return Object.values(vitalsByName);
    })()
  };

  // Load all user data from database
  const loadUserData = async (email) => {
    try {
      setLoading(true);
      const userDataFromDB = await loadAllUserData(email);
      setUserData(prev => ({
        ...prev,
        profile: userDataFromDB.profile,
        vitals: userDataFromDB.vitals,
        goals: userDataFromDB.goals,
        reminders: userDataFromDB.reminders,
        userAnalytics: userDataFromDB.analytics
      }));
    } catch (error) {
      console.error('Error loading user data:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Check authentication state on app startup
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is signed in
        try {
          console.log('User is authenticated:', user.email);
          await loadUserData(user.email);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Error loading user data on auth state change:', error);
          // Even if loading data fails, user is still authenticated
          setIsAuthenticated(true);
        }
      } else {
        // User is signed out
        console.log('User is not authenticated');
        setIsAuthenticated(false);
        setUserData(initialData);
      }
      setAuthChecked(true);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Profile management
  const updateProfile = async (updates) => {
    try {
      if (!userData.profile?.email) return;
      
      await updateUserProfile(userData.profile.email, updates);
      setUserData(prev => ({
        ...prev,
        profile: { ...prev.profile, ...updates }
      }));
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  // Update specific profile sections (for nested objects like emergencyContact, notifications, etc.)
  const updateProfileSection = async (section, updates) => {
    try {
      if (!userData.profile?.email) return;
      
      const currentSection = userData.profile[section] || {};
      const updatedSection = { ...currentSection, ...updates };
      
      await updateUserProfile(userData.profile.email, { [section]: updatedSection });
      setUserData(prev => ({
        ...prev,
        profile: { 
          ...prev.profile, 
          [section]: updatedSection 
        }
      }));
    } catch (error) {
      console.error('Error updating profile section:', error);
      throw error;
    }
  };

  // Vitals management
  const updateVitals = async (index, value) => {
    try {
      const vital = userData.vitals[index];
      if (!vital?.id || !userData.profile?.email) return;
      // Use the returned full vital object from updateVitalDB
      const updatedVital = await updateVitalDB(vital.id, { value });
      setUserData(prev => ({
        ...prev,
        vitals: prev.vitals.map((v, i) => 
          i === index ? updatedVital : v
        )
      }));
    } catch (error) {
      console.error('Error updating vital:', error);
      throw error;
    }
  };

  // Goals management
  const addGoal = async (goal) => {
    try {
      if (!userData.profile?.email) return;
      
      const newGoal = await addGoalDB(userData.profile.email, {
        ...goal,
        done: false,
        progress: 0
      });
      
      setUserData(prev => ({
        ...prev,
        goals: [...prev.goals, newGoal]
      }));
    } catch (error) {
      console.error('Error adding goal:', error);
      throw error;
    }
  };

  const toggleGoal = async (goalId) => {
    try {
      const goal = userData.goals.find(g => g.id === goalId);
      if (!goal) return;
      
      await updateGoalDB(goalId, { done: !goal.done });
      setUserData(prev => ({
        ...prev,
        goals: prev.goals.map(g =>
          g.id === goalId ? { ...g, done: !g.done } : g
        )
      }));
    } catch (error) {
      console.error('Error toggling goal:', error);
      throw error;
    }
  };

  const deleteGoal = async (goalId) => {
    try {
      await deleteGoalDB(goalId);
      setUserData(prev => ({
        ...prev,
        goals: prev.goals.filter(goal => goal.id !== goalId)
      }));
    } catch (error) {
      console.error('Error deleting goal:', error);
      throw error;
    }
  };

  // Reminders management
  const toggleReminder = async (reminderId) => {
    try {
      const reminder = userData.reminders.find(r => r.id === reminderId);
      if (!reminder) return;
      
      await updateReminderDB(reminderId, { taken: !reminder.taken });
      setUserData(prev => ({
        ...prev,
        reminders: prev.reminders.map(r =>
          r.id === reminderId ? { ...r, taken: !r.taken } : r
        )
      }));
    } catch (error) {
      console.error('Error toggling reminder:', error);
      throw error;
    }
  };

  const addReminder = async (reminder) => {
    try {
      if (!userData.profile?.email) return;
      
      const newReminder = await addReminderDB(userData.profile.email, reminder);
      setUserData(prev => ({
        ...prev,
        reminders: [...prev.reminders, newReminder]
      }));
    } catch (error) {
      console.error('Error adding reminder:', error);
      throw error;
    }
  };

  const deleteReminder = async (reminderId) => {
    try {
      await deleteReminderDB(reminderId);
      setUserData(prev => ({
        ...prev,
        reminders: prev.reminders.filter(reminder => reminder.id !== reminderId)
      }));
    } catch (error) {
      console.error('Error deleting reminder:', error);
      throw error;
    }
  };

  const updateReminder = async (reminderId, updatedReminder) => {
    try {
      await updateReminderDB(reminderId, updatedReminder);
      setUserData(prev => ({
        ...prev,
        reminders: prev.reminders.map(reminder =>
          reminder.id === reminderId ? updatedReminder : reminder
        )
      }));
    } catch (error) {
      console.error('Error updating reminder:', error);
      throw error;
    }
  };

  // User Analytics management
  const updateUserAnalytics = async (updates) => {
    try {
      if (!userData.profile?.email) return;
      
      await updateUserAnalyticsDB(userData.profile.email, updates);
      setUserData(prev => ({
        ...prev,
        userAnalytics: { ...prev.userAnalytics, ...updates }
      }));
    } catch (error) {
      console.error('Error updating user analytics:', error);
      throw error;
    }
  };

  const updateHealthScore = async (newScore) => {
    try {
      if (!userData.profile?.email) return;
      
      const updates = {
        healthScore: {
          ...userData.userAnalytics?.healthScore,
          previous: userData.userAnalytics?.healthScore?.current || newScore,
          current: newScore,
          history: [...(userData.userAnalytics?.healthScore?.history || []).slice(1), newScore]
        }
      };
      
      await updateUserAnalyticsDB(userData.profile.email, updates);
      setUserData(prev => ({
        ...prev,
        userAnalytics: {
          ...prev.userAnalytics,
          ...updates
        }
      }));
    } catch (error) {
      console.error('Error updating health score:', error);
      throw error;
    }
  };

  const updateActivityData = async (activityType, newData) => {
    try {
      if (!userData.profile?.email) return;
      
      const updates = {
        activities: {
          ...userData.userAnalytics?.activities,
          [activityType]: {
            ...userData.userAnalytics?.activities?.[activityType],
            ...newData
          }
        }
      };
      
      await updateUserAnalyticsDB(userData.profile.email, updates);
      setUserData(prev => ({
        ...prev,
        userAnalytics: {
          ...prev.userAnalytics,
          ...updates
        }
      }));
    } catch (error) {
      console.error('Error updating activity data:', error);
      throw error;
    }
  };

  // Articles management (for admin)
  const addArticle = (article) => {
    const newArticle = {
      id: Date.now(),
      ...article,
      status: 'draft',
      views: 0,
      likes: 0,
      saved: 0,
      date: new Date().toISOString().split('T')[0]
    };
    setUserData(prev => ({
      ...prev,
      articles: [newArticle, ...prev.articles]
    }));
  };

  const updateArticle = (articleId, updates) => {
    setUserData(prev => ({
      ...prev,
      articles: prev.articles.map(article =>
        article.id === articleId ? { ...article, ...updates } : article
      )
    }));
  };

  const deleteArticle = (articleId) => {
    setUserData(prev => ({
      ...prev,
      articles: prev.articles.filter(article => article.id !== articleId)
    }));
  };

  // Doctors management (for admin)
  const ensureDefaultDoctors = useCallback(async () => {
    const doctors = await getAllDoctors();
    if (!doctors || doctors.length < 5) {
      const defaultDoctors = [
        {
          name: 'Dr. Priya Sharma',
          specialty: 'General Physician',
          location: 'Kolkata',
          rating: 4.8,
          reviews: 32,
          status: 'active',
          experience: '15 years',
          languages: ['English', 'Hindi', 'Bengali'],
          consultationFee: 800
        },
        {
          name: 'Dr. Arjun Mehta',
          specialty: 'Cardiologist',
          location: 'Delhi',
          rating: 4.6,
          reviews: 21,
          status: 'active',
          experience: '12 years',
          languages: ['English', 'Hindi'],
          consultationFee: 1200
        },
        {
          name: 'Dr. Sneha Kapoor',
          specialty: 'Dermatologist',
          location: 'Mumbai',
          rating: 4.9,
          reviews: 40,
          status: 'active',
          experience: '8 years',
          languages: ['English', 'Hindi', 'Marathi'],
          consultationFee: 1000
        },
        {
          name: 'Dr. Rahul Verma',
          specialty: 'Pediatrician',
          location: 'Bangalore',
          rating: 4.7,
          reviews: 28,
          status: 'active',
          experience: '10 years',
          languages: ['English', 'Hindi', 'Kannada'],
          consultationFee: 900
        },
        {
          name: 'Dr. Anjali Singh',
          specialty: 'Gynecologist',
          location: 'Chennai',
          rating: 4.5,
          reviews: 19,
          status: 'active',
          experience: '14 years',
          languages: ['English', 'Hindi', 'Tamil'],
          consultationFee: 1100
        }
      ];
      for (let i = doctors.length; i < 5; i++) {
        await addDoctorDB(defaultDoctors[i]);
      }
    }
  }, []);

  const loadAllDoctors = useCallback(async () => {
    try {
      setDoctorsLoading(true);
      await ensureDefaultDoctors();
      const doctors = await getAllDoctors();
      setUserData(prev => ({ ...prev, doctors }));
    } catch (error) {
      console.error('Error loading doctors:', error);
    } finally {
      setDoctorsLoading(false);
    }
  }, [ensureDefaultDoctors]);

  const addDoctor = useCallback(async (doctor) => {
    try {
      const newDoctor = await addDoctorDB(doctor);
      setUserData(prev => ({ ...prev, doctors: [...prev.doctors, newDoctor] }));
    } catch (error) {
      console.error('Error adding doctor:', error);
      throw error;
    }
  }, []);

  const updateDoctor = useCallback(async (doctorId, updates) => {
    try {
      await updateDoctorDB(doctorId, updates);
      setUserData(prev => ({
        ...prev,
        doctors: prev.doctors.map(doc => doc.id === doctorId ? { ...doc, ...updates } : doc)
      }));
    } catch (error) {
      console.error('Error updating doctor:', error);
      throw error;
    }
  }, []);

  const deleteDoctor = useCallback(async (doctorId) => {
    try {
      await deleteDoctorDB(doctorId);
      setUserData(prev => ({ ...prev, doctors: prev.doctors.filter(doc => doc.id !== doctorId) }));
    } catch (error) {
      console.error('Error deleting doctor:', error);
      throw error;
    }
  }, []);

  // Load doctors on startup
  useEffect(() => {
    loadAllDoctors();
  }, [loadAllDoctors]);

  // Appointments management
  const addAppointment = async (appointment) => {
    try {
      const newAppointment = await createAppointment(appointment);
      setUserData(prev => ({
        ...prev,
        appointments: [...prev.appointments, newAppointment]
      }));
      return newAppointment;
    } catch (error) {
      console.error('Error adding appointment:', error);
      throw error;
    }
  };

  const updateAppointment = async (appointmentId, updates) => {
    try {
      await updateAppointmentDB(appointmentId, updates);
      setUserData(prev => ({
        ...prev,
        appointments: prev.appointments.map(appointment =>
          appointment.id === appointmentId ? { ...appointment, ...updates } : appointment
        )
      }));
      return { id: appointmentId, ...updates };
    } catch (error) {
      console.error('Error updating appointment:', error);
      throw error;
    }
  };

  const deleteAppointment = async (appointmentId) => {
    try {
      await deleteAppointmentDB(appointmentId);
      setUserData(prev => ({
        ...prev,
        appointments: prev.appointments.filter(appointment => appointment.id !== appointmentId)
      }));
      return appointmentId;
    } catch (error) {
      console.error('Error deleting appointment:', error);
      throw error;
    }
  };

  // Load user appointments from database
  const loadUserAppointments = async (userEmail) => {
    try {
      const appointments = await getUserAppointments(userEmail);
      setUserData(prev => ({
        ...prev,
        appointments: appointments
      }));
      return appointments;
    } catch (error) {
      console.error('Error loading appointments:', error);
      throw error;
    }
  };

  // Medical History Management
  const loadMedicalHistory = async (email) => {
    if (!email) return;

    // Access environment variables using import.meta.env for Vite-based projects.
    // This prevents the "process is not defined" error in the browser.
    // Ensure your .env file has VITE_API_URL=https://ai-health-analyst.onrender.com
    const API_URL = import.meta.env.VITE_API_URL || 'https://ai-health-analyst.onrender.com';

    try {
      const response = await fetch(`${API_URL}/api/documents/user/${encodeURIComponent(email)}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to fetch medical history: ${response.statusText}`);
      }

      const data = await response.json();

      // Update the global user state with the fetched documents array.
      setUserData(prevData => ({
        ...prevData,
        medicalHistory: data.documents || [],
      }));
    } catch (error) {
      console.error("Error in loadMedicalHistory:", error);
      // Set an empty array on error to prevent UI crashes
      setUserData(prevData => ({ ...prevData, medicalHistory: [] }));
    }
  };

  // System users management (for admin)
  const addSystemUser = (user) => {
    const newUser = {
      id: Date.now(),
      ...user,
      status: 'active',
      reminders: 0,
      registered: new Date().toISOString().split('T')[0],
      lastLogin: new Date().toISOString().split('T')[0],
      healthScore: 75
    };
    setUserData(prev => ({
      ...prev,
      systemUsers: [newUser, ...prev.systemUsers]
    }));
  };

  const updateSystemUser = (userId, updates) => {
    setUserData(prev => ({
      ...prev,
      systemUsers: prev.systemUsers.map(user =>
        user.id === userId ? { ...user, ...updates } : user
      )
    }));
  };

  const deleteSystemUser = (userId) => {
    setUserData(prev => ({
      ...prev,
      systemUsers: prev.systemUsers.filter(user => user.id !== userId)
    }));
  };

  // Load all users for admin dashboard
  const loadAllUsers = async () => {
    try {
      // Prevent multiple simultaneous requests
      if (usersLoading) return;
      setUsersLoading(true);
      const users = await getAllUsers();
      setAllUsers(users);
      // Update both systemUsers and users in userData
      setUserData(prev => ({
        ...prev,
        systemUsers: users,
        users: users
      }));
      // Update analytics with real user data
      const totalUsers = users.length;
      const activeUsers = users.filter(u => u.status === 'active').length;
      const adminUsers = users.filter(u => u.role === 'admin').length;
      setUserData(prev => ({
        ...prev,
        analytics: {
          ...prev.analytics,
          totalUsers,
          activeUsers,
          userGrowthRate: totalUsers > 0 ? ((totalUsers - prev.analytics.totalUsers) / prev.analytics.totalUsers * 100).toFixed(1) : 0
        }
      }));
    } catch (error) {
      console.error('Error loading all users:', error);
    } finally {
      setUsersLoading(false);
    }
  };

  // Update user status (for admin)
  const updateUserStatusDB = async (email, status) => {
    try {
      await updateUserStatus(email, status);
      setAllUsers(prev => 
        prev.map(user => 
          user.email === email ? { ...user, status } : user
        )
      );
    } catch (error) {
      console.error('Error updating user status:', error);
      throw error;
    }
  };

  // Update user role (for admin)
  const updateUserRoleDB = async (email, role) => {
    try {
      await updateUserRole(email, role);
      setAllUsers(prev => 
        prev.map(user => 
          user.email === email ? { ...user, role } : user
        )
      );
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  };

  // Ensure at least 5 default articles exist
  const ensureDefaultArticles = useCallback(async () => {
    const articles = await getAllArticles();
    if (!articles || articles.length < 5) {
      const defaultArticles = [
        {
          title: '5 Simple Ways to Boost Your Immune System',
          summary: 'Discover easy lifestyle changes to strengthen your bodys natural defenses and stay healthy year-round.',
          content: 'Full article content here...',
          date: '2024-05-01',
          author: 'Dr. Health Expert',
          category: 'wellness',
          tags: ['immunity', 'health', 'lifestyle'],
          status: 'published',
          views: 1250,
          likes: 89,
          saved: 45
        },
        {
          title: 'The Importance of Regular Exercise',
          summary: 'Learn how daily physical activity can improve your mood, energy, and overall well-being.',
          content: 'Full article content here...',
          date: '2024-04-28',
          author: 'Fitness Coach',
          category: 'fitness',
          tags: ['exercise', 'fitness', 'wellness'],
          status: 'published',
          views: 980,
          likes: 67,
          saved: 32
        },
        {
          title: 'Healthy Eating on a Budget',
          summary: 'Tips and tricks for maintaining a nutritious diet without breaking the bank.',
          content: 'Full article content here...',
          date: '2024-04-25',
          author: 'Nutritionist',
          category: 'nutrition',
          tags: ['diet', 'budget', 'nutrition'],
          status: 'published',
          views: 756,
          likes: 54,
          saved: 28
        },
        {
          title: 'Managing Stress in a Busy World',
          summary: 'Explore practical strategies to reduce stress and improve your mental health.',
          content: 'Full article content here...',
          date: '2024-04-20',
          author: 'Mental Health Expert',
          category: 'mental-health',
          tags: ['stress', 'mental-health', 'wellness'],
          status: 'draft',
          views: 0,
          likes: 0,
          saved: 0
        },
        {
          title: 'Why Sleep Matters: The Science of Rest',
          summary: 'Understand the crucial role of sleep in your health and how to get better rest.',
          content: 'Full article content here...',
          date: '2024-04-15',
          author: 'Sleep Specialist',
          category: 'sleep',
          tags: ['sleep', 'health', 'wellness'],
          status: 'published',
          views: 1120,
          likes: 78,
          saved: 41
        }
      ];
      // Only add missing articles
      for (let i = articles.length; i < 5; i++) {
        await addArticleDB(defaultArticles[i]);
      }
    }
  }, []);

  // Load all articles for admin dashboard
  const loadAllArticles = useCallback(async () => {
    try {
      if (articlesLoading) return;
      setArticlesLoading(true);
      await ensureDefaultArticles();
      const articles = await getAllArticles();
      setAllArticles(articles);
      // Update analytics with real article data
      const totalArticles = articles.length;
      const publishedArticles = articles.filter(a => a.status === 'published').length;
      setUserData(prev => ({
        ...prev,
        analytics: {
          ...prev.analytics,
          totalArticles,
          publishedArticles
        }
      }));
    } catch (error) {
      console.error('Error loading all articles:', error);
    } finally {
      setArticlesLoading(false);
    }
  }, [articlesLoading, ensureDefaultArticles]);

  // Load published articles for user blog feed
  const loadPublishedArticles = useCallback(async () => {
    try {
      const articles = await getPublishedArticles();
      setPublishedArticles(articles);
    } catch (error) {
      console.error('Error loading published articles:', error);
    }
  }, []);

  // Add new article
  const addArticleToDB = useCallback(async (articleData) => {
    try {
      const newArticle = await addArticleDB(articleData);
      setAllArticles(prev => [newArticle, ...prev]);
      
      // If article is published, also add to published articles
      if (articleData.status === 'published') {
        setPublishedArticles(prev => [newArticle, ...prev]);
      }
      
      return newArticle;
    } catch (error) {
      console.error('Error adding article:', error);
      throw error;
    }
  }, []);

  // Update article
  const updateArticleInDB = useCallback(async (articleId, updates) => {
    try {
      await updateArticleDB(articleId, updates);
      
      setAllArticles(prev => 
        prev.map(article => 
          article.id === articleId ? { ...article, ...updates } : article
        )
      );
      
      // Update published articles if status changed
      if (updates.status) {
        if (updates.status === 'published') {
          const updatedArticle = allArticles.find(a => a.id === articleId);
          if (updatedArticle) {
            setPublishedArticles(prev => [updatedArticle, ...prev]);
          }
        } else {
          setPublishedArticles(prev => prev.filter(a => a.id !== articleId));
        }
      }
    } catch (error) {
      console.error('Error updating article:', error);
      throw error;
    }
  }, [allArticles]);

  // Delete article
  const deleteArticleFromDB = useCallback(async (articleId) => {
    try {
      await deleteArticleDB(articleId);
      setAllArticles(prev => prev.filter(article => article.id !== articleId));
      setPublishedArticles(prev => prev.filter(article => article.id !== articleId));
    } catch (error) {
      console.error('Error deleting article:', error);
      throw error;
    }
  }, []);

  // Manual refresh function for articles
  const refreshArticles = useCallback(async () => {
    try {
      setArticlesLoading(true);
      setAllArticles([]); // Clear current articles
      const articles = await getAllArticles();
      setAllArticles(articles);
      
      // Update analytics with real article data
      const totalArticles = articles.length;
      const publishedArticles = articles.filter(a => a.status === 'published').length;
      
      setUserData(prev => ({
        ...prev,
        analytics: {
          ...prev.analytics,
          totalArticles,
          publishedArticles
        }
      }));
    } catch (error) {
      console.error('Error refreshing articles:', error);
    } finally {
      setArticlesLoading(false);
    }
  }, []);

  // Authentication
  const loginUser = async (credentials) => {
    try {
      setLoading(true);
      // Load all user data from database
      await loadUserData(credentials.profile.email);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logoutUser = async () => {
    try {
      await auth.signOut();
      setIsAuthenticated(false);
      setUserData(initialData);
      // Redirect to landing page after logout
      window.location.href = '/';
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  // Update analytics when data changes
  useEffect(() => {
    const updatedAnalytics = {
      totalUsers: userData.systemUsers.length,
      activeUsers: userData.systemUsers.filter(u => u.status === 'active').length,
      totalArticles: userData.articles.length,
      publishedArticles: userData.articles.filter(a => a.status === 'published').length,
      totalDoctors: userData.doctors.length,
      totalAppointments: userData.appointments.length,
      totalReminders: userData.systemUsers.reduce((sum, user) => sum + user.reminders, 0),
      reminderCompletionRate: Math.round((derivedData.remindersTaken / userData.reminders.length) * 100),
      userEngagementRate: 75,
      articleReadershipRate: 48,
      userGrowthRate: 12,
      articleEngagementRate: 8,
      systemHealth: userData.analytics.systemHealth
    };

    setUserData(prev => ({
      ...prev,
      analytics: updatedAnalytics
    }));
  }, [userData.systemUsers, userData.articles, userData.doctors, userData.appointments, derivedData.remindersTaken]);

  // Ensure analytics and userAnalytics are always present and populated
  useEffect(() => {
    setUserData(prev => {
      // Default analytics
      const defaultAnalytics = {
        totalUsers: prev.systemUsers?.length || 5,
        activeUsers: prev.systemUsers?.filter(u => u.status === 'active').length || 4,
        totalArticles: prev.articles?.length || 5,
        publishedArticles: prev.articles?.filter(a => a.status === 'published').length || 4,
        totalDoctors: prev.doctors?.length || 5,
        totalAppointments: prev.appointments?.length || 0,
        totalReminders: prev.systemUsers?.reduce?.((sum, u) => sum + (u.reminders || 0), 0) || 10,
        reminderCompletionRate: 80,
        userEngagementRate: 75,
        articleReadershipRate: 48,
        userGrowthRate: 12,
        articleEngagementRate: 8,
        systemHealth: {
          serverStatus: 'Online',
          apiResponse: '120ms',
          database: 'Connected',
          storageUsed: '68%'
        }
      };
      // Default user analytics
      const defaultUserAnalytics = {
        goals: { completionRate: 72 },
        medications: { adherence: 88 },
        activities: {
          steps: { average: 8200 },
          sleep: { average: 7.2 },
          exercise: { total: 150 },
          water: { average: 8 }
        },
        healthScore: {
          current: 82,
          previous: 78,
          trend: 'up',
          history: [78, 80, 81, 82, 83, 82, 82]
        },
        mood: {
          average: 7.8,
          trend: 'stable',
          history: [7, 8, 8, 7, 8, 8, 8]
        },
        insights: [
          { type: 'positive', message: 'Users are completing more goals this week.' },
          { type: 'warning', message: 'Some users missed their medication reminders.' },
          { type: 'suggestion', message: 'Encourage users to drink more water.' }
        ]
      };
      return {
        ...prev,
        analytics: { ...defaultAnalytics, ...(prev.analytics || {}) },
        userAnalytics: { ...defaultUserAnalytics, ...(prev.userAnalytics || {}) }
      };
    });
  }, [userData.systemUsers, userData.articles, userData.doctors, userData.appointments]);

  useEffect(() => {
    async function ensureAllDemoData() {
      let usersAdded = false, articlesAdded = false, doctorsAdded = false, appointmentsAdded = false, remindersAdded = false;
      // Ensure demo users
      if ((userData.systemUsers || []).length < 5) {
        const demoUsers = [
          { name: 'Alice', email: 'alice@example.com', status: 'active', role: 'user', healthScore: 80, reminders: 2 },
          { name: 'Bob', email: 'bob@example.com', status: 'active', role: 'user', healthScore: 85, reminders: 3 },
          { name: 'Charlie', email: 'charlie@example.com', status: 'inactive', role: 'user', healthScore: 70, reminders: 1 },
          { name: 'Diana', email: 'diana@example.com', status: 'active', role: 'user', healthScore: 90, reminders: 2 },
          { name: 'Eve', email: 'eve@example.com', status: 'active', role: 'admin', healthScore: 95, reminders: 2 }
        ];
        for (let i = (userData.systemUsers || []).length; i < 5; i++) {
          await addSystemUser(demoUsers[i]);
          usersAdded = true;
        }
      }
      // Ensure demo articles
      if ((userData.articles || []).length < 5) {
        await ensureDefaultArticles();
        articlesAdded = true;
      }
      // Ensure demo doctors
      if ((userData.doctors || []).length < 5) {
        await ensureDefaultDoctors();
        doctorsAdded = true;
      }
      // Ensure demo appointments
      if ((userData.appointments || []).length < 5) {
        const demoAppointments = [
          { doctorId: '1', doctorName: 'Dr. Priya Sharma', specialty: 'General Physician', patientEmail: 'alice@example.com', patientName: 'Alice', date: '2024-06-01', time: '10:00', status: 'confirmed' },
          { doctorId: '2', doctorName: 'Dr. Arjun Mehta', specialty: 'Cardiologist', patientEmail: 'bob@example.com', patientName: 'Bob', date: '2024-06-02', time: '11:00', status: 'pending' },
          { doctorId: '3', doctorName: 'Dr. Sneha Kapoor', specialty: 'Dermatologist', patientEmail: 'charlie@example.com', patientName: 'Charlie', date: '2024-06-03', time: '12:00', status: 'cancelled' },
          { doctorId: '4', doctorName: 'Dr. Rahul Verma', specialty: 'Pediatrician', patientEmail: 'diana@example.com', patientName: 'Diana', date: '2024-06-04', time: '13:00', status: 'confirmed' },
          { doctorId: '5', doctorName: 'Dr. Anjali Singh', specialty: 'Gynecologist', patientEmail: 'eve@example.com', patientName: 'Eve', date: '2024-06-05', time: '14:00', status: 'pending' }
        ];
        for (let i = (userData.appointments || []).length; i < 5; i++) {
          await addAppointment(demoAppointments[i]);
          appointmentsAdded = true;
        }
      }
      // Ensure demo reminders
      if ((userData.reminders || []).length < 5) {
        const demoReminders = [
          { id: 'r1', text: 'Take blood pressure medicine', taken: true },
          { id: 'r2', text: 'Drink water', taken: false },
          { id: 'r3', text: 'Go for a walk', taken: true },
          { id: 'r4', text: 'Take vitamins', taken: false },
          { id: 'r5', text: 'Check blood sugar', taken: true }
        ];
        for (let i = (userData.reminders || []).length; i < 5; i++) {
          await addReminder(demoReminders[i]);
          remindersAdded = true;
        }
      }
      // Reload all lists if any demo data was added
      if (usersAdded) await loadAllUsers();
      if (articlesAdded) await loadAllArticles();
      if (doctorsAdded) await loadAllDoctors();
      if (appointmentsAdded && userData.profile?.email) await loadUserAppointments(userData.profile.email);
      if (remindersAdded && userData.profile?.email) await loadUserData(userData.profile.email);
    }
    ensureAllDemoData();
    // eslint-disable-next-line
  }, []);

  const value = {
    userData,
    derivedData,
    isAuthenticated,
    loading,
    authChecked,
    allUsers,
    usersLoading,
    allArticles,
    publishedArticles,
    articlesLoading,
    updateProfile,
    updateProfileSection,
    updateVitals,
    addGoal,
    toggleGoal,
    deleteGoal,
    toggleReminder,
    addReminder,
    deleteReminder,
    updateReminder,
    updateUserAnalytics,
    updateHealthScore,
    updateActivityData,
    addArticle,
    updateArticle,
    deleteArticle,
    addDoctor,
    updateDoctor,
    deleteDoctor,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    loadUserAppointments,
    loadUserData,
    loadMedicalHistory,
    loadAllUsers,
    loadAllArticles,
    loadPublishedArticles,
    addArticleToDB,
    updateArticleInDB,
    deleteArticleFromDB,
    updateUserStatusDB,
    updateUserRoleDB,
    addSystemUser,
    updateSystemUser,
    deleteSystemUser,
    loginUser,
    logoutUser,
    refreshArticles,
    loadAllDoctors,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};