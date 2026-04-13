import { auth } from '@clerk/nextjs/server';
import prisma from './prisma';
import { Role } from '@prisma/client';

/**
 * Get current authenticated user
 */
export async function getCurrentUser() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  // Fetch user from our database
  const user = await prisma.user.findFirst({
    where: {
      email: {}, // We'll use Clerk ID instead
    },
  });

  return user;
}

/**
 * Sync Clerk user to our database
 */
export async function syncClerkUser(
  clerkUserId: string,
  email: string,
  name: string,
  phone?: string
) {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      // Update existing user
      return await prisma.user.update({
        where: { email },
        data: {
          name,
          phone,
        },
      });
    }

    // Create new user
    return await prisma.user.create({
      data: {
        id: clerkUserId,
        email,
        name,
        phone,
        password: '', // Clerk handles authentication
        role: 'HERMANO', // Default role
      },
    });
  } catch (error) {
    console.error('Failed to sync Clerk user:', error);
    return null;
  }
}

/**
 * Check if user has permission
 */
export async function userHasPermission(
  userId: string,
  resource: string,
  action: string
): Promise<boolean> {
  try {
    const permission = await prisma.permiso.findFirst({
      where: {
        userId,
        recurso: resource,
        accion: action,
      },
    });

    return permission?.permitido || false;
  } catch (error) {
    console.error('Failed to check permission:', error);
    return false;
  }
}

/**
 * Get user role
 */
export async function getUserRole(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    return user?.role || null;
  } catch (error) {
    console.error('Failed to get user role:', error);
    return null;
  }
}

/**
 * Update user role (admin only)
 */
export async function updateUserRole(
  userId: string,
  newRole: Role,
  updatedBy: string
) {
  try {
    // Check if updater is admin
    const updater = await prisma.user.findUnique({
      where: { id: updatedBy },
      select: { role: true },
    });

    if (updater?.role !== 'LIDER_GENERAL') {
      throw new Error('Only leaders can update user roles');
    }

    return await prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
    });
  } catch (error) {
    console.error('Failed to update user role:', error);
    return null;
  }
}

/**
 * Webhook handler for Clerk events
 */
export async function handleClerkWebhook(
  event: { type: string; data: Record<string, unknown> }
) {
  try {
    const { type, data } = event;

    switch (type) {
      case 'user.created':
        return await syncClerkUser(
          data.id as string,
          (data.email_addresses as Array<{ email_address: string }>)[0].email_address,
          `${(data.first_name as string) || ''} ${(data.last_name as string) || ''}`.trim(),
          (data.phone_numbers as Array<{ phone_number: string }>)?.[0]?.phone_number
        );

      case 'user.updated':
        return await syncClerkUser(
          data.id as string,
          (data.email_addresses as Array<{ email_address: string }>)[0].email_address,
          `${(data.first_name as string) || ''} ${(data.last_name as string) || ''}`.trim(),
          (data.phone_numbers as Array<{ phone_number: string }>)?.[0]?.phone_number
        );

      case 'user.deleted':
        // Optionally handle user deletion
        // For now, we'll keep the user record for historical purposes
        return true;

      default:
        console.log('Unhandled Clerk webhook event:', type);
        return null;
    }
  } catch (error) {
    console.error('Failed to handle Clerk webhook:', error);
    throw error;
  }
}
