const BASE_URL = 'http://localhost:5000/api';

const getHeaders = () => {
  const token = localStorage.getItem('wi_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const handle = async (res) => {
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || data.errors?.[0]?.msg || 'Something went wrong');
  return data;
};

// ─── AUTH ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (name, email, password) =>
    fetch(`${BASE_URL}/auth/register`, { method:'POST', headers:getHeaders(), body:JSON.stringify({name,email,password}) }).then(handle),
  login: (email, password) =>
    fetch(`${BASE_URL}/auth/login`, { method:'POST', headers:getHeaders(), body:JSON.stringify({email,password}) }).then(handle),
  me: () =>
    fetch(`${BASE_URL}/auth/me`, { headers:getHeaders() }).then(handle),
};

// ─── PROJECTS ─────────────────────────────────────────────────────────────────
export const projectsAPI = {
  getAll: () =>
    fetch(`${BASE_URL}/projects`, { headers:getHeaders() }).then(handle),
  getById: (id) =>
    fetch(`${BASE_URL}/projects/${id}`, { headers:getHeaders() }).then(handle),
  create: (data) =>
    fetch(`${BASE_URL}/projects`, { method:'POST', headers:getHeaders(), body:JSON.stringify(data) }).then(handle),
  update: (id, data) =>
    fetch(`${BASE_URL}/projects/${id}`, { method:'PUT', headers:getHeaders(), body:JSON.stringify(data) }).then(handle),
  delete: (id) =>
    fetch(`${BASE_URL}/projects/${id}`, { method:'DELETE', headers:getHeaders() }).then(handle),
  getStats: () =>
    fetch(`${BASE_URL}/projects/stats/summary`, { headers:getHeaders() }).then(handle),
  invite: (id, email, role='editor') =>
    fetch(`${BASE_URL}/projects/${id}/invite`, { method:'POST', headers:getHeaders(), body:JSON.stringify({email,role}) }).then(handle),
  removeMember: (id, userId) =>
    fetch(`${BASE_URL}/projects/${id}/members/${userId}`, { method:'DELETE', headers:getHeaders() }).then(handle),
  getActivity: (id) =>
    fetch(`${BASE_URL}/projects/${id}/activity`, { headers:getHeaders() }).then(handle),
};

// ─── ISSUES ───────────────────────────────────────────────────────────────────
export const issuesAPI = {
  getAll: (params={}) =>
    fetch(`${BASE_URL}/issues?${new URLSearchParams(params)}`, { headers:getHeaders() }).then(handle),
  create: (data) =>
    fetch(`${BASE_URL}/issues`, { method:'POST', headers:getHeaders(), body:JSON.stringify(data) }).then(handle),
  update: (id, data) =>
    fetch(`${BASE_URL}/issues/${id}`, { method:'PUT', headers:getHeaders(), body:JSON.stringify(data) }).then(handle),
  delete: (id) =>
    fetch(`${BASE_URL}/issues/${id}`, { method:'DELETE', headers:getHeaders() }).then(handle),
};

// ─── FEEDBACK ─────────────────────────────────────────────────────────────────
export const feedbackAPI = {
  getAll: (params={}) =>
    fetch(`${BASE_URL}/feedback?${new URLSearchParams(params)}`, { headers:getHeaders() }).then(handle),
  create: (data) =>
    fetch(`${BASE_URL}/feedback`, { method:'POST', headers:getHeaders(), body:JSON.stringify(data) }).then(handle),
  reply: (id, text) =>
    fetch(`${BASE_URL}/feedback/${id}/reply`, { method:'POST', headers:getHeaders(), body:JSON.stringify({text}) }).then(handle),
  resolve: (id) =>
    fetch(`${BASE_URL}/feedback/${id}/resolve`, { method:'PUT', headers:getHeaders() }).then(handle),
  delete: (id) =>
    fetch(`${BASE_URL}/feedback/${id}`, { method:'DELETE', headers:getHeaders() }).then(handle),
};

// ─── AI ───────────────────────────────────────────────────────────────────────
export const aiAPI = {
  analyze: (projectId) =>
    fetch(`${BASE_URL}/ai/analyze`, { method:'POST', headers:getHeaders(), body:JSON.stringify({projectId}) }).then(handle),
  suggestFix: (issueTitle, issueDescription, severity) =>
    fetch(`${BASE_URL}/ai/suggest-fix`, { method:'POST', headers:getHeaders(), body:JSON.stringify({issueTitle,issueDescription,severity}) }).then(handle),
};