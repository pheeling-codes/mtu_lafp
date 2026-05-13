export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          matric_number: string | null;
          avatar_url: string | null;
          role: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          email: string;
          matric_number?: string | null;
          avatar_url?: string | null;
          role?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          email?: string;
          matric_number?: string | null;
          avatar_url?: string | null;
          role?: string;
          created_at?: string;
          updated_at?: string;
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
          reporter_id: string;
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
      matches: {
        Row: {
          id: string;
          lost_item_id: string;
          found_item_id: string;
          score: number;
          status: string;
          created_at: string;
        };
      };
    };
  };
};
