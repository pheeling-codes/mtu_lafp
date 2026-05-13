import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Disable auto-refresh to prevent lock issues - we use cookie auth
    autoRefreshToken: false,
    persistSession: false,
  },
});

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          role: string;
          created_at: string;
          updated_at: string;
        };
      };
      items: {
        Row: {
          id: string;
          type: string;
          title: string;
          description_public: string;
          description_private: string | null;
          status: string;
          image_url: string | null;
          date_lost_or_found: string | null;
          created_at: string;
          updated_at: string;
          category_id: string;
          location_id: string;
        };
      };
      claims: {
        Row: {
          id: string;
          item_id: string;
          seeker_id: string;
          verification_text: string;
          proof_url: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
      };
    };
  };
};
