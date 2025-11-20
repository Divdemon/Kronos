
export interface TelemetryEvent {
  id: string;
  timestamp: string;
  type: 'KEY_CREATED' | 'UNLOCK_SUCCESS' | 'UNLOCK_FAILURE' | 'SYNC_SUCCESS';
  message: string;
  metadata: {
    userId: string;
    deviceId: string;
    platform: 'iOS' | 'Android' | 'Web';
  };
}

export interface TelemetryError extends TelemetryEvent {
  errorCode: number;
}

export interface Metrics {
  totalKeys: number;
  activeKeys: number;
  unlocks: number;
  successRate: number;
}

export interface PlatformData {
  name: 'iOS' | 'Android' | 'Web';
  value: number;
}

export interface UsageDataPoint {
  time: string;
  unlocks: number;
}

export interface MeshNode {
  id: string;
  x: number;
  y: number;
  type: 'TOWER' | 'DEVICE' | 'PORT' | 'GATEWAY';
  status: 'IDLE' | 'ACTIVE' | 'LOCKED' | 'TRACING';
  label: string;
}

export interface MeshLink {
  source: string;
  target: string;
  active: boolean;
  signalStrength?: number; // 0-100 representing signal quality/intensity
}
