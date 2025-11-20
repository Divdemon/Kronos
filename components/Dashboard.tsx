import React, { useState, useEffect, useCallback } from 'react';
import Header from './Header';
import MetricCard from './MetricCard';
import UsageChart from './UsageChart';
import PlatformChart from './PlatformChart';
import EventLog from './EventLog';
import ErrorLog from './ErrorLog';
import AnomalyInsights from './AnomalyInsights';
import SignalInvestigation from './SignalInvestigation';
import type { Metrics, TelemetryEvent, TelemetryError, UsageDataPoint, PlatformData } from '../types';

const ICONS = {
    Key: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H5v-2H3v-2H1v-4a6 6 0 016-6h1.743A6 6 0 0119 9z" /></svg>,
    Active: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
    Unlock: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0v4m-5 9V14a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2h1a2 2 0 002-2z" /></svg>,
    Success: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
};

const WS_ENDPOINT = 'wss://api.telemetry.example.com/v1/stream'; // Placeholder for real backend

const Dashboard: React.FC = () => {
    const [metrics, setMetrics] = useState<Metrics>({
        totalKeys: 125600,
        activeKeys: 98750,
        unlocks: 450320,
        successRate: 99.8,
    });
    const [events, setEvents] = useState<TelemetryEvent[]>([]);
    const [errors, setErrors] = useState<TelemetryError[]>([]);
    const [usageData, setUsageData] = useState<UsageDataPoint[]>([]);
    const [platformData] = useState<PlatformData[]>([
        { name: 'iOS', value: 450 },
        { name: 'Android', value: 300 },
        { name: 'Web', value: 50 },
    ]);
    
    // WebSocket State
    const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connecting');

    // Security / Investigation State
    const [investigationMode, setInvestigationMode] = useState(false);
    const [targetError, setTargetError] = useState<TelemetryError | null>(null);

    // -------------------------------------------------------------------------
    // REAL-TIME WEBSOCKET IMPLEMENTATION
    // -------------------------------------------------------------------------
    useEffect(() => {
        let ws: WebSocket | null = null;
        let retryTimeout: ReturnType<typeof setTimeout>;

        const connect = () => {
            setConnectionStatus('connecting');
            
            try {
                // Attempt connection to backend
                ws = new WebSocket(WS_ENDPOINT);

                ws.onopen = () => {
                    console.log('[Telemetry] WebSocket Connected');
                    setConnectionStatus('connected');
                    // Reset connection state or auth handshakes could go here
                };

                ws.onmessage = (event) => {
                    try {
                        const payload = JSON.parse(event.data);
                        
                        // Handle various message types from backend
                        switch (payload.type) {
                            case 'METRICS_UPDATE':
                                setMetrics(payload.data);
                                break;
                            case 'NEW_EVENT':
                                setEvents(prev => [payload.data, ...prev].slice(0, 50));
                                break;
                            case 'NEW_ERROR':
                                setErrors(prev => [payload.data, ...prev].slice(0, 50));
                                break;
                            case 'USAGE_UPDATE':
                                setUsageData(prev => [...prev, payload.data].slice(-30));
                                break;
                            default:
                                break;
                        }
                    } catch (err) {
                        console.error('[Telemetry] Failed to parse message:', err);
                    }
                };

                ws.onclose = () => {
                    console.warn('[Telemetry] WebSocket Disconnected');
                    setConnectionStatus('disconnected');
                    // Exponential backoff could be implemented here
                    // For demo, we just fall back to simulation
                };

                ws.onerror = (err) => {
                    console.error('[Telemetry] WebSocket Error:', err);
                    ws?.close();
                };

            } catch (error) {
                console.error('[Telemetry] Connection failed', error);
                setConnectionStatus('disconnected');
            }
        };

        // Initiate connection
        connect();

        return () => {
            if (ws) ws.close();
            clearTimeout(retryTimeout);
        };
    }, []);


    // -------------------------------------------------------------------------
    // SIMULATION FALLBACK (Runs only when WebSocket is Disconnected)
    // -------------------------------------------------------------------------
    const generateRandomEvent = useCallback((): TelemetryEvent | TelemetryError => {
        const platforms: ('iOS' | 'Android' | 'Web')[] = ['iOS', 'Android', 'Web'];
        const randomPlatform = platforms[Math.floor(Math.random() * platforms.length)];
        const eventTypes: TelemetryEvent['type'][] = ['KEY_CREATED', 'UNLOCK_SUCCESS', 'UNLOCK_FAILURE', 'SYNC_SUCCESS'];
        const randomType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
        
        const baseEvent = {
            id: `evt_${Date.now()}_${Math.random()}`,
            timestamp: new Date().toLocaleTimeString(),
            metadata: {
                userId: `user_${Math.floor(Math.random() * 1000)}`,
                deviceId: `dev_${Math.floor(Math.random() * 5000)}`,
                platform: randomPlatform
            },
            type: randomType,
            message: ''
        };

        switch (randomType) {
            case 'KEY_CREATED':
                baseEvent.message = `New key provisioned for ${baseEvent.metadata.userId}`;
                break;
            case 'UNLOCK_SUCCESS':
                baseEvent.message = `Access granted via device ${baseEvent.metadata.deviceId}`;
                break;

            case 'UNLOCK_FAILURE':
                 const errorEvent: TelemetryError = {
                    ...baseEvent,
                    type: 'UNLOCK_FAILURE',
                    message: `Auth failed: Invalid credentials`,
                    errorCode: 401
                };
                return errorEvent;
            case 'SYNC_SUCCESS':
                baseEvent.message = `Keychain sync complete for ${baseEvent.metadata.userId}`;
                break;
        }

        return baseEvent;
    }, []);

    useEffect(() => {
        // Initialize historical data (static for both modes initially)
        if (usageData.length === 0) {
            const initialUsage: UsageDataPoint[] = Array.from({ length: 20 }, (_, i) => {
                const time = new Date(Date.now() - (20 - i) * 2000);
                return {
                    time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                    unlocks: Math.floor(Math.random() * 20) + 10
                }
            });
            setUsageData(initialUsage);
        }

        // IF CONNECTED: Do not run simulation
        if (connectionStatus === 'connected') {
            return;
        }

        // FALLBACK: Run simulation interval
        const interval = setInterval(() => {
            setMetrics(prev => {
                const successfulUnlocks = prev.unlocks * (prev.successRate / 100);
                const failedUnlocks = prev.unlocks - successfulUnlocks;
                const newUnlocks = Math.floor(Math.random() * 5) + 1;
                const newFails = Math.random() > 0.98 ? 1 : 0; // 2% chance of a new failure
                const totalUnlocks = prev.unlocks + newUnlocks + newFails;
                const totalSuccessful = successfulUnlocks + newUnlocks;

                return {
                    totalKeys: prev.totalKeys + (Math.random() > 0.8 ? 1 : 0),
                    activeKeys: prev.activeKeys + (Math.random() > 0.6 ? 1 : -1),
                    unlocks: totalUnlocks,
                    successRate: (totalSuccessful / totalUnlocks) * 100
                }
            });

            const newEvent = generateRandomEvent();
            if ('errorCode' in newEvent) {
                setErrors(prev => [newEvent as TelemetryError, ...prev].slice(0, 50));
            } else {
                setEvents(prev => [newEvent, ...prev].slice(0, 50));
            }

            setUsageData(prev => {
                const lastPoint = prev[prev.length - 1];
                if (!lastPoint) return prev;
                const newUnlocks = lastPoint.unlocks + (Math.floor(Math.random() * 5) - 2);
                 const newDataPoint: UsageDataPoint = {
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                    unlocks: newUnlocks > 0 ? newUnlocks : 0,
                };
                return [...prev, newDataPoint].slice(-30);
            });
        }, 2000);

        return () => clearInterval(interval);
    }, [generateRandomEvent, connectionStatus]);

    const handleTraceSignal = (error: TelemetryError) => {
        setTargetError(error);
        setInvestigationMode(true);
    };

    const totalMetricChange = metrics.unlocks / 10000;
    const activeMetricChange = (metrics.activeKeys / metrics.totalKeys * 100) - 78;

    return (
        <main className="p-4 sm:p-6 lg:p-8 space-y-6 relative">
            <Header connectionStatus={connectionStatus} />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard title="Total Keys Issued" value={metrics.totalKeys.toLocaleString()} icon={ICONS.Key} change={totalMetricChange} />
                <MetricCard title="Active Keys" value={metrics.activeKeys.toLocaleString()} icon={ICONS.Active} change={activeMetricChange} />
                <MetricCard title="Total Unlocks (24h)" value={metrics.unlocks.toLocaleString()} icon={ICONS.Unlock} change={12.5} />
                <MetricCard title="Success Rate" value={`${metrics.successRate.toFixed(2)}%`} icon={ICONS.Success} change={metrics.successRate - 99.8} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <UsageChart data={usageData} />
                </div>
                <div className="space-y-6">
                    <PlatformChart data={platformData} />
                    <AnomalyInsights metrics={metrics} errors={errors} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <EventLog events={events} />
                <ErrorLog errors={errors} onTrace={handleTraceSignal} />
            </div>

            {investigationMode && (
                <SignalInvestigation 
                    targetError={targetError} 
                    onClose={() => setInvestigationMode(false)} 
                />
            )}
        </main>
    );
};

export default Dashboard;