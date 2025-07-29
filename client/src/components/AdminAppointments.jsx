import React, { useState, useEffect } from 'react';
import { getAllAppointments, updateAppointment as updateAppointmentDB, deleteAppointment as deleteAppointmentDB } from '../services/appointmentService';

const AdminAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, confirmed, cancelled

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const data = await getAllAppointments();
      setAppointments(data);
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    try {
      await updateAppointmentDB(appointmentId, { status: newStatus });
      setAppointments(prev => 
        prev.map(apt => 
          apt.id === appointmentId ? { ...apt, status: newStatus } : apt
        )
      );
    } catch (error) {
      console.error('Error updating appointment status:', error);
      alert('Failed to update appointment status');
    }
  };

  const handleDeleteAppointment = async (appointmentId) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      try {
        await deleteAppointmentDB(appointmentId);
        setAppointments(prev => prev.filter(apt => apt.id !== appointmentId));
      } catch (error) {
        console.error('Error deleting appointment:', error);
        alert('Failed to delete appointment');
      }
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    if (filter === 'all') return true;
    return apt.status === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center p-8">
        <div className="text-lg">Loading appointments...</div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6">
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4">Appointments Management</h2>
        
        {/* Filter Controls */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              filter === 'all' 
                ? 'bg-primary text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All ({appointments.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              filter === 'pending' 
                ? 'bg-yellow-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Pending ({appointments.filter(apt => apt.status === 'pending').length})
          </button>
          <button
            onClick={() => setFilter('confirmed')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              filter === 'confirmed' 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Confirmed ({appointments.filter(apt => apt.status === 'confirmed').length})
          </button>
          <button
            onClick={() => setFilter('cancelled')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              filter === 'cancelled' 
                ? 'bg-red-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Cancelled ({appointments.filter(apt => apt.status === 'cancelled').length})
          </button>
        </div>

        {/* Refresh Button */}
        <button
          onClick={loadAppointments}
          className="btn btn-primary mb-4"
        >
          Refresh Appointments
        </button>
      </div>

      {/* Appointments List */}
      <div className="grid gap-4">
        {filteredAppointments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No appointments found for the selected filter.
          </div>
        ) : (
          filteredAppointments.map((appointment) => (
            <div key={appointment.id} className="card card-alt p-6 border-l-4 border-primary">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-primary">{appointment.doctorName}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}>
                      {appointment.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Patient:</span>
                      <div>{appointment.patientName}</div>
                      <div className="text-gray-500">{appointment.patientEmail}</div>
                    </div>
                    
                    <div>
                      <span className="font-medium text-gray-600">Appointment:</span>
                      <div>{formatDate(appointment.date)} at {appointment.time}</div>
                      <div className="text-gray-500">{appointment.specialty}</div>
                    </div>
                    
                    <div>
                      <span className="font-medium text-gray-600">Reason:</span>
                      <div>{appointment.reason}</div>
                      {appointment.symptoms && (
                        <div className="text-gray-500 text-xs mt-1">
                          Symptoms: {appointment.symptoms}
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <span className="font-medium text-gray-600">Details:</span>
                      <div>Urgency: {appointment.urgency}</div>
                      <div className="text-gray-500 text-xs">
                        Created: {formatDate(appointment.createdAt?.toDate?.() || appointment.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  {/* Status Update */}
                  <select
                    value={appointment.status}
                    onChange={(e) => handleStatusUpdate(appointment.id, e.target.value)}
                    className="input input-dark text-sm"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  
                  {/* Delete Button */}
                  <button
                    onClick={() => handleDeleteAppointment(appointment.id)}
                    className="btn btn-outline btn-sm text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminAppointments; 