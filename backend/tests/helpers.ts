import { User } from "../src/models/User";
import { hashPassword } from "../src/utils/password";
import { signAccessToken } from "../src/utils/jwt";
import { Role, UserStatus } from "../src/constants/enums";

interface CreateUserOptions {
  role: Role;
  status?: UserStatus;
  isEmailVerified?: boolean;
  email?: string;
  name?: string;
  password?: string;
}

let counter = 0;

/** Creates a user directly in the DB (bypassing registration/OTP) with a ready-to-use access
 * token — for tests that only care about what a given role/status is authorized to do. */
export async function createUser(opts: CreateUserOptions) {
  counter += 1;
  const email = opts.email ?? `user${counter}.${Date.now()}@test.local`;
  const password = opts.password ?? "Passw0rd!";
  const passwordHash = await hashPassword(password);

  const user = await User.create({
    name: opts.name ?? `Test User ${counter}`,
    email,
    phone: `9800000${String(counter).padStart(3, "0")}`,
    passwordHash,
    role: opts.role,
    status: opts.status ?? "ACTIVE",
    isEmailVerified: opts.isEmailVerified ?? true,
  });

  const token = signAccessToken({ sub: user._id.toString(), role: user.role, status: user.status });
  return { user, password, token };
}

export function authHeader(token: string): { Authorization: string } {
  return { Authorization: `Bearer ${token}` };
}
