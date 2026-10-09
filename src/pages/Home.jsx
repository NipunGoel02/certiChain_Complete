// src/pages/Home.jsx
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Hero from "../Hero"; // Assuming Hero component exists and is styled similarly
import '../styles/heroShadow.css'; // Import heroShadow.css for shadow styles

// Variants for section headers
const sectionHeaderVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut"
    }
  }
};

// Variants for card items (more dynamic entry)
const cardVariants = {
  hidden: { opacity: 0, y: 80, scale: 0.9 },
  visible: i => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: i * 0.18, // Slightly more delay for staggered effect
      duration: 0.8,
      ease: "easeOut"
    }
  })
};

// Variants for image/visual elements
const imageVariants = {
  hidden: { opacity: 0, scale: 0.8, rotate: -5 },
  visible: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: {
      duration: 1,
      ease: "easeOut",
      delay: 0.3
    }
  }
};

// New variants for the opportunity blocks
const opportunityBlockVariants = {
  hidden: { opacity: 0, x: -100, scale: 0.9 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 1,
      ease: "easeOut",
      delay: 0.4 // Stagger initial load
    }
  },
  hover: {
    scale: 1.02,
    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.35)',
    transition: {
      duration: 0.3
    }
  }
};

const Home = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2 }}
      // Overall background: a rich, deep purple gradient for a premium feel
      className="min-h-screen  font-sans text-secondary-100 overflow-hidden"
    >
      {/* Hero Section - Assuming Hero component exists and is styled similarly */}
<div
  className="relative w-[99%]  mt-[7px] mb-[6px] p-3 "
>
  <Hero />
