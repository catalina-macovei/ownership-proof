import axios from 'axios';
import React, { useState } from 'react';
import { PhotoIcon } from '@heroicons/react/24/solid'

const Content = () => {

    const [proof, setProof] = useState(null);
    const [fileName, setFileName] = useState('');
    const [price, setPrice] = useState(null);

  // Gestioneaza selectarea fisierului
  const captureFile = (event) => {
    const selectedProof = event.target.files[0];
    setProof(selectedProof);
    setFileName(selectedProof.name);
    console.log('Document selectat:', selectedProof); // Afiseaza documentul selectat
  };

  // Gestioneaza introducerea pretului
  const capturePrice = (event) => {
    const selectedPrice = event.target.value;
    setPrice(selectedPrice);
    console.log('Pretul introdus:', selectedPrice); // Afiseaza pretul introdus
  };

  // Gestioneaza trimiterea formularului
  const processForm = async (event) => {
    event.preventDefault();

    if (!proof) {
      alert('Te rugam sa selectezi un document inainte de trimitere');
      return;
    }

    console.log('Document de incarcat:', proof); // Afiseaza documentul care urmeaza sa fie incarcat

    const uploadData = new FormData();
    uploadData.append('file', proof);

    try {
      const result = await axios.post('http://localhost:8000/api/v1/authorship-proof', uploadData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      alert('Document incarcat cu succes');
      console.log('Raspuns server:', result.data); // Afiseaza raspunsul de la server
    } catch (uploadError) {
      console.error('Eroare la incarcarea documentului:', uploadError.response || uploadError);
      alert('Eroare la incarcarea documentului');
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 lg:px-8">

      <form onSubmit={processForm}>
        <div className="space-y-12">
          <div className="border-b border-gray-900/10 pb-12">

            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-1">
              <div>
                <label htmlFor="price" className="block text-sm/6 font-medium text-gray-900">
                  Price
                </label>
                <div className="mt-2">
                  <div className="flex items-center rounded-md bg-white pl-3 outline outline-1 -outline-offset-1 outline-gray-300 has-[input:focus-within]:outline has-[input:focus-within]:outline-2 has-[input:focus-within]:-outline-offset-2 has-[input:focus-within]:outline-indigo-600">
                    <div className="shrink-0 select-none text-base text-gray-500 sm:text-sm/6">ETH</div>
                    <input
                      id="price"
                      name="price"
                      type="text"
                      placeholder="0.00"
                      className="block min-w-0 grow py-1.5 pl-1 pr-3 text-base text-gray-900 placeholder:text-gray-400 focus:outline focus:outline-0 sm:text-sm/6"
                      onChange={capturePrice}
                    />
                  </div>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="content" className="block text-sm/6 font-medium text-gray-900">
                  Your content
                </label>
                <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
                  {!proof && <div className="text-center">
                    <PhotoIcon aria-hidden="true" className="mx-auto size-12 text-gray-300"/>
                    <div className="mt-4 flex text-sm/6 text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500"
                      >
                        <div>
                          <span>Upload a file</span>
                          <input id="file-upload" name="file-upload" type="file" className="sr-only"  onChange={captureFile}/>
                        </div>
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs/5 text-gray-600">PNG, JPG, GIF up to 10MB</p>
                  </div>}
                  {fileName && (
                        <p className="text-sm text-gray-600 mt-2">
                          Selected file: {fileName}
                        </p>
                      )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-x-6">
          <button
            type="submit"
            className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  )
};

export default Content;