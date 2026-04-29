'use client';
import Link from 'next/link';
import {
    Github,
    Twitter,
    Instagram,
    Facebook,
    Mail,
    Phone,
    MapPin,
    Heart,
    ArrowUp
  } from 'lucide-react'
  
import { useState, useEffect } from 'react';

export default function AdminFooter() {
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-900 text-gray-300 pt-12 pb-6 relative">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About Section */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 rounded-md bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                <span className="text-sm font-bold text-white">A</span>
              </div>
              <h3 className="text-lg font-bold text-white">Admin Portal</h3>
            </div>
            <p className="text-sm mb-4">
              A powerful dashboard for managing events, registrations, and participants with easy-to-use tools.
            </p>
            <div className="flex space-x-3">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Github size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook size={20} />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/admin" className="text-sm hover:text-purple-400 transition-colors">Dashboard</Link>
              </li>
              <li>
                <Link href="/admin/events" className="text-sm hover:text-purple-400 transition-colors">Events</Link>
              </li>
              <li>
                <Link href="/admin/registrations" className="text-sm hover:text-purple-400 transition-colors">Registrations</Link>
              </li>
              <li>
                <Link href="/admin/settings" className="text-sm hover:text-purple-400 transition-colors">Settings</Link>
              </li>
              <li>
                <Link href="/admin/help" className="text-sm hover:text-purple-400 transition-colors">Help & Support</Link>
              </li>
            </ul>
          </div>
          
          {/* Resources */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-sm hover:text-purple-400 transition-colors">Documentation</Link>
              </li>
              <li>
                <Link href="#" className="text-sm hover:text-purple-400 transition-colors">API Reference</Link>
              </li>
              <li>
                <Link href="#" className="text-sm hover:text-purple-400 transition-colors">Tutorials</Link>
              </li>
              <li>
                <Link href="#" className="text-sm hover:text-purple-400 transition-colors">Release Notes</Link>
              </li>
              <li>
                <Link href="#" className="text-sm hover:text-purple-400 transition-colors">Privacy Policy</Link>
              </li>
            </ul>
          </div>
          
          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <MapPin size={18} className="text-purple-400 mt-0.5" />
                <span className="text-sm">123 Admin Street, Dashboard City, 10010</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone size={18} className="text-purple-400" />
                <span className="text-sm">+1 (123) 456-7890</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail size={18} className="text-purple-400" />
                <span className="text-sm">support@adminportal.com</span>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Divider */}
        <div className="border-t border-gray-800 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm">
              © {currentYear} Admin Portal. All rights reserved.
            </p>
            <p className="text-xs mt-2 md:mt-0 flex items-center">
              Built with <Heart size={12} className="text-red-500 mx-1" /> using Next.js
            </p>
          </div>
        </div>
      </div>
      
      {/* Scroll to top button */}
      <button 
        onClick={scrollToTop} 
        className={`fixed bottom-6 right-6 p-3 rounded-full bg-purple-600 text-white shadow-lg transition-all duration-300 hover:bg-purple-700 ${
          showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
        }`}
        aria-label="Scroll to top"
      >
        <ArrowUp size={18} />
      </button>
    </footer>
  );
}