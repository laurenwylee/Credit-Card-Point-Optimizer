import { createClient } from "@/utils/supabase/server";
import {
  emptyOnboardingProfile,
  loadOnboardingProfile,
  validateOnboardingInput,
} from "@/lib/onboarding";

async function authenticatedClient() {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  return user ? { supabase, user } : null;
}

export async function GET() {
  const auth = await authenticatedClient();
  if (!auth) return Response.json({ error: "Unauthorized." }, { status: 401 });
  try {
    return Response.json(await loadOnboardingProfile(auth.supabase, auth.user.id));
  } catch {
    return Response.json(emptyOnboardingProfile());
  }
}

export async function PUT(request: Request) {
  const auth = await authenticatedClient();
  if (!auth) return Response.json({ error: "Unauthorized." }, { status: 401 });

  let body: unknown;
  try { body = await request.json(); } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const validated = validateOnboardingInput(body);
  if (!validated.success) {
    return Response.json({ error: validated.error }, { status: 400 });
  }

  const { error } = await auth.supabase.rpc("save_onboarding_profile", {
    p_input: validated.data,
  });
  if (error) {
    return Response.json({ error: "Unable to save your profile." }, { status: 500 });
  }

  return Response.json(await loadOnboardingProfile(auth.supabase, auth.user.id));
}
