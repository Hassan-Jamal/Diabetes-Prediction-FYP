import crypto from "crypto"

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString("hex")
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex")
  return `${salt}:${hash}`
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const [salt, storedHash] = hash.split(":")
  const computedHash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex")
  return computedHash === storedHash
}

export function generateResetToken(): string {
  return crypto.randomBytes(32).toString("hex")
}

export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString("hex")
}
