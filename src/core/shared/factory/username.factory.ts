import crypto from 'crypto';

export function generateUsername(fullName: string) {
  const parts = fullName.trim().split(/\s+/);
  const firstName = parts[0];
  const rawLastName = parts[parts.length - 1];

  let lastName = rawLastName;
  if (lastName.includes('-')) {
    lastName = lastName.split('-').pop();
  }

  const randomDigits = crypto.randomInt(100, 10000);

  return `${firstName[0].toLowerCase()}.${lastName.toLowerCase()}${randomDigits}`;
}
