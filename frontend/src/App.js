import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import axios from 'axios';
import './App.css';
import DisplayContent from './components/DisplayContent';

function App() {
    const [proof, setProof] = useState(null);

    const captureFile = (event) => {
        const selectedProof = event.target.files[0];
        setProof(selectedProof);
        console.log('Document selectat:', selectedProof);
    };

    const processForm = async (event) => {
        event.preventDefault();

        if (!proof) {
            alert('Te rugam sa selectezi un document inainte de trimitere');
            return;
        }

        const uploadData = new FormData();
        uploadData.append('file', proof);

        try {
            const result = await axios.post('http://localhost:8000/api/v1/authorship-proof', uploadData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            alert('Document incarcat cu succes');
            console.log('Raspuns server:', result.data);
        } catch (uploadError) {
            console.error('Eroare la incarcarea documentului:', uploadError.response || uploadError);
            alert('Eroare la incarcarea documentului');
        }
    };

    return (
        <Router>
            <div className="min-h-screen bg-gray-100">
                <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                    <Routes>
                        <Route path="/" element={
                            <div className="flex flex-col items-center space-y-8">
                                <form className="w-full max-w-md bg-white shadow-md rounded-lg p-8" onSubmit={processForm}>
                                    <div className="mb-6">
                                        <input 
                                            type="file" 
                                            name="data" 
                                            onChange={captureFile}
                                            className="block w-full text-sm text-gray-500
                                                file:mr-4 file:py-2 file:px-4
                                                file:rounded-full file:border-0
                                                file:text-sm file:font-semibold
                                                file:bg-indigo-50 file:text-indigo-700
                                                hover:file:bg-indigo-100"
                                        />
                                    </div>
                                    <button 
                                        type="submit" 
                                        className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                    >
                                        Incarca document
                                    </button>
                                </form>
                                
                                <Link 
                                    to="/content" 
                                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    View All Content
                                </Link>
                            </div>
                        } />
                        <Route path="/content" element={<DisplayContent />} />
                    </Routes>
                </div>
            </div>
        </Router>
    );
}

export default App;
