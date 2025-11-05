import React, { useState } from 'react';
import './AddUserForm.css';

const initialFormState = { name: '', email: '', role: '' };

function AddUserForm({ addUser }) {
  const [user, setUser] = useState(initialFormState);
  const [error, setError] = useState(null);

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
    addUser(user);
    setUser(initialFormState);
    setError(null);
  };

  return (
    <div>
      <h2>Add New User</h2>
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
        <button type="submit">Add User</button>
      </form>
    </div>
  );
}

export default AddUserForm;
