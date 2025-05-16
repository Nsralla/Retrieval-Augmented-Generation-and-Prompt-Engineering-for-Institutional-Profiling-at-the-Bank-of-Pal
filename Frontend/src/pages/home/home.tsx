// pages/home/Home.tsx
import React from "react";
import { Link } from "react-router-dom";
import {  motion } from "framer-motion";
import Navbar from "@/components/custom/navbar";
import bot from "@/assets/bot.png"; // Placeholder for chatbot image
import { isTokenExpired } from "@/utils/auth"; // Import the function to check token expiration
import { useNavigate } from "react-router-dom";
const Home: React.FC = () => {
  const navigate = useNavigate();
  // check if the token has expired or not
  const token = localStorage.getItem("token");
  const isExpired = isTokenExpired(token);
  if (isExpired) {
     localStorage.removeItem("token");
     navigate("/login");
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
    >
      {/* Sticky Navbar */}
      <Navbar/>

      {/* Hero Section: Text Left, Image Right */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="h-screen flex flex-col md:flex-row items-center justify-center px-4 md:px-16 lg:px-32 mb-12"
      >
        {/* Left Column: Hero Text */}
        <div className="md:w-1/2 space-y-6 text-center md:text-left">
          <motion.h1
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-6xl font-extrabold"
          >
            Your Virtual Bank Assistant<br/>Available 24/7
          </motion.h1>
          <motion.p
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-gray-700 dark:text-gray-300"
          >
            Ask anything about your account, transactions, or services—and get
            instant, secure answers.
          </motion.p>
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Link
              to="/chat"
              className="inline-block px-6 py-3 bg-blue-800 text-white text-lg rounded-full hover:bg-blue-700 transition"
            >
              Launch Chatbot
            </Link>
          </motion.div>
          {/* Powered by ChatGPT */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-4 text-sm text-gray-500 dark:text-gray-400"
          >
            Powered by ChatGPT
          </motion.p>
        </div>

        {/* Right Column: Chatbot Image */}
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="md:w-1/2 mt-8 md:mt-0 flex justify-center"
        >
          <img
            src={bot}
            alt="Chatbot illustration"
            className="w-full max-w-xl md:max-w-2xl rounded-2xl shadow-2xl"
          />
        </motion.div>
      </motion.section>


       


      {/* Features Section */}
      <motion.section
        id="features"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="h-screen py-16 bg-blue-50 dark:bg-gray-800 flex items-center"
      >
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
          <div className="p-6 bg-white dark:bg-gray-700 rounded-lg shadow hover:shadow-lg transition">
            <h3 className="text-2xl font-semibold mb-2 text-blue-800">🔒 Secure</h3>
            <p>Your data is encrypted end-to-end and never shared.</p>
          </div>
          <div className="p-6 bg-white dark:bg-gray-700 rounded-lg shadow hover:shadow-lg transition">
            <h3 className="text-2xl font-semibold mb-2 text-blue-800">⚡ Instant</h3>
            <p>Get answers in seconds, no waiting on hold.</p>
          </div>
          <div className="p-6 bg-white dark:bg-gray-700 rounded-lg shadow hover:shadow-lg transition">
            <h3 className="text-2xl font-semibold mb-2 text-blue-800">🤖 Smart</h3>
            <p>Powered by AI, it understands your questions in natural language.</p>
          </div>
        </div>
      </motion.section>

      {/* How It Works Section */}
      <motion.section
        id="how-it-works"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="h-screen py-16 flex flex-col items-center justify-center px-4"
      >
        <h2 className="text-3xl font-bold mb-8 text-blue-800">How It Works</h2>
        <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              step: 1,
              title: "Ask Anything",
              desc: "Type your question about balance, transfers, or services."
            },
            {
              step: 2,
              title: "AI-Powered Reply",
              desc: "Our model fetches the best answers securely from our database."
            },
            {
              step: 3,
              title: "Get It Done",
              desc: "Follow simple instructions or links to complete your task."
            }
          ].map(({ step, title, desc }) => (
            <div key={step} className="text-center">
              <div className="mx-auto w-16 h-16 flex items-center justify-center bg-blue-800 text-white rounded-full text-xl font-bold mb-4">
                {step}
              </div>
              <h3 className="text-xl font-semibold mb-2">{title}</h3>
              <p className="text-gray-600 dark:text-gray-300">{desc}</p>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Contact / Footer */}
      <footer id="contact" className="py-8 bg-gray-100 dark:bg-gray-900 text-center text-gray-600 dark:text-gray-400">
        <p className="mb-4">
          Need more help? Reach out to our support team at{' '}
          <a href="mailto:support@bankofpalestine.com" className="underline text-blue-800">
            support@bankofpalestine.com
          </a>
        </p>
        <p>© {new Date().getFullYear()} Bank of Palestine</p>
      </footer>
    </motion.div>
  );
};

export default Home;


