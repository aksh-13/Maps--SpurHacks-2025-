export interface PaymentIntent {
  id: string
  amount: number
  currency: string
  status: string
  clientSecret: string
  paymentMethod?: string
}

export interface BookingPayment {
  id: string
  amount: number
  currency: string
  description: string
  status: 'pending' | 'succeeded' | 'failed' | 'canceled'
  customerEmail: string
  metadata: Record<string, string>
  createdAt: string
}

export interface RefundRequest {
  paymentIntentId: string
  amount?: number
  reason: string
  description?: string
}

export class StripeService {
  private secretKey: string
  private publishableKey: string

  constructor() {
    this.secretKey = process.env.STRIPE_SECRET_KEY || ''
    this.publishableKey = process.env.STRIPE_PUBLISHABLE_KEY || ''
    
    if (!this.secretKey || !this.publishableKey) {
      console.warn('Stripe API keys not found. Using fallback data.')
    }
  }

  async createPaymentIntent(amount: number, currency: string = 'usd', metadata: Record<string, string> = {}): Promise<PaymentIntent | null> {
    if (!this.secretKey) {
      return this.getFallbackPaymentIntent(amount, currency)
    }

    try {
      const response = await fetch('https://api.stripe.com/v1/payment_intents', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.secretKey}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          amount: amount.toString(),
          currency,
          'metadata[service]': metadata.service || 'trip_booking',
          'metadata[booking_id]': metadata.bookingId || '',
          'metadata[user_id]': metadata.userId || ''
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create payment intent')
      }

      const data = await response.json()
      
      return {
        id: data.id,
        amount: data.amount,
        currency: data.currency,
        status: data.status,
        clientSecret: data.client_secret,
        paymentMethod: data.payment_method
      }
    } catch (error) {
      console.error('Error creating payment intent:', error)
      return this.getFallbackPaymentIntent(amount, currency)
    }
  }

  async confirmPayment(paymentIntentId: string, paymentMethodId: string): Promise<boolean> {
    if (!this.secretKey) {
      return true // Mock success
    }

    try {
      const response = await fetch(`https://api.stripe.com/v1/payment_intents/${paymentIntentId}/confirm`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.secretKey}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          'payment_method': paymentMethodId
        })
      })

      if (!response.ok) {
        throw new Error('Payment confirmation failed')
      }

      const data = await response.json()
      return data.status === 'succeeded'
    } catch (error) {
      console.error('Error confirming payment:', error)
      return false
    }
  }

  async getPaymentStatus(paymentIntentId: string): Promise<string | null> {
    if (!this.secretKey) {
      return 'succeeded' // Mock success
    }

    try {
      const response = await fetch(`https://api.stripe.com/v1/payment_intents/${paymentIntentId}`, {
        headers: {
          'Authorization': `Bearer ${this.secretKey}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to get payment status')
      }

      const data = await response.json()
      return data.status
    } catch (error) {
      console.error('Error getting payment status:', error)
      return null
    }
  }

  async processRefund(refundRequest: RefundRequest): Promise<boolean> {
    if (!this.secretKey) {
      return true // Mock success
    }

    try {
      const body: any = {
        payment_intent: refundRequest.paymentIntentId,
        reason: refundRequest.reason
      }

      if (refundRequest.amount) {
        body.amount = refundRequest.amount
      }

      if (refundRequest.description) {
        body.metadata = { description: refundRequest.description }
      }

      const response = await fetch('https://api.stripe.com/v1/refunds', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.secretKey}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams(body)
      })

      if (!response.ok) {
        throw new Error('Refund processing failed')
      }

      return true
    } catch (error) {
      console.error('Error processing refund:', error)
      return false
    }
  }

  async createBookingPayment(bookingData: {
    amount: number
    currency: string
    description: string
    customerEmail: string
    bookingId: string
    userId: string
  }): Promise<BookingPayment | null> {
    const paymentIntent = await this.createPaymentIntent(
      bookingData.amount,
      bookingData.currency,
      {
        service: 'trip_booking',
        bookingId: bookingData.bookingId,
        userId: bookingData.userId
      }
    )

    if (!paymentIntent) {
      return null
    }

    return {
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      description: bookingData.description,
      status: paymentIntent.status as 'pending' | 'succeeded' | 'failed' | 'canceled',
      customerEmail: bookingData.customerEmail,
      metadata: {
        bookingId: bookingData.bookingId,
        userId: bookingData.userId
      },
      createdAt: new Date().toISOString()
    }
  }

  async sendPaymentConfirmation(payment: BookingPayment): Promise<boolean> {
    // This would integrate with an email service
    console.log('Sending payment confirmation email to:', payment.customerEmail)
    console.log('Payment details:', {
      amount: payment.amount,
      currency: payment.currency,
      description: payment.description,
      bookingId: payment.metadata.bookingId
    })
    
    return true
  }

  async generateInvoice(payment: BookingPayment): Promise<string> {
    // This would generate a proper invoice
    const invoice = `
      INVOICE
      
      Payment ID: ${payment.id}
      Date: ${payment.createdAt}
      Amount: ${payment.amount / 100} ${payment.currency.toUpperCase()}
      Description: ${payment.description}
      Status: ${payment.status}
      
      Customer: ${payment.customerEmail}
      Booking ID: ${payment.metadata.bookingId}
    `
    
    return invoice
  }

  // Helper methods for currency conversion
  convertCurrency(amount: number, fromCurrency: string, toCurrency: string): number {
    // This would integrate with a currency conversion API
    // For now, return the same amount
    return amount
  }

  formatAmount(amount: number, currency: string): string {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    })
    return formatter.format(amount / 100) // Stripe amounts are in cents
  }

  private getFallbackPaymentIntent(amount: number, currency: string): PaymentIntent {
    return {
      id: 'pi_mock_' + Date.now(),
      amount,
      currency,
      status: 'requires_payment_method',
      clientSecret: 'pi_mock_secret_' + Date.now()
    }
  }

  // Get supported currencies
  getSupportedCurrencies(): { code: string; name: string; symbol: string }[] {
    return [
      { code: 'usd', name: 'US Dollar', symbol: '$' },
      { code: 'eur', name: 'Euro', symbol: '€' },
      { code: 'gbp', name: 'British Pound', symbol: '£' },
      { code: 'jpy', name: 'Japanese Yen', symbol: '¥' },
      { code: 'cad', name: 'Canadian Dollar', symbol: 'C$' },
      { code: 'aud', name: 'Australian Dollar', symbol: 'A$' },
      { code: 'chf', name: 'Swiss Franc', symbol: 'CHF' },
      { code: 'cny', name: 'Chinese Yuan', symbol: '¥' }
    ]
  }

  // Validate payment method
  async validatePaymentMethod(paymentMethodId: string): Promise<boolean> {
    if (!this.secretKey) {
      return true // Mock validation
    }

    try {
      const response = await fetch(`https://api.stripe.com/v1/payment_methods/${paymentMethodId}`, {
        headers: {
          'Authorization': `Bearer ${this.secretKey}`
        }
      })

      return response.ok
    } catch (error) {
      console.error('Error validating payment method:', error)
      return false
    }
  }
}

export const stripeService = new StripeService() 