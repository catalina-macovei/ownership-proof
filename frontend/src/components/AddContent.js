import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from './ConnectMetamask';

function AddContent() {
    const [proof, setProof] = useState(null);
    const { token } = useContext(AuthContext);

    const captureFile = (event) => {
        const selectedProof = event.target.files[0];
        setProof(selectedProof);
        console.log('Selected document:', selectedProof);
    };

    const processForm = async (event) => {
        event.preventDefault();
    
        const storedToken = sessionStorage.getItem('authToken');
        if (!storedToken) {
            alert('Please connect with MetaMask first');
            return;
        }
    
        if (!proof) {
            alert('Please select a document before uploading');
            return;
        }
    
        const uploadData = new FormData();
        uploadData.append('file', proof);
    
        try {
            const response = await fetch('http://localhost:8000/api/v1/authorship-proof', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${storedToken}`
                },
                body: uploadData
            });
    
            if (response.ok) {
                const result = await response.json();
                alert('Document uploaded successfully');
                console.log('Server response:', result);
            } else {
                throw new Error('Upload failed');
            }
        } catch (error) {
            console.error('Error uploading document:', error);
            alert('Error uploading document');
        }
    };
    

    return (
        <div className="flex flex-col items-center justify-center max-w-md mx-auto mt-8 space-y-6" style={{ width: "400px" }}>
            <form className="w-full bg-white shadow-md rounded-lg p-6 space-y-4" onSubmit={processForm}>
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
                    type="submit"
                    className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                    Upload File
                </button>
            </form>
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
