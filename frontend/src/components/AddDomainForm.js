import React, { useState } from 'react';
import './AddUserForm.css'; // Reusing AddUserForm.css for now

const initialFormState = { domain_name: '' };

function AddDomainForm({ addDomain }) {
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
      const response = await fetch('/domains', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ domain_name: domain.domain_name }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add domain');
      }

      addDomain(); // Trigger re-fetch in App.js
      setDomain(initialFormState);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
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
          />
        </label>
        <button type="submit">Add Domain</button>
      </form>
    </div>
  );
}

export default AddDomainForm;
