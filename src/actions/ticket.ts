'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function createTicket(data: { 
  guardianName: string; 
  groupSize: number; 
  paymentMethod: string;
  phoneNumber?: string;
  visitingDate?: string;
  isImmediate?: boolean;
}) {
  try {
    const serialNumber = 'TKT-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const amountPaid = data.groupSize * 500;

    const ticket = await prisma.ticket.create({
      data: {
        serialNumber,
        guardianName: data.guardianName,
        groupSize: data.groupSize,
        paymentMethod: data.paymentMethod,
        phoneNumber: data.phoneNumber,
        visitingDate: data.visitingDate ? new Date(data.visitingDate) : null,
        isImmediate: data.isImmediate || false,
        amountPaid,
      }
    });

    revalidatePath('/admin');
    return { success: true, ticket };
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, error: 'Failed to create pass' };
  }
}

export async function verifyTicket(serialNumber: string, volunteerId: string) {
  try {
    const ticket = await prisma.ticket.findUnique({
      where: { serialNumber }
    });

    if (!ticket) return { status: 'INVALID' };
    if (ticket.isUsed) return { status: 'USED', ticket };

    const updated = await prisma.ticket.update({
      where: { id: ticket.id },
      data: {
        isUsed: true,
        scannedAt: new Date(),
        scannedBy: volunteerId
      }
    });

    await prisma.verificationLog.create({
      data: {
        ticketId: ticket.serialNumber,
        volunteerId,
        status: 'VALID',
        guardianName: ticket.guardianName,
        groupSize: ticket.groupSize
      }
    });

    revalidatePath('/admin');
    return { status: 'VALID', ticket: updated };
  } catch (err) {
    return { status: 'ERROR' };
  }
}

export async function getStats() {
  const totalTickets = await prisma.ticket.count();
  const verifiedCount = await prisma.ticket.count({ where: { isUsed: true } });
  const allTickets = await prisma.ticket.findMany();
  const totalTourists = allTickets.reduce((acc, t) => acc + t.groupSize, 0);
  const totalRevenue = allTickets.reduce((acc, t) => acc + t.amountPaid, 0);

  return { totalTickets, verifiedCount, totalTourists, totalRevenue };
}

export async function getHistory() {
  return await prisma.verificationLog.findMany({
    orderBy: { timestamp: 'desc' },
    take: 10
  });
}
