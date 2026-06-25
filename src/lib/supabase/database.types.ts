export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      admin_profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          role?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      article_translations: {
        Row: {
          article_id: string
          body_markdown: string | null
          created_at: string
          excerpt: string | null
          id: string
          locale: string
          seo_description: string | null
          seo_title: string | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          article_id: string
          body_markdown?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          locale: string
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          article_id?: string
          body_markdown?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          locale?: string
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "article_translations_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      articles: {
        Row: {
          author_name: string | null
          cover_image_url: string | null
          created_at: string
          featured: boolean
          id: string
          published_at: string | null
          reading_minutes: number | null
          slug: string
          status: Database["public"]["Enums"]["content_status"]
          updated_at: string
        }
        Insert: {
          author_name?: string | null
          cover_image_url?: string | null
          created_at?: string
          featured?: boolean
          id?: string
          published_at?: string | null
          reading_minutes?: number | null
          slug: string
          status?: Database["public"]["Enums"]["content_status"]
          updated_at?: string
        }
        Update: {
          author_name?: string | null
          cover_image_url?: string | null
          created_at?: string
          featured?: boolean
          id?: string
          published_at?: string | null
          reading_minutes?: number | null
          slug?: string
          status?: Database["public"]["Enums"]["content_status"]
          updated_at?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          status: Database["public"]["Enums"]["message_status"]
          subject: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          status?: Database["public"]["Enums"]["message_status"]
          subject?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          status?: Database["public"]["Enums"]["message_status"]
          subject?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      freelance_leads: {
        Row: {
          budget_range: string | null
          company: string | null
          contact_preference: string | null
          created_at: string
          details: string | null
          email: string
          id: string
          name: string
          project_type: string | null
          status: Database["public"]["Enums"]["lead_status"]
          timeline: string | null
          updated_at: string
        }
        Insert: {
          budget_range?: string | null
          company?: string | null
          contact_preference?: string | null
          created_at?: string
          details?: string | null
          email: string
          id?: string
          name: string
          project_type?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          timeline?: string | null
          updated_at?: string
        }
        Update: {
          budget_range?: string | null
          company?: string | null
          contact_preference?: string | null
          created_at?: string
          details?: string | null
          email?: string
          id?: string
          name?: string
          project_type?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          timeline?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      project_translations: {
        Row: {
          created_at: string
          description: string | null
          id: string
          locale: string
          project_id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          locale: string
          project_id: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          locale?: string
          project_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_translations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          cover_image_url: string | null
          created_at: string
          demo_url: string | null
          featured: boolean
          id: string
          repo_url: string | null
          slug: string
          sort_order: number
          started_at: string | null
          status: Database["public"]["Enums"]["content_status"]
          tech_stack: string[]
          updated_at: string
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string
          demo_url?: string | null
          featured?: boolean
          id?: string
          repo_url?: string | null
          slug: string
          sort_order?: number
          started_at?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          tech_stack?: string[]
          updated_at?: string
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string
          demo_url?: string | null
          featured?: boolean
          id?: string
          repo_url?: string | null
          slug?: string
          sort_order?: number
          started_at?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          tech_stack?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          created_at: string
          description: Json
          icon: string | null
          id: string
          slug: string
          sort_order: number
          status: Database["public"]["Enums"]["content_status"]
          title: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: Json
          icon?: string | null
          id?: string
          slug: string
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          title?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: Json
          icon?: string | null
          id?: string
          slug?: string
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          title?: Json
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          availability_status: string
          contact_email: string | null
          created_at: string
          cv_url: string | null
          id: boolean
          profile: Json
          social_links: Json
          updated_at: string
        }
        Insert: {
          availability_status?: string
          contact_email?: string | null
          created_at?: string
          cv_url?: string | null
          id?: boolean
          profile?: Json
          social_links?: Json
          updated_at?: string
        }
        Update: {
          availability_status?: string
          contact_email?: string | null
          created_at?: string
          cv_url?: string | null
          id?: boolean
          profile?: Json
          social_links?: Json
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      content_status: "draft" | "published" | "archived"
      lead_status:
        | "new"
        | "qualified"
        | "meeting"
        | "proposal"
        | "won"
        | "lost"
        | "spam"
      message_status: "new" | "read" | "replied" | "archived" | "spam"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      content_status: ["draft", "published", "archived"],
      lead_status: [
        "new",
        "qualified",
        "meeting",
        "proposal",
        "won",
        "lost",
        "spam",
      ],
      message_status: ["new", "read", "replied", "archived", "spam"],
    },
  },
} as const

