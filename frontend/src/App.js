import React from 'react';
import { Outlet } from 'react-router-dom';
import './App.css';
import Header from './components/Header';

export const ApiContext = React.createContext(null);

function App() {
    return (
    <ApiContext.Provider value="null">
      <Header />
      <Outlet />
    </ApiContext.Provider>
    );
}

export default App;