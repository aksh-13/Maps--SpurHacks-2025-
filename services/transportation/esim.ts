export interface ESIMPlan {
  id: string
  name: string
  country: string
  region?: string
  data: string
  duration: string
  price: number
  currency: string
  features: string[]
  coverage: string[]
  activationType: 'instant' | 'manual'
  qrCode?: string
  affiliateUrl: string
}

export interface ESIMRecommendation {
  destination: string
  recommendedPlans: ESIMPlan[]
  alternatives: ESIMPlan[]
  tips: string[]
  coverageInfo: {
    hasCoverage: boolean
    bestProvider: string
    averageSpeed: string
    networkType: string
  }
}

export class ESIMService {
  private airaloAffiliateLink: string

  constructor() {
    this.airaloAffiliateLink = process.env.AIRALO_AFFILIATE_LINK || ''
  }

  async getESIMPlans(country: string): Promise<ESIMPlan[]> {
    return this.getFallbackPlans(country)
  }

  async getRecommendations(destination: string, duration: number): Promise<ESIMRecommendation> {
    const plans = await this.getESIMPlans(destination)
    const recommendedPlans = this.filterRecommendedPlans(plans, duration)
    const alternatives = this.getAlternativePlans(plans, recommendedPlans)
    const tips = this.generateTips(destination, duration)
    const coverageInfo = this.getCoverageInfo(destination)

    return {
      destination,
      recommendedPlans,
      alternatives,
      tips,
      coverageInfo
    }
  }

  private getFallbackPlans(country: string): ESIMPlan[] {
    const countryPlans: { [key: string]: ESIMPlan[] } = {
      'japan': [
        {
          id: 'japan-1',
          name: 'Japan Traveler',
          country: 'Japan',
          data: '1GB',
          duration: '7 days',
          price: 4.99,
          currency: 'USD',
          features: ['High-speed data', 'Instant activation', '24/7 support'],
          coverage: ['All Japan'],
          activationType: 'instant',
          affiliateUrl: this.generateAiraloUrl('japan', '1gb-7days')
        }
      ],
      'france': [
        {
          id: 'france-1',
          name: 'France Traveler',
          country: 'France',
          data: '1GB',
          duration: '7 days',
          price: 3.99,
          currency: 'USD',
          features: ['EU roaming', 'Instant activation', 'Free calls'],
          coverage: ['France', 'EU countries'],
          activationType: 'instant',
          affiliateUrl: this.generateAiraloUrl('france', '1gb-7days')
        }
      ]
    }

    return countryPlans[country.toLowerCase()] || this.getGlobalPlans()
  }

  async getGlobalPlans(): Promise<ESIMPlan[]> {
    return [
      {
        id: 'global-1',
        name: 'Global Traveler',
        country: 'Global',
        data: '1GB',
        duration: '7 days',
        price: 4.99,
        currency: 'USD',
        features: ['Global coverage', 'Instant activation', '24/7 support'],
        coverage: ['Europe', 'Asia', 'Americas', 'Oceania'],
        activationType: 'instant',
        affiliateUrl: this.generateAiraloUrl('global', '1gb-7days')
      }
    ]
  }

  private filterRecommendedPlans(plans: ESIMPlan[], duration: number): ESIMPlan[] {
    return plans
      .filter(plan => {
        const planDuration = parseInt(plan.duration.split(' ')[0])
        return planDuration >= duration || plan.duration.includes('Unlimited')
      })
      .sort((a, b) => a.price - b.price)
      .slice(0, 3)
  }

  private getAlternativePlans(allPlans: ESIMPlan[], recommendedPlans: ESIMPlan[]): ESIMPlan[] {
    const recommendedIds = new Set(recommendedPlans.map(p => p.id))
    return allPlans
      .filter(plan => !recommendedIds.has(plan.id))
      .sort((a, b) => a.price - b.price)
      .slice(0, 2)
  }

  private generateTips(destination: string, duration: number): string[] {
    return [
      'Order your eSIM before departure for instant activation',
      'Make sure your phone supports eSIM technology',
      'Keep your physical SIM as backup',
      'Download offline maps before activating eSIM'
    ]
  }

  private getCoverageInfo(destination: string): ESIMRecommendation['coverageInfo'] {
    return {
      hasCoverage: true,
      bestProvider: 'Local Partner',
      averageSpeed: '25 Mbps',
      networkType: '4G/LTE'
    }
  }

  private generateAiraloUrl(country: string, plan: string): string {
    if (this.airaloAffiliateLink) {
      return `${this.airaloAffiliateLink}?country=${country}&plan=${plan}`
    }
    return `https://airalo.com/${country}/${plan}`
  }
}

export const esimService = new ESIMService() 