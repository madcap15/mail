// frontend/src/components/UserTable.js
// Компонент для отображения таблицы пользователей.

import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './UserTable.css';

const API_BASE_URL = 'http://localhost:8000'; // URL нашего FastAPI бэкенда

function UserTable({ users, deleteUser, editUser, fetchUsers }) { // Добавляем fetchUsers в пропсы
  const navigate = useNavigate();

  // Удаляем локальную функцию handleDelete, так как она теперь в App.js
  // Используем переданную функцию deleteUser

  // Функция для перехода к редактированию пользователя
  const handleEditClick = (user) => {
    editUser(user); // Передаем пользователя в App.js для установки состояния editingUser
    // navigate(`/users/edit/${user.email}`); // Навигация будет обработана в App.js
  };

  // Если users пуст, можно показать сообщение или заглушку
  if (!users || users.length === 0) {
    return (
      <div>
        <h2>User Management</h2>
        <p>No users found. <Link to="/users/add">Add a new user</Link>.</p>
      </div>
    );
  }

  return (
    <div>
      <h2>User Management</h2>
      <table>
        <thead>
          <tr>
            <th>Email</th> {/* Предполагаем, что email является уникальным идентификатором */}
            <th>Name</th> {/* Добавим поле Name, если оно есть в данных */}
            <th>Role</th> {/* Добавим поле Role, если оно есть в данных */}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.email}> {/* Используем email как ключ */}
              <td>{user.email}</td>
              <td>{user.name || 'N/A'}</td> {/* Отображаем Name, если есть */}
              <td>{user.role || 'N/A'}</td> {/* Отображаем Role, если есть */}
              <td>
                <button onClick={() => handleEditClick(user)}>Edit</button>
                <button onClick={() => deleteUser(user.email)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Link to="/users/add">Add New User</Link>
    </div>
  );
}

export default UserTable;