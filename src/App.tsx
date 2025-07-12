import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Menu from './pages/Menu';
import Reservations from './pages/Reservations';
import Chat from './pages/Chat';
import Orders from './pages/Orders';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';
import { getToken } from './service/asyncstorage';
import { socket } from './lib/socket';

function App() {
  const token = getToken();

  useEffect(() => {
    if (token ) {
      console.log("🔌 Calling socket.connect");
      socket.connect(token);
    }
  }, [token]);

  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/menu" element={<Menu />} />
              <Route path="/reservations" element={<Reservations />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/cart" element={<Cart />} />
            </Routes>
          </Layout>
          <Toaster position="top-right" />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;