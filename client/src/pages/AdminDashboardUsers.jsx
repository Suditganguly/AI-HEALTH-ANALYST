import React, { useState } from 'react';

const AdminDashboardUsers = ({ users, usersLoading, editingUser, userEdit, setUserEdit, startEditUser, saveEditUser, setEditingUser, deleteUser, newUser, setNewUser, addUser, onRefresh }) => {
  // Summary stats
  const totalUsers = users.length;
  const usersWithReminders = users.filter(u => u.reminders > 0).length;
  const activeUsers = users.filter(u => u.status === 'active').length;
  const adminUsers = users.filter(u => u.role === 'admin').length;

  // Search/filter
  const [search, setSearch] = useState('');
  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-slideInUp w-full max-w-7xl mx-auto px-2 md:px-6 py-4">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-2">
        <h2 className="text-2xl font-bold text-primary">All Users</h2>
        <button 
          onClick={onRefresh}
          className="btn btn-secondary btn-sm"
          disabled={usersLoading}
        >
          {usersLoading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Loading...
            </div>
          ) : (
            'Refresh'
          )}
        </button>
      </div>
      
      {usersLoading && users.length === 0 && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2 text-primary">Loading users...</span>
        </div>
      )}
      
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="glass-card p-4 flex flex-col items-center">
          <span className="text-lg font-semibold text-primary">Total Users</span>
          <span className="text-2xl font-bold">{usersLoading ? '...' : totalUsers}</span>
        </div>
        <div className="glass-card p-4 flex flex-col items-center">
          <span className="text-lg font-semibold text-primary">Active Users</span>
          <span className="text-2xl font-bold text-success">{usersLoading ? '...' : activeUsers}</span>
        </div>
        <div className="glass-card p-4 flex flex-col items-center">
          <span className="text-lg font-semibold text-primary">With Reminders</span>
          <span className="text-2xl font-bold text-info">{usersLoading ? '...' : usersWithReminders}</span>
        </div>
        <div className="glass-card p-4 flex flex-col items-center">
          <span className="text-lg font-semibold text-primary">Admins</span>
          <span className="text-2xl font-bold text-warning">{usersLoading ? '...' : adminUsers}</span>
        </div>
      </div>

      {/* Add New User Form */}
      <div className="card card-gradient mb-6">
        <div className="card-header">
          <h3 className="card-title">Add New User</h3>
        </div>
        <form onSubmit={addUser} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="form-group">
            <label className="form-label">Name</label>
            <input
              value={newUser.name}
              onChange={e => setNewUser({ ...newUser, name: e.target.value })}
              placeholder="Full name"
              className="input-dark w-full"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              value={newUser.email}
              onChange={e => setNewUser({ ...newUser, email: e.target.value })}
              placeholder="email@example.com"
              type="email"
              className="input-dark w-full"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Role</label>
            <select
              value={newUser.role}
              onChange={e => setNewUser({ ...newUser, role: e.target.value })}
              className="input-dark w-full"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select
              value={newUser.status}
              onChange={e => setNewUser({ ...newUser, status: e.target.value })}
              className="input-dark w-full"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="md:col-span-2 lg:col-span-4 mt-2">
            <button type="submit" className="btn btn-primary">Add User</button>
          </div>
        </form>
      </div>

      {/* Search Bar */}
      <div className="mb-4 flex flex-col md:flex-row gap-2 items-center">
        <input
          className="input-dark w-full md:w-64"
          placeholder="Search users by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Users Table */}
      <div className="card glass-card overflow-x-auto">
        <table className="w-full text-sm min-w-[600px] responsive-table">
            <thead>
              <tr className="bg-neutral-900 bg-opacity-60 text-white">
                <th className="p-3 font-semibold">Name</th>
                <th className="p-3 font-semibold">Email</th>
                <th className="p-3 font-semibold">Reminders</th>
                <th className="p-3 font-semibold">Role</th>
                <th className="p-3 font-semibold">Status</th>
                <th className="p-3 font-semibold">Health Score</th>
                <th className="p-3 font-semibold">Registered</th>
                <th className="p-3 font-semibold">Last Login</th>
                <th className="p-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {usersLoading && users.length === 0 ? (
                <tr>
                  <td colSpan="9" className="p-8 text-center">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      <span className="ml-2 text-primary">Loading users...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="9" className="p-8 text-center text-neutral-400">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => (
                <tr key={user.email || user.id || Math.random()} className="border-b border-neutral-800 hover:bg-neutral-800 hover:bg-opacity-40 transition-all">
                  <td className="p-3" data-label="Name">
                    {editingUser === user.email ? (
                      <input
                        value={userEdit.name}
                        onChange={e => setUserEdit({ ...userEdit, name: e.target.value })}
                        className="input-dark"
                      />
                    ) : (user.name || '-')}
                  </td>
                  <td className="p-3" data-label="Email">
                    {editingUser === user.email ? (
                      <input
                        value={userEdit.email}
                        onChange={e => setUserEdit({ ...userEdit, email: e.target.value })}
                        className="input-dark"
                        disabled
                      />
                    ) : (user.email || '-')}
                  </td>
                  <td className="p-3 text-center" data-label="Reminders">
                    <span className="badge badge-info bg-opacity-80">{user.reminders != null ? user.reminders : 0}</span>
                  </td>
                  <td className="p-3 text-center" data-label="Role">
                    {editingUser === user.email ? (
                      <select
                        value={userEdit.role}
                        onChange={e => setUserEdit({ ...userEdit, role: e.target.value })}
                        className="input-dark"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    ) : (
                      <span className={`badge ${user.role === 'admin' ? 'badge-warning' : 'badge-secondary'} bg-opacity-80`}>
                        {user.role || '-'}
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-center" data-label="Status">
                    {editingUser === user.email ? (
                      <select
                        value={userEdit.status}
                        onChange={e => setUserEdit({ ...userEdit, status: e.target.value })}
                        className="input-dark"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    ) : (
                      <span className={`badge ${user.status === 'active' ? 'badge-success' : 'badge-error'} bg-opacity-80`}>
                        {user.status || '-'}
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-center" data-label="Health Score">
                    <span className="badge badge-secondary bg-opacity-80">{user.healthScore != null ? user.healthScore : 0}</span>
                  </td>
                  <td className="p-3 text-center" data-label="Registered">
                    <span className="text-xs text-neutral-400">{user.registered ? (new Date(user.registered).toLocaleDateString() || '-') : '-'}</span>
                  </td>
                  <td className="p-3 text-center" data-label="Last Login">
                    <span className="text-xs text-neutral-400">{user.lastLogin ? (new Date(user.lastLogin).toLocaleDateString() || '-') : '-'}</span>
                  </td>
                  <td className="p-3 text-center" data-label="Actions">
                    {editingUser === user.email ? (
                      <div className="flex gap-2">
                        <button onClick={() => saveEditUser(user.email)} className="btn btn-primary btn-sm">Save</button>
                        <button onClick={() => setEditingUser(null)} className="btn btn-ghost btn-sm">Cancel</button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button onClick={() => startEditUser(user)} className="btn btn-outline btn-sm">Edit</button>
                        <button onClick={() => deleteUser(user.email)} className="btn bg-error text-white btn-sm">Delete</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
            </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboardUsers;
