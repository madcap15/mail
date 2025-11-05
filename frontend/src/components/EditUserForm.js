// frontend/src/components/EditUserForm.js
// Компонент для редактирования пользователей.

import React, { useState, useEffect } from 'react';
import './AddUserForm.css';

function EditUserForm({ currentUser, updateUser, setEditing }) {
  const [user, setUser] = useState(currentUser);
  const [error, setError] = useState(null);

  useEffect(() => {
    setUser(currentUser);
  }, [currentUser]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setUser({ ...user, [name]: value });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!user.name || !user.email || !user.role) {
      setError('All fields are required');
      return;
    }
    updateUser(user.id, user);
    setError(null);
  };

  return (
    <div>
      <h2>Edit User</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <label>
          Name:
          <input
            type="text"
            name="name"
            value={user.name}
            onChange={handleInputChange}
          />
        </label>
        <label>
          Email:
          <input
            type="email"
            name="email"
            value={user.email}
            onChange={handleInputChange}
          />
        </label>
        <label>
          Role:
          <input
            type="text"
            name="role"
            value={user.role}
            onChange={handleInputChange}
          />
        </label>
        <button type="submit">Update User</button>
        <button onClick={() => setEditing(false)}>Cancel</button>
      </form>
    </div>
  );
}

export default EditUserForm;
