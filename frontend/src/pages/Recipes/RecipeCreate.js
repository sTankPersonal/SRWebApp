import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Recipes.css';

const API_URL = process.env.REACT_APP_API_URL;

const fetchList = (endpoint, setter) => {
  fetch(`${API_URL}/recipes/${endpoint}`)
    .then(res => res.json())
    .then(setter);
};

const RecipeCreate = () => {
  const [title, setTitle] = useState('');
  const [instructions, setInstructions] = useState('');
  const [error, setError] = useState('');
  const [ingredientsList, setIngredientsList] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [quantitiesList, setQuantitiesList] = useState([]);
  const [ingredientSearch, setIngredientSearch] = useState('');
  const [categorySearch, setCategorySearch] = useState('');
  const [quantitySearch, setQuantitySearch] = useState('');
  const [showAddIngredient, setShowAddIngredient] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddQuantity, setShowAddQuantity] = useState(false);
  const [newIngredientName, setNewIngredientName] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newQuantityName, setNewQuantityName] = useState('');
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [ingredientId, setIngredientId] = useState('');
  const [quantityId, setQuantityId] = useState('');
  const [quantityAmount, setQuantityAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [editingIngredientId, setEditingIngredientId] = useState(null);
  const [editingIngredientName, setEditingIngredientName] = useState('');
  const navigate = useNavigate();

  // Fetch lists
  useEffect(() => {
    fetchList('ingredients', setIngredientsList);
    fetchList('categories', setCategoriesList);
    fetchList('quantities', setQuantitiesList);
  }, []);

  // Filtered lists for search
  const filteredIngredients = ingredientsList.filter(i =>
    i.name.toLowerCase().includes(ingredientSearch.toLowerCase())
  );
  const filteredCategories = categoriesList.filter(c =>
    c.name.toLowerCase().includes(categorySearch.toLowerCase())
  );
  const filteredQuantities = quantitiesList.filter(q =>
    q.name.toLowerCase().includes(quantitySearch.toLowerCase())
  );

  // Add new ingredient
  const handleAddIngredient = (e) => {
    e.preventDefault();
    fetch(`${API_URL}/recipes/ingredients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newIngredientName })
    })
      .then(res => res.json())
      .then(newIng => {
        fetchList('ingredients', setIngredientsList);
        setIngredientId(newIng.id);
        setShowAddIngredient(false);
        setNewIngredientName('');
      });
  };

  // Add new category
  const handleAddCategory = (e) => {
    e.preventDefault();
    fetch(`${API_URL}/recipes/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newCategoryName })
    })
      .then(res => res.json())
      .then(newCat => {
        fetchList('categories', setCategoriesList);
        setCategoryId(newCat.id);
        setShowAddCategory(false);
        setNewCategoryName('');
      });
  };

  // Add new quantity
  const handleAddQuantity = (e) => {
    e.preventDefault();
    fetch(`${API_URL}/recipes/quantities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newQuantityName })
    })
      .then(res => res.json())
      .then(newQ => {
        fetchList('quantities', setQuantitiesList);
        setQuantityId(newQ.id);
        setShowAddQuantity(false);
        setNewQuantityName('');
      });
  };

  // Add ingredient to recipe (local state)
  const handleAddIngredientToRecipe = (e) => {
    e.preventDefault();
    if (!ingredientId || !quantityId || !quantityAmount) return;
    const ingredient = ingredientsList.find(i => i.id === parseInt(ingredientId));
    const quantity = quantitiesList.find(q => q.id === parseInt(quantityId));
    setSelectedIngredients([
      ...selectedIngredients,
      {
        id: ingredient.id,
        name: ingredient.name,
        quantity_id: quantity.id,
        quantity: quantity.name,
        quantity_amount: quantityAmount
      }
    ]);
    setIngredientId('');
    setQuantityId('');
    setQuantityAmount('');
  };

  // Add category to recipe (local state)
  const handleAddCategoryToRecipe = (e) => {
    e.preventDefault();
    if (!categoryId) return;
    const category = categoriesList.find(c => c.id === parseInt(categoryId));
    setSelectedCategories([...selectedCategories, { id: category.id, name: category.name }]);
    setCategoryId('');
  };

  // Remove ingredient/category from local state
  const removeIngredient = (id) => setSelectedIngredients(selectedIngredients.filter(i => i.id !== id));
  const removeCategory = (id) => setSelectedCategories(selectedCategories.filter(c => c.id !== id));

  // Start editing ingredient
  const startEditIngredient = (id, name) => {
    setEditingIngredientId(id);
    setEditingIngredientName(name);
  };

  // Save edited ingredient
  const saveEditIngredient = () => {
    fetch(`${API_URL}/recipes/ingredients/${editingIngredientId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editingIngredientName })
    })
      .then(res => res.json())
      .then(() => {
        fetchList('ingredients', setIngredientsList);
        setEditingIngredientId(null);
        setEditingIngredientName('');
      });
  };

  // Submit recipe
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
      .then(async (recipe) => {
        // Add ingredients
        for (const ing of selectedIngredients) {
          await fetch(`${API_URL}/recipes/recipies/${recipe.id}/ingredients`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ingredient_id: ing.id,
              quantity_amount: ing.quantity_amount,
              quantity_id: ing.quantity_id
            })
          });
        }
        // Add categories
        for (const cat of selectedCategories) {
          await fetch(`${API_URL}/recipes/recipies/${recipe.id}/categories`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ category_id: cat.id })
          });
        }
        navigate('/recipies/home');
      })
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
        <div style={{ marginBottom: '1rem' }}>
          <h4>Ingredients</h4>
          <form onSubmit={handleAddIngredientToRecipe} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div>
              <input
                type="text"
                placeholder="Search ingredient..."
                value={ingredientSearch}
                onChange={e => setIngredientSearch(e.target.value)}
                style={{ width: 120 }}
              />
              <select
                value={ingredientId}
                onChange={e => setIngredientId(e.target.value)}
                style={{ marginLeft: 4 }}
              >
                <option value="">Select</option>
                {filteredIngredients.map(ing => (
                  <option key={ing.id} value={ing.id}>{ing.name}</option>
                ))}
              </select>
              <button type="button" onClick={() => setShowAddIngredient(true)} style={{ marginLeft: 4 }}>Add new</button>
            </div>
            <div>
              <input
                type="text"
                placeholder="Search unit..."
                value={quantitySearch}
                onChange={e => setQuantitySearch(e.target.value)}
                style={{ width: 80 }}
              />
              <select
                value={quantityId}
                onChange={e => setQuantityId(e.target.value)}
                style={{ marginLeft: 4 }}
              >
                <option value="">Unit</option>
                {filteredQuantities.map(q => (
                  <option key={q.id} value={q.id}>{q.name}</option>
                ))}
              </select>
              <button type="button" onClick={() => setShowAddQuantity(true)} style={{ marginLeft: 4 }}>Add new</button>
            </div>
            <input
              type="number"
              min="0.01"
              step="0.01"
              placeholder="Amount"
              value={quantityAmount}
              onChange={e => setQuantityAmount(e.target.value)}
              style={{ width: 70 }}
              required
            />
            <button type="submit">Add Ingredient</button>
          </form>
          <ul>
            {selectedIngredients.map(ing => (
              <li key={ing.id}>
                {ing.quantity_amount} {ing.quantity} {ing.name}
                <button type="button" onClick={() => removeIngredient(ing.id)} style={{ marginLeft: 8 }}>Remove</button>
              </li>
            ))}
          </ul>
          <ul>
            {ingredientsList.map(ing =>
              editingIngredientId === ing.id ? (
                <li key={ing.id}>
                  <input
                    value={editingIngredientName}
                    onChange={e => setEditingIngredientName(e.target.value)}
                  />
                  <button onClick={saveEditIngredient}>Save</button>
                  <button onClick={() => setEditingIngredientId(null)}>Cancel</button>
                </li>
              ) : (
                <li key={ing.id}>
                  {ing.name}
                  <button onClick={() => startEditIngredient(ing.id, ing.name)}>Edit</button>
                </li>
              )
            )}
          </ul>
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <h4>Categories</h4>
          <form onSubmit={handleAddCategoryToRecipe} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Search category..."
              value={categorySearch}
              onChange={e => setCategorySearch(e.target.value)}
              style={{ width: 120 }}
            />
            <select
              value={categoryId}
              onChange={e => setCategoryId(e.target.value)}
              style={{ marginLeft: 4 }}
            >
              <option value="">Select</option>
              {filteredCategories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <button type="button" onClick={() => setShowAddCategory(true)} style={{ marginLeft: 4 }}>Add new</button>
            <button type="submit" style={{ marginLeft: 8 }}>Add Category</button>
          </form>
          <ul>
            {selectedCategories.map(cat => (
              <li key={cat.id}>
                {cat.name}
                <button type="button" onClick={() => removeCategory(cat.id)} style={{ marginLeft: 8 }}>Remove</button>
              </li>
            ))}
          </ul>
        </div>
        <button type="submit">Create</button>
        <button type="button" style={{ marginLeft: 8 }} onClick={() => navigate('/recipies/home')}>Cancel</button>
      </form>

      {/* Add new ingredient modal */}
      {showAddIngredient && (
        <div className="recipe-detail-modal" onClick={() => setShowAddIngredient(false)}>
          <div className="recipe-detail-content" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowAddIngredient(false)}>&times;</button>
            <h3>Add New Ingredient</h3>
            <form onSubmit={handleAddIngredient}>
              <input
                value={newIngredientName}
                onChange={e => setNewIngredientName(e.target.value)}
                placeholder="Ingredient name"
                required
              />
              <button type="submit" style={{ marginLeft: 8 }}>Add</button>
            </form>
          </div>
        </div>
      )}
      {/* Add new category modal */}
      {showAddCategory && (
        <div className="recipe-detail-modal" onClick={() => setShowAddCategory(false)}>
          <div className="recipe-detail-content" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowAddCategory(false)}>&times;</button>
            <h3>Add New Category</h3>
            <form onSubmit={handleAddCategory}>
              <input
                value={newCategoryName}
                onChange={e => setNewCategoryName(e.target.value)}
                placeholder="Category name"
                required
              />
              <button type="submit" style={{ marginLeft: 8 }}>Add</button>
            </form>
          </div>
        </div>
      )}
      {/* Add new quantity modal */}
      {showAddQuantity && (
        <div className="recipe-detail-modal" onClick={() => setShowAddQuantity(false)}>
          <div className="recipe-detail-content" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowAddQuantity(false)}>&times;</button>
            <h3>Add New Measurement</h3>
            <form onSubmit={handleAddQuantity}>
              <input
                value={newQuantityName}
                onChange={e => setNewQuantityName(e.target.value)}
                placeholder="Measurement name"
                required
              />
              <button type="submit" style={{ marginLeft: 8 }}>Add</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipeCreate;