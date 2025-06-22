'use client'

import { useState } from 'react'
import { toast } from 'react-hot-toast'

export default function TestIntegration() {
  const [testResults, setTestResults] = useState<any>({})
  const [loading, setLoading] = useState(false)

  const runTests = async () => {
    setLoading(true)
    const results: any = {}

    try {
      // Test 1: AI Trip Generation
      toast.loading('Testing AI Trip Generation...')
      const tripResponse = await fetch('/api/generate-trip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: 'Plan a 2-day trip to Tokyo with sushi and temples' })
      })
      
      if (tripResponse.ok) {
        const tripData = await tripResponse.json()
        results.tripGeneration = { success: true, data: tripData.tripPlan }
        toast.success('✅ AI Trip Generation: SUCCESS')
      } else {
        results.tripGeneration = { success: false, error: 'Failed to generate trip' }
        toast.error('❌ AI Trip Generation: FAILED')
      }

      // Test 2: Hotel Search
      toast.loading('Testing Hotel Search...')
      const hotelsResponse = await fetch(
        '/api/hotels?destination=Tokyo&checkInDate=2024-02-15&checkOutDate=2024-02-17&adults=2&children=0&rooms=1'
      )
      
      if (hotelsResponse.ok) {
        const hotelsData = await hotelsResponse.json()
        results.hotelSearch = { success: true, data: hotelsData.hotels }
        toast.success('✅ Hotel Search: SUCCESS')
      } else {
        results.hotelSearch = { success: false, error: 'Failed to search hotels' }
        toast.error('❌ Hotel Search: FAILED')
      }

      // Test 3: Car Rental Search
      toast.loading('Testing Car Rental Search...')
      const carsResponse = await fetch(
        '/api/car-rentals?destination=Tokyo&startDate=2024-02-15&endDate=2024-02-17&driverAge=25'
      )
      
      if (carsResponse.ok) {
        const carsData = await carsResponse.json()
        results.carRentalSearch = { success: true, data: carsData.carRentals }
        toast.success('✅ Car Rental Search: SUCCESS')
      } else {
        results.carRentalSearch = { success: false, error: 'Failed to search car rentals' }
        toast.error('❌ Car Rental Search: FAILED')
      }

      setTestResults(results)
      toast.success('🎉 All tests completed!')
    } catch (error) {
      console.error('Test error:', error)
      toast.error('❌ Test failed with error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Integration Test Dashboard</h1>
        
        <div className="mb-6">
          <button
            onClick={runTests}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Running Tests...' : 'Run All Tests'}
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">AI Trip Generation</h3>
            <p className="text-sm text-gray-600">Tests the Gemini AI trip planning</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Hotel Search</h3>
            <p className="text-sm text-gray-600">Tests Booking.com hotel API</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Car Rental Search</h3>
            <p className="text-sm text-gray-600">Tests Booking.com car rental API</p>
          </div>
        </div>
      </div>

      {Object.keys(testResults).length > 0 && (
        <div className="space-y-6">
          {/* Trip Generation Results */}
          {testResults.tripGeneration && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <span className={`w-4 h-4 rounded-full mr-3 ${testResults.tripGeneration.success ? 'bg-green-500' : 'bg-red-500'}`}></span>
                AI Trip Generation
              </h2>
              {testResults.tripGeneration.success ? (
                <div>
                  <p className="text-green-600 mb-2">✅ Success</p>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold">{testResults.tripGeneration.data.destination}</h4>
                    <p className="text-gray-600">{testResults.tripGeneration.data.duration} • {testResults.tripGeneration.data.budget}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Activities: {testResults.tripGeneration.data.activities.length} • 
                      Itinerary Days: {testResults.tripGeneration.data.itinerary.length}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-red-600">❌ {testResults.tripGeneration.error}</p>
              )}
            </div>
          )}

          {/* Hotel Search Results */}
          {testResults.hotelSearch && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <span className={`w-4 h-4 rounded-full mr-3 ${testResults.hotelSearch.success ? 'bg-green-500' : 'bg-red-500'}`}></span>
                Hotel Search
              </h2>
              {testResults.hotelSearch.success ? (
                <div>
                  <p className="text-green-600 mb-2">✅ Success</p>
                  <p className="text-gray-600">Found {testResults.hotelSearch.data.length} hotels</p>
                  {testResults.hotelSearch.data.length > 0 && (
                    <div className="bg-gray-50 p-4 rounded-lg mt-2">
                      <h4 className="font-semibold">{testResults.hotelSearch.data[0].name}</h4>
                      <p className="text-gray-600">{testResults.hotelSearch.data[0].location}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-red-600">❌ {testResults.hotelSearch.error}</p>
              )}
            </div>
          )}

          {/* Car Rental Search Results */}
          {testResults.carRentalSearch && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <span className={`w-4 h-4 rounded-full mr-3 ${testResults.carRentalSearch.success ? 'bg-green-500' : 'bg-red-500'}`}></span>
                Car Rental Search
              </h2>
              {testResults.carRentalSearch.success ? (
                <div>
                  <p className="text-green-600 mb-2">✅ Success</p>
                  <p className="text-gray-600">Found {testResults.carRentalSearch.data.length} car rentals</p>
                  {testResults.carRentalSearch.data.length > 0 && (
                    <div className="bg-gray-50 p-4 rounded-lg mt-2">
                      <h4 className="font-semibold">{testResults.carRentalSearch.data[0].carType}</h4>
                      <p className="text-gray-600">{testResults.carRentalSearch.data[0].company}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-red-600">❌ {testResults.carRentalSearch.error}</p>
              )}
            </div>
          )}

          {/* Summary */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Test Summary</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className={`text-2xl font-bold ${testResults.tripGeneration?.success ? 'text-green-600' : 'text-red-600'}`}>
                  {testResults.tripGeneration?.success ? '✅' : '❌'}
                </div>
                <p className="text-sm text-gray-600">AI Trip Generation</p>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${testResults.hotelSearch?.success ? 'text-green-600' : 'text-red-600'}`}>
                  {testResults.hotelSearch?.success ? '✅' : '❌'}
                </div>
                <p className="text-sm text-gray-600">Hotel Search</p>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${testResults.carRentalSearch?.success ? 'text-green-600' : 'text-red-600'}`}>
                  {testResults.carRentalSearch?.success ? '✅' : '❌'}
                </div>
                <p className="text-sm text-gray-600">Car Rental Search</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 