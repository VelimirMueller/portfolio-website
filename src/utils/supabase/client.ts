import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/supabase";
import { supabaseEnv } from "./env";

export const createClient = () => {
  const { url, key } = supabaseEnv();
  return createBrowserClient<Database>(url, key);
};
