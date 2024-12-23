import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const PlatformFee = () => {
    const [fee, setFee] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchPlatformFee = async () => {
            try {
                setIsLoading(true);
                const response = await fetch('http://localhost:8000/api/v1/fee');
                const data = await response.json();
                console.log(data);
                setFee(ethers.formatEther(data));
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching fee:', error);
                setIsLoading(false);
            }
        };
    
        fetchPlatformFee();
    }, []);


    // Gestioneaza introducerea pretului
    const captureFee = (event) => {
        const selectedFee = event.target.value;
        setFee(selectedFee);
            
    };

    // Gestioneaza trimiterea formularului
    const processForm = async (event) => {
        event.preventDefault();

        // Validation checks
        if (!fee) {
            alert('Te rugam sa introduci o valoare pentru taxa');
            return;
        }

        if (fee < 0) {
            alert('Taxa nu poate fi o valoare negativa');
            return;
        }

        try {
            setIsLoading(true);

            const result = await axios.post('http://localhost:8000/api/v1/set-fee', {
                fee: fee
            });

            setIsLoading(false);
            alert('Taxa actualizata cu succes');

            console.log('Raspuns server:', result.data);
        } catch (uploadError) {
            console.error('Eroare la actualizarea taxei:', uploadError.response || uploadError);
            alert('Eroare la actualizarea taxei');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative mx-auto max-w-2xl px-4 py-6 sm:px-6 lg:px-8">
            {/* Loading Overlay */}
            {isLoading && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
                    <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-white"></div>
                        <p className="mt-4 text-white text-lg">Loading...</p>
                    </div>
                </div>
            )}

            <form onSubmit={processForm}>
                <div className="space-y-12">
                    <div className="border-b border-gray-900/10 pb-12">
                        <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-1">
                            <div className="sm:col-span-2">
                                <label htmlFor="title" className="block text-sm/6 font-medium text-gray-900">
                                    Platform fee
                                </label>
                                <p className="mt-1 text-sm/6 text-gray-600">This fee will be paid by users when they upload content on the platform.</p>
                                <p className="mt-1 text-sm/6 text-red-600">Only the admin cand change the platform fee!</p>
                                <div className="mt-2">
                                <div className="flex items-center rounded-md bg-white pl-3 outline outline-1 -outline-offset-1 outline-gray-300 has-[input:focus-within]:outline has-[input:focus-within]:outline-2 has-[input:focus-within]:-outline-offset-2 has-[input:focus-within]:outline-indigo-600">
                                        <div className="shrink-0 select-none text-base text-gray-500 sm:text-sm/6">ETH</div>
                                        <input
                                            id="fee"
                                            name="fee"
                                            type="text"
                                            value={fee}
                                            className="block min-w-0 grow py-1.5 pl-1 pr-3 text-base text-gray-900 placeholder:text-gray-400 focus:outline focus:outline-0 sm:text-sm/6"
                                            onChange={captureFee}
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                <div className="mt-6 flex items-center justify-end gap-x-6">
                    <button
                        type="submit"
                        className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Uploading...' : 'Save'}
                    </button>
                </div>
            </form>
        </div>
    )
};

export default PlatformFee;