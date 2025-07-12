import React from 'react';
import Hero from '../components/home/Hero';
import Features from '../components/home/Features';
import PopularDishes from '../components/home/PopularDishes';
import Testimonials from '../components/home/Testimonials';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <Features />
      <PopularDishes />
      {/* <Testimonials /> */}
    </div>
  );
};

export default Home;