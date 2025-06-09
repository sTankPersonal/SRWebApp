import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Recipes.css';

const API_URL = process.env.REACT_APP_API_URL;

const RecipeEdit = () => {
  const { id } = useParams();
  const [title, setTitle] = useState('');
  const [instructions, setInstructions] = useState('');
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
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

  const handleDelete = () => {
    fetch(`${API_URL}/recipes/recipies/${id}`, { method: 'DELETE' })
      .then(() => navigate('/recipies/home'));
  };

  return (
    <div className="recipes-container">
      <h2>Edit Recipe</h2>
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
        <button type="submit">Save</button>
        <button type="button" style={{ marginLeft: 8 }} onClick={() => navigate('/recipies/home')}>Cancel</button>
        <button
          type="button"
          style={{ marginLeft: 8, background: '#e57373', color: '#fff', border: 'none' }}
          onClick={() => setShowDeleteModal(true)}
        >
          Delete
        </button>
      </form>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="recipe-detail-modal" onClick={() => setShowDeleteModal(false)}>
          <div className="recipe-detail-content" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowDeleteModal(false)}>&times;</button>
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete this recipe?</p>
            <button
              style={{ background: '#e57373', color: '#fff', border: 'none', marginRight: 8 }}
              onClick={handleDelete}
            >
              Yes, Delete
            </button>
            <button onClick={() => setShowDeleteModal(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipeEdit;