import React, { useState, useEffect, useCallback, useMemo } from "react";
import { firestore } from "../firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";

const BEVERAGES = [
  "Nescafe",
  "Nestea"
];

// Toast notification component
const Toast = ({ toast, onRemove, isDarkMode }) => {
  const getToastStyles = () => {
    const baseStyles = "fixed z-50 p-4 rounded-lg shadow-lg border transform transition-all duration-300 ease-in-out max-w-sm";
    
    switch (toast.type) {
      case 'success':
        return `${baseStyles} ${
          isDarkMode 
            ? "bg-green-900/30 border-green-700/50 text-green-300" 
            : "bg-green-50 border-green-200 text-green-800"
        }`;
      case 'error':
        return `${baseStyles} ${
          isDarkMode 
            ? "bg-red-900/30 border-red-700/50 text-red-300" 
            : "bg-red-50 border-red-200 text-red-800"
        }`;
      case 'warning':
        return `${baseStyles} ${
          isDarkMode 
            ? "bg-yellow-900/30 border-yellow-700/50 text-yellow-300" 
            : "bg-yellow-50 border-yellow-200 text-yellow-800"
        }`;
      case 'info':
      default:
        return `${baseStyles} ${
          isDarkMode 
            ? "bg-primary-900/30 border-primary-700/50 text-primary-300" 
            : "bg-primary-50 border-primary-200 text-primary-800"
        }`;
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, 5000);

    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  return (
    <div
      className={getToastStyles()}
      style={{
        top: `${20 + toast.index * 80}px`,
        right: "20px",
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <span className="mr-2">
            {toast.type === 'success' && '✅'}
            {toast.type === 'error' && '❌'}
            {toast.type === 'warning' && '⚠️'}
            {toast.type === 'info' && 'ℹ️'}
          </span>
          <span className="font-medium">{toast.message}</span>
        </div>
        <button
          onClick={() => onRemove(toast.id)}
          className="ml-4 text-lg hover:opacity-70 transition-opacity"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default function SummaryPage() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    return saved ? JSON.parse(saved) : false;
  });

  // Add toast function
  const [toasts, setToasts] = useState([]);
  const addToast = useCallback((message, type = 'info') => {
    const newToast = {
      id: Date.now(),
      message,
      type,
      index: 0 // Will be updated when rendering
    };
    setToasts(prev => [...prev, newToast]);
  }, []);

  // Remove toast function
  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  // State for data
  const [inventory, setInventory] = useState([]);
  const [beverages, setBeverages] = useState([]);
  const [beveragePrices, setBeveragePrices] = useState([]);
  const [loading, setLoading] = useState(false);

  // Cash balance states
  const [cashierName, setCashierName] = useState(() => {
    return localStorage.getItem("cashierName") || "";
  });
  const [initialCash, setInitialCash] = useState(() => {
    const saved = localStorage.getItem(`initialCash_${selectedDate}`);
    return saved || "";
  });
  const [finalCash, setFinalCash] = useState(() => {
    const saved = localStorage.getItem(`finalCash_${selectedDate}`);
    return saved || "";
  });
  const [totalSales, setTotalSales] = useState(() => {
    const saved = localStorage.getItem(`totalSales_${selectedDate}`);
    return saved || "";
  });
  const [cashOut, setCashOut] = useState(() => {
    const saved = localStorage.getItem(`cashOut_${selectedDate}`);
    return saved || "";
  });
  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem(`notes_${selectedDate}`);
    return saved || "";
  });

  // Save to localStorage when values change
  useEffect(() => {
    localStorage.setItem(`initialCash_${selectedDate}`, initialCash);
  }, [initialCash, selectedDate]);

  useEffect(() => {
    localStorage.setItem(`finalCash_${selectedDate}`, finalCash);
  }, [finalCash, selectedDate]);

  useEffect(() => {
    localStorage.setItem(`totalSales_${selectedDate}`, totalSales);
  }, [totalSales, selectedDate]);

  useEffect(() => {
    localStorage.setItem(`cashOut_${selectedDate}`, cashOut);
  }, [cashOut, selectedDate]);

  useEffect(() => {
    localStorage.setItem(`notes_${selectedDate}`, notes);
  }, [notes, selectedDate]);

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  // Navigation function
  const navigateDate = (direction) => {
    const currentDate = new Date(selectedDate);
    currentDate.setDate(currentDate.getDate() + direction);
    const newDateString = currentDate.toISOString().split('T')[0];
    
    setSelectedDate(newDateString);
    
    // Load saved data for the new date
    setInitialCash(localStorage.getItem(`initialCash_${newDateString}`) || "");
    setFinalCash(localStorage.getItem(`finalCash_${newDateString}`) || "");
    setTotalSales(localStorage.getItem(`totalSales_${newDateString}`) || "");
    setCashOut(localStorage.getItem(`cashOut_${newDateString}`) || "");
    setNotes(localStorage.getItem(`notes_${newDateString}`) || "");
  };

  // Fetch data function
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch inventory data
      const inventoryQuery = query(collection(firestore, "inventory"), orderBy("timestamp", "desc"));
      const inventorySnapshot = await getDocs(inventoryQuery);
      const inventoryData = inventorySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Filter by selected date
      const filteredInventory = inventoryData.filter(item => {
        const itemDate = new Date(item.timestamp?.toDate()).toISOString().split('T')[0];
        return itemDate === selectedDate;
      });

      setInventory(filteredInventory);

      // Fetch beverage data
      const beverageQuery = query(collection(firestore, "beverages"), orderBy("timestamp", "desc"));
      const beverageSnapshot = await getDocs(beverageQuery);
      const beverageData = beverageSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const filteredBeverages = beverageData.filter(item => {
        const itemDate = new Date(item.timestamp?.toDate()).toISOString().split('T')[0];
        return itemDate === selectedDate;
      });

      setBeverages(filteredBeverages);

      // Fetch beverage prices
      const pricesSnapshot = await getDocs(collection(firestore, "beveragePrices"));
      const pricesData = pricesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBeveragePrices(pricesData);

      addToast("Data loaded successfully!", "success");
    } catch (error) {
      console.error("Error fetching data:", error);
      addToast("Error loading data: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  }, [selectedDate, addToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    // Bakery items summary
    const bakeryStats = inventory.reduce((acc, item) => {
      const totalValue = (item.totalItems || 0) * (item.price || 0);
      const soldValue = (item.soldItems || 0) * (item.price || 0);
      const remainingValue = (item.remainingItems || 0) * (item.price || 0);

      return {
        totalItems: acc.totalItems + (item.totalItems || 0),
        soldItems: acc.soldItems + (item.soldItems || 0),
        remainingItems: acc.remainingItems + (item.remainingItems || 0),
        totalValue: acc.totalValue + totalValue,
        soldValue: acc.soldValue + soldValue,
        remainingValue: acc.remainingValue + remainingValue,
        categories: acc.categories + 1
      };
    }, {
      totalItems: 0,
      soldItems: 0,
      remainingItems: 0,
      totalValue: 0,
      soldValue: 0,
      remainingValue: 0,
      categories: 0
    });

    // Beverage summary
    const beverageStats = beverages.reduce((acc, item) => {
      const priceData = beveragePrices.find(p => p.name === item.beverageName);
      const price = priceData?.price || 0;
      const totalValue = (item.totalCups || 0) * price;
      const soldValue = (item.soldCups || 0) * price;
      const remainingValue = (item.remainingCups || 0) * price;

      return {
        totalCups: acc.totalCups + (item.totalCups || 0),
        soldCups: acc.soldCups + (item.soldCups || 0),
        remainingCups: acc.remainingCups + (item.remainingCups || 0),
        totalValue: acc.totalValue + totalValue,
        soldValue: acc.soldValue + soldValue,
        remainingValue: acc.remainingValue + remainingValue,
        types: acc.types + 1
      };
    }, {
      totalCups: 0,
      soldCups: 0,
      remainingCups: 0,
      totalValue: 0,
      soldValue: 0,
      remainingValue: 0,
      types: 0
    });

    // Grand totals
    const grandTotal = {
      totalValue: bakeryStats.totalValue + beverageStats.totalValue,
      soldValue: bakeryStats.soldValue + beverageStats.soldValue,
      remainingValue: bakeryStats.remainingValue + beverageStats.remainingValue
    };

    return { bakeryStats, beverageStats, grandTotal };
  }, [inventory, beverages, beveragePrices]);

  // Cash balance calculations
  const cashBalance = useMemo(() => {
    const initial = parseFloat(initialCash) || 0;
    const final = parseFloat(finalCash) || 0;
    const sales = parseFloat(totalSales) || 0;
    const out = parseFloat(cashOut) || 0;
    
    const expected = initial + sales - out;
    const difference = final - expected;
    const isBalanced = Math.abs(difference) < 0.01;
    
    return {
      initial,
      final,
      sales,
      out,
      expected,
      difference,
      isBalanced
    };
  }, [initialCash, finalCash, totalSales, cashOut]);

  // Generate PDF function
  const downloadPDF = useCallback(async () => {
    try {
      addToast("Generating PDF...", "info");
      
      let doc;
      if (window.jsPDF) {
        doc = new window.jsPDF();
      } else if (typeof jsPDF !== 'undefined') {
        doc = new jsPDF();
      } else {
        throw new Error("jsPDF library not found");
      }

      // Header
      doc.setFontSize(20);
      doc.text("Mahajana Bakery - Daily Summary", 20, 20);
      
      doc.setFontSize(12);
      doc.text(`Date: ${selectedDate}`, 20, 30);
      doc.text(`Cashier: ${cashierName || 'Not specified'}`, 20, 40);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 50);

      let yPosition = 70;

      // Cash Balance Section
      doc.setFontSize(16);
      doc.text("Cash Balance Summary", 20, yPosition);
      yPosition += 10;
      
      doc.setFontSize(10);
      doc.text(`Initial Cash: Rs. ${cashBalance.initial.toFixed(2)}`, 20, yPosition);
      yPosition += 8;
      doc.text(`Total Sales: Rs. ${cashBalance.sales.toFixed(2)}`, 20, yPosition);
      yPosition += 8;
      doc.text(`Cash Out: Rs. ${cashBalance.out.toFixed(2)}`, 20, yPosition);
      yPosition += 8;
      doc.text(`Expected Final: Rs. ${cashBalance.expected.toFixed(2)}`, 20, yPosition);
      yPosition += 8;
      doc.text(`Actual Final: Rs. ${cashBalance.final.toFixed(2)}`, 20, yPosition);
      yPosition += 8;
      doc.text(`Difference: Rs. ${cashBalance.difference.toFixed(2)} (${cashBalance.isBalanced ? 'Balanced' : 'Unbalanced'})`, 20, yPosition);
      yPosition += 20;

      // Bakery Summary
      doc.setFontSize(16);
      doc.text("Bakery Items Summary", 20, yPosition);
      yPosition += 10;
      
      doc.setFontSize(10);
      doc.text(`Total Categories: ${summaryStats.bakeryStats.categories}`, 20, yPosition);
      yPosition += 8;
      doc.text(`Total Items: ${summaryStats.bakeryStats.totalItems}`, 20, yPosition);
      yPosition += 8;
      doc.text(`Sold Items: ${summaryStats.bakeryStats.soldItems}`, 20, yPosition);
      yPosition += 8;
      doc.text(`Remaining Items: ${summaryStats.bakeryStats.remainingItems}`, 20, yPosition);
      yPosition += 8;
      doc.text(`Total Value: Rs. ${summaryStats.bakeryStats.totalValue.toFixed(2)}`, 20, yPosition);
      yPosition += 8;
      doc.text(`Sold Value: Rs. ${summaryStats.bakeryStats.soldValue.toFixed(2)}`, 20, yPosition);
      yPosition += 8;
      doc.text(`Remaining Value: Rs. ${summaryStats.bakeryStats.remainingValue.toFixed(2)}`, 20, yPosition);
      yPosition += 20;

      // Beverage Summary
      doc.setFontSize(16);
      doc.text("Beverage Summary", 20, yPosition);
      yPosition += 10;
      
      doc.setFontSize(10);
      doc.text(`Total Types: ${summaryStats.beverageStats.types}`, 20, yPosition);
      yPosition += 8;
      doc.text(`Total Cups: ${summaryStats.beverageStats.totalCups}`, 20, yPosition);
      yPosition += 8;
      doc.text(`Sold Cups: ${summaryStats.beverageStats.soldCups}`, 20, yPosition);
      yPosition += 8;
      doc.text(`Remaining Cups: ${summaryStats.beverageStats.remainingCups}`, 20, yPosition);
      yPosition += 8;
      doc.text(`Total Value: Rs. ${summaryStats.beverageStats.totalValue.toFixed(2)}`, 20, yPosition);
      yPosition += 8;
      doc.text(`Sold Value: Rs. ${summaryStats.beverageStats.soldValue.toFixed(2)}`, 20, yPosition);
      yPosition += 8;
      doc.text(`Remaining Value: Rs. ${summaryStats.beverageStats.remainingValue.toFixed(2)}`, 20, yPosition);
      yPosition += 20;

      // Grand Total
      doc.setFontSize(16);
      doc.text("Grand Total Summary", 20, yPosition);
      yPosition += 10;
      
      doc.setFontSize(10);
      doc.text(`Combined Total Value: Rs. ${summaryStats.grandTotal.totalValue.toFixed(2)}`, 20, yPosition);
      yPosition += 8;
      doc.text(`Combined Sold Value: Rs. ${summaryStats.grandTotal.soldValue.toFixed(2)}`, 20, yPosition);
      yPosition += 8;
      doc.text(`Combined Remaining Value: Rs. ${summaryStats.grandTotal.remainingValue.toFixed(2)}`, 20, yPosition);

      // Notes
      if (notes.trim()) {
        yPosition += 20;
        doc.setFontSize(16);
        doc.text("Notes", 20, yPosition);
        yPosition += 10;
        
        doc.setFontSize(10);
        const noteLines = doc.splitTextToSize(notes, 170);
        doc.text(noteLines, 20, yPosition);
      }

      const fileName = `mahajana_bakery_summary_${selectedDate}.pdf`;
      doc.save(fileName);
      
      addToast(`PDF downloaded: ${fileName}`, "success");
    } catch (error) {
      console.error("Error generating PDF:", error);
      addToast("Error generating PDF: " + error.message, "error");
    }
  }, [selectedDate, cashierName, cashBalance, summaryStats, notes, addToast]);

  return (
    <div className={`min-h-screen relative transition-colors duration-300 ${
      isDarkMode 
        ? "bg-gradient-to-br from-primary-900 via-secondary-900 to-accent-900 text-white" 
        : "bg-gradient-to-br from-primary-50 via-secondary-50 to-accent-50 text-gray-900"
    }`}>
      {/* Modern geometric background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Animated particles */}
        <div className="absolute inset-0">
          {[...Array(15)].map((_, i) => (
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

      {/* Toast notifications */}
      {toasts.map((toast, index) => (
        <Toast
          key={toast.id}
          toast={{...toast, index}}
          onRemove={removeToast}
          isDarkMode={isDarkMode}
        />
      ))}

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
            <span className="relative z-10 text-2xl font-bold text-white animate-pulse">📊</span>
          </div>
          <div>
            <h2 className={`font-bold text-xl transition-colors duration-300 ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}>
              Daily Summary
            </h2>
            <p className={`text-sm transition-colors duration-300 ${
              isDarkMode ? "text-primary-200" : "text-secondary-600"
            }`}>
              Dashboard & Reporting
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 animate-slideInRight">
          <button
            type="button"
            onClick={() => setIsDarkMode(!isDarkMode)}
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

          <button
            type="button"
            onClick={() => navigate("/selection")}
            className={`group relative px-6 py-3 text-sm font-semibold rounded-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 focus:outline-none focus:ring-4 active:scale-95 overflow-hidden ${
              isDarkMode
                ? "bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-500 hover:to-secondary-500 text-white shadow-2xl focus:ring-primary-500/50"
                : "bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white shadow-2xl focus:ring-primary-400/50"
            }`}
            aria-label="Back to inventory management"
          >
            <div className="absolute inset-0 bg-white/20 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500 group-hover:animate-shimmer"></div>
            <span className="relative z-10 flex items-center gap-2">
              <span className="transition-transform duration-500 group-hover:-translate-x-1">📦</span>
              <span>Back to Inventory</span>
            </span>
          </button>
        </div>
      </header>

      {/* Main content container */}
      <div className="relative z-10 container mx-auto px-6 pb-16 max-w-7xl">

        {/* Date Navigation Card */}
        <div className={`backdrop-blur-md rounded-3xl shadow-2xl border p-8 mb-8 transition-all duration-300 animate-fadeInUp ${
          isDarkMode
            ? "bg-white/5 border-white/10 shadow-primary-900/50"
            : "bg-white/70 border-white/50 shadow-primary-900/20"
        }`}
        style={{ animationDelay: "0.2s" }}>
          <h2 className={`text-2xl font-bold mb-6 flex items-center gap-3 ${
            isDarkMode ? "text-white" : "text-gray-900"
          }`}>
            📅 Date Selection
            <span className={`text-sm font-normal px-3 py-1 rounded-full ${
              isDarkMode ? "bg-primary-800/40 text-primary-200" : "bg-primary-200/60 text-primary-700"
            }`}>
              {selectedDate}
            </span>
          </h2>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigateDate(-1)}
                className={`p-3 rounded-2xl transition-all duration-300 hover:scale-110 hover:-translate-y-1 ${
                  isDarkMode
                    ? "bg-white/10 hover:bg-white/20 text-white border border-white/20"
                    : "bg-white/80 hover:bg-white text-gray-700 border border-gray-200 shadow-lg"
                }`}
                title="Previous day"
              >
                ←
              </button>
              
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className={`border rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm ${
                  isDarkMode
                    ? "bg-white/10 border-white/20 text-white placeholder-white/50"
                    : "bg-white/80 border-gray-200 text-gray-700"
                }`}
              />
              
              <button
                onClick={() => navigateDate(1)}
                className={`p-3 rounded-2xl transition-all duration-300 hover:scale-110 hover:-translate-y-1 ${
                  isDarkMode
                    ? "bg-white/10 hover:bg-white/20 text-white border border-white/20"
                    : "bg-white/80 hover:bg-white text-gray-700 border border-gray-200 shadow-lg"
                }`}
                title="Next day"
              >
                →
              </button>
            </div>

            <button
              onClick={fetchData}
              disabled={loading}
              className={`px-6 py-3 rounded-2xl transition-all duration-300 font-medium transform hover:scale-105 ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : isDarkMode
                  ? "bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-500 hover:to-secondary-500 text-white shadow-xl"
                  : "bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white shadow-xl"
              }`}
            >
              {loading ? "🔄 Loading..." : "🔄 Refresh Data"}
            </button>
          </div>
        </div>

        {/* Cash Balance Section */}
        <section className={`backdrop-blur-sm rounded-lg shadow-lg border-2 p-6 mb-6 transition-colors duration-300 ${
          isDarkMode
            ? "bg-gradient-to-br from-green-900/40 to-emerald-900/40 border-green-600/30"
            : "bg-gradient-to-br from-green-50/90 to-emerald-50/90 border-green-300/30"
        }`}>
          <h2 className={`text-xl font-bold mb-4 flex items-center gap-3 ${
            isDarkMode ? "text-green-300" : "text-green-800"
          }`}>
            💰 Cash Balance Management
            <span className={`text-sm font-normal px-2 py-1 rounded-full ${
              isDarkMode ? "bg-green-800/40 text-green-200" : "bg-green-200/60 text-green-700"
            }`}>
              Daily Summary
            </span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            <div className={`p-4 rounded-lg border ${
              isDarkMode 
                ? "bg-gray-800/60 border-gray-600/40" 
                : "bg-white/80 border-gray-200/40"
            }`}>
              <label htmlFor="cashier-name" className={`block text-sm font-semibold mb-2 ${
                isDarkMode ? "text-green-300" : "text-green-700"
              }`}>
                👤 Cashier Name:
              </label>
              <input
                id="cashier-name"
                type="text"
                value={cashierName}
                onChange={(e) => {
                  setCashierName(e.target.value);
                  localStorage.setItem("cashierName", e.target.value);
                }}
                className={`w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-sm ${
                  isDarkMode
                    ? "bg-slate-800 border-slate-600 text-slate-200"
                    : "bg-white border-slate-300 text-slate-700"
                }`}
                placeholder="Enter name"
              />
            </div>

            <div className={`p-4 rounded-lg border ${
              isDarkMode 
                ? "bg-gray-800/60 border-gray-600/40" 
                : "bg-white/80 border-gray-200/40"
            }`}>
              <label htmlFor="initial-cash" className={`block text-sm font-semibold mb-2 ${
                isDarkMode ? "text-green-300" : "text-green-700"
              }`}>
                🏦 Initial Cash:
              </label>
              <input
                id="initial-cash"
                type="number"
                step="0.01"
                value={initialCash}
                onChange={(e) => setInitialCash(e.target.value)}
                className={`w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-sm ${
                  isDarkMode
                    ? "bg-slate-800 border-slate-600 text-slate-200"
                    : "bg-white border-slate-300 text-slate-700"
                }`}
                placeholder="0.00"
              />
            </div>

            <div className={`p-4 rounded-lg border ${
              isDarkMode 
                ? "bg-gray-800/60 border-gray-600/40" 
                : "bg-white/80 border-gray-200/40"
            }`}>
              <label htmlFor="total-sales" className={`block text-sm font-semibold mb-2 ${
                isDarkMode ? "text-green-300" : "text-green-700"
              }`}>
                💵 Total Sales:
              </label>
              <input
                id="total-sales"
                type="number"
                step="0.01"
                value={totalSales}
                onChange={(e) => setTotalSales(e.target.value)}
                className={`w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-sm ${
                  isDarkMode
                    ? "bg-slate-800 border-slate-600 text-slate-200"
                    : "bg-white border-slate-300 text-slate-700"
                }`}
                placeholder="0.00"
              />
            </div>

            <div className={`p-4 rounded-lg border ${
              isDarkMode 
                ? "bg-gray-800/60 border-gray-600/40" 
                : "bg-white/80 border-gray-200/40"
            }`}>
              <label htmlFor="cash-out" className={`block text-sm font-semibold mb-2 ${
                isDarkMode ? "text-green-300" : "text-green-700"
              }`}>
                💸 Cash Out:
              </label>
              <input
                id="cash-out"
                type="number"
                step="0.01"
                value={cashOut}
                onChange={(e) => setCashOut(e.target.value)}
                className={`w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-sm ${
                  isDarkMode
                    ? "bg-slate-800 border-slate-600 text-slate-200"
                    : "bg-white border-slate-300 text-slate-700"
                }`}
                placeholder="0.00"
              />
            </div>

            <div className={`p-4 rounded-lg border ${
              isDarkMode 
                ? "bg-gray-800/60 border-gray-600/40" 
                : "bg-white/80 border-gray-200/40"
            }`}>
              <label htmlFor="final-cash" className={`block text-sm font-semibold mb-2 ${
                isDarkMode ? "text-green-300" : "text-green-700"
              }`}>
                🏪 Final Cash:
              </label>
              <input
                id="final-cash"
                type="number"
                step="0.01"
                value={finalCash}
                onChange={(e) => setFinalCash(e.target.value)}
                className={`w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-sm ${
                  isDarkMode
                    ? "bg-slate-800 border-slate-600 text-slate-200"
                    : "bg-white border-slate-300 text-slate-700"
                }`}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Cash Balance Equation */}
          <div className={`p-4 rounded-lg border-2 ${
            cashBalance.isBalanced
              ? isDarkMode
                ? "bg-green-900/30 border-green-600/50"
                : "bg-green-50/70 border-green-300/50"
              : isDarkMode
                ? "bg-red-900/30 border-red-600/50"
                : "bg-red-50/70 border-red-300/50"
          }`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className={`font-semibold ${
                isDarkMode ? "text-slate-200" : "text-slate-800"
              }`}>
                💰 Cash Balance Equation
              </h3>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                cashBalance.isBalanced
                  ? isDarkMode
                    ? "bg-green-700/40 text-green-200"
                    : "bg-green-200/60 text-green-700"
                  : isDarkMode
                    ? "bg-red-700/40 text-red-200"
                    : "bg-red-200/60 text-red-700"
              }`}>
                {cashBalance.isBalanced ? "✅ Balanced" : "❌ Unbalanced"}
              </span>
            </div>
            
            <div className={`text-sm space-y-1 ${
              isDarkMode ? "text-slate-300" : "text-slate-600"
            }`}>
              <div>Expected Final = Initial + Sales - Cash Out</div>
              <div>Expected Final = {cashBalance.initial.toFixed(2)} + {cashBalance.sales.toFixed(2)} - {cashBalance.out.toFixed(2)} = <strong>Rs. {cashBalance.expected.toFixed(2)}</strong></div>
              <div>Actual Final = <strong>Rs. {cashBalance.final.toFixed(2)}</strong></div>
              <div className={`font-medium ${
                cashBalance.isBalanced
                  ? isDarkMode ? "text-green-300" : "text-green-700"
                  : isDarkMode ? "text-red-300" : "text-red-700"
              }`}>
                Difference = Rs. {cashBalance.difference.toFixed(2)} {cashBalance.difference > 0 ? "(Surplus)" : cashBalance.difference < 0 ? "(Deficit)" : "(Perfect)"}
              </div>
            </div>
          </div>
        </section>

        {/* Summary Statistics */}
        <section className={`backdrop-blur-sm rounded-lg shadow-lg border-2 p-6 mb-6 transition-colors duration-300 ${
          isDarkMode
            ? "bg-gradient-to-br from-accent-900/40 to-secondary-900/40 border-accent-600/30"
            : "bg-gradient-to-br from-accent-50/90 to-secondary-50/90 border-accent-300/30"
        }`}>
          <h2 className={`text-xl font-bold mb-6 flex items-center gap-3 ${
            isDarkMode ? "text-accent-300" : "text-accent-800"
          }`}>
            📈 Summary Statistics
            <span className={`text-sm font-normal px-2 py-1 rounded-full ${
              isDarkMode ? "bg-accent-800/40 text-accent-200" : "bg-accent-200/60 text-accent-700"
            }`}>
              {selectedDate}
            </span>
          </h2>

          {/* Bakery Items Summary */}
          <div className={`p-5 rounded-lg border mb-6 ${
            isDarkMode 
              ? "bg-orange-900/20 border-orange-700/40" 
              : "bg-orange-50/60 border-orange-200/40"
          }`}>
            <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
              isDarkMode ? "text-orange-300" : "text-orange-800"
            }`}>
              🥖 Bakery Items Summary
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              <div className={`text-center p-3 rounded-md ${
                isDarkMode ? "bg-slate-800/40" : "bg-white/60"
              }`}>
                <div className={`text-2xl font-bold ${
                  isDarkMode ? "text-orange-300" : "text-orange-600"
                }`}>
                  {summaryStats.bakeryStats.categories}
                </div>
                <div className={`text-xs ${
                  isDarkMode ? "text-slate-400" : "text-slate-600"
                }`}>
                  Categories
                </div>
              </div>
              
              <div className={`text-center p-3 rounded-md ${
                isDarkMode ? "bg-slate-800/40" : "bg-white/60"
              }`}>
                <div className={`text-2xl font-bold ${
                  isDarkMode ? "text-primary-300" : "text-primary-600"
                }`}>
                  {summaryStats.bakeryStats.totalItems}
                </div>
                <div className={`text-xs ${
                  isDarkMode ? "text-slate-400" : "text-slate-600"
                }`}>
                  Total Items
                </div>
              </div>
              
              <div className={`text-center p-3 rounded-md ${
                isDarkMode ? "bg-slate-800/40" : "bg-white/60"
              }`}>
                <div className={`text-2xl font-bold ${
                  isDarkMode ? "text-green-300" : "text-green-600"
                }`}>
                  {summaryStats.bakeryStats.soldItems}
                </div>
                <div className={`text-xs ${
                  isDarkMode ? "text-slate-400" : "text-slate-600"
                }`}>
                  Sold Items
                </div>
              </div>
              
              <div className={`text-center p-3 rounded-md ${
                isDarkMode ? "bg-slate-800/40" : "bg-white/60"
              }`}>
                <div className={`text-2xl font-bold ${
                  isDarkMode ? "text-yellow-300" : "text-yellow-600"
                }`}>
                  {summaryStats.bakeryStats.remainingItems}
                </div>
                <div className={`text-xs ${
                  isDarkMode ? "text-slate-400" : "text-slate-600"
                }`}>
                  Remaining
                </div>
              </div>
              
              <div className={`text-center p-3 rounded-md ${
                isDarkMode ? "bg-slate-800/40" : "bg-white/60"
              }`}>
                <div className={`text-lg font-bold ${
                  isDarkMode ? "text-primary-300" : "text-primary-600"
                }`}>
                  Rs. {summaryStats.bakeryStats.totalValue.toFixed(2)}
                </div>
                <div className={`text-xs ${
                  isDarkMode ? "text-slate-400" : "text-slate-600"
                }`}>
                  Total Value
                </div>
              </div>
              
              <div className={`text-center p-3 rounded-md ${
                isDarkMode ? "bg-slate-800/40" : "bg-white/60"
              }`}>
                <div className={`text-lg font-bold ${
                  isDarkMode ? "text-green-300" : "text-green-600"
                }`}>
                  Rs. {summaryStats.bakeryStats.soldValue.toFixed(2)}
                </div>
                <div className={`text-xs ${
                  isDarkMode ? "text-slate-400" : "text-slate-600"
                }`}>
                  Sold Value
                </div>
              </div>
              
              <div className={`text-center p-3 rounded-md ${
                isDarkMode ? "bg-slate-800/40" : "bg-white/60"
              }`}>
                <div className={`text-lg font-bold ${
                  isDarkMode ? "text-yellow-300" : "text-yellow-600"
                }`}>
                  Rs. {summaryStats.bakeryStats.remainingValue.toFixed(2)}
                </div>
                <div className={`text-xs ${
                  isDarkMode ? "text-slate-400" : "text-slate-600"
                }`}>
                  Remaining Value
                </div>
              </div>
            </div>
          </div>

          {/* Beverage Summary */}
          <div className={`p-5 rounded-lg border mb-6 ${
            isDarkMode 
              ? "bg-teal-900/20 border-teal-700/40" 
              : "bg-teal-50/60 border-teal-200/40"
          }`}>
            <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
              isDarkMode ? "text-teal-300" : "text-teal-800"
            }`}>
              ☕ Beverage Summary
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              <div className={`text-center p-3 rounded-md ${
                isDarkMode ? "bg-slate-800/40" : "bg-white/60"
              }`}>
                <div className={`text-2xl font-bold ${
                  isDarkMode ? "text-teal-300" : "text-teal-600"
                }`}>
                  {summaryStats.beverageStats.types}
                </div>
                <div className={`text-xs ${
                  isDarkMode ? "text-slate-400" : "text-slate-600"
                }`}>
                  Types
                </div>
              </div>
              
              <div className={`text-center p-3 rounded-md ${
                isDarkMode ? "bg-slate-800/40" : "bg-white/60"
              }`}>
                <div className={`text-2xl font-bold ${
                  isDarkMode ? "text-primary-300" : "text-primary-600"
                }`}>
                  {summaryStats.beverageStats.totalCups}
                </div>
                <div className={`text-xs ${
                  isDarkMode ? "text-slate-400" : "text-slate-600"
                }`}>
                  Total Cups
                </div>
              </div>
              
              <div className={`text-center p-3 rounded-md ${
                isDarkMode ? "bg-slate-800/40" : "bg-white/60"
              }`}>
                <div className={`text-2xl font-bold ${
                  isDarkMode ? "text-green-300" : "text-green-600"
                }`}>
                  {summaryStats.beverageStats.soldCups}
                </div>
                <div className={`text-xs ${
                  isDarkMode ? "text-slate-400" : "text-slate-600"
                }`}>
                  Sold Cups
                </div>
              </div>
              
              <div className={`text-center p-3 rounded-md ${
                isDarkMode ? "bg-slate-800/40" : "bg-white/60"
              }`}>
                <div className={`text-2xl font-bold ${
                  isDarkMode ? "text-yellow-300" : "text-yellow-600"
                }`}>
                  {summaryStats.beverageStats.remainingCups}
                </div>
                <div className={`text-xs ${
                  isDarkMode ? "text-slate-400" : "text-slate-600"
                }`}>
                  Remaining
                </div>
              </div>
              
              <div className={`text-center p-3 rounded-md ${
                isDarkMode ? "bg-slate-800/40" : "bg-white/60"
              }`}>
                <div className={`text-lg font-bold ${
                  isDarkMode ? "text-primary-300" : "text-primary-600"
                }`}>
                  Rs. {summaryStats.beverageStats.totalValue.toFixed(2)}
                </div>
                <div className={`text-xs ${
                  isDarkMode ? "text-slate-400" : "text-slate-600"
                }`}>
                  Total Value
                </div>
              </div>
              
              <div className={`text-center p-3 rounded-md ${
                isDarkMode ? "bg-slate-800/40" : "bg-white/60"
              }`}>
                <div className={`text-lg font-bold ${
                  isDarkMode ? "text-green-300" : "text-green-600"
                }`}>
                  Rs. {summaryStats.beverageStats.soldValue.toFixed(2)}
                </div>
                <div className={`text-xs ${
                  isDarkMode ? "text-slate-400" : "text-slate-600"
                }`}>
                  Sold Value
                </div>
              </div>
              
              <div className={`text-center p-3 rounded-md ${
                isDarkMode ? "bg-slate-800/40" : "bg-white/60"
              }`}>
                <div className={`text-lg font-bold ${
                  isDarkMode ? "text-yellow-300" : "text-yellow-600"
                }`}>
                  Rs. {summaryStats.beverageStats.remainingValue.toFixed(2)}
                </div>
                <div className={`text-xs ${
                  isDarkMode ? "text-slate-400" : "text-slate-600"
                }`}>
                  Remaining Value
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Grand Total Summary */}
        <section className={`backdrop-blur-sm rounded-lg shadow-lg border-2 p-6 mb-6 transition-colors duration-300 ${
          isDarkMode
            ? "bg-gradient-to-br from-emerald-900/40 to-green-900/40 border-emerald-600/30"
            : "bg-gradient-to-br from-emerald-50/90 to-green-50/90 border-emerald-300/30"
        }`}>
          <h2 className={`text-xl font-bold mb-6 flex items-center gap-3 ${
            isDarkMode ? "text-emerald-300" : "text-emerald-800"
          }`}>
            🏆 Grand Total Summary
            <span className={`text-sm font-normal px-2 py-1 rounded-full ${
              isDarkMode ? "bg-emerald-800/40 text-emerald-200" : "bg-emerald-200/60 text-emerald-700"
            }`}>
              Combined Overview
            </span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`p-6 rounded-lg border-2 text-center ${
              isDarkMode 
                ? "bg-blue-900/30 border-blue-700/50" 
                : "bg-blue-50/60 border-blue-200/50"
            }`}>
              <div className={`text-3xl font-bold mb-2 ${
                isDarkMode ? "text-primary-300" : "text-primary-600"
              }`}>
                Rs. {summaryStats.grandTotal.totalValue.toFixed(2)}
              </div>
              <div className={`text-sm font-medium ${
                isDarkMode ? "text-primary-200" : "text-primary-700"
              }`}>
                💼 Total Inventory Value
              </div>
              <div className={`text-xs mt-1 ${
                isDarkMode ? "text-slate-400" : "text-slate-600"
              }`}>
                Bakery + Beverages
              </div>
            </div>

            <div className={`p-6 rounded-lg border-2 text-center ${
              isDarkMode 
                ? "bg-green-900/30 border-green-700/50" 
                : "bg-green-50/60 border-green-200/50"
            }`}>
              <div className={`text-3xl font-bold mb-2 ${
                isDarkMode ? "text-green-300" : "text-green-600"
              }`}>
                Rs. {summaryStats.grandTotal.soldValue.toFixed(2)}
              </div>
              <div className={`text-sm font-medium ${
                isDarkMode ? "text-green-200" : "text-green-700"
              }`}>
                💰 Total Sales Value
              </div>
              <div className={`text-xs mt-1 ${
                isDarkMode ? "text-slate-400" : "text-slate-600"
              }`}>
                Revenue Generated
              </div>
            </div>

            <div className={`p-6 rounded-lg border-2 text-center ${
              isDarkMode 
                ? "bg-yellow-900/30 border-yellow-700/50" 
                : "bg-yellow-50/60 border-yellow-200/50"
            }`}>
              <div className={`text-3xl font-bold mb-2 ${
                isDarkMode ? "text-yellow-300" : "text-yellow-600"
              }`}>
                Rs. {summaryStats.grandTotal.remainingValue.toFixed(2)}
              </div>
              <div className={`text-sm font-medium ${
                isDarkMode ? "text-yellow-200" : "text-yellow-700"
              }`}>
                📦 Remaining Value
              </div>
              <div className={`text-xs mt-1 ${
                isDarkMode ? "text-slate-400" : "text-slate-600"
              }`}>
                Unsold Inventory
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className={`mt-6 p-4 rounded-lg border ${
            isDarkMode 
              ? "bg-slate-800/40 border-slate-600/40" 
              : "bg-white/60 border-slate-200/40"
          }`}>
            <h3 className={`font-semibold mb-3 ${
              isDarkMode ? "text-slate-200" : "text-slate-800"
            }`}>
              📊 Performance Metrics
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <div className={`text-xl font-bold ${
                  isDarkMode ? "text-emerald-300" : "text-emerald-600"
                }`}>
                  {summaryStats.grandTotal.totalValue > 0 
                    ? ((summaryStats.grandTotal.soldValue / summaryStats.grandTotal.totalValue) * 100).toFixed(1)
                    : 0}%
                </div>
                <div className={`text-xs ${
                  isDarkMode ? "text-slate-400" : "text-slate-600"
                }`}>
                  Sales Rate
                </div>
              </div>
              
              <div className="text-center">
                <div className={`text-xl font-bold ${
                  isDarkMode ? "text-blue-300" : "text-blue-600"
                }`}>
                  Rs. {(summaryStats.bakeryStats.soldItems + summaryStats.beverageStats.soldCups > 0 
                    ? summaryStats.grandTotal.soldValue / (summaryStats.bakeryStats.soldItems + summaryStats.beverageStats.soldCups)
                    : 0).toFixed(2)}
                </div>
                <div className={`text-xs ${
                  isDarkMode ? "text-slate-400" : "text-slate-600"
                }`}>
                  Avg Price/Unit
                </div>
              </div>
              
              <div className="text-center">
                <div className={`text-xl font-bold ${
                  isDarkMode ? "text-purple-300" : "text-purple-600"
                }`}>
                  {summaryStats.bakeryStats.categories + summaryStats.beverageStats.types}
                </div>
                <div className={`text-xs ${
                  isDarkMode ? "text-slate-400" : "text-slate-600"
                }`}>
                  Total Items
                </div>
              </div>
              
              <div className="text-center">
                <div className={`text-xl font-bold ${
                  isDarkMode ? "text-orange-300" : "text-orange-600"
                }`}>
                  {summaryStats.bakeryStats.soldItems + summaryStats.beverageStats.soldCups}
                </div>
                <div className={`text-xs ${
                  isDarkMode ? "text-slate-400" : "text-slate-600"
                }`}>
                  Units Sold
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Notes Section */}
        <section className={`backdrop-blur-sm rounded-lg shadow-lg border-2 p-6 mb-6 transition-colors duration-300 ${
          isDarkMode
            ? "bg-gradient-to-br from-slate-800/60 to-slate-700/60 border-slate-600/30"
            : "bg-gradient-to-br from-slate-50/90 to-gray-50/90 border-slate-300/30"
        }`}>
          <h2 className={`text-xl font-bold mb-4 flex items-center gap-3 ${
            isDarkMode ? "text-slate-200" : "text-slate-800"
          }`}>
            📝 Daily Notes
          </h2>
          
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 ${
              isDarkMode
                ? "bg-slate-800 border-slate-600 text-slate-200"
                : "bg-white border-slate-300 text-slate-700"
            }`}
            placeholder="Add daily notes, observations, or important information..."
            rows="4"
          />
        </section>

        {/* Actions Section */}
        <section className={`backdrop-blur-sm rounded-lg shadow-lg border-2 p-6 mb-6 transition-colors duration-300 ${
          isDarkMode
            ? "bg-gradient-to-br from-secondary-900/40 to-primary-900/40 border-secondary-600/30"
            : "bg-gradient-to-br from-secondary-50/90 to-primary-50/90 border-secondary-300/30"
        }`}>
          <h2 className={`text-xl font-bold mb-6 flex items-center gap-3 ${
            isDarkMode ? "text-secondary-300" : "text-secondary-800"
          }`}>
            🎯 Actions
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              onClick={downloadPDF}
              className="flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              📄 Download PDF Report
            </button>

            <button
              onClick={() => navigate("/inventory")}
              className="flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              📦 Manage Inventory
            </button>

            <button
              onClick={() => navigate("/price-management")}
              className="flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-accent-600 to-accent-700 hover:from-accent-700 hover:to-accent-800 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              💲 Price Management
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
