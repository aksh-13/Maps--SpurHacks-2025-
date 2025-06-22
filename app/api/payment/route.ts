import { NextRequest, NextResponse } from 'next/server'
import { stripeService } from '@/services/payments/stripe'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount, currency, description, service, type, customerEmail = 'user@example.com' } = body

    if (!amount || !currency || !description) {
      return NextResponse.json(
        { error: 'Amount, currency, and description are required' },
        { status: 400 }
      )
    }

    // Create a unique booking ID for this payment
    const bookingId = `${service}-${Date.now()}`

    // Create the payment
    const payment = await stripeService.createBookingPayment({
      amount,
      currency,
      description,
      customerEmail,
      bookingId,
      userId: 'user-123' // This would come from Auth0 session
    })

    if (!payment) {
      return NextResponse.json(
        { error: 'Failed to create payment' },
        { status: 500 }
      )
    }

    // In a real implementation, you would:
    // 1. Redirect to Stripe Checkout or handle payment flow
    // 2. Store payment intent in database
    // 3. Send confirmation email
    // 4. Update user's subscription/access

    // For demo purposes, we'll simulate a successful payment
    const success = await stripeService.sendPaymentConfirmation(payment)
    
    if (success) {
      return NextResponse.json({
        success: true,
        paymentId: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        message: 'Payment created successfully'
      })
    } else {
      return NextResponse.json(
        { error: 'Payment confirmation failed' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Payment API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (action === 'currencies') {
      const currencies = stripeService.getSupportedCurrencies()
      return NextResponse.json(currencies)
    }

    if (action === 'status') {
      const paymentId = searchParams.get('paymentId')
      if (!paymentId) {
        return NextResponse.json(
          { error: 'Payment ID is required' },
          { status: 400 }
        )
      }

      const status = await stripeService.getPaymentStatus(paymentId)
      return NextResponse.json({ status })
    }

    return NextResponse.json(
      { error: 'Invalid action parameter' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Payment API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 