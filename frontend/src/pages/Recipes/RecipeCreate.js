import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Recipes.css';

const API_URL = process.env.REACT_APP_API_URL;

const RecipeCreate = () => {
  const [title, setTitle] = useState('');
  const [instructions, setInstructions] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch(`${API_URL}/recipes/recipies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, instructions })
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to create recipe');
        return res.json();
      })
      .then(() => navigate('/recipies/home'))
      .catch(err => setError(err.message));
  };

  return (
    <div className="recipes-container">
      <h2>Create Recipe</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label>
            Title:
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              style={{ marginLeft: 8, padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc' }}
            />
          </label>
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>
            Instructions:
            <textarea
              value={instructions}
              onChange={e => setInstructions(e.target.value)}
              required
              style={{ marginLeft: 8, padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc', width: '100%', minHeight: 80 }}
            />
          </label>
        </div>
        <button type="submit">Create</button>
        <button type="button" style={{ marginLeft: 8 }} onClick={() => navigate('/recipies/home')}>Cancel</button>
      </form>
    </div>
  );
};

export default RecipeCreate;