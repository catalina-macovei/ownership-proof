import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import axios from 'axios';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'

const FilePreview = ({ fileUrl }) => {
    const [fileType, setFileType] = useState(null);

    useEffect(() => {
        const fetchFileType = async () => {
            try {
                const response = await fetch(fileUrl, { method: 'HEAD' });
                const contentType = response.headers.get('Content-Type');
                setFileType(contentType ? contentType.toLowerCase() : 'unknown');
            } catch {
                setFileType('unknown');
            }
        };

        if (!fileUrl.match(/\.(jpg|jpeg|png|gif|webp|mp4|webm|mp3|wav|pdf)$/i)) {
            fetchFileType();
        } else {
            const extToMime = {
                jpg: 'image/jpeg', jpeg: 'image/jpeg',
                png: 'image/png', gif: 'image/gif', webp: 'image/webp',
                mp4: 'video/mp4', webm: 'video/webm',
                mp3: 'audio/mpeg', wav: 'audio/wav',
                pdf: 'application/pdf'
            };
            const extension = fileUrl.split('.').pop().toLowerCase();
            setFileType(extToMime[extension] || 'unknown');
        }
    }, [fileUrl]);

    if (!fileType) return <div>Loading preview...</div>;
    if (fileType.includes('image')) return <img src={fileUrl} alt="Preview" />;
    if (fileType.includes('video')) return <video src={fileUrl} controls />;
    if (fileType.includes('audio')) return <audio src={fileUrl} controls />;
    if (fileType === 'application/pdf') return <iframe src={fileUrl} title="PDF Preview" />;
    return <div>Preview not available</div>;
};

