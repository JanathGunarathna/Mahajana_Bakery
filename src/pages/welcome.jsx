import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Welcome() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const navigate = useNavigate();

  // Professional: use useCallback for handlers
  const handleGetStarted = React.useCallback(() => {
    navigate("/selection");
  }, [navigate]);

  const toggleDarkMode = React.useCallback(() => {
    setIsDarkMode((prev) => !prev);
  }, []);

  return (
    <div
      className={`min-h-screen relative transition-colors duration-300 ${
        isDarkMode
          ? "text-white"
          : "text-gray-900"
      }`}
      style={{
        background: isDarkMode 
          ? 'linear-gradient(to bottom right, rgba(15, 23, 42, 0.8), rgba(30, 41, 59, 0.8), rgba(51, 65, 85, 0.8))'
          : 'linear-gradient(to bottom right, rgba(248, 250, 252, 0.8), rgba(241, 245, 249, 0.8), rgba(226, 232, 240, 0.8))'
      }}
    >
      {/* Modern geometric background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Animated particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-2 h-2 rounded-full animate-twinkle ${
                isDarkMode ? "bg-primary-400/20" : "bg-secondary-400/30"
              }`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDuration: `${3 + Math.random() * 4}s`,
                animationDelay: `${Math.random() * 2}s`
              }}
            />
          ))}
        </div>

        {/* Glassmorphism cards floating */}
        <div
          className={`absolute top-20 left-16 w-72 h-48 rounded-3xl opacity-40 blur-sm rotate-12 backdrop-blur-md animate-floatSlow ${
            isDarkMode 
              ? "bg-gradient-to-br from-primary-800/30 to-secondary-700/20 border border-primary-600/20" 
              : "bg-gradient-to-br from-primary-100/60 to-secondary-100/40 border border-primary-200/30"
          }`}
        ></div>
        
        <div
          className={`absolute top-1/3 right-20 w-80 h-56 rounded-3xl opacity-30 blur-sm -rotate-6 backdrop-blur-md ${
            isDarkMode 
              ? "bg-gradient-to-br from-secondary-800/25 to-accent-700/15 border border-secondary-600/20" 
              : "bg-gradient-to-br from-secondary-100/70 to-accent-100/50 border border-secondary-200/40"
          }`}
          style={{ 
            animation: "floatSlow 15s ease-in-out infinite",
            animationDelay: "3s"
          }}
        ></div>

        <div
          className={`absolute bottom-32 left-1/4 w-64 h-64 rounded-full opacity-20 blur-[40px] animate-pulse ${
            isDarkMode ? "bg-gradient-to-r from-primary-600/30 to-accent-500/20" : "bg-gradient-to-r from-primary-400/40 to-accent-300/30"
          }`}
          style={{ 
            animation: "pulse 8s ease-in-out infinite"
          }}
        ></div>

        {/* Animated gradient orbs */}
        <div
          className={`absolute top-1/2 left-10 w-32 h-32 rounded-full blur-[30px] animate-orbFloat ${
            isDarkMode ? "bg-gradient-to-r from-accent-600/20 to-primary-600/20" : "bg-gradient-to-r from-accent-400/30 to-primary-400/30"
          }`}
        ></div>

        <div
          className={`absolute top-3/4 right-1/4 w-24 h-24 rounded-full blur-[25px] ${
            isDarkMode ? "bg-gradient-to-r from-secondary-600/25 to-accent-600/25" : "bg-gradient-to-r from-secondary-400/35 to-accent-400/35"
          }`}
          style={{
            animation: "orbFloat 8s ease-in-out infinite reverse",
            animationDelay: "2s"
          }}
        ></div>

        {/* Modern grid pattern */}
        <div
          className={`absolute inset-0 opacity-10 ${isDarkMode ? "opacity-5" : ""}`}
          style={{
            backgroundImage: `linear-gradient(${isDarkMode ? "rgba(99,102,241,0.1)" : "rgba(59,130,246,0.1)"} 1px, transparent 1px), linear-gradient(90deg, ${isDarkMode ? "rgba(99,102,241,0.1)" : "rgba(59,130,246,0.1)"} 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
            animation: "gridMove 20s linear infinite"
          }}
        ></div>
      </div>

      {/* Header with modern navbar */}
      <header className="relative z-20 flex justify-between items-center p-8 animate-fadeInDown">
        <div className="flex items-center gap-4 animate-slideInLeft">
          <div
            className={`relative w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl transition-all duration-500 hover:scale-110 hover:rotate-12 overflow-hidden animate-logoSpin ${
              isDarkMode
                ? "bg-gradient-to-r from-primary-600 to-secondary-600"
                : "bg-gradient-to-r from-primary-500 to-secondary-500"
            }`}
          >
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
            <span className="relative z-10 text-2xl font-bold text-white animate-pulse">MB</span>
          </div>
          <div>
            <h2 className={`font-bold text-xl transition-colors duration-300 ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}>
              Mahajana Bakery
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-4 animate-slideInRight">
          <button
            type="button"
            onClick={toggleDarkMode}
            className={`group flex items-center gap-2 px-5 py-3 rounded-2xl backdrop-blur-md transition-all duration-300 hover:scale-105 hover:rotate-3 ${
              isDarkMode
                ? "bg-white/10 hover:bg-white/15 text-primary-200 border border-white/20"
                : "bg-white/70 hover:bg-white/90 text-secondary-700 border border-white/50 shadow-lg"
            }`}
            aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            <span className={`text-lg transition-all duration-300 group-hover:scale-125 group-hover:rotate-180 ${
              isDarkMode ? "text-primary-400" : "text-secondary-600"
            }`}>
              {isDarkMode ? "☀️" : "🌙"}
            </span>
            <span className="text-sm font-medium hidden sm:block">
              {isDarkMode ? "Light" : "Dark"}
            </span>
          </button>
        </div>
      </header>

      {/* Main hero content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 -mt-24">

        {/* Main title with modern typography - EXTRA LARGE */}
        <div className="text-center mb-12 max-w-7xl w-full">
          <h1 className={`text-8xl md:text-9xl lg:text-[12rem] xl:text-[12rem] font-black mb-8 leading-tight tracking-tight animate-fadeInUp ${
            isDarkMode
              ? "bg-gradient-mahajana-dark text-fill-transparent bg-clip-text drop-shadow-glow-blue"
              : "bg-gradient-mahajana-light text-fill-transparent bg-clip-text drop-shadow-glow-blue-light"
          }`}
          style={{
            animationDelay: "0.7s"
          }}>
            <div className="mb-4">
              Mahajana
            </div>
            <div className={`${
              isDarkMode 
                ? "bg-gradient-bakery-dark text-fill-transparent bg-clip-text"
                : "bg-gradient-bakery-light text-fill-transparent bg-clip-text"
            }`}>
              Bakery
            </div>
          </h1>

          <p className={`text-xl md:text-2xl font-light leading-relaxed max-w-3xl mx-auto transition-colors duration-500 animate-fadeInUp ${
            isDarkMode ? "text-gray-300" : "text-gray-700"
          }`}
          style={{
            animationDelay: "1s"
          }}>
            <span style={{ animation: "wordAppear 0.8s ease-out 1.2s both" }}>Malabe Road, Kottawa.</span>
          </p>
        </div>

        {/* Modern CTA section */}
        <div className="flex flex-col sm:flex-row gap-4 items-center mb-16 animate-fadeInUp"
        style={{
          animationDelay: "1.4s"
        }}>
          <button
            type="button"
            onClick={handleGetStarted}
            className={`group relative px-12 py-5 text-lg font-semibold rounded-2xl transition-all duration-500 transform hover:scale-110 hover:-translate-y-3 focus:outline-none focus:ring-4 active:scale-95 overflow-hidden animate-buttonGlow ${
              isDarkMode
                ? "bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-500 hover:to-secondary-500 text-white shadow-2xl focus:ring-primary-500/50"
                : "bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white shadow-2xl focus:ring-primary-400/50"
            }`}
            aria-label="Get started with Mahajana Bakery"
          >
            <div className="absolute inset-0 bg-white/20 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500 group-hover:animate-shimmer"></div>
            <span className="relative z-10 flex items-center gap-3">
              <span className="animate-bounce">Go to the Menu</span>
              <span className="transition-transform duration-500 group-hover:translate-x-3 group-hover:rotate-12">
                🥖
              </span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}