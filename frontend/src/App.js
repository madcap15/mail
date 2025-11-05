// frontend/App.js
// Основной компонент React-приложения.

import React, { useState } from 'react';
import './App.css';
import UserTable from './components/UserTable';
import AddUserForm from './components/AddUserForm';
import EditUserForm from './components/EditUserForm';

const initialUsers = [
  { id: 1, name: 'John Doe', email: 'john.doe@example.com', role: 'Admin' },
  { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com', role: 'User' },
  { id: 3, name: 'Peter Jones', email: 'peter.jones@example.com', role: 'User' },
];

function App() {
  const [users, setUsers] = useState(initialUsers);
  const [editing, setEditing] = useState(false);
  const initialFormState = { id: null, name: '', email: '', role: '' };
  const [currentUser, setCurrentUser] = useState(initialFormState);

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
