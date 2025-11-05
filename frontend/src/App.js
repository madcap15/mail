// frontend/App.js
// Основной компонент React-приложения.

import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import UserTable from './components/UserTable';
import AddUserForm from './components/AddUserForm';
import EditUserForm from './components/EditUserForm';

function App() {
  const [users, setUsers] = useState([]);
  const [editing, setEditing] = useState(false);
  const initialFormState = { id: null, name: '', email: '', role: '' };
  const [currentUser, setCurrentUser] = useState(initialFormState);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch('/users');
      const data = await response.json();
      if (data.users) {
        setUsers(data.users.map((user, index) => ({ ...user, id: index + 1, name: user.email.split('@')[0], role: 'User' })));
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const addUser = () => {
    fetchUsers(); // Re-fetch users after adding a new one
  };

  const deleteUser = () => {
    fetchUsers(); // Re-fetch users after deleting one
  };

  const editUser = (user) => {
    setEditing(true);
    setCurrentUser({ id: user.id, name: user.name, email: user.email, role: user.role });
  };

  const updateUser = () => {
    fetchUsers(); // Re-fetch users after updating one
    setEditing(false);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Admin Panel</h1>
        <p>Welcome to the mail service administration panel.</p>
      </header>
      <main>
        <div>
          {editing ? (
            <EditUserForm
              setEditing={setEditing}
              currentUser={currentUser}
              updateUser={updateUser}
            />
          ) : (
            <AddUserForm addUser={addUser} />
          )}
        </div>
        <UserTable users={users} deleteUser={deleteUser} editUser={editUser} />
      </main>
    </div>
  );
}

export default App;
