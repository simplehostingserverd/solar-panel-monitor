import axios from 'axios'

const ENPHASE_API_BASE = 'https://api.enphaseenergy.com/api/v4'

// Existing interfaces
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

// System Details interfaces
export interface System {
  system_id: number
  name: string
  public_name: string
  timezone: string
  address: {
    address1: string
    address2?: string
    city: string
    state: string
    postal_code: string
    country: string
  }
  connection_type: string
  status: string
  last_report_at: number
  operational_at: number
  reference?: string
}

export interface SystemsListResponse {
  total: number
  current_page: number
  size: number
  count: number
  systems: System[]
}

export interface SearchSystemsParams {
  sort_by?: string
  connection_type?: string[]
  status?: string[]
  reference?: string
  installer?: string
  name?: string
}

export interface Device {
  serial_number: string
  device_type: string
  model: string
  status: string
  last_report_at?: number
  part_number?: string
}

export interface DevicesResponse {
  system_id: number
  micros?: Device[]
  meters?: Device[]
  gateways?: Device[]
  relays?: Device[]
  batteries?: Device[]
}

// Events & Alarms interfaces
export interface Event {
  event_id: string
  event_type_id: number
  event_type: string
  event_name: string
  start_at: number
  end_at?: number
  devices: Array<{
    device_type: string
    serial_number: string
  }>
  severity: string
}

export interface EventsResponse {
  system_id: number
  start_time: number
  end_time: number
  events: Event[]
}

export interface Alarm {
  alarm_id: string
  event_type_id: number
  severity: string
  cleared: boolean
  started_at: number
  cleared_at?: number
  events: Event[]
}

export interface AlarmsResponse {
  system_id: number
  alarms: Alarm[]
}

export interface EventType {
  event_type_id: number
  name: string
  description: string
  recommended_action?: string
  severity: string
}

export interface EventTypesResponse {
  event_types: EventType[]
}

// Production Monitoring interfaces
export interface MeterReading {
  serial_number: string
  timestamp: number
  value: number
}

export interface ProductionMeterReadingsResponse {
  system_id: number
  meter_readings: MeterReading[]
}

export interface RgmStats {
  system_id: number
  total_devices: number
  start_at: number
  end_at: number
  intervals: Array<{
    end_at: number
    devices_reporting: number
    wh_del: number
    meters: Array<{
      serial_number: string
      wh_del: number
    }>
  }>
}

export interface EnergyLifetimeResponse {
  system_id: number
  start_date: string
  end_date: string
  production: number[]
  meter_production?: number[]
  micro_production?: number[]
  meta: {
    status: string
    last_report_at: number
  }
}

export interface InverterSummary {
  serial_number: string
  model: string
  part_number: string
  last_report_date: number
  max_report_watts: number
  last_report_watts: number
  energy_today: number
  energy_lifetime: number
  status: string
  signal_strength: number
}

export interface InvertersSummaryResponse {
  total: number
  items: InverterSummary[]
}

// Consumption Monitoring interfaces
export interface LifetimeEnergyResponse {
  system_id: number
  start_date: string
  end_date: string
  consumption?: number[]
  charge?: number[]
  discharge?: number[]
  import?: number[]
  export?: number[]
  meta: {
    status: string
    last_report_at: number
  }
}

export class EnphaseAPI {
  private apiKey: string
  private accessToken?: string
  private refreshToken?: string
  private clientId?: string
  private clientSecret?: string

