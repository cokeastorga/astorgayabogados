import React from 'react';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Services from './components/Services';
import NewsFeed from './components/NewsFeed';
import Contact from './components/Contact';
import Footer from './components/Footer';
import LegalAssistant from './components/LegalAssistant';
import SEO from './components/SEO';

function App() {
  return (
    <HelmetProvider>
      <div className="min-h-screen flex flex-col font-sans">
        <SEO />
        <Toaster 
          position="bottom-center"
          toastOptions={{
            duration: 5000,
            style: {
              background: '#0f172a', // navy-900
              color: '#fff',
              border: '1px solid #d97706', // gold-600
            },
            success: {
              iconTheme: {
                primary: '#d97706',
                secondary: '#fff',
              },
            },
          }}
        />
        <Navbar />
        <main>
          <Hero />
          <About />
          <Services />
          <NewsFeed />
          <Contact />
        </main>
        <LegalAssistant />
        <Footer />
      </div>
    </HelmetProvider>
  );
}

export default App;