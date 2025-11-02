    import SecureUpload from './components/SecureUpload.jsx';
    import FileDownloader from './components/FileDownloader.jsx';
    
    import './App.css';
    import React, { Component } from 'react';

    class App extends Component {
      render() {
        return (
        //   <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
        //   <h1>Projet APIS - Prototype Zero Trust</h1>
        //   < SecureUpload  />
        // </div>
            <div className="p-6">
                <h1 className="text-2xl font-bold text-center mb-6">🚀 APIS Secure App</h1>

                {/* Composant pour uploader */}
                <div className="mb-10">
                    <SecureUpload />
                </div>

                {/* Composant pour télécharger/déchiffrer */}
                <div className="mt-10">
                    <FileDownloader />
                </div>
            </div>
        );
      }
    }

    export default App;
