import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { StoreProvider } from './context/StoreContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Shop from './pages/Shop';
import Cart from './pages/Cart';
import Admin from './pages/Admin';
import Login from './pages/Login';
import CustomerLogin from './pages/CustomerLogin';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Simulador from './pages/Simulador';
import Assistant from './components/Assistant';

const App: React.FC = () => {
  return (
    <StoreProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/perfil" element={<Profile />} />
              <Route path="/login" element={<Login />} />
              <Route path="/entrar" element={<CustomerLogin />} />
              <Route path="/cadastro" element={<Register />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/simulador" element={<Simulador />} />
            </Routes>
          </main>
          <Assistant />
          <Footer />
        </div>
      </Router>
    </StoreProvider>
  );
};

export default App;