import React, { useEffect } from 'react';
import { Router, Route, Switch } from 'wouter';
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
import { getToken, setUserDetails } from './service/asyncstorage';
import { socket } from './lib/socket';
import { api } from './lib/api';

function App() {
  const token = getToken();
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Layout>
            <Switch>
              <Route path="/" component={Home} />
              <Route path="/menu" component={Menu} />
              <Route path="/reservations" component={Reservations} />
              <Route path="/chat" component={Chat} />
              <Route path="/orders" component={Orders} />
              <Route path="/login" component={Login} />
              <Route path="/register" component={Register} />
              <Route path="/cart" component={Cart} />
            </Switch>
          </Layout>
          <Toaster position="top-right" />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;