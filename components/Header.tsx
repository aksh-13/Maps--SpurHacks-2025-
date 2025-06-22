'use client'

import { Plane, MapPin, Home } from 'lucide-react'
import { motion } from 'framer-motion'
import Auth from './Auth'

export default function Header() {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-2"
          >
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg">
              <Plane className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">TripPlanner 3D</span>
          </motion.div>

          <nav className="hidden md:flex items-center space-x-8">
            <a href="#" className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors">
              <Home className="h-4 w-4" />
              <span>Home</span>
            </a>
            <a href="#" className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors">
              <MapPin className="h-4 w-4" />
              <span>Destinations</span>
            </a>
            <a href="#" className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors">
              <Plane className="h-4 w-4" />
              <span>My Trips</span>
            </a>
          </nav>

          <div className="flex items-center space-x-4">
            <Auth />
          </div>
        </div>
      </div>
    </header>
  )
} 