'use client'

import { useState } from 'react'
import TripPlanner from '@/components/TripPlanner'
import ServicesIntegration from '@/components/ServicesIntegration'
import PaymentExample from '@/components/PaymentExample'
import Header from '@/components/Header'
import Chatbot from '@/components/Chatbot'
import { motion } from 'framer-motion'

export default function Home() {
  const [isPlanning, setIsPlanning] = useState(false)
  const [showServices, setShowServices] = useState(false)
  const [showPayments, setShowPayments] = useState(false)

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

        {!showServices && !showPayments ? (
          <div className="space-y-8">
            <TripPlanner onPlanningStart={() => setIsPlanning(true)} />
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center space-y-4"
            >
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => setShowServices(true)}
                  className="px-8 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition-all shadow-lg"
                >
                  View Connected Services
                </button>
                <button
                  onClick={() => setShowPayments(true)}
                  className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
                >
                  View Payment Options
                </button>
              </div>
            </motion.div>
          </div>
        ) : showServices ? (
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <button
                onClick={() => setShowServices(false)}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all mb-6"
              >
                ← Back to Trip Planner
              </button>
            </motion.div>
            
            <ServicesIntegration />
          </div>
        ) : (
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <button
                onClick={() => setShowPayments(false)}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all mb-6"
              >
                ← Back to Trip Planner
              </button>
            </motion.div>
            
            <PaymentExample />
          </div>
        )}
      </div>

      {/* AI Travel Assistant Chatbot */}
      <Chatbot />
    </main>
  )
} 