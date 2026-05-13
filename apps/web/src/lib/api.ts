import type { HealthCheckResponse } from '@mtu/shared-types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001';

export async function healthCheck(): Promise<HealthCheckResponse> {
  const response = await fetch(`${API_URL}/health`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Health check failed: ${response.statusText}`);
  }

  return response.json();
}
