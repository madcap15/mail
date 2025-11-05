import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import './AddUserForm.css'; // Reusing AddUserForm.css for now

const initialFormState = { domain_name: '' };

function AddDomainForm({ fetchDomains }) { // Changed prop name from addDomain to fetchDomains
  const [domain, setDomain] = useState(initialFormState);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const API_BASE_URL = 'http://localhost:8000'; // URL нашего FastAPI бэкенда

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setDomain({ ...domain, [name]: value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!domain.domain_name) {
      setError('Domain name is required');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/domains`, { // Use API_BASE_URL
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: domain.domain_name }), // Backend expects 'name' for domain
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add domain');
      }

      fetchDomains(); // Trigger re-fetch in App.js
      setDomain(initialFormState);
      setError(null);
      navigate('/domains'); // Redirect to domain list after successful addition
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCancel = () => {
    navigate('/domains'); // Redirect to domain list on cancel
  };

  return (
    <div>
      <h2>Add New Domain</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <label>
          Domain Name:
          <input
            type="text"
            name="domain_name"
            value={domain.domain_name}
            onChange={handleInputChange}
            required
          />
        </label>
        <button type="submit">Add Domain</button>
        <button type="button" onClick={handleCancel}>Cancel</button>
      </form>
    </div>
  );
}

export default AddDomainForm;