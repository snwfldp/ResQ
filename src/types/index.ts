
export interface Hospital {
  id: string;
  name: string;
  location: string; // Could be "lat,lng" or address
  capacity: number; // Available beds or general capacity score
  specialties: string[];
  eta?: string; // Estimated time of arrival
  suitabilityScore?: number;
  reasoning?: string;
  contact?: string;
  currentLoad?: number; // e.g. 0-100%
}

export interface PatientCondition {
  description: string;
  assessedState?: string;
}

export interface Ambulance {
  id: string;
  callSign: string;
  currentLocation: string; // "lat,lng"
  status: 'available' | 'en_route_to_incident' | 'at_incident' | 'en_route_to_hospital' | 'at_hospital' | 'unavailable';
  assignedPatientId?: string;
  destinationHospitalId?: string;
  crew: string[];
}

export interface PatientAdmissionRequest {
  id: string;
  patientInfo: {
    age?: number;
    gender?: string;
    briefHistory?: string;
  };
  primarySymptoms: string;
  vitalSigns?: string; // e.g. "BP: 120/80, HR: 70, SpO2: 98%"
  assessedCondition: string;
  incidentLocation: string;
  ambulanceId: string;
  etaToHospital: string;
  requestTimestamp: string; // ISO string
  status: 'pending' | 'accepted' | 'rejected' | 'diverted';
  hospitalId: string;
  rejectionReason?: string;
}

export type HospitalDataForAI = {
  hospitalName: string;
  hospitalLocation: string;
  capacity: number; // Represents available capacity or a score
  specialties: string[];
};
