import React, { useState } from 'react';
import './AddUserForm.css'; // Reusing AddUserForm.css for now

const initialFormState = { domain_name: '' };

function AddDomainForm({ addDomain, getAuthHeaders }) {
  const [domain, setDomain] = useState(initialFormState);
  const [error, setError] = useState(null);

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
      const response = await fetch(`/domains`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ domain_name: domain.domain_name }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add domain');
      }

      addDomain();
      setDomain(initialFormState);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="form-container">
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
      </form>
    </div>
  );
}

export default AddDomainForm;