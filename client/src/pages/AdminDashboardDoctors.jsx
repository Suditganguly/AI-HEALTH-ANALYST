import React from 'react';

const AdminDashboardDoctors = ({ doctors, editingDoctor, doctorEdit, setDoctorEdit, startEditDoctor, saveEditDoctor, setEditingDoctor, deleteDoctor, newDoctor, setNewDoctor, addDoctor }) => (
  <div className="animate-slideInUp w-full max-w-7xl mx-auto px-2 md:px-6 py-4">
    <h2 className="text-2xl font-bold text-primary mb-6">Doctors</h2>
    <div className="card card-gradient mb-6">
      <div className="card-header">
        <h3 className="card-title">Add New Doctor</h3>
      </div>
      <form onSubmit={addDoctor} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="form-group">
          <label className="form-label">Name</label>
          <input 
            value={newDoctor.name} 
            onChange={e => setNewDoctor({ ...newDoctor, name: e.target.value })} 
            placeholder="Doctor's name" 
            className="input"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Specialty</label>
          <input 
            value={newDoctor.specialty} 
            onChange={e => setNewDoctor({ ...newDoctor, specialty: e.target.value })} 
            placeholder="Medical specialty" 
            className="input"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Location</label>
          <input 
            value={newDoctor.location} 
            onChange={e => setNewDoctor({ ...newDoctor, location: e.target.value })} 
            placeholder="City or hospital" 
            className="input"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Rating</label>
          <input 
            value={newDoctor.rating} 
            onChange={e => setNewDoctor({ ...newDoctor, rating: e.target.value })} 
            placeholder="Rating (0-5)" 
            type="number" 
            min="0" 
            max="5" 
            step="0.1" 
            className="input"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Reviews</label>
          <input 
            value={newDoctor.reviews} 
            onChange={e => setNewDoctor({ ...newDoctor, reviews: e.target.value })} 
            placeholder="Number of reviews" 
            type="number" 
            min="0" 
            className="input"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Experience</label>
          <input 
            value={newDoctor.experience} 
            onChange={e => setNewDoctor({ ...newDoctor, experience: e.target.value })} 
            placeholder="Experience (e.g. 10 years)" 
            className="input"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Languages (comma-separated)</label>
          <input 
            value={newDoctor.languages} 
            onChange={e => setNewDoctor({ ...newDoctor, languages: e.target.value })} 
            placeholder="English, Hindi, Bengali" 
            className="input"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Consultation Fee</label>
          <input 
            value={newDoctor.consultationFee} 
            onChange={e => setNewDoctor({ ...newDoctor, consultationFee: e.target.value })} 
            placeholder="Fee in ₹" 
            type="number" 
            min="0" 
            className="input"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Status</label>
          <select
            value={newDoctor.status || 'active'}
            onChange={e => setNewDoctor({ ...newDoctor, status: e.target.value })}
            className="input"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div className="md:col-span-2 lg:col-span-4 mt-2">
          <button type="submit" className="btn btn-primary">Add Doctor</button>
        </div>
      </form>
    </div>
    <div className="card overflow-x-auto">
      <table className="w-full min-w-[600px] responsive-table">
          <thead>
            <tr className="bg-neutral-100">
              <th className="text-left p-4 text-primary font-semibold">Name</th>
              <th className="text-left p-4 text-primary font-semibold">Specialty</th>
              <th className="text-left p-4 text-primary font-semibold">Location</th>
              <th className="text-left p-4 text-primary font-semibold">Rating</th>
              <th className="text-left p-4 text-primary font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {doctors.map(doc => (
              <tr key={doc.id} className="border-b border-neutral-200 hover:bg-neutral-50">
                <td className="p-4" data-label="Name">
                  {editingDoctor === doc.id ? (
                    <input 
                      value={doctorEdit.name} 
                      onChange={e => setDoctorEdit({ ...doctorEdit, name: e.target.value })} 
                      className="input"
                    />
                  ) : doc.name}
                </td>
                <td className="p-4" data-label="Specialty">
                  {editingDoctor === doc.id ? (
                    <input 
                      value={doctorEdit.specialty} 
                      onChange={e => setDoctorEdit({ ...doctorEdit, specialty: e.target.value })} 
                      className="input"
                    />
                  ) : doc.specialty}
                </td>
                <td className="p-4" data-label="Location">
                  {editingDoctor === doc.id ? (
                    <input 
                      value={doctorEdit.location} 
                      onChange={e => setDoctorEdit({ ...doctorEdit, location: e.target.value })} 
                      className="input"
                    />
                  ) : doc.location}
                </td>
                <td className="p-4" data-label="Rating">
                  {editingDoctor === doc.id ? (
                    <input 
                      value={doctorEdit.rating} 
                      onChange={e => setDoctorEdit({ ...doctorEdit, rating: e.target.value })} 
                      type="number" 
                      min="0" 
                      max="5" 
                      step="0.1" 
                      className="input w-24"
                    />
                  ) : (
                    <span className="badge badge-primary">{doc.rating.toFixed(1)} ★</span>
                  )}
                </td>
                <td className="p-4" data-label="Actions">
                  {editingDoctor === doc.id ? (
                    <div className="flex gap-2">
                      <button onClick={() => saveEditDoctor(doc.id)} className="btn btn-primary">Save</button>
                      <button onClick={() => setEditingDoctor(null)} className="btn btn-ghost">Cancel</button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button onClick={() => startEditDoctor(doc)} className="btn btn-outline">Edit</button>
                      <button onClick={() => deleteDoctor(doc.id)} className="btn bg-error text-white">Delete</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
    </div>
  </div>
);

export default AdminDashboardDoctors;
