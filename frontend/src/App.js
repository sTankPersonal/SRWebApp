import React, { useEffect, useState, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ModulesMenu from './pages/Root/ModulesMenu';

function App() {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/modules`)
      .then(res => res.json())
      .then(data => {
        setModules(data.modules || []);
        setLoading(false);
      });
  }, []);

  const getModuleHomeComponent = (name) => {
    switch (name) {
      case 'recipies':
        return React.lazy(() => import('./pages/Recipes/RecipesHome'));
      default:
        return () => <div>Module not found</div>;
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <Router>
      <Suspense fallback={<div>Loading module...</div>}>
        <Routes>
          <Route path="/" element={<ModulesMenu />} />
          {modules.map(mod => (
            <Route
              key={mod.name}
              path={`/${mod.name}/home`}
              element={React.createElement(getModuleHomeComponent(mod.name))}
            />
          ))}
          <Route path="/recipies/create" element={React.createElement(React.lazy(() => import('./pages/Recipes/RecipeCreate')))} />
          <Route path="/recipies/edit/:id" element={React.createElement(React.lazy(() => import('./pages/Recipes/RecipeEdit')))} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;