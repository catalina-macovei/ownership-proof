import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Outlet } from 'react-router-dom';
import { useSDK } from "@metamask/sdk-react";
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