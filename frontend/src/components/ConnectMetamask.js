import React, { useState, useEffect, createContext} from 'react';
import { useSDK } from "@metamask/sdk-react";

// Create an auth context to share the token across components
export const AuthContext = createContext();

function ConnectMetamask() {
    const [account, setAccount] = useState(() => sessionStorage.getItem('account'));
    const [token, setToken] = useState(() => sessionStorage.getItem('authToken'));
    const { sdk, connected, connecting, chainId } = useSDK();

    // Create a reusable fetch function with auth header
    const authenticatedFetch = async (url, options = {}) => {
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            ...options.headers
        };

        return fetch(url, {
            ...options,
            headers
        });
    };

    const connect = async () => {
        try {
            const accounts = await sdk?.connect();
            const connectedAccount = accounts?.[0];
            setAccount(connectedAccount);
            sessionStorage.setItem('account', connectedAccount);
    
            const message = `Authenticate with account ${connectedAccount}`;
            const signature = await window.ethereum.request({
                method: 'personal_sign',
                params: [message, connectedAccount]
            });
    
            // Update the fetch URL to include the full backend address
            const response = await fetch('http://localhost:8000/api/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ account: connectedAccount, signature, message }),
            });
    
            if (response.ok) {
                const { token } = await response.json();
                setToken(token);
                sessionStorage.setItem('authToken', token);
                console.log("Authenticated successfully, token saved:", token);
            }
        } catch (err) {
            console.warn("Failed to connect or authenticate:", err);
        }
    };
    
    
    const disconnect = () => {
        setAccount(null);
        setToken(null);
        sessionStorage.removeItem('account');
        sessionStorage.removeItem('authToken');
        console.log("Disconnected from MetaMask");
    };

    // Make auth context and authenticated fetch available to child components
    const authContextValue = {
        account,
        token,
        authenticatedFetch
    };

    return (
        <AuthContext.Provider value={authContextValue}>
            <div className="m-8 text-center w-full flex flex-col items-center">
                <img src='/images/avatar.png' className='w-72' alt="avatar" />
                {!account ? (
                    <button
                        className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                        onClick={connect}
                        disabled={connecting}
                    >
                        {connecting ? "Connecting..." : "Connect MetaMask"}
                    </button>
                ) : (
                    <div className="mt-4 text-gray-700">
                        <p>Connected chain: {chainId}</p>
                        <p>Connected account: {account}</p>
                        <button
                            className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 mt-4"
                            onClick={disconnect}
                        >
                            Disconnect
                        </button>
                    </div>
                )}
                {token && <p className="mt-4 text-green-600">Authenticated with token!</p>}
            </div>
        </AuthContext.Provider>
    );
}

export default ConnectMetamask;
