
import React from 'react';
import type { TelemetryEvent } from '../types';

interface EventLogProps {
  events: TelemetryEvent[];
}

const EventIcon: React.FC<{ type: TelemetryEvent['type'] }> = ({ type }) => {
  switch (type) {
    case 'KEY_CREATED':
      return <div className="h-2 w-2 rounded-full bg-blue-400"></div>;
    case 'UNLOCK_SUCCESS':
      return <div className="h-2 w-2 rounded-full bg-green-400"></div>;
    case 'SYNC_SUCCESS':
      return <div className="h-2 w-2 rounded-full bg-purple-400"></div>;
    default:
      return <div className="h-2 w-2 rounded-full bg-gray-400"></div>;
  }
};

const EventLog: React.FC<EventLogProps> = ({ events }) => {
  return (
    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
      <h3 className="text-lg font-semibold text-slate-100 mb-4">Real-time Event Log</h3>
      <div className="h-80 overflow-y-auto space-y-4 pr-2">
        {events.map(event => (
          <div key={event.id} className="flex items-start space-x-3 text-sm animate-fade-in">
            <EventIcon type={event.type} />
            <div className="flex-1">
              <p className="text-slate-300">
                <span className="font-semibold text-slate-100">{event.type}</span> - {event.message}
              </p>
              <p className="text-xs text-slate-500">
                {event.timestamp} | {event.metadata.platform} | {event.metadata.userId}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventLog;
