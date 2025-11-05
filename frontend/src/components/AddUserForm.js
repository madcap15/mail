import React, { useState } from 'react';
import './AddUserForm.css';

const initialFormState = { email: '', password: '' };

function AddUserForm({ addUser }) {
  const [user, setUser] = useState(initialFormState);
  const [error, setError] = useState(null);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setUser({ ...user, [name]: value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!user.email || !user.password) {
      setError('Email and password are required');
      return;
    }

    try {
      const response = await fetch('/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: user.email, password: user.password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add user');
      }

      // Assuming successful creation, re-fetch users in App.js
      addUser(); 
      setUser(initialFormState);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h2>Add New User</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
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
          Password:
          <input
            type="password"
            name="password"
            value={user.password}
            onChange={handleInputChange}
          />
        </label>
        <button type="submit">Add User</button>
      </form>
    </div>
  );
}

export default AddUserForm;
