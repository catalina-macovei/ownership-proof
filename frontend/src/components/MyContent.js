import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import axios from 'axios';

const FilePreview = ({ fileUrl }) => {
    const [fileType, setFileType] = useState(null);
    
    const previewStyle = {
        width: '250px',
        height: '200px',
        objectFit: 'cover',
        borderRadius: '8px',
        margin: '0 auto'
    };

    useEffect(() => {
        const fetchFileType = async () => {
            try {
                const response = await fetch(fileUrl, { method: 'HEAD' });
                const contentType = response.headers.get('Content-Type');
                setFileType(contentType ? contentType.toLowerCase() : 'unknown');
            } catch (error) {
                console.error('Error fetching file type:', error);
                setFileType('unknown');
            }
        };

        if (!fileUrl.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp|mp4|webm|mp3|wav|pdf)$/)) {
            fetchFileType();
        } else {
            const extension = fileUrl.toLowerCase().split('.').pop();
            const extToMime = {
                jpg: 'image/jpeg',
                jpeg: 'image/jpeg',
                png: 'image/png',
                gif: 'image/gif',
                webp: 'image/webp',
                mp4: 'video/mp4',
                webm: 'video/webm',
                mp3: 'audio/mpeg',
                wav: 'audio/wav',
                pdf: 'application/pdf'
            };
            setFileType(extToMime[extension] || 'unknown');
        }
    }, [fileUrl]);

    if (!fileType) {
        return <div>Loading preview...</div>;
    }

    if (fileType === 'pdf') {
        return (
            <iframe
                src={fileUrl}
                title="PDF preview"
                style={{ ...previewStyle, height: '400px' }}
            />
        );
    }

    if (fileType.includes('image')) {
        return <img src={fileUrl} alt="Content preview" style={previewStyle} />;
    }

    if (fileType.includes('video')) {
        return <video src={fileUrl} controls style={previewStyle} />;
    }

    if (fileType.includes('audio')) {
        return <audio src={fileUrl} controls style={{ width: '250px', margin: '0 auto' }} />;
    }

    return (
        <div style={{ ...previewStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6', color: '#6b7280' }}>
            <span>Preview not available</span>
        </div>
    );
};


const MyContent = () => {
    const [contentList, setContentList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [selectedContentCid, setSelectedContentCid] = useState(null);

    const handleDeleteClick = async (event) => {
        setIsLoading(true);
        try {
            const result = await axios.post('http://localhost:8000/api/v1/disable-content', {
                cid: selectedContentCid,
              });
              setIsLoading(false);
              setOpen(false);
              alert('Continut setat ca indisponibil');
        } catch (uploadError) {
            setIsLoading(false);
            setOpen(false);
            console.error('Eroare la incarcarea documentului:', uploadError.response || uploadError);
            alert('Eroare la incarcarea documentului');
        } finally {
            setIsLoading(false);
            setOpen(false);
        }
    };
    

    useEffect(() => {
        const fetchContent = async () => {
            try {
                setIsLoading(true);
                const response = await fetch('http://localhost:8000/api/v1/my-content');
                const data = await response.json();
                setContentList(data);
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching content:', error);
                setIsLoading(false);
            }
        };

        fetchContent();
    }, []);

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
           
           {/* Disable modal dialog */}
            <Dialog open={open} onClose={setOpen} className="relative z-10">
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
                                    Disable content
                                </DialogTitle>
                                <div className="mt-2">
                                    <p className="text-sm text-gray-500">
                                    Are you sure you want the content to become unavailable?
                                    This action cannot be undone.
                                    </p>
                                </div>
                                </div>
                            </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                            <button
                                type="button"
                                onClick={handleDeleteClick}
                                className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                            >
                                Disable
                            </button>
                            <button
                                type="button"
                                data-autofocus
                                onClick={() => setOpen(false)}
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
                        <p style={{ color: '#4b5563', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>
                            Creator: {content.creator}
                        </p>
                        <p style={{ color: '#4b5563' }}>Price: {ethers.formatEther(content.price)} ETH</p>
                        <p style={{ color: '#4b5563' }}>Usage Count: {content.usageCount}</p>
                        <p style={{ color: '#4b5563', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>CID: {content.CID}</p>
                    </div>
                    <div className='bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 justify-between'>
                        <button onClick={() => {setOpen(true); setSelectedContentCid(content.CID)}} className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto text-center items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-ban" viewBox="0 0 16 16">
                                <path d="M15 8a6.97 6.97 0 0 0-1.71-4.584l-9.874 9.875A7 7 0 0 0 15 8M2.71 12.584l9.874-9.875a7 7 0 0 0-9.874 9.874ZM16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0"/>
                            </svg>
                            Disable
                        </button>
                        <button className="inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto text-center items-center ">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pen" viewBox="0 0 16 16">
                            <path d="m13.498.795.149-.149a1.207 1.207 0 1 1 1.707 1.708l-.149.148a1.5 1.5 0 0 1-.059 2.059L4.854 14.854a.5.5 0 0 1-.233.131l-4 1a.5.5 0 0 1-.606-.606l1-4a.5.5 0 0 1 .131-.232l9.642-9.642a.5.5 0 0 0-.642.056L6.854 4.854a.5.5 0 1 1-.708-.708L9.44.854A1.5 1.5 0 0 1 11.5.796a1.5 1.5 0 0 1 1.998-.001m-.644.766a.5.5 0 0 0-.707 0L1.95 11.756l-.764 3.057 3.057-.764L14.44 3.854a.5.5 0 0 0 0-.708z"/>
                            </svg>
                            Edit
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default MyContent;
