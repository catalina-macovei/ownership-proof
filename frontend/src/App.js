import React from 'react';
import { Outlet } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import { AuthContext } from './components/ConnectMetamask';

export const ApiContext = React.createContext(null);


function App() {
    return (
        <AuthContext.Provider value={{ token: sessionStorage.getItem('authToken') }}>
            <ApiContext.Provider value="null">
                <Header />
                <Outlet />
            </ApiContext.Provider>
        </AuthContext.Provider>
    );
}

export default App;