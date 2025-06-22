'use client'

import { useState } from 'react'
import { CreditCard, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'

interface PaymentOption {
  id: string
  title: string
  description: string
  price: number
  currency: string
  features: string[]
  type: 'one-time' | 'subscription'
}

const paymentOptions: PaymentOption[] = [
  {
    id: 'premium-planning',
    title: 'Premium AI Planning',
    description: 'Advanced AI-powered trip planning with custom recommendations',
    price: 19.99,
    currency: 'USD',
    features: [
      'Unlimited AI trip generations',
      'Custom itinerary templates',
      'Priority support',
      'Export to PDF'
    ],
    type: 'one-time'
  },
  {
    id: 'pro-subscription',
    title: 'Pro Membership',
    description: 'Monthly subscription with all premium features',
    price: 9.99,
    currency: 'USD',
    features: [
      'All premium features',
      'Unlimited trip storage',
      'Advanced analytics',
      'Early access to new features'
    ],
    type: 'subscription'
  },
  {
    id: 'hotel-deposit',
    title: 'Hotel Deposit',
    description: 'Secure deposit for your accommodation booking',
    price: 150.00,
    currency: 'USD',
    features: [
      'Secure payment processing',
      'Instant confirmation',
      'Refundable deposit',
      '24/7 support'
    ],
    type: 'one-time'
  }
]

export default function PaymentExample() {
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handlePayment = async (option: PaymentOption) => {
    setIsProcessing(true)
    setPaymentStatus('idle')

    try {
      // Simulate payment processing
      const response = await fetch('/api/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(option.price * 100), // Convert to cents
          currency: option.currency.toLowerCase(),
          description: option.description,
          service: option.id,
          type: option.type
        })
      })

      if (response.ok) {
        setPaymentStatus('success')
        // In real implementation, this would redirect to Stripe Checkout
        // or handle the payment flow
      } else {
        setPaymentStatus('error')
      }
    } catch (error) {
      console.error('Payment error:', error)
      setPaymentStatus('error')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl p-8"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Payment Options
          </h2>
          <p className="text-gray-600">
            Choose from our premium services and secure payment options
          </p>
        </div>

        {/* Payment Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {paymentOptions.map((option) => (
            <motion.div
              key={option.id}
              whileHover={{ scale: 1.02 }}
              className={`bg-gray-50 rounded-lg p-6 border-2 cursor-pointer transition-all ${
                selectedOption === option.id 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedOption(option.id)}
            >
              <div className="text-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {option.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {option.description}
                </p>
                <div className="text-3xl font-bold text-blue-600">
                  ${option.price}
                  {option.type === 'subscription' && <span className="text-sm text-gray-500">/month</span>}
                </div>
              </div>

              <ul className="space-y-2 mb-6">
                {option.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handlePayment(option)
                }}
                disabled={isProcessing}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                  isProcessing
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Processing...
                  </div>
                ) : (
                  `Pay $${option.price}`
                )}
              </button>
            </motion.div>
          ))}
        </div>

        {/* Payment Status */}
        {paymentStatus === 'success' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6"
          >
            <div className="flex items-center">
              <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
              <div>
                <h4 className="font-semibold text-green-800">Payment Successful!</h4>
                <p className="text-green-700">Your payment has been processed successfully.</p>
              </div>
            </div>
          </motion.div>
        )}

        {paymentStatus === 'error' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
          >
            <div className="flex items-center">
              <AlertCircle className="h-6 w-6 text-red-600 mr-3" />
              <div>
                <h4 className="font-semibold text-red-800">Payment Failed</h4>
                <p className="text-red-700">There was an error processing your payment. Please try again.</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Payment Information */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Secure Payment</h4>
              <p>All payments are processed securely through Stripe with bank-level encryption.</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Refund Policy</h4>
              <p>Full refunds available within 30 days for unused services and subscriptions.</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Supported Currencies</h4>
              <p>USD, EUR, GBP, CAD, AUD, and more. Automatic currency conversion available.</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Customer Support</h4>
              <p>24/7 support available for all payment-related questions and issues.</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
} 