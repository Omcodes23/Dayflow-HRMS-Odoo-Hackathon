import { prisma } from '@/lib/db';
import { verifyAccessToken } from '@/lib/auth/jwt';
import { cookies } from 'next/headers';

export async function createContext() {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;

  let user = null;
  if (token) {
    try {
      const payload = verifyAccessToken(token);
      user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: {
          id: true,
          email: true,
          role: true,
          employeeId: true,
          accountStatus: true,
        },
      });
    } catch {
      // Token invalid or expired - user will be null
    }
  }

  return { prisma, user };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
