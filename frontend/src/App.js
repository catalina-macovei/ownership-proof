import React from 'react';
import { Outlet } from 'react-router-dom';
import './App.css';
import Header from './components/Header';

export const ApiContext = React.createContext({});

function App() {
    return (
    <ApiContext.Provider>
      <Header />
      <Outlet />
    </ApiContext.Provider>
    );
}

export default App;