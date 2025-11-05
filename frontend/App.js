// frontend/App.js
// Основной компонент React-приложения с маршрутизацией и управлением состоянием пользователей и доменов.

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from 'react-router-dom';
import UserTable from './src/components/UserTable';
import AddUserForm from './src/components/AddUserForm';
import EditUserForm from './src/components/EditUserForm';
import DomainTable from './src/components/DomainTable';
import AddDomainForm from './src/components/AddDomainForm';
import './App.css'; // Предполагается, что App.css существует и содержит базовые стили

const API_BASE_URL = 'http://localhost:8000'; // URL нашего FastAPI бэкенда

function App() {
  const [users, setUsers] = useState([]);
  const [domains, setDomains] = useState([]); // State for domains
  const [editingUser, setEditingUser] = useState(null);
  const navigate = useNavigate();

  // --- User Management Functions ---
  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users`);
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const deleteUser = async (email) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${email}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete user');
      }
      fetchUsers(); // Refresh list
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    navigate(`/users/edit/${user.email}`);
  };

  // --- Domain Management Functions ---
  const fetchDomains = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/domains`);
      if (!response.ok) {
        throw new Error('Failed to fetch domains');
      }
      const data = await response.json();
      // Assuming backend returns { domains: [...] }
      setDomains(data.domains || []);
    } catch (error) {
      console.error('Error fetching domains:', error);
    }
  };

  const deleteDomain = async (domainName) => {
    try {
      const response = await fetch(`${API_BASE_URL}/domains/${domainName}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete domain');
      }
      fetchDomains(); // Refresh list
    } catch (error) {
      console.error('Error deleting domain:', error);
    }
  };

  // --- Initial Data Fetching ---
  useEffect(() => {
    fetchUsers();
    fetchDomains(); // Fetch domains on mount
  }, []);

  return (
    <Router>
      <div className="App">
        <nav>
          <ul>
            <li><Link to="/users">Users</Link></li>
            <li><Link to="/users/add">Add User</Link></li>
            <li><Link to="/domains">Domains</Link></li>
            <li><Link to="/domains/add">Add Domain</Link></li>
          </ul>
        </nav>
        <hr />
        <Routes>
          {/* User Routes */}
          <Route path="/users" element={<UserTable users={users} deleteUser={deleteUser} editUser={handleEditUser} />} />
          <Route path="/users/add" element={<AddUserForm fetchUsers={fetchUsers} />} />
          <Route path="/users/edit/:email" element={<EditUserForm editingUser={editingUser} fetchUsers={fetchUsers} />} />

          {/* Domain Routes */}
          <Route path="/domains" element={<DomainTable domains={domains} deleteDomain={deleteDomain} />} />
          <Route path="/domains/add" element={<AddDomainForm fetchDomains={fetchDomains} />} /> {/* Pass fetchDomains to AddDomainForm */}

          {/* Root Route */}
          <Route path="/" element={
            <div>
              <h1>Admin Panel</h1>
              <p>Welcome to the mail service administration panel.</p>
              <p>Please select an option from the navigation above.</p>
            </div>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;