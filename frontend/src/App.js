import React, { useEffect, useState } from 'react';

const API_URL = process.env.REACT_APP_API_URL;

function App() {
  const [recipes, setRecipes] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch all recipes
  useEffect(() => {
    setLoading(true);
    fetch(`${API_URL}/recipes/recipies`)
      .then(res => res.json())
      .then(data => {
        setRecipes(data.recipes || []);
        setLoading(false);
      });
  }, []);

  // Fetch details for a selected recipe
  const handleSelect = (id) => {
    setLoading(true);
    fetch(`${API_URL}/recipes/recipies/${id}`)
      .then(res => res.json())
      .then(data => {
        setSelected(data);
        setLoading(false);
      });
  };

  return (
    <div style={{ maxWidth: 800, margin: '2rem auto', fontFamily: 'sans-serif' }}>
      <h1>Recipes</h1>
      {loading && <p>Loading...</p>}
      <ul>
        {recipes.map(r => (
          <li key={r.id}>
            <button style={{ background: 'none', border: 'none', color: 'blue', cursor: 'pointer', textDecoration: 'underline' }}
              onClick={() => handleSelect(r.id)}>
              {r.title}
            </button>
          </li>
        ))}
      </ul>
      {selected && (
        <div style={{ marginTop: '2rem', border: '1px solid #ccc', padding: '1rem' }}>
          <h2>{selected.title}</h2>
          <p><strong>Instructions:</strong> {selected.instructions}</p>
          <h3>Ingredients</h3>
          <ul>
            {selected.ingredients && selected.ingredients.length > 0 ? (
              selected.ingredients.map(ing => (
                <li key={ing.id}>
                  {ing.quantity_amount} {ing.quantity} {ing.name}
                </li>
              ))
            ) : (
              <li>No ingredients listed.</li>
            )}
          </ul>
          <h3>Categories</h3>
          <ul>
            {selected.categories && selected.categories.length > 0 ? (
              selected.categories.map(cat => (
                <li key={cat.id}>{cat.name}</li>
              ))
            ) : (
              <li>No categories listed.</li>
            )}
          </ul>
          <button onClick={() => setSelected(null)} style={{ marginTop: '1rem' }}>Back to list</button>
        </div>
      )}
    </div>
  );
}

export default App;