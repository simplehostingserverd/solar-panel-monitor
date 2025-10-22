import axios from 'axios'

const ENPHASE_API_BASE = 'https://api.enphaseenergy.com/api/v4'

export interface ProductionData {
  system_id: number
  total_devices: number
  intervals: Array<{
    end_at: number
    devices_reporting: number
    wh_del: number
    powr: number
  }>
}

export interface ConsumptionData {
  system_id: number
  total_devices: number
  intervals: Array<{
    end_at: number
    eid: number
    wh_del: number
    devices_reporting: number
  }>
}

export interface SystemSummary {
  system_id: number
  current_power: number
  energy_today: number
  energy_lifetime: number
  summary_date: string
  status: string
  operational_at: number
  last_report_at: number
}

export class EnphaseAPI {
  private apiKey: string
  private accessToken?: string

  constructor(apiKey: string, accessToken?: string) {
    this.apiKey = apiKey
    this.accessToken = accessToken
  }

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.accessToken}`,
      'key': this.apiKey,
    }
  }

  async getSystemSummary(systemId: string): Promise<SystemSummary> {
    const response = await axios.get(
      `${ENPHASE_API_BASE}/systems/${systemId}/summary`,
      { headers: this.getHeaders() }
    )
    return response.data
  }

  async getProductionData(
    systemId: string,
    startAt?: number,
    endAt?: number
  ): Promise<ProductionData> {
    const params: any = {}
    if (startAt) params.start_at = startAt
    if (endAt) params.end_at = endAt

    const response = await axios.get(
      `${ENPHASE_API_BASE}/systems/${systemId}/telemetry/production_micro`,
      {
        headers: this.getHeaders(),
        params,
      }
    )
    return response.data
  }

  async getConsumptionData(
    systemId: string,
    startAt?: number,
    endAt?: number
  ): Promise<ConsumptionData> {
    const params: any = {}
    if (startAt) params.start_at = startAt
    if (endAt) params.end_at = endAt

    const response = await axios.get(
      `${ENPHASE_API_BASE}/systems/${systemId}/telemetry/consumption_meter`,
      {
        headers: this.getHeaders(),
        params,
      }
    )
    return response.data
  }
}