</div>



      {/* Section: Why CertiChain? - Dynamic Text & Visual Layout */}
      <section className="py-28 bg-white relative z-10">
        <div className="container mx-auto px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-16">
            {/* Text Content */}
            <motion.div
              variants={sectionHeaderVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.5 }}
              className="lg:w-1/2 text-center lg:text-left"
            >
              <h2 className="text-5xl md:text-6xl font-extrabold mb-8 text-secondary-900 leading-tight">
                Why Choose <span className="bg-clip-text text-transparent bg-certi-gradient-purple">CertiChain</span>?
              </h2>
              <p className="text-xl md:text-2xl text-secondary-700 max-w-2xl lg:max-w-none mx-auto mb-10 leading-relaxed">
                In a world demanding verifiable skills, CertiChain offers a revolutionary platform
                where your achievements are not just recognized, but immutably secured on the blockchain.
                Empower your career with credentials that truly stand out.
              </p>
              <Link to="/about">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: '0 10px 20px rgba(0, 0, 0, 0.2)' }}
                  whileTap={{ scale: 0.95 }}
                  className="px-10 py-4 bg-certi-gradient-purple text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 text-lg"
                >
                  Learn More About Us
                </motion.button>
              </Link>
            </motion.div>

            {/* Visual Element */}
            <motion.div
              variants={imageVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.5 }}
              className="lg:w-1/2 flex justify-center items-center relative"
            >
              <img
                src="gemini.png" // Purple background, light purple text
                alt="Blockchain Verification Concept"
                className="rounded-3xl shadow-3xl w-full max-w-xl transform rotate-3 hover:rotate-0 transition-transform duration-700"
              />
              <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob-slow animation-delay-2000"></div>
              <div className="absolute top-10 -right-10 w-32 h-32 bg-accent-200 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob-slow animation-delay-4000"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section: Core Features - Modern Grid with Animated Icons */}
      <section className="py-28 bg-gradient-to-br from-primary-50 to-primary-100 relative overflow-hidden">
        <div className="container mx-auto px-8">
          <motion.div
            variants={sectionHeaderVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-6xl font-extrabold mb-6 text-secondary-900 leading-tight">
              Our Core Features
            </h2>
            <p className="text-xl md:text-2xl text-secondary-700 max-w-4xl mx-auto">
              Experience a platform built for the future of digital credentials.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {[
              {
                icon: (
                  <svg className="w-20 h-20 text-primary-600 drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                ),
                title: "Advanced Learning Modules",
                description: "Dive into interactive modules with cutting-edge content and practical exercises.",
              },
              {
                icon: (
                  <svg className="w-20 h-20 text-primary-600 drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                ),
                title: "Immutable NFT Certificates",
                description: "Your achievements are minted as NFTs, providing tamper-proof, verifiable proof of skill.",
              },
              {
                icon: (
                  <svg className="w-20 h-20 text-primary-600 drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                ),
                title: "Global Professional Profile",
                description: "Showcase your verified credentials on a decentralized profile, visible to employers worldwide.",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                custom={index}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                className="bg-white p-12 rounded-3xl shadow-2xl hover:shadow-primary-500/30 transition-all duration-700 transform hover:-translate-y-4 border border-primary-200 flex flex-col items-center text-center"
              >
                <div className="bg-primary-50 w-28 h-28 rounded-full flex items-center justify-center mb-10 mx-auto shadow-inner-lg transform hover:scale-110 transition-transform duration-500">
                  {feature.icon}
                </div>
                <h3 className="text-3xl font-bold mb-5 text-secondary-900">
                  {feature.title}
                </h3>
                <p className="text-secondary-700 leading-relaxed text-lg">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Section: Explore Opportunities (Courses & Hackathons) - Alternating Layout - REVAMPED */}
      <section className="py-28 bg-primary-900 text-white relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0 0v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0 0v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM12 14v-4h-2v4H6v2h4v4h2v-4h4v-2h-4z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
        }}></div>

        <div className="container mx-auto px-8 relative z-10">
          <motion.div
            variants={sectionHeaderVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl text-white md:text-6xl font-extrabold mb-6 leading-tight">
              Unleash Your Potential
            </h2>
            <p className="text-xl md:text-2xl text-primary-200 max-w-4xl mx-auto">
              Dive into a world of cutting-edge knowledge and real-world challenges.
            </p>
          </motion.div>

          {/* Course Showcase - Revamped Block */}
          <motion.div
            variants={opportunityBlockVariants}
            initial="hidden"
            whileInView="visible"
            whileHover="hover"
            viewport={{ once: true, amount: 0.3 }}
            className="relative flex flex-col lg:flex-row items-center bg-gradient-to-br from-primary-800 to-primary-700 rounded-3xl shadow-4xl mb-28 overflow-hidden transform transition-all duration-700"
          >
            {/* Background Blob */}
            <div className="absolute -top-10 -left-10 w-60 h-60 bg-primary-600 rounded-full mix-blend-screen opacity-20 animate-blob-slow animation-delay-1000"></div>

            {/* Visual Side */}
            <div className="lg:w-1/2 p-10 lg:p-16 flex justify-center items-center relative z-10">
              <div className="relative w-full max-w-md aspect-video rounded-2xl overflow-hidden shadow-3xl border-4 border-primary-500">
                <img
                  src="th.jpeg"
                  alt="Immersive Courses"
                  className="w-full h-full  transform scale-105 hover:scale-100 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary-900/60 to-transparent flex items-end p-6">
                  <h3 className="text-3xl font-bold text-white drop-shadow-md">Deep Dive Learning</h3>
                </div>
              </div>
            </div>

            {/* Text Content Side */}
            <div className="lg:w-1/2 p-10 lg:p-16 text-center lg:text-left relative z-10">
              <h3 className="text-5xl  text-white font-extrabold mb-6 leading-tight">
                Master Cutting-Edge <span className="bg-clip-text text-transparent bg-certi-gradient-purple">Courses</span>
              </h3>
              <p className="text-xl text-primary-200 mb-10 leading-relaxed">
                Unlock a world of knowledge with our expertly curated courses. From blockchain fundamentals to advanced AI,
                each module is designed for practical mastery, culminating in a verifiable NFT certificate.
              </p>
              <Link to="/courses">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: '0 10px 20px rgba(0, 0, 0, 0.2)' }}
                  whileTap={{ scale: 0.95 }}
                  className="px-12 py-5 bg-certi-gradient-purple text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 text-xl tracking-wide uppercase"
                >
                  Explore Courses
                </motion.button>
              </Link>
            </div>
          </motion.div>

          {/* Hackathon Showcase - Revamped Block */}
          <motion.div
            variants={opportunityBlockVariants}
            initial="hidden"
            whileInView="visible"
            whileHover="hover"
            viewport={{ once: true, amount: 0.3 }}
            className="relative flex flex-col lg:flex-row-reverse items-center bg-gradient-to-br from-primary-800 to-primary-700 rounded-3xl shadow-4xl overflow-hidden transform transition-all duration-700"
          >
            {/* Background Blob */}
            <div className="absolute -bottom-10 -right-10 w-60 h-60 bg-accent-500 rounded-full mix-blend-screen opacity-20 animate-blob-slow animation-delay-2000"></div>

            {/* Visual Side */}
            <div className="lg:w-1/2 p-10 lg:p-16 flex justify-center items-center relative z-10">
              <div className="relative w-full max-w-md aspect-video rounded-2xl overflow-hidden shadow-3xl border-4 border-primary-500">
                <img
                  src="heeee.jpeg"
                  alt="Hackathon Challenges"
                  className="w-full h-full object-cover transform scale-105 hover:scale-100 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary-900/60 to-transparent flex items-end p-6">
                  <h3 className="text-3xl font-bold text-white drop-shadow-md">Real-World Challenges</h3>
                </div>
              </div>
            </div>

            {/* Text Content Side */}
            <div className="lg:w-1/2 p-10 lg:p-16 text-center lg:text-left relative z-10">
              <h3 className="text-5xl text-white font-extrabold mb-6 leading-tight">
                Conquer Epic <span className="bg-clip-text text-transparent bg-certi-gradient-purple">Hackathons</span>
              </h3>
              <p className="text-xl text-primary-200 mb-10 leading-relaxed">
                Test your skills in high-stakes hackathons, collaborating with top talent and building innovative solutions.
                Earn prestigious NFT certificates that validate your prowess in competitive environments.
              </p>
              <Link to="/hackathons">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: '0 10px 20px rgba(0, 0, 0, 0.2)' }}
                  whileTap={{ scale: 0.95 }}
                  className="px-12 py-5 bg-certi-gradient-purple text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 text-xl tracking-wide uppercase"
                >
                  Join Hackathons
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Section: Testimonials - Enhanced Visuals */}
      <section className="py-28 bg-primary-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob-slow animation-delay-2000"></div>
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-accent-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob-slow animation-delay-4000"></div>

        <div className="container mx-auto px-8 relative z-10">
          <motion.div
            variants={sectionHeaderVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-6xl font-extrabold mb-6 text-secondary-900 leading-tight">
              What Our Community Says
            </h2>
            <p className="text-xl md:text-2xl text-secondary-700 max-w-4xl mx-auto">
              Hear directly from learners and professionals who have transformed their careers with CertiChain.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {[
              {
                name: "Alex Johnson",
                role: "Lead Software Engineer",
                image: "https://randomuser.me/api/portraits/men/32.jpg",
                quote:
                  "CertiChain's blockchain certificates are revolutionary. They've opened doors to opportunities I never thought possible, providing undeniable proof of my skills.",
              },
              {
                name: "Sarah Williams",
                role: "Senior Data Scientist",
                image: "https://randomuser.me/api/portraits/women/44.jpg",
                quote:
                  "The hackathons are incredibly stimulating, and earning an NFT certificate is a fantastic way to showcase my practical expertise. Truly a modern platform!",
              },
              {
                name: "Michael Chen",
                role: "Decentralized App Developer",
                image: "https://randomuser.me/api/portraits/men/22.jpg",
                quote:
                  "The quality of courses and the verifiable credentials make CertiChain stand out. It's the future of professional development and skill validation.",
              },
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                custom={index}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                className="bg-white p-10 rounded-3xl shadow-2xl border border-primary-100 relative overflow-hidden group hover:shadow-primary-500/30 transition-all duration-700 flex flex-col h-full"
              >
                <svg className="absolute top-8 right-8 w-14 h-14 text-primary-100 opacity-50 transition-opacity duration-300 group-hover:opacity-100" fill="currentColor" viewBox="0 0 24 24"><path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z"></path></svg>
                <div className="flex items-center mb-8">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-20 h-20 rounded-full mr-6 border-4 border-primary-500 shadow-lg object-cover"
                  />
                  <div>
                    <h4 className="font-bold text-2xl text-secondary-900">{testimonial.name}</h4>
                    <p className="text-lg text-secondary-700">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
                <p className="text-secondary-800 italic leading-relaxed text-xl mb-4 flex-grow">
                  "{testimonial.quote}"
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Grand Finale */}
      <section
        className="py-36 text-white text-center relative overflow-hidden"
        style={{
          background: 'linear-gradient(90deg, #4F2D78 0%, #331A99 100%)' // Deepest purple gradient
        }}
      >
        {/* Animated background elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/4 w-60 h-60 bg-primary-600 rounded-full mix-blend-screen opacity-20 animate-pulse-bg"></div>
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-accent-500 rounded-full mix-blend-screen opacity-20 animate-pulse-bg animation-delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-primary-400 rounded-full mix-blend-screen opacity-20 animate-pulse-bg animation-delay-2000"></div>
        </div>

        <div className="container mx-auto px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            viewport={{ once: true }}
          >
            <h2 className="text-6xl text-white md:text-8xl font-extrabold mb-12 leading-tight drop-shadow-lg">
  Ready to Build Your Future?
</h2>
<p className="text-xl md:text-3xl text-primary-200 mb-14 max-w-5xl mx-auto leading-relaxed">
  Join CertiChain today and step into a new era of verifiable education and professional recognition.
  Your journey to a blockchain-powered, globally recognized career starts here.
</p> 
            <Link to="/login">
              <motion.button
                whileHover={{ scale: 1.07, boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)' }}
                whileTap={{ scale: 0.93 }}
                className="px-14 py-7 bg-certi-gradient-purple text-white font-bold rounded-full shadow-4xl hover:shadow-5xl transition-all duration-500 text-3xl tracking-wider uppercase transform hover:rotate-1"
              >
                Get Started for Free
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
};

export default Home;
