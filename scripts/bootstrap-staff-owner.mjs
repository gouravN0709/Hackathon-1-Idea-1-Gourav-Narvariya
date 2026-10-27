#!/usr/bin/env node
/**
 * Local-only bootstrap for the first (or additional) staff_profiles row.
 * Uses SUPABASE_SECRET_KEY from .env.local or .env — never commit keys.
 *
 * Usage:
 *   node scripts/bootstrap-staff-owner.mjs --email you@example.com --display-name "Owner Name"
 *   node scripts/bootstrap-staff-owner.mjs --user-id <uuid> --display-name "Owner Name" --role manager
 *
 * Requires an existing Supabase Auth user. Does not create Auth users.
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const ALLOWED_ROLES = new Set(["owner", "manager", "staff"]);

function loadEnvFromFile(filePath) {
  if (!existsSync(filePath)) {
    return;
  }
  const text = readFileSync(filePath, "utf8");
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }
    const eq = trimmed.indexOf("=");
    if (eq <= 0) {
      continue;
    }
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function parseArgs(argv) {
  const out = { email: "", userId: "", displayName: "", role: "owner" };
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = argv[i + 1];
    if (arg === "--email" && next) {
      out.email = next.trim().toLowerCase();
      i += 1;
    } else if (arg === "--user-id" && next) {
      out.userId = next.trim();
      i += 1;
    } else if (arg === "--display-name" && next) {
      out.displayName = next.trim();
      i += 1;
    } else if (arg === "--role" && next) {
      out.role = next.trim().toLowerCase();
      i += 1;
    } else if (arg === "--help" || arg === "-h") {
      out.help = true;
    }
  }
  return out;
}

function validateDisplayName(displayName) {
  const name = displayName.trim();
  if (name.length < 1 || name.length > 80) {
    return "display-name must be between 1 and 80 characters after trimming.";
  }
  return null;
}

function validateEmail(email) {
  if (!email || !email.includes("@")) {
    return "Provide a valid --email or --user-id.";
  }
  return null;
}

function validateUserId(userId) {
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      userId,
    )
  ) {
    return "user-id must be a UUID.";
  }
  return null;
}

async function findUserIdByEmail(supabase, email) {
  let page = 1;
  const perPage = 200;
  while (page <= 50) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) {
      throw new Error(`Auth user lookup failed: ${error.message}`);
    }
    const match = data.users.find(
      (user) => user.email?.trim().toLowerCase() === email,
    );
    if (match) {
      return match.id;
    }
    if (data.users.length < perPage) {
      break;
    }
    page += 1;
  }
  return null;
}

async function main() {
  const root = resolve(import.meta.dirname, "..");
  loadEnvFromFile(resolve(root, ".env.local"));
  loadEnvFromFile(resolve(root, ".env"));

  const args = parseArgs(process.argv);
  if (args.help) {
    console.log(`Usage:
  node scripts/bootstrap-staff-owner.mjs --email <auth-email> --display-name "<name>" [--role owner|manager|staff]
  node scripts/bootstrap-staff-owner.mjs --user-id <uuid> --display-name "<name>" [--role owner|manager|staff]

Loads NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY from .env.local (preferred) or .env.
Does not print secret values.`);
    process.exit(0);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const secretKey = process.env.SUPABASE_SECRET_KEY?.trim() ?? "";

  if (!supabaseUrl) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL in .env.local or .env.");
    process.exit(1);
  }
  if (!secretKey) {
    console.error("Missing SUPABASE_SECRET_KEY in .env.local or .env.");
    process.exit(1);
  }

  const displayError = validateDisplayName(args.displayName);
  if (displayError) {
    console.error(displayError);
    process.exit(1);
  }

  if (!ALLOWED_ROLES.has(args.role)) {
    console.error("role must be one of: owner, manager, staff.");
    process.exit(1);
  }

  let userId = args.userId;
  if (!userId) {
    const emailError = validateEmail(args.email);
    if (emailError) {
      console.error(emailError);
      process.exit(1);
    }
  } else {
    const idError = validateUserId(userId);
    if (idError) {
      console.error(idError);
      process.exit(1);
    }
  }

  const supabase = createClient(supabaseUrl, secretKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  if (!userId) {
    userId = await findUserIdByEmail(supabase, args.email);
    if (!userId) {
      console.error(
        "No Auth user found for that email. Create the user in Supabase Dashboard first.",
      );
      process.exit(1);
    }
  }

  const { data: existing, error: existingError } = await supabase
    .from("staff_profiles")
    .select("id, role, is_active")
    .eq("user_id", userId)
    .maybeSingle();

  if (existingError) {
    console.error(`Could not read staff_profiles: ${existingError.message}`);
    process.exit(1);
  }

  if (existing) {
    console.error(
      `staff_profiles already exists for this user (role=${existing.role}, active=${existing.is_active}). No changes made.`,
    );
    process.exit(1);
  }

  const { error: insertError } = await supabase.from("staff_profiles").insert({
    user_id: userId,
    role: args.role,
    display_name: args.displayName.trim(),
    is_active: true,
  });

  if (insertError) {
    console.error(`Insert failed: ${insertError.message}`);
    process.exit(1);
  }

  console.log(
    `Created staff_profiles row: user_id=${userId}, role=${args.role}, display_name="${args.displayName.trim()}".`,
  );
  console.log("Next: sign in at /staff/login and open /staff/operations to verify owner access.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Unexpected error.");
  process.exit(1);
});
