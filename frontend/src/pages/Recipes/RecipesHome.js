import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL;

const RecipesHome = () => {
  const [recipes, setRecipes] = useState([]);
  const [search, setSearch] = useState('');
  const [ingredient, setIngredient] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Fetch recipes with filters
  useEffect(() => {
    setLoading(true);
    let url = `${API_URL}/recipes/recipies?page=${page}&pageSize=${pageSize}`;
    if (ingredient) url += `&ingredient_id=${ingredient}`;
    if (category) url += `&category_id=${category}`;
    if (search) url = `${API_URL}/recipes/recipies/search/${encodeURIComponent(search)}`;
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setRecipes(data.recipes || data);
        setTotal(data.total || 0);
        setLoading(false);
      });
  }, [page, pageSize, ingredient, category, search]);

  // Delete a recipe
  const handleDelete = (id) => {
    if (!window.confirm('Delete this recipe?')) return;
    fetch(`${API_URL}/recipes/recipies/${id}`, { method: 'DELETE' })
      .then(() => {
        setRecipes(recipes.filter(r => r.id !== id));
      });
  };

  return (
    <div style={{ maxWidth: 800, margin: '2rem auto', fontFamily: 'sans-serif' }}>
      <h1>Recipes</h1>
      <div style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Search by title..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ marginRight: '1rem' }}
        />
        {/* Add dropdowns for ingredient and category here */}
        <button onClick={() => navigate('/recipies/create')}>Create New Recipe</button>
      </div>
      {loading ? <p>Loading...</p> : (
        <>
          <ul>
            {recipes.map(r => (
              <li key={r.id}>
                {r.title}
                <button onClick={() => navigate(`/recipies/edit/${r.id}`)}>Edit</button>
                <button onClick={() => handleDelete(r.id)}>Delete</button>
              </li>
            ))}
          </ul>
          <div>
            <button disabled={page === 1} onClick={() => setPage(page - 1)}>Prev</button>
            <span> Page {page} </span>
            <button disabled={recipes.length < pageSize} onClick={() => setPage(page + 1)}>Next</button>
          </div>
        </>
      )}
    </div>
  );
};

export default RecipesHome;