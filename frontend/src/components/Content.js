import axios from 'axios';
import React, { useState } from 'react';
import Layout from './Header';

const Content = () => {

    const [proof, setProof] = useState(null);

  // Gestioneaza selectarea fisierului
  const captureFile = (event) => {
    const selectedProof = event.target.files[0];
    setProof(selectedProof);
    console.log('Document selectat:', selectedProof); // Afiseaza documentul selectat
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
    <div className="App">

      <form className="form" onSubmit={processForm}>
        <label id="data">Content</label><br />
        <input type="file" id="data" name="data" onChange={captureFile} /> <br /> < br />
        <label id="price">Price of licence</label> <br /> 
        <input type="number" id="price" name="price" defaultValue={0}/> <br /> < br />
        <button type="submit" className="btn">Save</button>
      </form>
    </div>
  )
};

export default Content;