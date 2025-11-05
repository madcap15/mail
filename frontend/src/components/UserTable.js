// frontend/src/components/UserTable.js
// Компонент для отображения таблицы пользователей.

import React from 'react';
import './UserTable.css';

function UserTable({ users, deleteUser, editUser }) {
  const handleDelete = async (email) => {
    try {
      const response = await fetch(`/users/${email}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete user');
      }

      deleteUser(); // Trigger re-fetch in App.js
    } catch (error) {
      console.error('Error deleting user:', error);
      // Optionally, display an error message to the user
    }
  };

  return (
    <div>
      <h2>User Management</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>
                <button onClick={() => editUser(user)}>Edit</button>
                <button onClick={() => handleDelete(user.email)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default UserTable;