const DisplayContent = () => {
    const [contentList, setContentList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedContentCid, setSelectedContentCid] = useState('');
    const [duration, setDuration] = useState(1);
    const [openModal, setOpenModal] = useState(false);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                setIsLoading(true);
                const storedToken = sessionStorage.getItem('authToken');
                
                const response = await fetch('http://localhost:8000/api/v1/content', {
                    headers: {
                        'Authorization': `Bearer ${storedToken}`
                    }
                });
                const data = await response.json();
                setContentList(data);
            } catch (error) {
                console.error('Error fetching content:', error);
            } finally {
                setIsLoading(false);
            }
        };
        
        const handleBuyLicence = async (event) => {
            event.preventDefault();
            const storedToken = sessionStorage.getItem('authToken');
        
            if (!storedToken) {
                alert('Please connect with MetaMask first');
                return;
            }
        
            if (!duration || duration < 1) {
                alert('Duration must be at least one day');
                return;
            }
        
            try {
                setIsLoading(true);
                const uploadData = new FormData();
                uploadData.append('cid', selectedContentCid);
                uploadData.append('duration', duration);
        
                const response = await fetch('http://localhost:8000/api/v1/buy-licence', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${storedToken}`
                    },
                    body: uploadData
                });
        
                if (response.ok) {
                    alert('License purchased successfully');
                } else {
                    throw new Error('License purchase failed');
                }
            } catch (error) {
                console.error('Error purchasing license:', error);
                alert('Error purchasing license');
            } finally {
                setOpenModal(false);
                setIsLoading(false);
            }
        };
        

        fetchContent();
    }, []);

    
    // Gestioneaza introducerea pretului
    const captureDuration = (event) => {
        const selectedDuration = event.target.value;
        setDuration(selectedDuration);
    };

 // Handle buy licence
 const handleBuyLicence = async (event) => {
    event.preventDefault();
    if (!duration || duration < 1) {
        alert('Duration must be at least one day.');
        return;
    }
    try {
        setIsLoading(true);
        const storedToken = sessionStorage.getItem('authToken');
        if (!storedToken) {
            alert('Please connect with MetaMask first.');
            return;
        }
        const uploadData = new FormData();
        uploadData.append('cid', selectedContentCid);
        uploadData.append('duration', duration);

        const response = await axios.post('http://localhost:8000/api/v1/buy-licence', uploadData, {
            headers: { Authorization: `Bearer ${storedToken}` },
        });
        
        if (response.status === 200) {
            alert('License purchased successfully');
        } else {
            throw new Error('License purchase failed');
        }
    } catch (error) {
        console.error('Error purchasing license:', error);
        alert('Error purchasing license');
    } finally {
        setOpenModal(false);
        setIsLoading(false);
    }
    }


    const cardStyle = {
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '1.5rem',
        backgroundColor: 'white',
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        width: '300px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', padding: '1.5rem' }}>
             {/* Loading Overlay */}
             {isLoading && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
                    <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-white"></div>
                        <p className="mt-4 text-white text-lg">Loading...</p>
                    </div>
                </div>
            )}

            {contentList.length === 0 && !isLoading && <p>No content available yet.</p>}
           

            {/* Buy licence modal dialog */}
            <Dialog open={openModal} onClose={setOpenModal} className="relative z-10">
                    <DialogBackdrop
                        transition
                        className="fixed inset-0 bg-gray-500/75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
                    />

                    <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                        <DialogPanel
                            transition
                            className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-lg data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
                        >
                            <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                            <div className="sm:flex sm:items-start">
                                <div className="mx-auto flex size-12 shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:size-10">
                                <ExclamationTriangleIcon aria-hidden="true" className="size-6 text-red-600" />
                                </div>
                                <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                                <DialogTitle as="h3" className="text-base font-semibold text-gray-900">
                                    Buy licence
                                </DialogTitle>
                                <div className="mt-2">
                                    <div className="sm:col-span-2">
                                        <label htmlFor="title" className="block text-sm/6 font-medium text-gray-900">
                                            Number of days the licence will be available
                                        </label>
                                        <div className="mt-2">
                                            <div className="flex items-center rounded-md bg-white pl-3 outline outline-1 -outline-offset-1 outline-gray-300 has-[input:focus-within]:outline has-[input:focus-within]:outline-2 has-[input:focus-within]:-outline-offset-2 has-[input:focus-within]:outline-indigo-600">
                                                <input
                                                    id="duration"
                                                    name="duration"
                                                    type="number"
                                                    min="1"
                                                    value={duration}
                                                    className="block min-w-0 grow py-1.5 pl-1 pr-3 text-base text-gray-900 placeholder:text-gray-400 focus:outline focus:outline-0 sm:text-sm/6"
                                                    onChange={captureDuration}
                                                    disabled={isLoading}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                </div>
                            </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                            <button
                                type="button"
                                onClick={handleBuyLicence}
                                className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                            >
                                Buy
                            </button>
                            <button
                                type="button"
                                data-autofocus
                                onClick={() => setOpenModal(false)}
                                className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                            >
                                Cancel
                            </button>
                            </div>
                        </DialogPanel>
                        </div>
                    </div>
                </Dialog>

            {contentList.map((content) => (
                <div key={content.CID} style={cardStyle}>
                    <FilePreview fileUrl={content.fileUrl} />
                    <div style={{ marginTop: '1rem' }}>
                    <p style={{ color: '#4b5563' }}>Title: {content.title}</p>
                        <p style={{ color: '#4b5563', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>
                            Creator: {content.creator}
                        </p>
                        <p style={{ color: '#4b5563' }}>Price: {ethers.formatEther(content.price)} ETH</p>
                        <p style={{ color: '#4b5563' }}>Usage Count: {content.usageCount}</p>
                        <p style={{ color: '#4b5563', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>CID: {content.CID}</p>
                        <button
                            type="button"
                            className="mt-6 flex w-full items-center justify-center rounded-md border border-transparent bg-slate-100 px-8 py-3 text-base font-medium text-black hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:ring-offset-2"
                            onClick={() => {setSelectedContentCid(content.CID); setOpenModal(true)}}
                        >
                            Buy licence
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default DisplayContent;
