import React from 'react';
import './UserTable.css'; // Reusing UserTable.css for now

function DomainTable({ domains, deleteDomain }) {
  return (
    <div>
      <h2>Domain Management</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Domain Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {domains.map((domain, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
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
