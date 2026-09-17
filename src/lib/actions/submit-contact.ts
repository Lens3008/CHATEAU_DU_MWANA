'use server'

import { db } from '@/lib/prisma';

export async function submitContactMessageAction(data: { name: string, email: string, phone?: string, subject: string, message: string }) {
  try {
    if (!data.name || !data.email || !data.message) {
      return { success: false, error: 'Les champs Nom, Email et Message sont obligatoires.' };
    }

    await db.raw.sql`
      INSERT INTO "ContactMessage" (id, name, email, phone, subject, message, status, "createdAt", "updatedAt")
      VALUES (
        gen_random_uuid(),
        ${data.name},
        ${data.email},
        ${data.phone || ''},
        ${data.subject || 'Contact'},
        ${data.message},
        'NEW',
        now(),
        now()
      )
    `;

    return { success: true };
  } catch (err: any) {
    console.error('Error submitting contact message:', err);
    return { success: false, error: 'Une erreur est survenue lors de l\'envoi du message.' };
  }
}
