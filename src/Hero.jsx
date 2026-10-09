import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

// Main App Component
// The background is now transparent to remove the surrounding color.
// Padding has been added to ensure the shadow is visible.
export default function App() {
  return (
    <div className="font-sans p-[2px]">
       <Hero />
    </div>
  );
}


// Main Component Wrapper
function Hero() {
  return (
    // The shadow effect is added here using Tailwind's drop-shadow-2xl utility.
    <div className="w-full ml-2 hero-shadow  rounded-t-[60px] overflow-hidden">
      <HeroSection />
    </div>
  );
}

// Logo Component (Your Original)
const Logo = () => (
  <div className="flex items-center justify-center">
    <span className="w-4 h-4 rounded-full bg-gradient-to-tr from-[#C084FC] to-[#F472B6]"></span>
  </div>
);

// Navigation Links Data (Your Original - empty)
const navLinks = [];

// Header Component (Your Original)
const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const headerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: -20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 120 },
    },
  };

  return (
    <>
      <motion.header
        className="absolute top-0 left-0 right-0 z-30"
        variants={headerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="container mx-auto px-6 py-8 flex justify-between items-center">
          {/* Logo */}
          <motion.div variants={itemVariants}>
            <Logo />
          </motion.div>

          {/* Desktop Navigation (empty) */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <motion.a
                key={link.title}
                href={link.href}
                variants={itemVariants}
                className="text-[#4A3F6D] hover:text-[#1A0A3B] transition-colors duration-300"
              >
                {link.title}
              </motion.a>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(true)} className="text-[#1A0A3B]">
              <Menu size={28} />
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-0 bg-[#F4F2FA] z-50 p-6 md:hidden"
          >
            <div className="flex justify-between items-center mb-16">
              <Logo />
              <button onClick={() => setIsMenuOpen(false)} className="text-[#1A0A3B]">
                <X size={28} />
              </button>
            </div>
            <nav className="flex flex-col items-center space-y-8">
              {navLinks.map((link) => (
                <a
                  key={link.title}
                  href={link.href}
                  className="text-2xl text-[#4A3F6D] hover:text-[#1A0A3B]"
                >
                  {link.title}
                </a>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// Hero Section Component (Your Original)
const HeroSection = () => {
  return (
    <div className="relative w-full hero- h-[101vh] flex items-center justify-center md:justify-start -mt-4 overflow-hidden rounded-t-[60px] bg-transparent">
      {/* Video with rounded corners inherited from parent */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-screen  h-full object-cover"
        src="ssss.mp4"
        onError={(e) => { e.target.style.display='none'; console.error("Video failed to load.") }}
      />
     
      {/* Header */}
      <Header />

      {/* Hero Content */}
      <div className="absolute top-[18%] left-[10%] z-20 text-left max-w-xl font-sans">
        <h1 className="text-[2.8rem] md:text-[4rem] font-bold text-[#1A0A3B] leading-[1.1] tracking-tight">
          The Smarter,<br />
          NFT-Powered<br />
          Credential &<br />
          Verification Platform
        </h1>
        <p className="mt-4 text-[1rem] md:text-[1.25rem] font-normal text-[#4A3F6D] max-w-md leading-snug">
          Issue and verify NFT certificates for hackathons, courses, and internships with CertiChain.
        </p>
      </div>
    </div>
  );
};
