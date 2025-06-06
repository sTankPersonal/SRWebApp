import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL;

const RecipeEdit = () => {
  const { id } = useParams();
  const [title, setTitle] = useState('');
  const [instructions, setInstructions] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_URL}/recipes/recipies/${id}`)
      .then(res => res.json())
      .then(data => {
        setTitle(data.title || '');
        setInstructions(data.instructions || '');
      });
  }, [id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch(`${API_URL}/recipes/recipies/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, instructions })
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to update recipe');
        return res.json();
      })
      .then(() => navigate('/recipies/home'))
      .catch(err => setError(err.message));
  };

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto' }}>
      <h2>Edit Recipe</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Title: <input value={title} onChange={e => setTitle(e.target.value)} required /></label>
        </div>
        <div>
          <label>Instructions: <textarea value={instructions} onChange={e => setInstructions(e.target.value)} required /></label>
        </div>
        <button type="submit">Save</button>
        <button type="button" onClick={() => navigate('/recipies/home')}>Cancel</button>
      </form>
    </div>
  );
};

export default RecipeEdit;