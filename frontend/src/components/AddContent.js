import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function AddContent() {
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
        <div className=" flex flex-col items-center justify-center max-w-md mx-auto mt-8  space-y-6"  style={{ width: "400px" }}>
        {/* File Upload Form */}
        <form 
            className="w-full bg-white shadow-md rounded-lg p-6 space-y-4" 
            onSubmit={processForm}>
            <div className="flex flex-col gap-2 mb-2">
                <label className="text-gray-700 text-sm font-medium">Upload File</label>
                <input 
                    type="file" 
                    name="data" 
                    onChange={captureFile} 
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
            </div>
    
            <button 
                type="submit" className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                Upload File            
                </button>
        </form>
    
        {/* View Content Link */}
        <Link 
            to="/content" 
            className="w-full text-center bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
            View All Content
        </Link>
    </div>
    
    );
}

export default AddContent;
