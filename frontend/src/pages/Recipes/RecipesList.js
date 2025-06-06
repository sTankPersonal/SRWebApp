import React from 'react';

const RecipesList = ({ recipes, onSelect }) => (
  <ul>
    {recipes.map(r => (
      <li key={r.id}>
        <button
          style={{ background: 'none', border: 'none', color: 'blue', cursor: 'pointer', textDecoration: 'underline' }}
          onClick={() => onSelect(r.id)}
        >
          {r.title}
        </button>
      </li>
    ))}
  </ul>
);

export default RecipesList;