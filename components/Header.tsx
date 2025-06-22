'use client'

import { Plane, MapPin, Home, Bookmark } from 'lucide-react'
import { motion } from 'framer-motion'
import Auth from './Auth'

interface HeaderProps {
  onNavigateToMyTrips?: () => void
}

export default function Header({ onNavigateToMyTrips }: HeaderProps) {
  return (
    <header className="glass sticky top-0 z-50 border-b border-surface-200/50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-3"
          >
            <div className="bg-accent-600 p-2.5 rounded-xl shadow-soft">
              <Plane className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-primary-900">Travana</span>
          </motion.div>

          <nav className="hidden md:flex items-center space-x-8">
            <a href="#" className="flex items-center space-x-2 text-primary-600 hover:text-accent-600 transition-colors font-medium">
              <Home className="h-4 w-4" />
              <span>Home</span>
            </a>
            <button 
              onClick={onNavigateToMyTrips}
              className="flex items-center space-x-2 text-primary-600 hover:text-accent-600 transition-colors font-medium"
            >
              <Bookmark className="h-4 w-4" />
              <span>My Trips</span>
            </button>
          </nav>

          <div className="flex items-center space-x-4">
            <Auth />
          </div>
        </div>
      </div>
    </header>
  )
} 