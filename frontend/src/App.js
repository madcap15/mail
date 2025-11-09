// frontend/App.js
// Основной компонент React-приложения.

import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import UserTable from './components/UserTable';
import AddUserForm from './components/AddUserForm';
import EditUserForm from './components/EditUserForm';
import DomainTable from './components/DomainTable';
import AddDomainForm from './components/AddDomainForm';
import Login from './components/Login';

function App() {
  const [users, setUsers] = useState([]);
  const [domains, setDomains] = useState([]);
  const [editing, setEditing] = useState(false);
  const [currentView, setCurrentView] = useState('users'); // 'users' or 'domains'
  const initialFormState = { id: null, name: '', email: '', role: '' };
  const [currentUser, setCurrentUser] = useState(initialFormState);
  const [token, setToken] = useState(localStorage.getItem('token'));

  const getAuthHeaders = useCallback(() => {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  }, [token]);

  const fetchUsers = useCallback(async () => {
    if (!token) return;
    try {
      const response = await fetch('/users', { headers: getAuthHeaders() });
      if (response.status === 401) {
        setToken(null);
        localStorage.removeItem('token');
        return;
      }
      const data = await response.json();
      if (data.users) {
        setUsers(
          data.users.map((user, index) => ({
            ...user,
            id: index + 1,
            name: user.email.split('@')[0],
            role: 'User',
          }))
        );
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }, [token, getAuthHeaders]);

  const fetchDomains = useCallback(async () => {
    if (!token) return;
    try {
      const response = await fetch('/domains', { headers: getAuthHeaders() });
       if (response.status === 401) {
        setToken(null);
        localStorage.removeItem('token');
        return;
      }
      const data = await response.json();
      if (data.domains) {
        setDomains(data.domains);
      }
    } catch (error) {
      console.error('Error fetching domains:', error);
    }
  }, [token, getAuthHeaders]);

  useEffect(() => {
    if (token) {
      fetchUsers();
      fetchDomains();
    }
  }, [token, fetchUsers, fetchDomains]);

  const addUser = () => {
    fetchUsers(); // Re-fetch users after adding a new one
  };

  const deleteUser = () => {
    fetchUsers(); // Re-fetch users after deleting one
  };

  const editUser = (user) => {
    setEditing(true);
    setCurrentUser({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  };

  const updateUser = () => {
    fetchUsers(); // Re-fetch users after updating one
    setEditing(false);
  };

  const addDomain = () => {
    fetchDomains(); // Re-fetch domains after adding a new one
  };

  const deleteDomain = async (domainName) => {
    try {
      const response = await fetch(`/domains/${domainName}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete domain');
      }

      fetchDomains(); // Re-fetch domains after deleting one
    } catch (error) {
      console.error('Error deleting domain:', error);
    }
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('token');
  };

  if (!token) {
    return <Login setToken={setToken} />;
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Admin Panel</h1>
        <p>Welcome to the mail service administration panel.</p>
        <nav>
          <button onClick={() => setCurrentView('users')}>User Management</button>
          <button onClick={() => setCurrentView('domains')}>Domain Management</button>
          <button onClick={handleLogout} className="logout-button">Logout</button>
        </nav>
      </header>
      <main>
        {currentView === 'users' ? (
          <>
            <div>
              {editing ? (
                <EditUserForm
                  setEditing={setEditing}
                  currentUser={currentUser}
                  updateUser={updateUser}
                  getAuthHeaders={getAuthHeaders}
                />
              ) : (
                <AddUserForm addUser={addUser} getAuthHeaders={getAuthHeaders} />
              )}
            </div>
            <UserTable users={users} deleteUser={deleteUser} editUser={editUser} getAuthHeaders={getAuthHeaders} />
          </>
        ) : (
          <>
            <AddDomainForm addDomain={addDomain} getAuthHeaders={getAuthHeaders} />
            <DomainTable domains={domains} deleteDomain={deleteDomain} />
          </>
        )}
      </main>
    </div>
  );
}

export default App;
