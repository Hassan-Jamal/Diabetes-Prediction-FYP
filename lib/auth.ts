import { hash, compare } from "bcryptjs"

export async function hashPassword(password: string): Promise<string> {
  return hash(password, 10)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return compare(password, hashedPassword)
}

export function generateResetToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

export function isTokenExpired(createdAt: Date, expiryMinutes = 30): boolean {
  const now = new Date()
  const diffMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60)
  return diffMinutes > expiryMinutes
}
