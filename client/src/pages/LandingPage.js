import React from 'react';
import { Link } from 'react-router-dom';

// Boxicons are imported via CSS in index.css
// Usage: <i className="bx bx-icon-name"></i>
// For solid icons: <i className="bx bxs-icon-name"></i>
// For logos: <i className="bx bxl-icon-name"></i>

const LandingPage = () => {
  const serviceCategories = [
    {
      name: 'Accounts',
      icon: 'bx bx-user',
      link: '/products?category=accounts'
    },
    {
      name: 'Boosting',
      icon: 'bx bx-trending-up',
      link: '/products?category=boosting'
    },
    {
      name: 'Items',
      icon: 'bx bx-package',
      link: '/products?category=items'
    },
    {
      name: 'Currencies',
      icon: 'bx bx-credit-card',
      link: '/products?category=currency'
    },
    {
      name: 'Top Ups',
      icon: 'bx bx-gift',
      link: '/products?category=topups'
    },
    {
      name: 'Buddy',
      icon: 'bx bx-heart',
      link: '/products?category=buddy'
    },
    {
      name: 'CS2 Skins',
      icon: 'bx bx-shield',
      link: '/products?category=skins',
      badge: true
    },
    {
      name: 'Game Keys',
      icon: 'bx bx-key',
      link: '/products?category=keys'
    }
  ];

  const popularGames = [
    { name: 'FORTNITE', icon: 'bx bx-game', badge: null },
    { name: 'GROW A GARDEN', icon: 'bx bx-leaf', badge: 'New' },
    { name: 'CLASH of CLANS', icon: 'bx bx-crown', badge: null },
    { name: 'VALORANT', icon: 'bx bx-target-lock', badge: null },
    { name: 'CLASH ROYALE', icon: 'bx bx-chess', badge: null },
    { name: 'CS2', icon: 'bx bx-shield', badge: null }
  ];

  const features = [
    {
      icon: 'bx bx-shield-check',
      title: 'Secure Escrow System',
      description: 'Your money is protected until you receive your purchase. No scams, no worries.'
    },
    {
      icon: 'bx bx-bolt',
      title: 'Instant Delivery',
      description: 'Most items are delivered instantly after payment confirmation.'
    },
    {
      icon: 'bx bx-group',
      title: 'Verified Sellers',
      description: 'All sellers are verified and rated by the community for your safety.'
    },
    {
      icon: 'bx bx-star',
      title: 'Quality Guarantee',
      description: 'We ensure all products meet our quality standards before listing.'
    }
  ];

  const stats = [
    { number: '50,000+', label: 'Active Users', icon: 'bx bx-user-check' },
    { number: '100,000+', label: 'Successful Trades', icon: 'bx bx-check-circle' },
    { number: '4.9/5', label: 'Average Rating', icon: 'bx bx-star' },
    { number: '24/7', label: 'Support', icon: 'bx bx-support' }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative text-white overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 min-h-screen -mt-16 pt-16">
        {/* Modern Background with Animated Gradients */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-transparent to-blue-500/10"></div>
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-purple-500/5 to-transparent"></div>
          <div className="absolute inset-0 opacity-20">
            <div className="w-full h-full" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffb31f' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}></div>
          </div>
          {/* Floating Elements */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-32 pb-24">
          <div className="text-center">
            {/* Main Heading with Modern Typography */}
            <div className="mb-10">
              <div className="inline-block mb-4">
                <span className="bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent text-xs font-semibold tracking-wider uppercase">
                  Premium Gaming Marketplace
                </span>
              </div>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
                <span className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                  The All-In-One
                </span>
                <span className="block bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600 bg-clip-text text-transparent mt-1">
                  Platform for Gamers
                </span>
              </h1>
              <div className="flex items-center justify-center space-x-3 mb-6">
                <div className="w-12 h-1 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full"></div>
                <div className="w-1.5 h-1.5 bg-primary-500 rounded-full"></div>
                <div className="w-12 h-1 bg-gradient-to-r from-primary-600 to-primary-500 rounded-full"></div>
              </div>
            </div>
            
            {/* Enhanced Subtitle */}
            <p className="text-lg md:text-xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed font-light">
              <span className="text-white font-medium">High-Quality Accounts</span> · 
              <span className="text-primary-400 font-medium"> Premium Gaming Services</span> · 
              <span className="text-blue-400 font-medium"> In-Game Currencies</span>
            </p>
            
            {/* Modern Search Bar */}
            <div className="max-w-2xl mx-auto mb-16">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-blue-500/20 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-500"></div>
                <div className="relative">
                  <i className="bx bx-search absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg group-focus-within:text-primary-400 transition-all duration-300"></i>
                  <input
                    type="text"
                    placeholder="Search for games, services, or accounts..."
                    className="w-full pl-12 pr-24 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400/50 text-lg shadow-xl transition-all duration-500 hover:bg-white/15 hover:border-white/30"
                  />
                  <button className="absolute right-1.5 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white px-6 py-2 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105">
                    Search
                  </button>
                </div>
              </div>
            </div>

            {/* Enhanced Service Categories */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 max-w-6xl mx-auto">
              {serviceCategories.map((service, index) => (
                <Link
                  key={index}
                  to={service.link}
                  className="group relative"
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-blue-500/10 rounded-2xl blur-md group-hover:blur-lg transition-all duration-500"></div>
                    <div className="relative bg-white/10 backdrop-blur-xl hover:bg-white/15 rounded-2xl p-4 transition-all duration-500 border border-white/20 hover:border-primary-400/40 hover:shadow-xl hover:shadow-primary-500/20 hover:-translate-y-1">
                      <div className="flex flex-col items-center space-y-3">
                        <div className="relative">
                          <div className="w-12 h-12 bg-gradient-to-br from-primary-500/20 to-primary-600/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-all duration-300">
                            <i className={`${service.icon} text-2xl text-primary-400 group-hover:text-primary-300 transition-colors duration-300`}></i>
                          </div>
                          {service.badge && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                              <span className="text-xs text-white font-bold">!</span>
                            </div>
                          )}
                        </div>
                        <span className="text-xs text-white font-semibold text-center leading-tight group-hover:text-primary-200 transition-colors duration-300">
                          {service.name}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Popular Games Section */}
      <section className="py-32 relative">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-800/20 to-transparent"></div>
        
        <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-16">
            <div className="inline-block mb-4">
              <span className="bg-gradient-to-r from-primary-400 to-blue-400 bg-clip-text text-transparent text-xs font-semibold tracking-wider uppercase">
                Trending Now
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 tracking-tight">
              <span className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                Popular Games
              </span>
            </h2>
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-8 h-1 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full"></div>
              <div className="w-1.5 h-1.5 bg-primary-500 rounded-full"></div>
              <div className="w-8 h-1 bg-gradient-to-r from-primary-600 to-primary-500 rounded-full"></div>
            </div>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto font-light leading-relaxed">
              Discover the most sought-after gaming accounts and services from our 
              <span className="text-primary-400 font-medium"> premium collection</span>
            </p>
          </div>
          
          <div className="flex space-x-4 overflow-x-auto pb-6 scrollbar-hide">
            {popularGames.map((game, index) => (
              <div key={index} className="flex-shrink-0 relative group">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-blue-500/20 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-500"></div>
                  <div className="relative w-40 h-40 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 hover:border-primary-400/40 transition-all duration-500 cursor-pointer group-hover:shadow-xl group-hover:shadow-primary-500/30 group-hover:-translate-y-2">
                    <div className="w-full h-full flex items-center justify-center p-6">
                      <div className="text-center">
                        <div className="w-14 h-14 bg-gradient-to-br from-primary-500/20 to-primary-600/20 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-all duration-300">
                          <i className={`${game.icon} text-primary-400 text-2xl group-hover:text-primary-300 transition-colors duration-300`}></i>
                        </div>
                        <span className="text-xs text-white font-semibold leading-tight group-hover:text-primary-200 transition-colors duration-300">
                          {game.name}
                        </span>
                      </div>
                    </div>
                  </div>
                  {game.badge && (
                    <div className="absolute -top-2 -right-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-xs px-2 py-1 rounded-full font-bold border border-primary-400/30 shadow-lg animate-pulse">
                      {game.badge}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-32 relative">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-800/10 to-transparent"></div>
        
        <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-16">
            <div className="inline-block mb-4">
              <span className="bg-gradient-to-r from-blue-400 to-primary-400 bg-clip-text text-transparent text-xs font-semibold tracking-wider uppercase">
                Simple Process
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 tracking-tight">
              <span className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                Fast And Easy
              </span>
            </h2>
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-8 h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"></div>
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
              <div className="w-8 h-1 bg-gradient-to-r from-blue-600 to-blue-500 rounded-full"></div>
            </div>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto font-light leading-relaxed">
              Buying/selling, accounts and boosting has never been this easy. Just 
              <span className="text-blue-400 font-medium"> select your service</span>, 
              <span className="text-primary-400 font-medium"> make a payment</span> and 
              <span className="text-green-400 font-medium"> enjoy!</span>
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Process Steps */}
            <div className="space-y-8">
              <div className="flex items-start space-x-6 group">
                <div className="flex-shrink-0">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-2xl blur-md group-hover:blur-lg transition-all duration-500"></div>
                    <div className="relative w-16 h-16 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/20 group-hover:border-blue-400/40 transition-all duration-500">
                      <i className="bx bx-check text-2xl text-blue-400 group-hover:text-blue-300 transition-colors duration-300"></i>
                    </div>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors duration-300">Select Service</h3>
                  <p className="text-gray-300 font-light leading-relaxed">Choose from our wide range of gaming services and products</p>
                </div>
              </div>

              <div className="flex items-start space-x-6 group">
                <div className="flex-shrink-0">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-primary-600/20 rounded-2xl blur-md group-hover:blur-lg transition-all duration-500"></div>
                    <div className="relative w-16 h-16 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/20 group-hover:border-primary-400/40 transition-all duration-500">
                      <i className="bx bx-credit-card text-2xl text-primary-400 group-hover:text-primary-300 transition-colors duration-300"></i>
                    </div>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-primary-400 transition-colors duration-300">Secure Payment</h3>
                  <p className="text-gray-300 font-light leading-relaxed">Complete your purchase with our secure payment system</p>
                </div>
              </div>

              <div className="flex items-start space-x-6 group">
                <div className="flex-shrink-0">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-2xl blur-md group-hover:blur-lg transition-all duration-500"></div>
                    <div className="relative w-16 h-16 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/20 group-hover:border-green-400/40 transition-all duration-500">
                      <i className="bx bx-rocket text-2xl text-green-400 group-hover:text-green-300 transition-colors duration-300"></i>
                    </div>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-green-400 transition-colors duration-300">Order Starts</h3>
                  <p className="text-gray-300 font-light leading-relaxed">Your order begins processing immediately after payment</p>
                </div>
              </div>
            </div>

            {/* Order Completed Animation */}
            <div className="relative">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-primary-500/20 rounded-3xl blur-2xl"></div>
                <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-12 border border-white/20 hover:border-green-400/40 transition-all duration-500">
                  <div className="text-center">
                    <div className="relative mb-10">
                      <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-3xl blur-lg"></div>
                      <div className="relative w-32 h-32 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-3xl flex items-center justify-center mx-auto border border-green-400/30">
                        <i className="bx bx-check text-6xl text-green-400"></i>
                      </div>
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-8">Order Completed</h3>
                    <p className="text-gray-300 mb-10 font-light leading-relaxed text-lg">
                      Just like magic, you've received it! We appreciate your feedback, don't forget to share your experience with us.
                    </p>
                    
                    {/* Rating Animation */}
                    <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 rounded-3xl p-8 border border-yellow-400/20">
                      <div className="flex justify-center space-x-3 mb-6">
                        {[...Array(5)].map((_, i) => (
                          <i key={i} className="bx bxs-star text-yellow-400 text-3xl animate-pulse" style={{animationDelay: `${i * 0.1}s`}}></i>
                        ))}
                      </div>
                      <p className="text-yellow-400 font-bold text-lg">You rated 5/5 stars!</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 relative">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-800/20 to-transparent"></div>
        
        <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-16">
            <div className="inline-block mb-4">
              <span className="bg-gradient-to-r from-purple-400 to-primary-400 bg-clip-text text-transparent text-xs font-semibold tracking-wider uppercase">
                Premium Features
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 tracking-tight">
              <span className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                Gaming Services Just Got Better
              </span>
            </h2>
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-8 h-1 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full"></div>
              <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
              <div className="w-8 h-1 bg-gradient-to-r from-purple-600 to-purple-500 rounded-full"></div>
            </div>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto font-light leading-relaxed">
              We are setting the 
              <span className="text-purple-400 font-medium"> new standards</span> in the gaming industry.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Instant Support Card */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-primary-600/20 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-500"></div>
              <div className="relative bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:border-primary-400/40 transition-all duration-500 hover:shadow-xl hover:shadow-primary-500/30 hover:-translate-y-1">
                <div className="flex items-start space-x-6">
                  <div className="flex-shrink-0">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-primary-600/20 rounded-2xl blur-md"></div>
                      <div className="relative w-16 h-16 bg-gradient-to-br from-primary-500/20 to-primary-600/20 rounded-2xl flex items-center justify-center border border-primary-400/30">
                        <i className="bx bx-bolt text-3xl text-primary-400"></i>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-primary-400 transition-colors duration-300">Instant 24/7 Human Support</h3>
                    <p className="text-gray-300 mb-4 font-light">No chatbots, no ChatGPT - just humans.</p>
                    
                    {/* Chat Bubbles */}
                    <div className="space-y-3">
                      <div className="bg-white/15 rounded-2xl p-3 max-w-xs border border-white/20">
                        <p className="text-white text-sm font-light">"Hey, I need help"</p>
                      </div>
                      <div className="bg-gradient-to-r from-primary-500/20 to-primary-600/20 rounded-2xl p-3 max-w-xs ml-auto border border-primary-400/30">
                        <p className="text-white text-sm font-light">"How can we assist you?"</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Cashback Card */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-500"></div>
              <div className="relative bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:border-green-400/40 transition-all duration-500 hover:shadow-xl hover:shadow-green-500/30 hover:-translate-y-1">
                <div className="text-center">
                  <div className="relative mb-6">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-2xl blur-md"></div>
                    <div className="relative w-16 h-16 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-2xl flex items-center justify-center mx-auto border border-green-400/30">
                      <i className="bx bx-credit-card text-3xl text-green-400"></i>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-green-400 transition-colors duration-300">3-6% Cashback</h3>
                  <p className="text-gray-300 mb-6 font-light">on all purchases.</p>
                  
                  {/* Cashback Examples */}
                  <div className="space-y-3">
                    <div className="bg-white/15 rounded-xl p-3 border border-white/20">
                      <p className="text-white font-semibold">You earned $25.12</p>
                    </div>
                    <div className="bg-white/15 rounded-xl p-3 border border-white/20">
                      <p className="text-white font-semibold">You earned $4.20</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Privacy Card */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-500"></div>
              <div className="relative bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:border-blue-400/40 transition-all duration-500 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-1">
                <div className="text-center">
                  <div className="relative mb-6">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-2xl blur-md"></div>
                    <div className="relative w-16 h-16 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-2xl flex items-center justify-center mx-auto border border-blue-400/30">
                      <i className="bx bx-shield text-3xl text-blue-400"></i>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-blue-400 transition-colors duration-300">Full Privacy & Anonymity</h3>
                  <p className="text-gray-300 font-light">Who are you? It's none of our business.</p>
                </div>
              </div>
            </div>

            {/* Secure Payments Card */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-500"></div>
              <div className="relative bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:border-purple-400/40 transition-all duration-500 hover:shadow-xl hover:shadow-purple-500/30 hover:-translate-y-1">
                <div className="text-center">
                  <div className="relative mb-6">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-2xl blur-md"></div>
                    <div className="relative w-16 h-16 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-2xl flex items-center justify-center mx-auto border border-purple-400/30">
                      <i className="bx bx-cart text-3xl text-purple-400"></i>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-purple-400 transition-colors duration-300">Secure & Instant Payments</h3>
                  <p className="text-gray-300 mb-6 font-light">Buy gaming services with PaysafeCard, Apple Pay, and more.</p>
                  
                  {/* Payment Methods */}
                  <div className="flex justify-center space-x-4 opacity-70">
                    <div className="bg-white/15 rounded-xl p-3 border border-white/20">
                      <i className="bx bx-credit-card text-gray-300 text-xl"></i>
                    </div>
                    <div className="bg-white/15 rounded-xl p-3 border border-white/20">
                      <i className="bx bx-credit-card text-gray-300 text-xl"></i>
                    </div>
                    <div className="bg-white/15 rounded-xl p-3 border border-white/20">
                      <i className="bx bx-credit-card text-gray-300 text-xl"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-32 relative">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-800/10 to-transparent"></div>
        
        <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8 tracking-tight">
              Trusted by Millions of Gamers Worldwide
            </h2>
            
            {/* Rating Badge */}
            <div className="inline-flex items-center bg-gray-800/50 backdrop-blur-xl rounded-2xl px-6 py-4 border border-gray-700/50">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-4">
                <i className="bx bx-check text-white text-lg"></i>
              </div>
              <div className="text-left">
                <div className="text-white font-semibold text-lg">
                  Excellent <span className="text-green-400">4.9</span> out of 5.0
                </div>
                <div className="text-gray-400 text-sm">
                  Based on 1,404,000+ orders
                </div>
              </div>
            </div>
          </div>

          {/* Moving Reviews */}
          <div className="space-y-8">
            {/* First Row - Moving Right */}
            <div className="relative flex space-x-6 overflow-hidden">
              {/* Gradient Overlays */}
              <div className="absolute left-0 top-0 bottom-0 w-48 bg-gradient-to-r from-dark-900 via-dark-900/60 via-dark-900/20 to-transparent z-10 pointer-events-none"></div>
              <div className="absolute right-0 top-0 bottom-0 w-48 bg-gradient-to-l from-dark-900 via-dark-900/60 via-dark-900/20 to-transparent z-10 pointer-events-none"></div>
              
              <div className="flex space-x-6 animate-scroll-right">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex-shrink-0 w-[439px] h-[226px] bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50">
                    <div className="flex items-start space-x-4 mb-4">
                      <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                        <i className="bx bx-shield text-white text-lg"></i>
                      </div>
                      <div className="flex-1">
                        <div className="text-white font-semibold text-sm">sl*****gz</div>
                        <div className="text-gray-400 text-xs">United States</div>
                      </div>
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <i className="bx bxs-star text-white text-xs"></i>
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed mb-4">
                      Account retrieved after being accidentally sold 2x. Seller helped with the investigation to retrieve $$ used on account during slippage.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="bg-gray-700/50 text-gray-300 text-xs px-3 py-1 rounded-full">Good Communication</span>
                      <span className="bg-gray-700/50 text-gray-300 text-xs px-3 py-1 rounded-full">Fast Delivery</span>
                    </div>
                  </div>
                ))}
                {/* Duplicate for seamless loop */}
                {[...Array(6)].map((_, i) => (
                  <div key={`dup-${i}`} className="flex-shrink-0 w-[439px] h-[226px] bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50">
                    <div className="flex items-start space-x-4 mb-4">
                      <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                        <i className="bx bx-shield text-white text-lg"></i>
                      </div>
                      <div className="flex-1">
                        <div className="text-white font-semibold text-sm">re*****ny</div>
                        <div className="text-gray-400 text-xs">France</div>
                      </div>
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <i className="bx bxs-star text-white text-xs"></i>
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed mb-4">
                      Nice communication, very helpful, 5/5
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="bg-gray-700/50 text-gray-300 text-xs px-3 py-1 rounded-full">Account as Described</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Second Row - Moving Left */}
            <div className="relative flex space-x-6 overflow-hidden">
              {/* Gradient Overlays */}
              <div className="absolute left-0 top-0 bottom-0 w-48 bg-gradient-to-r from-dark-900 via-dark-900/60 via-dark-900/20 to-transparent z-10 pointer-events-none"></div>
              <div className="absolute right-0 top-0 bottom-0 w-48 bg-gradient-to-l from-dark-900 via-dark-900/60 via-dark-900/20 to-transparent z-10 pointer-events-none"></div>
              
              <div className="flex space-x-6 animate-scroll-left">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex-shrink-0 w-[439px] h-[226px] bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50">
                    <div className="flex items-start space-x-4 mb-4">
                      <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                        <i className="bx bx-shield text-white text-lg"></i>
                      </div>
                      <div className="flex-1">
                        <div className="text-white font-semibold text-sm">Si*****er</div>
                        <div className="text-gray-400 text-xs">Germany</div>
                      </div>
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <i className="bx bxs-star text-white text-xs"></i>
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed mb-4">
                      Some problems had to pay a small amount extra but very helpful and nice
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="bg-gray-700/50 text-gray-300 text-xs px-3 py-1 rounded-full">Fast Delivery</span>
                      <span className="bg-gray-700/50 text-gray-300 text-xs px-3 py-1 rounded-full">Good Communication</span>
                    </div>
                  </div>
                ))}
                {/* Duplicate for seamless loop */}
                {[...Array(6)].map((_, i) => (
                  <div key={`dup2-${i}`} className="flex-shrink-0 w-[439px] h-[226px] bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50">
                    <div className="flex items-start space-x-4 mb-4">
                      <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                        <i className="bx bx-shield text-white text-lg"></i>
                      </div>
                      <div className="flex-1">
                        <div className="text-white font-semibold text-sm">Ne*****su</div>
                        <div className="text-gray-400 text-xs">Canada</div>
                      </div>
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <i className="bx bxs-star text-white text-xs"></i>
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed mb-4">
                      First account didnt work for me but 1-2 hours i got an even better account after chatting with seller
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="bg-gray-700/50 text-gray-300 text-xs px-3 py-1 rounded-full">Account as Described</span>
                      <span className="bg-gray-700/50 text-gray-300 text-xs px-3 py-1 rounded-full">Fast Delivery</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 overflow-hidden">
        {/* Background with Modern Gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500 via-primary-600 to-blue-600"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent"></div>
        
        {/* Floating Elements */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        
        <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 text-center">
          <div className="inline-block mb-12">
            <span className="bg-white/20 text-white text-sm font-semibold tracking-wider uppercase px-6 py-2 rounded-full border border-white/30">
              Join The Community
            </span>
          </div>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-8 tracking-tight">
            Ready to Start Trading?
          </h2>
          <div className="flex items-center justify-center space-x-4 mb-12">
            <div className="w-16 h-1 bg-white/60 rounded-full"></div>
            <div className="w-2 h-2 bg-white rounded-full"></div>
            <div className="w-16 h-1 bg-white/60 rounded-full"></div>
          </div>
          <p className="text-xl text-white/90 mb-16 max-w-4xl mx-auto leading-relaxed font-light">
            Join thousands of gamers who trust 
            <span className="font-semibold"> The Market</span> for their gaming needs
          </p>
          <div className="flex flex-col sm:flex-row gap-8 justify-center">
            <Link
              to="/register"
              className="group relative bg-white text-primary-600 px-16 py-6 rounded-3xl font-bold text-xl hover:bg-gray-50 transition-all duration-500 flex items-center justify-center space-x-4 shadow-2xl hover:shadow-3xl transform hover:scale-105"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white to-gray-50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative flex items-center space-x-4">
                <i className="bx bx-rocket text-2xl"></i>
                <span>Get Started</span>
              </div>
            </Link>
            <Link
              to="/products"
              className="group relative border-2 border-white text-white px-16 py-6 rounded-3xl font-bold text-xl hover:bg-white hover:text-primary-600 transition-all duration-500 flex items-center justify-center space-x-4 shadow-2xl hover:shadow-3xl transform hover:scale-105"
            >
              <div className="absolute inset-0 bg-white rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative flex items-center space-x-4">
                <i className="bx bx-search text-2xl"></i>
                <span>Browse Products</span>
              </div>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;