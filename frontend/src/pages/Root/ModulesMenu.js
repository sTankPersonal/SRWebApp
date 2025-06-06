import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL;

const ModulesMenu = () => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_URL}/modules`)
      .then(res => res.json())
      .then(data => {
        setModules(data.modules || []);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading modules...</p>;

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', textAlign: 'center' }}>
      <h1>Available Modules</h1>
      {modules.map(mod => (
        <button
          key={mod.name}
          style={{ margin: '1rem', padding: '1rem 2rem', fontSize: '1.2rem', cursor: 'pointer' }}
          onClick={() => navigate(`/${mod.name}/home`)}
        >
          {mod.name.charAt(0).toUpperCase() + mod.name.slice(1)}
        </button>
      ))}
    </div>
  );
};

export default ModulesMenu;