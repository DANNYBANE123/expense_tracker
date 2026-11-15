import { auth } from "@/lib/auth/auth";

export interface AuthenticatedUser {
  id: string;
  name?: string | null;
  email?: string | null;
}

export async function getAuthUser(): Promise<AuthenticatedUser | null> {
  const session = await auth();
  if (!session || !session.user || !session.user.id) {
    return null;
  }
  return {
    id: session.user.id as string,
    name: session.user.name,
    email: session.user.email,
  };
}

export async function requireAuthUser(): Promise<AuthenticatedUser> {
  const user = await getAuthUser();
  if (!user) {
    throw new Error("Unauthorized. Please log in.");
  }
  return user;
}
