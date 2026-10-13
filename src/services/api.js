// Production-ready API Service with automatic URL normalization
const normalizeBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  let url = (typeof envUrl === 'string' && envUrl.trim())
    ? envUrl.trim()
    : 'https://smart-hospital-backend-odf9.onrender.com/api';

  // Strip trailing slashes
  url = url.replace(/\/+$/, '');

  // Upgrade http to https for remote domains to avoid mixed-content browser blocking
  if (!url.includes('localhost') && !url.includes('127.0.0.1') && url.startsWith('http://')) {
    url = url.replace(/^http:\/\//, 'https://');
  }

  // Ensure /api suffix is present (prevents /doctors instead of /api/doctors)
  if (!url.endsWith('/api')) {
    url = `${url}/api`;
  }

  return url;
};

const BASE_URL = normalizeBaseUrl();

function getHeaders() {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function handleResponse(response) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: `HTTP Error ${response.status}` }));
    const errorMessage = errorData.message || errorData.error || `HTTP Error ${response.status}`;
    throw new Error(errorMessage);
  }
  if (response.status === 204) return null;
  return response.json();
}

export const api = {
  // Auth
  login: async (email, password) => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return handleResponse(res);
  },

  register: async (data) => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  getProfile: async () => {
    const res = await fetch(`${BASE_URL}/auth/me`, { headers: getHeaders() });
    return handleResponse(res);
  },

  // Departments
  getDepartments: async () => {
    const res = await fetch(`${BASE_URL}/departments`);
    return handleResponse(res);
  },

  createDepartment: async (dept) => {
    const res = await fetch(`${BASE_URL}/departments`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(dept)
    });
    return handleResponse(res);
  },

  deleteDepartment: async (id) => {
    const res = await fetch(`${BASE_URL}/departments/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return res.ok;
  },

  // Doctors
  getDoctors: async (departmentId = null) => {
    const url = (departmentId !== null && departmentId !== undefined && departmentId !== '')
      ? `${BASE_URL}/doctors?departmentId=${encodeURIComponent(departmentId)}`
      : `${BASE_URL}/doctors`;
    const res = await fetch(url);
    return handleResponse(res);
  },

  getDoctorById: async (id) => {
    const res = await fetch(`${BASE_URL}/doctors/${id}`);
    return handleResponse(res);
  },

  getDoctorAppointments: async (date = null) => {
    const url = (date !== null && date !== undefined && date !== '')
      ? `${BASE_URL}/doctors/my-appointments?date=${encodeURIComponent(date)}`
      : `${BASE_URL}/doctors/my-appointments`;
    const res = await fetch(url, { headers: getHeaders() });
    return handleResponse(res);
  },

  // Patients
  getPatientProfile: async () => {
    const res = await fetch(`${BASE_URL}/patients/profile`, { headers: getHeaders() });
    return handleResponse(res);
  },

  updatePatientProfile: async (data) => {
    const res = await fetch(`${BASE_URL}/patients/profile`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  getMyAppointments: async () => {
    const res = await fetch(`${BASE_URL}/patients/my-appointments`, { headers: getHeaders() });
    return handleResponse(res);
  },

  getMyPrescriptions: async () => {
    const res = await fetch(`${BASE_URL}/patients/my-prescriptions`, { headers: getHeaders() });
    return handleResponse(res);
  },

  // Appointments
  bookAppointment: async (data) => {
    const res = await fetch(`${BASE_URL}/appointments/book`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  updateAppointmentStatus: async (id, status) => {
    const res = await fetch(`${BASE_URL}/appointments/${id}/status`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status })
    });
    return handleResponse(res);
  },

  getAllAppointments: async () => {
    const res = await fetch(`${BASE_URL}/appointments`, { headers: getHeaders() });
    return handleResponse(res);
  },

  // Prescriptions
  createPrescription: async (data) => {
    const res = await fetch(`${BASE_URL}/prescriptions`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  getPrescriptionByAppointmentId: async (appointmentId) => {
    const res = await fetch(`${BASE_URL}/prescriptions/appointment/${appointmentId}`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  // Admin
  getAdminStats: async () => {
    const res = await fetch(`${BASE_URL}/admin/stats`, { headers: getHeaders() });
    return handleResponse(res);
  },

  getAllPatients: async () => {
    const res = await fetch(`${BASE_URL}/admin/patients`, { headers: getHeaders() });
    return handleResponse(res);
  }
};