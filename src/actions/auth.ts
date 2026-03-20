'use server';

import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';

const SESSION_COOKIE = 'auth_session';

export async function login(formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  // For demonstration: Auto-create first user if none exists (Admin)
  const userCount = await prisma.user.count();
  if (userCount === 0 && username === 'admin' && password === 'admin123') {
     await prisma.user.create({
       data: {
         username: 'admin',
         password: 'admin123',
         role: 'ADMIN',
         name: 'Master Admin'
       }
     });
  }

  const user = await prisma.user.findUnique({
    where: { username }
  });

  if (!user || user.password !== password) {
    return { error: 'Invalid credentials' };
  }

  // Create session
  const sessionData = JSON.stringify({
    id: user.id,
    username: user.username,
    role: user.role,
    name: user.name
  });

  (await cookies()).set(SESSION_COOKIE, sessionData, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24, // 1 day
    path: '/',
  });

  if (user.role === 'ADMIN') redirect('/admin');
  redirect('/verify');
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect('/login');
}

export async function getSession() {
  const session = (await cookies()).get(SESSION_COOKIE);
  if (!session) return null;
  try {
    return JSON.parse(session.value);
  } catch (e) {
    return null;
  }
}

export async function requireAuth(role?: string) {
  const session = await getSession();
  if (!session) redirect('/login');
  if (role && session.role !== role && session.role !== 'ADMIN') {
    redirect('/');
  }
  return session;
}
