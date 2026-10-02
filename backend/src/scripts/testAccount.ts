/**
 * Marks (or unmarks) an account as an internal test account. Test accounts can use the portal
 * normally but are excluded from every count, fee total and capacity figure.
 *
 *   npm run test-account -- mark   student1@ssrinstitute.in
 *   npm run test-account -- unmark student1@ssrinstitute.in
 *   npm run test-account -- list
 */
import { connectDB, disconnectDB } from "../config/db";
import { User } from "../models/User";

async function main(): Promise<void> {
  const [command, email] = process.argv.slice(2);
  if (!["mark", "unmark", "list"].includes(command ?? "") || (command !== "list" && !email)) {
    console.error("Usage: npm run test-account -- <mark|unmark> <email>   |   npm run test-account -- list");
    process.exitCode = 1;
    return;
  }

  await connectDB();
  try {
    if (command === "list") {
      const users = await User.find({ isTestAccount: true }).select("email role status").lean();
      console.log(users.length ? users.map((u) => `${u.email} (${u.role}, ${u.status})`).join("\n") : "No test accounts.");
      return;
    }

    const user = await User.findOneAndUpdate(
      { email: email.trim().toLowerCase() },
      { $set: { isTestAccount: command === "mark" } },
      { new: true }
    ).select("email role isTestAccount");
    if (!user) {
      console.error(`No user found with email ${email}`);
      process.exitCode = 1;
      return;
    }
    console.log(`${user.email} (${user.role}) is ${user.isTestAccount ? "now a TEST account" : "no longer a test account"}.`);
  } finally {
    await disconnectDB();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
