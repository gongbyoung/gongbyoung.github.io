/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type StationStatus = 'available' | 'in_use' | 'offline' | 'maintenance';

export interface Connector {
  type: 'CCS1' | 'CHAdeMO' | 'AC_3Phase' | 'Slow';
  power: number; // in kW
  status: StationStatus;
}

export interface ChargingStation {
  id: string;
  name: string;
  nameKo: string;
  address: string;
  addressKo: string;
  lat: number; // Latitude for coordinate simulation
  lng: number; // Longitude for coordinate simulation
  speed: number; // in kW
  status: StationStatus;
  distance: number; // in km from user's simulated location
  connectors: Connector[];
  operator: string;
  pricePerKwh: number; // in KRW
}

export interface ChargingSession {
  id: string;
  date: string;
  time: string;
  stationId: string;
  stationName: string;
  stationNameKo: string;
  address: string;
  energyUsed: number; // in kWh
  cost: number; // in KRW
  status: 'Completed' | 'Failed';
  plugType: string;
}

export interface RegisteredCard {
  id: string;
  isPrimary: boolean;
  type: 'visa' | 'mastercard' | 'shinhan' | 'hyundai';
  number: string;
  name: string;
  expiry: string;
}