  constructor(
    apiKey: string,
    accessToken?: string,
    refreshToken?: string,
    clientId?: string,
    clientSecret?: string
  ) {
    this.apiKey = apiKey
    this.accessToken = accessToken
    this.refreshToken = refreshToken
    this.clientId = clientId
    this.clientSecret = clientSecret
  }

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.accessToken}`,
      'key': this.apiKey,
    }
  }

  async refreshAccessToken(): Promise<{ access_token: string; refresh_token: string; expires_in: number }> {
    if (!this.refreshToken || !this.clientId || !this.clientSecret) {
      throw new Error('Refresh token, client ID, and client secret are required for token refresh')
    }

    const response = await axios.post(
      'https://api.enphaseenergy.com/oauth/token',
      new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: this.refreshToken,
        client_id: this.clientId,
        client_secret: this.clientSecret,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    )

    // Update internal tokens
    this.accessToken = response.data.access_token
    this.refreshToken = response.data.refresh_token

    return response.data
  }

  private async makeRequest<T>(requestFn: () => Promise<T>): Promise<T> {
    try {
      return await requestFn()
    } catch (error) {
      // If we get a 401, try to refresh the token and retry once
      if (error && typeof error === 'object' && 'response' in error &&
          (error as { response?: { status?: number } }).response?.status === 401 && this.refreshToken) {
        await this.refreshAccessToken()
        return await requestFn()
      }
      throw error
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
    const params: Record<string, number> = {}
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
    const params: Record<string, number> = {}
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

  // System Details methods
  async getSystems(page?: number, size?: number, sortBy?: string): Promise<SystemsListResponse> {
    const params: Record<string, number | string> = {}
    if (page) params.page = page
    if (size) params.size = size
    if (sortBy) params.sort_by = sortBy

    const response = await axios.get(
      `${ENPHASE_API_BASE}/systems`,
      {
        headers: this.getHeaders(),
        params,
      }
    )
    return response.data
  }

  async searchSystems(
    page?: number,
    size?: number,
    searchParams?: SearchSystemsParams
  ): Promise<SystemsListResponse> {
    const response = await axios.post(
      `${ENPHASE_API_BASE}/systems/search`,
      {
        page,
        size,
        params: searchParams,
      },
      { headers: this.getHeaders() }
    )
    return response.data
  }

  async getSystem(systemId: string): Promise<System> {
    const response = await axios.get(
      `${ENPHASE_API_BASE}/systems/${systemId}`,
      { headers: this.getHeaders() }
    )
    return response.data
  }

  async getDevices(systemId: string): Promise<DevicesResponse> {
    const response = await axios.get(
      `${ENPHASE_API_BASE}/systems/${systemId}/devices`,
      { headers: this.getHeaders() }
    )
    return response.data
  }

  async getSystemIdBySerial(serialNumber: string): Promise<number> {
    const response = await axios.get(
      `${ENPHASE_API_BASE}/systems/retrieve_system_id`,
      {
        headers: this.getHeaders(),
        params: { serial_num: serialNumber },
      }
    )
    return response.data
  }

  // Events & Alarms methods
  async getEvents(
    systemId: string,
    startTime: number,
    endTime?: number
  ): Promise<EventsResponse> {
    const params: Record<string, number> = { start_time: startTime }
    if (endTime) params.end_time = endTime

    const response = await axios.get(
      `${ENPHASE_API_BASE}/systems/${systemId}/events`,
      {
        headers: this.getHeaders(),
        params,
      }
    )
    return response.data
  }

  async getAlarms(
    systemId: string,
    startTime: number,
    endTime?: number,
    cleared?: boolean
  ): Promise<AlarmsResponse> {
    const params: Record<string, number | boolean> = { start_time: startTime }
    if (endTime) params.end_time = endTime
    if (cleared !== undefined) params.cleared = cleared

    const response = await axios.get(
      `${ENPHASE_API_BASE}/systems/${systemId}/alarms`,
      {
        headers: this.getHeaders(),
        params,
      }
    )
    return response.data
  }

  async getEventTypes(eventTypeId?: number): Promise<EventTypesResponse> {
    const params: Record<string, number> = {}
    if (eventTypeId) params.event_type_id = eventTypeId

    const response = await axios.get(
      `${ENPHASE_API_BASE}/systems/event_types`,
      {
        headers: this.getHeaders(),
        params,
      }
    )
    return response.data
  }

  // Production Monitoring methods
  async getProductionMeterReadings(
    systemId: string,
    endAt?: number
  ): Promise<ProductionMeterReadingsResponse> {
    const params: Record<string, number> = {}
    if (endAt) params.end_at = endAt

    const response = await axios.get(
      `${ENPHASE_API_BASE}/systems/${systemId}/production_meter_readings`,
      {
        headers: this.getHeaders(),
        params,
      }
    )
    return response.data
  }

  async getRgmStats(
    systemId: string,
    startAt?: number,
    endAt?: number
  ): Promise<RgmStats> {
    const params: Record<string, number> = {}
    if (startAt) params.start_at = startAt
    if (endAt) params.end_at = endAt

    const response = await axios.get(
      `${ENPHASE_API_BASE}/systems/${systemId}/rgm_stats`,
      {
        headers: this.getHeaders(),
        params,
      }
    )
    return response.data
  }

  async getEnergyLifetime(
    systemId: string,
    startDate?: string,
    endDate?: string,
    production?: string
  ): Promise<EnergyLifetimeResponse> {
    const params: Record<string, string> = {}
    if (startDate) params.start_date = startDate
    if (endDate) params.end_date = endDate
    if (production) params.production = production

    const response = await axios.get(
      `${ENPHASE_API_BASE}/systems/${systemId}/energy_lifetime`,
      {
        headers: this.getHeaders(),
        params,
      }
    )
    return response.data
  }

  async getInvertersSummary(
    siteId?: string,
    envoySerialNumber?: string,
    page?: number,
    size?: number
  ): Promise<InvertersSummaryResponse> {
    const params: Record<string, string | number> = {}
    if (siteId) params.site_id = siteId
    if (envoySerialNumber) params.envoy_serial_number = envoySerialNumber
    if (page) params.page = page
    if (size) params.size = size

    const response = await axios.get(
      `${ENPHASE_API_BASE}/systems/inverters_summary_by_envoy_or_site`,
      {
        headers: this.getHeaders(),
        params,
      }
    )
    return response.data
  }

  // Consumption Monitoring methods
  async getConsumptionLifetime(
    systemId: string,
    startDate?: string,
    endDate?: string
  ): Promise<LifetimeEnergyResponse> {
    const params: Record<string, string> = {}
    if (startDate) params.start_date = startDate
    if (endDate) params.end_date = endDate

    const response = await axios.get(
      `${ENPHASE_API_BASE}/systems/${systemId}/consumption_lifetime`,
      {
        headers: this.getHeaders(),
        params,
      }
    )
    return response.data
  }

  async getBatteryLifetime(
    systemId: string,
    startDate?: string,
    endDate?: string
  ): Promise<LifetimeEnergyResponse> {
    const params: Record<string, string> = {}
    if (startDate) params.start_date = startDate
    if (endDate) params.end_date = endDate

    const response = await axios.get(
      `${ENPHASE_API_BASE}/systems/${systemId}/battery_lifetime`,
      {
        headers: this.getHeaders(),
        params,
      }
    )
    return response.data
  }

  async getEnergyImportLifetime(
    systemId: string,
    startDate?: string,
    endDate?: string
  ): Promise<LifetimeEnergyResponse> {
    const params: Record<string, string> = {}
    if (startDate) params.start_date = startDate
    if (endDate) params.end_date = endDate

    const response = await axios.get(
      `${ENPHASE_API_BASE}/systems/${systemId}/energy_import_lifetime`,
      {
        headers: this.getHeaders(),
        params,
      }
    )
    return response.data
  }

  async getEnergyExportLifetime(
    systemId: string,
    startDate?: string,
    endDate?: string
  ): Promise<LifetimeEnergyResponse> {
    const params: Record<string, string> = {}
    if (startDate) params.start_date = startDate
    if (endDate) params.end_date = endDate

    const response = await axios.get(
      `${ENPHASE_API_BASE}/systems/${systemId}/energy_export_lifetime`,
      {
        headers: this.getHeaders(),
        params,
      }
    )
    return response.data
  }
}
