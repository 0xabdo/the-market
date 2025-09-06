import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center relative overflow-hidden">
      {/* Modern Background with Animated Gradients */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-transparent to-blue-500/10"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-purple-500/5 to-transparent"></div>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center px-4">
        <div className="relative">
          {/* Glassmorphism Container */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 rounded-3xl blur-2xl"></div>
          <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl max-w-lg mx-auto">
            
            {/* 404 Icon */}
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-primary-600/20 rounded-2xl blur-lg"></div>
              <div className="relative w-24 h-24 bg-gradient-to-br from-primary-500/20 to-primary-600/20 rounded-2xl flex items-center justify-center mx-auto border border-primary-400/30">
                <i className="bx bx-game text-4xl text-primary-400"></i>
              </div>
            </div>

            {/* 404 Text */}
            <h1 className="text-6xl font-bold text-white mb-3 bg-gradient-to-r from-primary-400 to-blue-400 bg-clip-text text-transparent">
              404
            </h1>
            
            <h2 className="text-2xl font-semibold text-white mb-4">
              Page Not Found
            </h2>
            
            <p className="text-gray-300 mb-8 text-base leading-relaxed">
              Sorry, we couldn't find the page you're looking for. 
              It might have been moved, deleted, or you entered the wrong URL.
            </p>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/"
                className="group relative inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/30 hover:-translate-y-1"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-primary-600/20 rounded-xl blur-md group-hover:blur-lg transition-all duration-300"></div>
                <div className="relative flex items-center">
                  <Home className="h-4 w-4 mr-2" />
                  Go Home
                </div>
              </Link>
              
              <button
                onClick={() => window.history.back()}
                className="group relative inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 hover:bg-white/20 hover:border-primary-400/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/20 hover:-translate-y-1"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-white/10 rounded-xl blur-md group-hover:blur-lg transition-all duration-300"></div>
                <div className="relative flex items-center">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Go Back
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
