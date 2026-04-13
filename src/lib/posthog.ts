import { PostHog } from 'posthog-js-lite';

let posthog: PostHog | null = null;

/**
 * Initialize PostHog
 */
export function initializePostHog() {
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    console.warn('PostHog key not configured');
    return null;
  }

  if (typeof window === 'undefined') {
    return null;
  }

  if (!posthog) {
    posthog = new PostHog(
      process.env.NEXT_PUBLIC_POSTHOG_KEY,
      {
        host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
      }
    );
  }

  return posthog;
}

/**
 * Track event
 */
export function trackEvent(
  event: string,
  properties?: Record<string, unknown>
) {
  if (!posthog) {
    initializePostHog();
  }

  if (posthog) {
    posthog.capture(event, properties);
  }
}

/**
 * Identify user
 */
export function identifyUser(
  userId: string,
  properties?: Record<string, unknown>
) {
  if (!posthog) {
    initializePostHog();
  }

  if (posthog) {
    posthog.identify(userId, properties);
  }
}

/**
 * Track user interaction
 */
export function trackUserAction(
  action: string,
  details?: Record<string, unknown>
) {
  trackEvent(`user_${action}`, {
    timestamp: new Date().toISOString(),
    ...details,
  });
}

/**
 * Track red management action
 */
export function trackRedAction(
  action: 'create' | 'update' | 'delete',
  redId: string,
  redName: string
) {
  trackEvent('red_action', {
    action,
    redId,
    redName,
  });
}

/**
 * Track hermano management action
 */
export function trackHermanoAction(
  action: 'create' | 'update' | 'delete' | 'status_change',
  hermanoId: string,
  status?: string
) {
  trackEvent('hermano_action', {
    action,
    hermanoId,
    status,
  });
}

/**
 * Track event registration
 */
export function trackEventAction(
  action: 'create' | 'update' | 'delete',
  eventoId: string,
  eventTitle: string
) {
  trackEvent('evento_action', {
    action,
    eventoId,
    eventTitle,
  });
}

/**
 * Track attendance
 */
export function trackAttendance(
  redId: string,
  redName: string,
  presente: number,
  total: number
) {
  trackEvent('attendance_recorded', {
    redId,
    redName,
    presente,
    total,
    porcentaje: (presente / total) * 100,
  });
}

/**
 * Track AI assistant usage
 */
export function trackAIAssistantUsage(
  userId: string,
  query: string,
  responseTime: number
) {
  trackEvent('ai_assistant_query', {
    userId,
    queryLength: query.length,
    responseTime,
  });
}

/**
 * Track email sent
 */
export function trackEmailSent(
  type: string,
  recipient: string,
  success: boolean
) {
  trackEvent('email_sent', {
    type,
    recipientHash: hashEmail(recipient),
    success,
  });
}

/**
 * Track feature usage
 */
export function trackFeatureUsage(
  feature: string,
  used: boolean,
  metadata?: Record<string, unknown>
) {
  trackEvent('feature_usage', {
    feature,
    used,
    ...metadata,
  });
}

/**
 * Hash email for privacy
 */
function hashEmail(email: string): string {
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    const char = email.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
}
