import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import { useSDK } from "@metamask/sdk-react";
import NewContent from "../components/NewContent"
import DisplayContent from "../components/DisplayContent"


export const ApiContext = React.createContext({});

function ConnectMetamask() {
    const [account, setAccount] = useState();
    const { sdk, connected, connecting, chainId } = useSDK();

    const connect = async () => {
        try {
            const accounts = await sdk?.connect();
            setAccount(accounts?.[0]);
        } catch (err) {
            console.warn("failed to connect..", err);
        }
    };

    return (
        <Router>
                    <div className="m-8 text-center w-full"> 
                        <button className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700" onClick={connect}>
                            Connect MetaMask
                        </button>
                        {connected && (
                            <div className="mt-4 text-gray-700">
                                <p>Connected chain: {chainId}</p>
                                <p>Connected account: {account}</p>
                            </div>
                        )}
                    </div>
                    
                    <Routes>
                        <Route path="/add-content" element={<NewContent />} />
                        <Route path="/content" element={<DisplayContent />} />
                    </Routes>

        </Router>
    );
}

export default ConnectMetamask;