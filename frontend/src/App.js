import React, { useEffect, useState } from 'react';

function App() {
  const [recipes, setRecipes] = useState([]);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/recipes/recipies`)
      .then(res => res.json())
      .then(data => setRecipes(data.recipes || []));
  }, []);

  return (
    <div>
      <h1>Recipes</h1>
      <ul>
        {recipes.map(r => (
          <li key={r.id}>{r.title}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;