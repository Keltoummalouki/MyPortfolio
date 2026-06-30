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
      about_profile: {
        Row: {
          avatar_url: string | null
          bio: Json
          created_at: string
          full_name: string | null
          headline: Json
          id: boolean
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: Json
          created_at?: string
          full_name?: string | null
          headline?: Json
          id?: boolean
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: Json
          created_at?: string
          full_name?: string | null
          headline?: Json
          id?: boolean
          updated_at?: string
        }
        Relationships: []
      }
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
      certification_translations: {
        Row: {
          certification_id: string
          created_at: string
          description: string | null
          id: string
          locale: string
          name: string
          updated_at: string
        }
        Insert: {
          certification_id: string
          created_at?: string
          description?: string | null
          id?: string
          locale: string
          name: string
          updated_at?: string
        }
        Update: {
          certification_id?: string
          created_at?: string
          description?: string | null
          id?: string
          locale?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "certification_translations_certification_id_fkey"
            columns: ["certification_id"]
            isOneToOne: false
            referencedRelation: "certifications"
            referencedColumns: ["id"]
          },
        ]
      }
      certifications: {
        Row: {
          created_at: string
          credential_url: string | null
          id: string
          image_url: string | null
          issue_date: string | null
          issuer: string | null
          sort_order: number
          status: Database["public"]["Enums"]["content_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          credential_url?: string | null
          id?: string
          image_url?: string | null
          issue_date?: string | null
          issuer?: string | null
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          credential_url?: string | null
          id?: string
          image_url?: string | null
          issue_date?: string | null
          issuer?: string | null
          sort_order?: number
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
      design_settings: {
        Row: {
          accent_color: string | null
          created_at: string
          cursor_style: string | null
          default_locale: string
          default_theme: string
          extra: Json
          font_body: string | null
          font_heading: string | null
          header_position: string
          id: boolean
          nav_items: Json
          primary_color: string | null
          updated_at: string
        }
        Insert: {
          accent_color?: string | null
          created_at?: string
          cursor_style?: string | null
          default_locale?: string
          default_theme?: string
          extra?: Json
          font_body?: string | null
          font_heading?: string | null
          header_position?: string
          id?: boolean
          nav_items?: Json
          primary_color?: string | null
          updated_at?: string
        }
        Update: {
          accent_color?: string | null
          created_at?: string
          cursor_style?: string | null
          default_locale?: string
          default_theme?: string
          extra?: Json
          font_body?: string | null
          font_heading?: string | null
          header_position?: string
          id?: boolean
          nav_items?: Json
          primary_color?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      education: {
        Row: {
          created_at: string
          end_date: string | null
          id: string
          image_url: string | null
          institution: string | null
          location: string | null
          sort_order: number
          start_date: string | null
          status: Database["public"]["Enums"]["content_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          id?: string
          image_url?: string | null
          institution?: string | null
          location?: string | null
          sort_order?: number
          start_date?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_date?: string | null
          id?: string
          image_url?: string | null
          institution?: string | null
          location?: string | null
          sort_order?: number
          start_date?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          updated_at?: string
        }
        Relationships: []
      }
      education_translations: {
        Row: {
          created_at: string
          degree: string
          description: string | null
          education_id: string
          field: string | null
          id: string
          locale: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          degree: string
          description?: string | null
          education_id: string
          field?: string | null
          id?: string
          locale: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          degree?: string
          description?: string | null
          education_id?: string
          field?: string | null
          id?: string
          locale?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "education_translations_education_id_fkey"
            columns: ["education_id"]
            isOneToOne: false
            referencedRelation: "education"
            referencedColumns: ["id"]
          },
        ]
      }
      experience_translations: {
        Row: {
          created_at: string
          description: string | null
          experience_id: string
          id: string
          locale: string
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          experience_id: string
          id?: string
          locale: string
          role: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          experience_id?: string
          id?: string
          locale?: string
          role?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "experience_translations_experience_id_fkey"
            columns: ["experience_id"]
            isOneToOne: false
            referencedRelation: "experiences"
            referencedColumns: ["id"]
          },
        ]
      }
      experiences: {
        Row: {
          company: string | null
          created_at: string
          end_date: string | null
          id: string
          image_url: string | null
          is_current: boolean
          location: string | null
          sort_order: number
          start_date: string | null
          status: Database["public"]["Enums"]["content_status"]
          technologies: string[]
          updated_at: string
          url: string | null
        }
        Insert: {
          company?: string | null
          created_at?: string
          end_date?: string | null
          id?: string
          image_url?: string | null
          is_current?: boolean
          location?: string | null
          sort_order?: number
          start_date?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          technologies?: string[]
          updated_at?: string
          url?: string | null
        }
        Update: {
          company?: string | null
          created_at?: string
          end_date?: string | null
          id?: string
          image_url?: string | null
          is_current?: boolean
          location?: string | null
          sort_order?: number
          start_date?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          technologies?: string[]
          updated_at?: string
          url?: string | null
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
      languages: {
        Row: {
          created_at: string
          icon: string | null
          id: string
          level: Json
          name: Json
          sort_order: number
          status: Database["public"]["Enums"]["content_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          icon?: string | null
          id?: string
          level?: Json
          name?: Json
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          icon?: string | null
          id?: string
          level?: Json
          name?: Json
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          updated_at?: string
        }
        Relationships: []
      }
      media_assets: {
        Row: {
          alt: Json
          bucket: string
          created_at: string
          height: number | null
          id: string
          kind: string | null
          mime_type: string | null
          path: string
          size_bytes: number | null
          updated_at: string
          url: string | null
          width: number | null
        }
        Insert: {
          alt?: Json
          bucket?: string
          created_at?: string
          height?: number | null
          id?: string
          kind?: string | null
          mime_type?: string | null
          path: string
          size_bytes?: number | null
          updated_at?: string
          url?: string | null
          width?: number | null
        }
        Update: {
          alt?: Json
          bucket?: string
          created_at?: string
          height?: number | null
          id?: string
          kind?: string | null
          mime_type?: string | null
          path?: string
          size_bytes?: number | null
          updated_at?: string
          url?: string | null
          width?: number | null
        }
        Relationships: []
      }
      project_skills: {
        Row: {
          created_at: string
          project_id: string
          skill_id: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          project_id: string
          skill_id: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          project_id?: string
          skill_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "project_skills_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_skills_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
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
          location: Json
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
          location?: Json
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
          location?: Json
          profile?: Json
          social_links?: Json
          updated_at?: string
        }
        Relationships: []
      }
      skill_categories: {
        Row: {
          created_at: string
          id: string
          name: Json
          slug: string
          sort_order: number
          status: Database["public"]["Enums"]["content_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name?: Json
          slug: string
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: Json
          slug?: string
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          updated_at?: string
        }
        Relationships: []
      }
      skills: {
        Row: {
          category_id: string | null
          created_at: string
          icon: string | null
          id: string
          image_url: string | null
          level: number | null
          name: string
          skill_type: string
          sort_order: number
          status: Database["public"]["Enums"]["content_status"]
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          image_url?: string | null
          level?: number | null
          name: string
          skill_type?: string
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          image_url?: string | null
          level?: number | null
          name?: string
          skill_type?: string
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "skills_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "skill_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      social_links: {
        Row: {
          created_at: string
          icon: string | null
          id: string
          label: string | null
          platform: string
          sort_order: number
          status: Database["public"]["Enums"]["content_status"]
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          icon?: string | null
          id?: string
          label?: string | null
          platform: string
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          icon?: string | null
          id?: string
          label?: string | null
          platform?: string
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          updated_at?: string
          url?: string
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
