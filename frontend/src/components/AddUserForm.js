import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import './AddUserForm.css';

const initialFormState = { email: '', password: '' };

function AddUserForm({ fetchUsers }) { // Changed prop name from addUser to fetchUsers
  const [user, setUser] = useState(initialFormState);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Initialize useNavigate

  const API_BASE_URL = 'http://localhost:8000'; // URL нашего FastAPI бэкенда

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
      const response = await fetch(`${API_BASE_URL}/users`, { // Use API_BASE_URL
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
      fetchUsers(); 
      setUser(initialFormState);
      setError(null);
      navigate('/users'); // Redirect to user list after successful addition
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
            required
          />
        </label>
        <label>
          Password:
          <input
            type="password"
            name="password"
            value={user.password}
            onChange={handleInputChange}
            required
          />
        </label>
        <button type="submit">Add User</button>
      </form>
      <button onClick={() => navigate('/users')}>Cancel</button>
    </div>
  );
}

export default AddUserForm;