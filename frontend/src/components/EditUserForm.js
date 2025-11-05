// frontend/src/components/EditUserForm.js
// Компонент для редактирования пользователей.

import React, { useState, useEffect } from 'react';
import './AddUserForm.css';

function EditUserForm({ currentUser, updateUser, setEditing }) {
  const [user, setUser] = useState(currentUser);
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    setUser(currentUser);
    setNewPassword(''); // Clear password field on user change
  }, [currentUser]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    if (name === "newPassword") {
      setNewPassword(value);
    } else {
      setUser({ ...user, [name]: value });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!newPassword) {
      setError('New password is required');
      return;
    }

    try {
      const response = await fetch(`/users/${user.email}/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ new_password: newPassword }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update password');
      }

      updateUser(); // Trigger re-fetch in App.js
      setEditing(false);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h2>Edit User</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <label>
          Email:
          <input
            type="email"
            name="email"
            value={user.email}
            onChange={handleInputChange}
            readOnly
          />
        </label>
        <label>
          New Password:
          <input
            type="password"
            name="newPassword"
            value={newPassword}
            onChange={handleInputChange}
          />
        </label>
        <button type="submit">Update Password</button>
        <button onClick={() => setEditing(false)}>Cancel</button>
      </form>
    </div>
  );
}

export default EditUserForm;
