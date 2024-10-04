import { randomBytes } from 'crypto';

export function generateOrderNumber(): string {
  const randomNumber = randomBytes(7).toString('hex').toUpperCase();
  return `ORD-${randomNumber}`;
}
