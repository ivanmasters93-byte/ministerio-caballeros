import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { handleClerkWebhook } from '@/lib/clerk';
import { errorResponse, jsonResponse } from '@/lib/api-helpers';

export async function POST(req: Request) {
  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // If there are missing headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return errorResponse('Error occurred -- no svix headers', 400);
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || '');

  let evt: { type: string; data: Record<string, unknown> };

  // Verify the webhook
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    });
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return errorResponse('Error occurred', 400);
  }

  // Handle the webhook
  try {
    const result = await handleClerkWebhook(evt);
    return jsonResponse({ result }, 200);
  } catch (error) {
    console.error('Error handling Clerk webhook:', error);
    return errorResponse('Error processing webhook', 500);
  }
}
