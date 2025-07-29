import React, { useState, useEffect, useCallback } from 'react';
import { useUser } from '../context/UserContext';
import AdminDashboardOverview from '../pages/AdminDashboardOverview';
import AdminDashboardUsers from '../pages/AdminDashboardUsers';
import AdminDashboardArticles from '../pages/AdminDashboardArticles';
import AdminDashboardDoctors from '../pages/AdminDashboardDoctors';
import AdminDashboardAnalytics from '../pages/AdminDashboardAnalytics';
import UserProfileDropdown from './UserProfileDropdown';
import Header from './Header';
import './AdminDashboard.css';

const admin = { name: 'Admin', email: 'admin@health.com', role: 'Super Admin' };

const buttonStyle = {
  background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 10px', fontWeight: 500, cursor: 'pointer'
};
const dangerButton = { ...buttonStyle, background: '#d32f2f' };
const cancelButton = { ...buttonStyle, background: '#888' };

const sectionNames = {
  dashboard: 'Admin Dashboard',
  users: 'Users',
  articles: 'Articles',
  doctors: 'Doctors',
  analytics: 'Analytics',
};

const AdminDashboard = () => {
  const [section, setSection] = useState('dashboard');
  const [profileOpen, setProfileOpen] = useState(false);
  const isMobile = window.innerWidth <= 900;
  const [sidebarOpen, setSidebarOpen] = useState(() => !isMobile ? true : false);
  const { userData, isAuthenticated, logoutUser } = useUser();
  
  // Get centralized data from UserContext
  const { 
    allUsers,
    usersLoading,
    allArticles,
    articlesLoading,
    loadAllUsers,
    loadAllArticles,
    refreshArticles,
    addArticleToDB,
    updateArticleInDB,
    deleteArticleFromDB,
    updateUserStatusDB,
    updateUserRoleDB,
    addSystemUser, 
    updateSystemUser, 
    deleteSystemUser,
    addArticle, 
    updateArticle, 
    deleteArticle,
    addDoctor, 
    updateDoctor, 
    deleteDoctor
  } = useUser();

  // Local state for editing
  const [editingUser, setEditingUser] = useState(null);
  const [userEdit, setUserEdit] = useState({ name: '', email: '', role: '', status: '' });
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'user', status: 'active' });

  const [editingArticle, setEditingArticle] = useState(null);
  const [articleEdit, setArticleEdit] = useState({ title: '', date: '', author: '', status: '' });
  const [newArticle, setNewArticle] = useState({ 
    title: '', 
    date: '', 
    author: '', 
    status: 'draft',
    summary: '',
    content: '',
    category: 'general',
    tags: ''
  });

  const [editingDoctor, setEditingDoctor] = useState(null);
  const [doctorEdit, setDoctorEdit] = useState({ name: '', specialty: '', location: '', rating: '' });
  const [newDoctor, setNewDoctor] = useState({ name: '', specialty: '', location: '', rating: '' });

  // Load all users when admin dashboard is accessed
  const handleLoadUsers = useCallback(() => {
    if (section === 'users' && allUsers.length === 0 && !usersLoading) {
      // Add a small delay to prevent rapid re-renders
      setTimeout(() => {
        loadAllUsers();
      }, 100);
    }
  }, [section, allUsers.length, usersLoading, loadAllUsers]);

  // Load all articles when admin dashboard is accessed
  const handleLoadArticles = useCallback(() => {
    if (section === 'articles' && allArticles.length === 0 && !articlesLoading) {
      loadAllArticles();
    }
  }, [section, allArticles.length, articlesLoading, loadAllArticles]);

  useEffect(() => {
    handleLoadUsers();
    handleLoadArticles();
  }, [handleLoadUsers, handleLoadArticles]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 900) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // User management handlers
  const startEditUser = (user) => {
    setEditingUser(user.email);
    setUserEdit({ name: user.name, email: user.email, role: user.role, status: user.status });
  };
  
  const saveEditUser = async (email) => {
    try {
      if (userEdit.role !== userData.analytics?.role) {
        await updateUserRoleDB(email, userEdit.role);
      }
      if (userEdit.status !== userData.analytics?.status) {
        await updateUserStatusDB(email, userEdit.status);
      }
      setEditingUser(null);
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user. Please try again.');
    }
  };
  
  const handleDeleteUser = (email) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      // Note: User deletion should be handled carefully in production
      alert('User deletion is not implemented for security reasons.');
    }
  };

  const handleAddUser = (e) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email) return;
    // Note: User creation should be handled through proper registration flow
    alert('User creation should be done through the registration process.');
    setNewUser({ name: '', email: '', role: 'user', status: 'active' });
  };

  // Article management handlers
  const startEditArticle = (article) => {
    setEditingArticle(article.id);
    setArticleEdit({ 
      title: article.title, 
      date: article.date, 
      author: article.author || '', 
      status: article.status || 'draft' 
    });
  };
  
  const saveEditArticle = async (id) => {
    try {
      await updateArticleInDB(id, articleEdit);
      setEditingArticle(null);
    } catch (error) {
      console.error('Error updating article:', error);
      alert('Failed to update article. Please try again.');
    }
  };
  
  const handleDeleteArticle = async (id) => {
    if (window.confirm('Are you sure you want to delete this article?')) {
      try {
        await deleteArticleFromDB(id);
      } catch (error) {
        console.error('Error deleting article:', error);
        alert('Failed to delete article. Please try again.');
      }
    }
  };

  const handleAddArticle = async (e) => {
    e.preventDefault();
    if (!newArticle.title || !newArticle.date) return;
    
    try {
      const articleData = {
        ...newArticle,
        author: newArticle.author || 'Admin',
        status: newArticle.status || 'draft',
        summary: newArticle.summary || '',
        content: newArticle.content || '',
        category: newArticle.category || 'general',
        tags: newArticle.tags || []
      };
      
      await addArticleToDB(articleData);
      setNewArticle({ 
        title: '', 
        date: '', 
        author: '', 
        status: 'draft',
        summary: '',
        content: '',
        category: 'general',
        tags: ''
      });
    } catch (error) {
      console.error('Error adding article:', error);
      alert('Failed to add article. Please try again.');
    }
  };

  // Doctor management handlers
  const startEditDoctor = (doctor) => {
    setEditingDoctor(doctor.id);
    setDoctorEdit({ 
      name: doctor.name, 
      specialty: doctor.specialty, 
      location: doctor.location, 
      rating: doctor.rating 
    });
  };
  
  const saveEditDoctor = (id) => {
    updateDoctor(id, { ...doctorEdit, rating: parseFloat(doctorEdit.rating) });
    setEditingDoctor(null);
  };
  
  const handleDeleteDoctor = (id) => {
    deleteDoctor(id);
  };

  const handleAddDoctor = (e) => {
    e.preventDefault();
    if (!newDoctor.name || !newDoctor.specialty || !newDoctor.location || !newDoctor.rating) return;
    addDoctor({ ...newDoctor, rating: parseFloat(newDoctor.rating) });
    setNewDoctor({ name: '', specialty: '', location: '', rating: '' });
  };

  // Dashboard summary cards - now using real data
  const summaryCards = [
    { label: 'Users', value: userData.analytics.totalUsers },
    { label: 'Articles', value: userData.analytics.totalArticles },
    { label: 'Doctors', value: userData.analytics.totalDoctors },
    { label: 'Reminders', value: userData.analytics.totalReminders },
  ];

  // Only allow admin@health.com
  if (!isAuthenticated || userData?.profile?.email !== 'admin@health.com') {
    return <div className="flex items-center justify-center min-h-screen text-xl text-red-600">Access Denied: Admin Only</div>;
  }
  // Sidebar class logic
  const sidebarClass = `sidebar${sidebarOpen && isMobile ? ' open' : ''}${!sidebarOpen ? ' sidebar-closed' : ''}`;
  // Main content style logic
  const mainContentStyle = {
    width: sidebarOpen && !isMobile ? 'calc(100vw - 260px)' : '100vw',
    maxWidth: sidebarOpen && !isMobile ? 'calc(100vw - 260px)' : '100vw',
    minHeight: 'calc(100vh - 70px)',
    marginLeft: sidebarOpen && !isMobile ? 260 : 0
  };
  return (
    <div className="flex">
      {/* Sidebar */}
      <aside className={sidebarClass}>
        <div className="sidebar-header">
          <div className="sidebar-title">
            <span>Smart Health Admin</span>
          </div>
          {isMobile && (
            <button 
              className="sidebar-close-btn"
              onClick={() => setSidebarOpen(false)}
              title="Close Sidebar"
            >
              ✕
            </button>
          )}
        </div>
        <nav className="sidebar-nav">
          <ul className="list">
            {Object.entries(sectionNames).map(([key, label]) => (
              <li key={key} className="nav-item">
                <a 
                  className={`nav-link ${section === key ? 'active' : ''}`}
                  onClick={() => { setSection(key); if (isMobile) setSidebarOpen(false); }}
                  style={{ cursor: 'pointer' }}
                >
                  <span className="nav-icon">
                    {label[0]}
                  </span>
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      {/* Sidebar overlay for mobile */}
      {sidebarOpen && isMobile && (
        <div className="sidebar-overlay blur-overlay" onClick={() => setSidebarOpen(false)}></div>
      )}
      {/* Main content area */}
      <div className="flex-1 flex flex-col items-center justify-start min-h-screen">
        {/* Modern Header */}
        <Header
          title={sectionNames[section]}
          onHamburgerClick={() => setSidebarOpen(true)}
          showHamburger={!sidebarOpen}
          user={{ ...userData.profile, onLogout: logoutUser }}
        />
        {/* Main Content with blurred dark background */}
        <div className="main-bg-blur-dark" style={mainContentStyle}>
          <main className="main-content flex flex-col items-center justify-center w-full" style={{marginLeft: 0, width: '100%', maxWidth: '100%', background: 'none'}}>
            <div className="content-wrapper animate-slideInUp" style={{margin: 0, width: '100%', maxWidth: '100%', minWidth: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
              {section === 'dashboard' && (
                <AdminDashboardOverview 
                  summaryCards={summaryCards}
                  analytics={userData.analytics}
                  recentActivity={[
                    `${userData.systemUsers[0]?.name || 'User'} set a new reminder`,
                    `${userData.systemUsers[1]?.name || 'User'} added a new article`,
                    `${userData.systemUsers[2]?.name || 'User'} updated profile`,
                    'System backup completed',
                    `New doctor registered: ${userData.doctors[userData.doctors.length - 1]?.name || 'Dr. New'}`,
                  ]}
                />
              )}
              {section === 'users' && (
                <AdminDashboardUsers 
                  users={allUsers}
                  usersLoading={usersLoading}
                  editingUser={editingUser}
                  userEdit={userEdit}
                  setUserEdit={setUserEdit}
                  startEditUser={startEditUser}
                  saveEditUser={saveEditUser}
                  setEditingUser={setEditingUser}
                  deleteUser={handleDeleteUser}
                  newUser={newUser}
                  setNewUser={setNewUser}
                  addUser={handleAddUser}
                  onRefresh={loadAllUsers}
                />
              )}
              {section === 'articles' && (
                <AdminDashboardArticles 
                  articles={allArticles}
                  articlesLoading={articlesLoading}
                  editingArticle={editingArticle}
                  articleEdit={articleEdit}
                  setArticleEdit={setArticleEdit}
                  startEditArticle={startEditArticle}
                  saveEditArticle={saveEditArticle}
                  setEditingArticle={setEditingArticle}
                  deleteArticle={handleDeleteArticle}
                  newArticle={newArticle}
                  setNewArticle={setNewArticle}
                  addArticle={handleAddArticle}
                  onRefresh={refreshArticles}
                />
              )}
              {section === 'doctors' && (
                <AdminDashboardDoctors 
                  doctors={userData.doctors}
                  editingDoctor={editingDoctor}
                  doctorEdit={doctorEdit}
                  setDoctorEdit={setDoctorEdit}
                  startEditDoctor={startEditDoctor}
                  saveEditDoctor={saveEditDoctor}
                  setEditingDoctor={setEditingDoctor}
                  deleteDoctor={handleDeleteDoctor}
                  newDoctor={newDoctor}
                  setNewDoctor={setNewDoctor}
                  addDoctor={handleAddDoctor}
                />
              )}
              {section === 'analytics' && (
                <AdminDashboardAnalytics />
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;