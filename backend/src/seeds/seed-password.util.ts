import * as crypto from 'crypto';

export async function hashSeedPassword(data: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString('hex');

    crypto.scrypt(data, salt, 64, (err, derivedKey) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(`${salt}:${derivedKey.toString('hex')}`);
    });
  });
}
