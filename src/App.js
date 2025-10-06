import SecureUpload from './components/SecureUpload.jsx';
import './App.css';
import React, { Component } from 'react';

class App extends Component {
  render() {
    return (
      <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>Projet APIS - Prototype Zero Trust</h1>
      < SecureUpload  />
    </div>
    );
  }
}

export default App;
