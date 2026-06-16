import crypto from 'node:crypto'

// AES-256-GCM encryption for secrets stored at rest (e.g. payment gateway
// credentials). The key is read lazily from process.env.ENCRYPTION_KEY so this
// module never touches process.env at import time (Vercel hard rule).
//
// ENCRYPTION_KEY must be 32 bytes, base64-encoded (`openssl rand -base64 32`).

function key(): Buffer {
  const k = process.env.ENCRYPTION_KEY
  if (!k) throw new Error('ENCRYPTION_KEY not set')
  return Buffer.from(k, 'base64')
}

/** Encrypt a plaintext string. Output format: `v1:<iv>:<tag>:<ciphertext>` (all base64). */
export function encryptSecret(plain: string): string {
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv('aes-256-gcm', key(), iv)
  const enc = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return `v1:${iv.toString('base64')}:${tag.toString('base64')}:${enc.toString('base64')}`
}

/**
 * Decrypt a value produced by `encryptSecret`. If the value is not in the
 * `v1:` envelope format (legacy plaintext written before encryption was added),
 * the input is returned unchanged so existing configs keep working.
 */
export function decryptSecret(blob: string): string {
  const [v, ivB, tagB, dataB] = blob.split(':')
  if (v !== 'v1') return blob // tolerate legacy plaintext during migration
  const decipher = crypto.createDecipheriv('aes-256-gcm', key(), Buffer.from(ivB, 'base64'))
  decipher.setAuthTag(Buffer.from(tagB, 'base64'))
  return Buffer.concat([decipher.update(Buffer.from(dataB, 'base64')), decipher.final()]).toString('utf8')
}
