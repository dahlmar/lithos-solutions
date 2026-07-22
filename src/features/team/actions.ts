"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/features/auth/session";
import { inviteEmail } from "@/lib/email";
import { createAdminClient, SERVICE_KEY_HINT } from "@/lib/supabase/admin";

export type UserFormState = { error?: string; done?: string };

const ROLES = ["admin", "client"] as const;
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Create a portal user without touching SQL. Uses the service-role admin API:
 * the account is created pre-confirmed (login is OTP, so no password), the
 * role goes into app_metadata (JWT-authoritative), and client users get
 * linked to their client. Fails soft when the service key isn't configured.
 */
export async function inviteUser(
  _prevState: UserFormState,
  formData: FormData,
): Promise<UserFormState> {
  // Server actions are public endpoints — never rely on the page's check.
  await requireUser("admin");

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const fullName = String(formData.get("full_name") ?? "").trim();
  const role = String(formData.get("role") ?? "");
  const clientId = String(formData.get("client_id") ?? "");

  if (!/^\S+@\S+\.\S+$/.test(email)) return { error: "Enter a valid email." };
  if (!ROLES.includes(role as (typeof ROLES)[number])) {
    return { error: "Choose a valid role." };
  }
  if (role === "client" && !UUID_RE.test(clientId)) {
    return { error: "Client users must be linked to a client." };
  }

  const admin = createAdminClient();
  if (!admin) return { error: SERVICE_KEY_HINT };

  const { data: created, error } = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
    app_metadata: { role },
    user_metadata: { full_name: fullName },
  });
  if (error) return { error: `Could not create user: ${error.message}` };

  // The handle_new_user trigger has already created the profile row.
  const { error: profileError } = await admin
    .from("profiles")
    .update({
      full_name: fullName,
      role,
      client_id: role === "client" ? clientId : null,
    })
    .eq("id", created.user.id);
  if (profileError) {
    return { error: `User created but profile update failed: ${profileError.message}` };
  }

  await inviteEmail({ to: email, name: fullName });

  revalidatePath("/admin/team");
  return { done: `${email} can now sign in with a one-time code.` };
}

/** Update a user's name, role, and client link. Role changes apply at next sign-in. */
export async function updateUserAccess(
  _prevState: UserFormState,
  formData: FormData,
): Promise<UserFormState> {
  // Server actions are public endpoints — never rely on the page's check.
  const me = await requireUser("admin");

  const userId = String(formData.get("user_id") ?? "");
  const fullName = String(formData.get("full_name") ?? "").trim();
  const role = String(formData.get("role") ?? "");
  const clientId = String(formData.get("client_id") ?? "");

  if (!UUID_RE.test(userId)) return { error: "Invalid user." };
  if (!ROLES.includes(role as (typeof ROLES)[number])) {
    return { error: "Choose a valid role." };
  }
  if (role === "client" && !UUID_RE.test(clientId)) {
    return { error: "Client users must be linked to a client." };
  }
  if (userId === me.id && role !== "admin") {
    return { error: "You can't remove your own admin access." };
  }

  const admin = createAdminClient();
  if (!admin) return { error: SERVICE_KEY_HINT };

  const { error } = await admin.auth.admin.updateUserById(userId, {
    app_metadata: { role },
    user_metadata: { full_name: fullName },
  });
  if (error) return { error: `Could not update user: ${error.message}` };

  const { error: profileError } = await admin
    .from("profiles")
    .update({
      full_name: fullName,
      role,
      client_id: role === "client" ? clientId : null,
    })
    .eq("id", userId);
  if (profileError) {
    return { error: `Profile update failed: ${profileError.message}` };
  }

  revalidatePath("/admin/team");
  return { done: "Saved. Role changes apply the next time they sign in." };
}
