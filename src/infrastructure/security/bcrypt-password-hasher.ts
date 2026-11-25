import bcrypt from 'bcryptjs';
import type { PasswordHasher } from '@/application/ports';

export class BcryptPasswordHasher implements PasswordHasher {
  hash(password: string) {
    return bcrypt.hash(password, 12);
  }

  compare(password: string, hash: string) {
    return bcrypt.compare(password, hash);
  }
}
