import React from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import './UserTable.css'; // Reusing UserTable.css for now

const API_BASE_URL = 'http://localhost:8000'; // URL нашего FastAPI бэкенда

function DomainTable({ domains, deleteDomain, fetchDomains }) { // Added fetchDomains prop
  const navigate = useNavigate();

  // If domains is empty, show a message
  if (!domains || domains.length === 0) {
    return (
      <div>
        <h2>Domain Management</h2>
        <p>No domains found. <button onClick={() => navigate('/domains/add')}>Add a new domain</button>.</p>
      </div>
    );
  }

  return (
    <div>
      <h2>Domain Management</h2>
      <table>
        <thead>
          <tr>
            <th>Domain Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {domains.map((domain) => (
            <tr key={domain.name}> {/* Use domain name as key */}
              <td>{domain.name}</td>
              <td>
                <button onClick={() => deleteDomain(domain.name)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={() => navigate('/domains/add')}>Add New Domain</button>
    </div>
  );
}

export default DomainTable;