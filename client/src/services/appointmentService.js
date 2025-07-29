import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';

const APPOINTMENTS_COLLECTION = 'appointments';

// Create a new appointment
export const createAppointment = async (appointmentData) => {
  try {
    const appointmentWithTimestamp = {
      ...appointmentData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, APPOINTMENTS_COLLECTION), appointmentWithTimestamp);
    return {
      id: docRef.id,
      ...appointmentData
    };
  } catch (error) {
    console.error('Error creating appointment:', error);
    throw error;
  }
};

// Get all appointments for a specific user
export const getUserAppointments = async (userEmail) => {
  try {
    const q = query(
      collection(db, APPOINTMENTS_COLLECTION),
      where('patientEmail', '==', userEmail)
    );
    
    const querySnapshot = await getDocs(q);
    const appointments = [];
    
    querySnapshot.forEach((doc) => {
      appointments.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Sort in memory instead of using orderBy
    appointments.sort((a, b) => {
      const aDate = new Date(a.date + 'T' + (a.time || '00:00'));
      const bDate = new Date(b.date + 'T' + (b.time || '00:00'));
      return aDate - bDate;
    });
    
    return appointments;
  } catch (error) {
    console.error('Error fetching user appointments:', error);
    throw error;
  }
};

// Update an appointment
export const updateAppointment = async (appointmentId, updates) => {
  try {
    const appointmentRef = doc(db, APPOINTMENTS_COLLECTION, appointmentId);
    await updateDoc(appointmentRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    return { id: appointmentId, ...updates };
  } catch (error) {
    console.error('Error updating appointment:', error);
    throw error;
  }
};

// Delete an appointment
export const deleteAppointment = async (appointmentId) => {
  try {
    const appointmentRef = doc(db, APPOINTMENTS_COLLECTION, appointmentId);
    await deleteDoc(appointmentRef);
    return appointmentId;
  } catch (error) {
    console.error('Error deleting appointment:', error);
    throw error;
  }
};

// Get all appointments (for admin purposes)
export const getAllAppointments = async () => {
  try {
    const q = query(collection(db, APPOINTMENTS_COLLECTION));
    
    const querySnapshot = await getDocs(q);
    const appointments = [];
    
    querySnapshot.forEach((doc) => {
      appointments.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Sort in memory instead of using orderBy
    appointments.sort((a, b) => {
      const aTime = a.createdAt?.toDate?.() || a.createdAt || new Date(0);
      const bTime = b.createdAt?.toDate?.() || b.createdAt || new Date(0);
      return bTime - aTime;
    });
    
    return appointments;
  } catch (error) {
    console.error('Error fetching all appointments:', error);
    throw error;
  }
};

// Get appointments by status
export const getAppointmentsByStatus = async (userEmail, status) => {
  try {
    const q = query(
      collection(db, APPOINTMENTS_COLLECTION),
      where('patientEmail', '==', userEmail),
      where('status', '==', status)
    );
    
    const querySnapshot = await getDocs(q);
    const appointments = [];
    
    querySnapshot.forEach((doc) => {
      appointments.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Sort in memory instead of using orderBy
    appointments.sort((a, b) => {
      const aDate = new Date(a.date + 'T' + (a.time || '00:00'));
      const bDate = new Date(b.date + 'T' + (b.time || '00:00'));
      return aDate - bDate;
    });
    
    return appointments;
  } catch (error) {
    console.error('Error fetching appointments by status:', error);
    throw error;
  }
}; 