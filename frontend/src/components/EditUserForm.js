// frontend/src/components/EditUserForm.js
// Компонент для редактирования пользователей.

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import './AddUserForm.css';

function EditUserForm({ editingUser, fetchUsers }) { // Changed prop names
  const [user, setUser] = useState(editingUser || { email: '', name: '', role: '' }); // Initialize with editingUser or default
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const API_BASE_URL = 'http://localhost:8000'; // URL нашего FastAPI бэкенда

  useEffect(() => {
    // If editingUser is not available (e.g., direct access to edit page without selecting from list),
    // try to get user details from URL or redirect.
    // For now, we assume editingUser is passed correctly.
    if (editingUser) {
      setUser(editingUser);
      setNewPassword(''); // Clear password field on user change
    } else {
      // Handle case where editingUser is null/undefined, maybe redirect to user list
      // Or try to fetch user by email from URL if that's a planned feature
      console.warn('Editing user data not provided. Redirecting to user list.');
      navigate('/users');
    }
  }, [editingUser, navigate]);

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
      const response = await fetch(`${API_BASE_URL}/users/${user.email}/password`, { // Use API_BASE_URL and user.email
        method: 'POST', // Changed to POST as per backend implementation for password update
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: newPassword }), // Backend expects 'password', not 'new_password'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update password');
      }

      fetchUsers(); // Trigger re-fetch in App.js
      navigate('/users'); // Redirect to user list after successful update
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCancel = () => {
    navigate('/users'); // Redirect to user list on cancel
  };

  // Render loading or error state if user data is not yet available
  if (!editingUser) {
    return <div>Loading user data or user not found...</div>; // Or redirect immediately
  }

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
        {/* Optionally display other user fields if needed, e.g., name, role */}
        <label>
          Name:
          <input
            type="text"
            name="name"
            value={user.name || ''}
            onChange={handleInputChange}
            readOnly // Assuming name/role are not editable via this form for now
          />
        </label>
        <label>
          Role:
          <input
            type="text"
            name="role"
            value={user.role || ''}
            onChange={handleInputChange}
            readOnly // Assuming name/role are not editable via this form for now
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
        <button type="button" onClick={handleCancel}>Cancel</button>
      </form>
    </div>
  );
}

export default EditUserForm;