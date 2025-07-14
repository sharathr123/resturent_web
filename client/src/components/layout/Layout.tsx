import React from 'react';
import Header from './Header';
import Footer from './Footer';
import FloatingCart from '../ui/FloatingCart';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-16">
        {children}
      </main>
      {/* <Footer /> */}
      <FloatingCart />
    </div>
  );
};

export default Layout;