// frontend/src/components/EditUserForm.js
// Компонент для редактирования пользователей.

import React, { useState, useEffect } from 'react';
import './AddUserForm.css';

function EditUserForm({ currentUser, updateUser, setEditing, getAuthHeaders }) {
  const [user, setUser] = useState(currentUser);
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    setUser(currentUser);
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
    if (!user.email) {
      setError('User email is required for update');
      return;
    }

    try {
      const response = await fetch(`/users/${user.email}/password`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ new_password: newPassword }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update password');
      }

      updateUser();
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="form-container">
      <h2>Edit User Password</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <label>
          Email:
          <input
            type="email"
            name="email"
            value={user.email}
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
            required
          />
        </label>
        <button type="submit">Update Password</button>
        <button type="button" onClick={() => setEditing(false)}>Cancel</button>
      </form>
    </div>
  );
}

export default EditUserForm;