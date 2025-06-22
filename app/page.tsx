'use client'

import { useState } from 'react'
import TripPlanner from '@/components/TripPlanner'
import ServicesIntegration from '@/components/ServicesIntegration'
import PaymentExample from '@/components/PaymentExample'
import MyTrips from '@/components/MyTrips'
import Header from '@/components/Header'
import Chatbot from '@/components/Chatbot'
import { motion } from 'framer-motion'

export default function Home() {
  const [isPlanning, setIsPlanning] = useState(false)
  const [showServices, setShowServices] = useState(false)
  const [showPayments, setShowPayments] = useState(false)
  const [showMyTrips, setShowMyTrips] = useState(false)

  const resetView = () => {
    setShowServices(false)
    setShowPayments(false)
    setShowMyTrips(false)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-surface-50 via-white to-accent-50/30">
      <Header onNavigateToMyTrips={() => setShowMyTrips(true)} />
      
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-primary-900 mb-6 leading-tight">
            Plan Your Perfect Trip
          </h1>
          <p className="text-xl text-primary-600 max-w-3xl mx-auto leading-relaxed">
            Describe your dream vacation and let AI create a personalized itinerary 
            with 3D maps, accommodation recommendations, and seamless booking.
          </p>
        </motion.div>

        {!showServices && !showPayments && !showMyTrips ? (
          <div className="space-y-12">
            <TripPlanner onPlanningStart={() => setIsPlanning(true)} />
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center space-y-6"
            >
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => setShowMyTrips(true)}
                  className="btn-primary"
                >
                  My Trips
                </button>
                <button
                  onClick={() => setShowServices(true)}
                  className="btn-secondary"
                >
                  View Connected Services
                </button>
                <button
                  onClick={() => setShowPayments(true)}
                  className="btn-secondary"
                >
                  View Payment Options
                </button>
              </div>
            </motion.div>
          </div>
        ) : showMyTrips ? (
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <button
                onClick={resetView}
                className="btn-secondary mb-8"
              >
                ← Back to Trip Planner
              </button>
            </motion.div>
            
            <MyTrips />
          </div>
        ) : showServices ? (
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <button
                onClick={resetView}
                className="btn-secondary mb-8"
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
                onClick={resetView}
                className="btn-secondary mb-8"
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