'use client'

import { useState } from 'react'
import TripPlanner from '@/components/TripPlanner'
import Header from '@/components/Header'
import { motion } from 'framer-motion'

export default function Home() {
  const [isPlanning, setIsPlanning] = useState(false)

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Plan Your Perfect Trip
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Describe your dream vacation and let AI create a personalized itinerary 
            with 3D maps and accommodation recommendations.
          </p>
        </motion.div>

        <TripPlanner onPlanningStart={() => setIsPlanning(true)} />
      </div>
    </main>
  )
} 