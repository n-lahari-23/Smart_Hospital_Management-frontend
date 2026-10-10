import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { DoctorSearch } from './pages/DoctorSearch';
import { BookAppointmentModal } from './components/BookAppointmentModal';
import { PatientAppointments } from './pages/PatientAppointments';
import { PatientPrescriptions } from './pages/PatientPrescriptions';
import { PatientProfile } from './pages/PatientProfile';
import { DoctorDashboard } from './pages/DoctorDashboard';
import { AdminDashboard } from './pages/AdminDashboard';

export function App() {
  const [activePage, setActivePage] = useState('home');
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState(null);

  return (
    <AuthProvider>
      <div className="app-container">
        <Navbar activePage={activePage} setActivePage={setActivePage} />

        <main className="main-content">
          {activePage === 'home' && <Home setActivePage={setActivePage} />}
          {activePage === 'login' && <Login setActivePage={setActivePage} />}
          {activePage === 'register' && <Register setActivePage={setActivePage} />}
          {activePage === 'doctors' && (
            <DoctorSearch
              setActivePage={setActivePage}
              onSelectDoctor={doc => setSelectedDoctorForBooking(doc)}
            />
          )}
          {activePage === 'my-appointments' && <PatientAppointments />}
          {activePage === 'my-prescriptions' && <PatientPrescriptions />}
          {activePage === 'patient-profile' && <PatientProfile />}
          {activePage === 'doctor-dashboard' && <DoctorDashboard />}
          {activePage === 'admin-dashboard' && <AdminDashboard />}
        </main>

        <Footer />

        {selectedDoctorForBooking && (
          <BookAppointmentModal
            doctor={selectedDoctorForBooking}
            onClose={() => setSelectedDoctorForBooking(null)}
            onSuccess={() => {
              setSelectedDoctorForBooking(null);
              setActivePage('my-appointments');
            }}
          />
        )}
      </div>
    </AuthProvider>
  );
}
export default App;
