import React from 'react';
import './UserTable.css'; // Reusing UserTable.css for now

function DomainTable({ domains, deleteDomain }) {

  // If domains is empty, show a message
  if (!domains || domains.length === 0) {
    return (
      <div>
        <h2>Domain Management</h2>
        <p>No domains found.</p>
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
            <tr key={domain.name}>
              <td>{domain.name}</td>
              <td>
                <button onClick={() => deleteDomain(domain.name)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DomainTable;