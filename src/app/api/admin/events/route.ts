import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';

// List of connected admin clients
const clients = new Set<{
  id: string;
  send: (data: string) => void;
}>();

// Event emitter for server-side events
export class EventEmitter {
  private static instance: EventEmitter;
  private events: Record<string, Function[]> = {};

  constructor() {
    if (EventEmitter.instance) {
      return EventEmitter.instance;
    }
    EventEmitter.instance = this;
  }

  public static getInstance(): EventEmitter {
    if (!EventEmitter.instance) {
      EventEmitter.instance = new EventEmitter();
    }
    return EventEmitter.instance;
  }

  public on(event: string, callback: Function): void {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  public emit(event: string, data: any): void {
    if (!this.events[event]) {
      return;
    }
    this.events[event].forEach((callback) => callback(data));
  }
}

// Singleton instance of event emitter
const eventEmitter = EventEmitter.getInstance();

// Function to broadcast events to all connected clients
export function broadcastEvent(event: string, data: any): void {
  const eventData = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  
  clients.forEach((client) => {
    try {
      client.send(eventData);
    } catch (error) {
      console.error(`Error sending event to client ${client.id}:`, error);
    }
  });
}

// Register waitlist event handler
eventEmitter.on('waitlist', (data: any) => {
  broadcastEvent('waitlist', data);
});

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export async function GET(request: NextRequest) {
  // Get server session for authentication check
  const session = await getServerSession();
  
  // Check if user is authenticated and is an admin
  if (!session?.user || session.user.role !== 'ADMIN') {
    return new Response('Unauthorized', { status: 403 });
  }
  
  // Set up Server-Sent Events response
  const responseStream = new TransformStream();
  const writer = responseStream.writable.getWriter();
  
  // Generate a unique client ID
  const clientId = crypto.randomUUID();
  
  // Add client to connected clients list
  const client = {
    id: clientId,
    send: (data: string) => writer.write(new TextEncoder().encode(data)),
  };
  
  clients.add(client);
  
  // Send initial connection message
  client.send('event: connected\ndata: {"status":"connected","clientId":"' + clientId + '"}\n\n');
  
  // Remove client when connection is closed
  request.signal.addEventListener('abort', () => {
    clients.delete(client);
  });
  
  return new Response(responseStream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}

// Helper function to send a waitlist notification
export function notifyWaitlistSignup(email: string): void {
  eventEmitter.emit('waitlist', {
    id: crypto.randomUUID(),
    type: 'success',
    message: `New waitlist signup: ${email}`,
  });
}