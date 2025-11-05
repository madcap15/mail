// frontend/App.js
// Основной компонент React-приложения.

import React, { useState, useEffect } from 'react';
import './App.css';
import UserTable from './components/UserTable';
import AddUserForm from './components/AddUserForm';
import EditUserForm from './components/EditUserForm';

function App() {
  const [users, setUsers] = useState([]);
  const [editing, setEditing] = useState(false);
  const initialFormState = { id: null, name: '', email: '', role: '' };
  const [currentUser, setCurrentUser] = useState(initialFormState);

  useEffect(() => {
    fetch('/users')
      .then(response => response.json())
      .then(data => {
        if (data.users) {
          setUsers(data.users.map((user, index) => ({ ...user, id: index + 1, name: user.email.split('@')[0], role: 'User' })));
        }
      })
      .catch(error => console.error('Error fetching users:', error));
  }, []);

  const addUser = (user) => {
    user.id = users.length + 1;
    setUsers([...users, user]);
  };

  const deleteUser = (id) => {
    setUsers(users.filter((user) => user.id !== id));
  };

  const editUser = (user) => {
    setEditing(true);
    setCurrentUser({ id: user.id, name: user.name, email: user.email, role: user.role });
  };

  const updateUser = (id, updatedUser) => {
    setEditing(false);
    setUsers(users.map((user) => (user.id === id ? updatedUser : user)));
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
