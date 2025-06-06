import React from 'react';

const RecipeDetail = ({ recipe, onBack }) => (
  <div style={{ marginTop: '2rem', border: '1px solid #ccc', padding: '1rem' }}>
    <h2>{recipe.title}</h2>
    <p><strong>Instructions:</strong> {recipe.instructions}</p>
    <h3>Ingredients</h3>
    <ul>
      {recipe.ingredients && recipe.ingredients.length > 0 ? (
        recipe.ingredients.map(ing => (
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
      {recipe.categories && recipe.categories.length > 0 ? (
        recipe.categories.map(cat => (
          <li key={cat.id}>{cat.name}</li>
        ))
      ) : (
        <li>No categories listed.</li>
      )}
    </ul>
    <button onClick={onBack} style={{ marginTop: '1rem' }}>Back to list</button>
  </div>
);

export default RecipeDetail;