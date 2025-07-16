import React from 'react';
import { AuthProvider } from './context/AuthContext';
import SearchPage from './pages/SearchPage';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <SearchPage />
    </AuthProvider>
  );
};

export default App;
