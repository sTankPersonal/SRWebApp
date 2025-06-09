import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Recipes.css';

const API_URL = process.env.REACT_APP_API_URL;

const RecipesHome = () => {
  const [recipes, setRecipes] = useState([]);
  const [search, setSearch] = useState('');
  const [ingredient, setIngredient] = useState('');
  const [category, setCategory] = useState('');
  const [ingredientsList, setIngredientsList] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

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

  // Fetch all ingredients and categories for dropdowns
  useEffect(() => {
    fetch(`${API_URL}/recipes/ingredients`)
      .then(res => res.json())
      .then(setIngredientsList);
    fetch(`${API_URL}/recipes/categories`)
      .then(res => res.json())
      .then(setCategoriesList);
  }, []);

  // Delete a recipe
  const handleDelete = (id) => {
    if (!window.confirm('Delete this recipe?')) return;
    fetch(`${API_URL}/recipes/recipies/${id}`, { method: 'DELETE' })
      .then(() => {
        setRecipes(recipes.filter(r => r.id !== id));
      });
  };

  // View full recipe
  const handleView = (id) => {
    fetch(`${API_URL}/recipes/recipies/${id}`)
      .then(res => res.json())
      .then(data => {
        setSelectedRecipe(data);
        setShowDetail(true);
      });
  };

  // Add category to recipe
  const handleAddCategory = (recipeId, categoryId) => {
    fetch(`${API_URL}/recipes/recipies/${recipeId}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category_id: categoryId })
    }).then(() => handleView(recipeId));
  };

  // Add ingredient to recipe
  const handleAddIngredient = (recipeId, ingredientId, quantityAmount, quantityId) => {
    fetch(`${API_URL}/recipes/recipies/${recipeId}/ingredients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ingredient_id: ingredientId, quantity_amount: quantityAmount, quantity_id: quantityId })
    }).then(() => handleView(recipeId));
  };

  // For ingredient adding UI
  const [newIngredientId, setNewIngredientId] = useState('');
  const [newQuantityAmount, setNewQuantityAmount] = useState('');
  const [quantitiesList, setQuantitiesList] = useState([]);
  const [newQuantityId, setNewQuantityId] = useState('');
  // For category adding UI
  const [newCategoryId, setNewCategoryId] = useState('');

  // Fetch quantities for ingredient adding
  useEffect(() => {
    fetch(`${API_URL}/recipes/quantities`)
      .then(res => res.json())
      .then(setQuantitiesList);
  }, []);

  return (
    <div className="recipes-container">
      <div className="recipes-header">
        <h1>Recipes</h1>
        <button onClick={() => navigate('/recipies/create')}>Create New Recipe</button>
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Search by title..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ marginRight: '1rem', padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc' }}
        />
        <select value={ingredient} onChange={e => setIngredient(e.target.value)} style={{ marginRight: '1rem' }}>
          <option value="">All Ingredients</option>
          {ingredientsList.map(ing => (
            <option key={ing.id} value={ing.id}>{ing.name}</option>
          ))}
        </select>
        <select value={category} onChange={e => setCategory(e.target.value)} style={{ marginRight: '1rem' }}>
          <option value="">All Categories</option>
          {categoriesList.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>
      {loading ? <p>Loading...</p> : (
        <>
          <ul className="recipes-list">
            {recipes.map(r => (
              <li key={r.id}>
                <span>{r.title}</span>
                <span>
                  <button onClick={() => handleView(r.id)}>View</button>
                  <button onClick={() => navigate(`/recipies/edit/${r.id}`)}>Edit</button>
                  <button onClick={() => handleDelete(r.id)}>Delete</button>
                </span>
              </li>
            ))}
          </ul>
          <div style={{ marginTop: '1rem' }}>
            <button disabled={page === 1} onClick={() => setPage(page - 1)}>Prev</button>
            <span> Page {page} </span>
            <button disabled={recipes.length < pageSize} onClick={() => setPage(page + 1)}>Next</button>
          </div>
        </>
      )}

      {/* Recipe Detail Modal */}
      {showDetail && selectedRecipe && (
        <div className="recipe-detail-modal" onClick={() => setShowDetail(false)}>
          <div className="recipe-detail-content" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowDetail(false)}>&times;</button>
            <h2>{selectedRecipe.title}</h2>
            <p><strong>Instructions:</strong> {selectedRecipe.instructions}</p>
            <h3>Ingredients</h3>
            <ul>
              {selectedRecipe.ingredients && selectedRecipe.ingredients.length > 0 ? (
                selectedRecipe.ingredients.map(ing => (
                  <li key={ing.id}>
                    {ing.quantity_amount} {ing.quantity} {ing.name}
                  </li>
                ))
              ) : (
                <li>No ingredients listed.</li>
              )}
            </ul>
            <form
              onSubmit={e => {
                e.preventDefault();
                if (newIngredientId && newQuantityAmount && newQuantityId) {
                  handleAddIngredient(selectedRecipe.id, newIngredientId, newQuantityAmount, newQuantityId);
                  setNewIngredientId('');
                  setNewQuantityAmount('');
                  setNewQuantityId('');
                }
              }}
              style={{ marginBottom: '1rem' }}
            >
              <select value={newIngredientId} onChange={e => setNewIngredientId(e.target.value)} required>
                <option value="">Add Ingredient</option>
                {ingredientsList.map(ing => (
                  <option key={ing.id} value={ing.id}>{ing.name}</option>
                ))}
              </select>
              <input
                type="number"
                min="0.01"
                step="0.01"
                placeholder="Amount"
                value={newQuantityAmount}
                onChange={e => setNewQuantityAmount(e.target.value)}
                style={{ width: 70, marginLeft: 8 }}
                required
              />
              <select value={newQuantityId} onChange={e => setNewQuantityId(e.target.value)} required>
                <option value="">Unit</option>
                {quantitiesList.map(q => (
                  <option key={q.id} value={q.id}>{q.name}</option>
                ))}
              </select>
              <button type="submit" style={{ marginLeft: 8 }}>Add</button>
            </form>
            <h3>Categories</h3>
            <ul>
              {selectedRecipe.categories && selectedRecipe.categories.length > 0 ? (
                selectedRecipe.categories.map(cat => (
                  <li key={cat.id}>{cat.name}</li>
                ))
              ) : (
                <li>No categories listed.</li>
              )}
            </ul>
            <form
              onSubmit={e => {
                e.preventDefault();
                if (newCategoryId) {
                  handleAddCategory(selectedRecipe.id, newCategoryId);
                  setNewCategoryId('');
                }
              }}
            >
              <select value={newCategoryId} onChange={e => setNewCategoryId(e.target.value)} required>
                <option value="">Add Category</option>
                {categoriesList.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <button type="submit" style={{ marginLeft: 8 }}>Add</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipesHome;