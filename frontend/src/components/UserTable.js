// frontend/src/components/UserTable.js
// Компонент для отображения таблицы пользователей.

import React from 'react';
import './UserTable.css';

function UserTable({ users, deleteUser, editUser, getAuthHeaders }) {

  const handleDeleteClick = async (email) => {
    if (window.confirm(`Are you sure you want to delete ${email}?`)) {
      try {
        const response = await fetch(`/users/${email}`, {
          method: 'DELETE',
          headers: getAuthHeaders(),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to delete user');
        }

        deleteUser(); // Re-fetch users in App.js
      } catch (error) {
        console.error('Error deleting user:', error);
        // Optionally, display an error message to the user
      }
    }
  };

  if (!users || users.length === 0) {
    return (
      <div>
        <h2>User Management</h2>
        <p>No users found.</p>
      </div>
    );
  }

  return (
    <div>
      <h2>User Management</h2>
      <table>
        <thead>
          <tr>
            <th>Email</th>
            <th>Name</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.email}</td>
              <td>{user.name}</td>
              <td>{user.role}</td>
              <td>
                <button onClick={() => editUser(user)}>Edit Password</button>
                <button onClick={() => handleDeleteClick(user.email)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default UserTable;