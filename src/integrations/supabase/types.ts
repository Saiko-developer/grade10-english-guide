export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      exam_upload_questions: {
        Row: {
          answer: string
          created_at: string
          explanation_my: string | null
          id: string
          kind: string
          options: Json
          prompt: string
          sort_order: number
          upload_id: string
          user_id: string
        }
        Insert: {
          answer: string
          created_at?: string
          explanation_my?: string | null
          id?: string
          kind?: string
          options?: Json
          prompt: string
          sort_order?: number
          upload_id: string
          user_id: string
        }
        Update: {
          answer?: string
          created_at?: string
          explanation_my?: string | null
          id?: string
          kind?: string
          options?: Json
          prompt?: string
          sort_order?: number
          upload_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_upload_questions_upload_id_fkey"
            columns: ["upload_id"]
            isOneToOne: false
            referencedRelation: "exam_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_uploads: {
        Row: {
          created_at: string
          error_message: string | null
          extracted_text: string | null
          file_name: string
          file_path: string
          id: string
          mime_type: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          extracted_text?: string | null
          file_name: string
          file_path: string
          id?: string
          mime_type?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          extracted_text?: string | null
          file_name?: string
          file_path?: string
          id?: string
          mime_type?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      grammar_lessons: {
        Row: {
          created_at: string
          examples: Json
          id: string
          rule_my: string | null
          sort_order: number
          title: string
          title_my: string | null
          topic: string
          unit_id: string
        }
        Insert: {
          created_at?: string
          examples?: Json
          id: string
          rule_my?: string | null
          sort_order?: number
          title: string
          title_my?: string | null
          topic: string
          unit_id: string
        }
        Update: {
          created_at?: string
          examples?: Json
          id?: string
          rule_my?: string | null
          sort_order?: number
          title?: string
          title_my?: string | null
          topic?: string
          unit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "grammar_lessons_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_questions: {
        Row: {
          answer: string | null
          created_at: string
          id: number
          kind: string
          lesson_id: string | null
          question: string
          question_number: number
          suggested_answer: string | null
        }
        Insert: {
          answer?: string | null
          created_at?: string
          id?: number
          kind?: string
          lesson_id?: string | null
          question: string
          question_number: number
          suggested_answer?: string | null
        }
        Update: {
          answer?: string | null
          created_at?: string
          id?: number
          kind?: string
          lesson_id?: string | null
          question?: string
          question_number?: number
          suggested_answer?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lesson_questions_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          audio_url: string | null
          code: string
          created_at: string
          id: string
          intro: string | null
          intro_my: string | null
          skill: string | null
          sort_order: number
          title: string
          title_my: string | null
          type: string | null
          unit_id: string | null
        }
        Insert: {
          audio_url?: string | null
          code: string
          created_at?: string
          id: string
          intro?: string | null
          intro_my?: string | null
          skill?: string | null
          sort_order?: number
          title: string
          title_my?: string | null
          type?: string | null
          unit_id?: string | null
        }
        Update: {
          audio_url?: string | null
          code?: string
          created_at?: string
          id?: string
          intro?: string | null
          intro_my?: string | null
          skill?: string | null
          sort_order?: number
          title?: string
          title_my?: string | null
          type?: string | null
          unit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_exams: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          questions: Json
          score: number | null
          status: string
          title: string
          total: number | null
          unit_ids: string[]
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          questions?: Json
          score?: number | null
          status?: string
          title: string
          total?: number | null
          unit_ids?: string[]
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          questions?: Json
          score?: number | null
          status?: string
          title?: string
          total?: number | null
          unit_ids?: string[]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      practice_progress: {
        Row: {
          completed_at: string
          created_at: string
          grammar_lesson_id: string | null
          id: string
          score: number
          source: string
          total: number
          unit_id: string
          user_id: string
        }
        Insert: {
          completed_at?: string
          created_at?: string
          grammar_lesson_id?: string | null
          id?: string
          score?: number
          source?: string
          total?: number
          unit_id: string
          user_id: string
        }
        Update: {
          completed_at?: string
          created_at?: string
          grammar_lesson_id?: string | null
          id?: string
          score?: number
          source?: string
          total?: number
          unit_id?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      section_exercises: {
        Row: {
          created_at: string
          data: Json
          headers: Json | null
          id: number
          instructions: string | null
          part: string
          section_id: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          data?: Json
          headers?: Json | null
          id?: number
          instructions?: string | null
          part: string
          section_id: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          data?: Json
          headers?: Json | null
          id?: number
          instructions?: string | null
          part?: string
          section_id?: string
          sort_order?: number
        }
        Relationships: []
      }
      section_passages: {
        Row: {
          content: Json
          created_at: string
          id: number
          lesson: string | null
          section_id: string
          sort_order: number
          topic: string | null
        }
        Insert: {
          content?: Json
          created_at?: string
          id?: number
          lesson?: string | null
          section_id: string
          sort_order?: number
          topic?: string | null
        }
        Update: {
          content?: Json
          created_at?: string
          id?: number
          lesson?: string | null
          section_id?: string
          sort_order?: number
          topic?: string | null
        }
        Relationships: []
      }
      supplements: {
        Row: {
          created_at: string
          id: number
          key: string
          payload: Json
          section_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          key: string
          payload?: Json
          section_id: string
        }
        Update: {
          created_at?: string
          id?: number
          key?: string
          payload?: Json
          section_id?: string
        }
        Relationships: []
      }
      unit_skills: {
        Row: {
          created_at: string
          detail: string
          id: number
          kind: string
          label: string
          sort_order: number
          unit_id: string
        }
        Insert: {
          created_at?: string
          detail: string
          id?: number
          kind: string
          label: string
          sort_order?: number
          unit_id: string
        }
        Update: {
          created_at?: string
          detail?: string
          id?: number
          kind?: string
          label?: string
          sort_order?: number
          unit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "unit_skills_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      units: {
        Row: {
          audio_url: string | null
          code: string
          created_at: string
          id: string
          sort_order: number
          title: string
          title_my: string | null
        }
        Insert: {
          audio_url?: string | null
          code: string
          created_at?: string
          id: string
          sort_order?: number
          title: string
          title_my?: string | null
        }
        Update: {
          audio_url?: string | null
          code?: string
          created_at?: string
          id?: string
          sort_order?: number
          title?: string
          title_my?: string | null
        }
        Relationships: []
      }
      vocabulary_items: {
        Row: {
          created_at: string
          example_en: string | null
          id: number
          lesson_id: string | null
          meaning_my: string | null
          pronunciation: string | null
          section_id: string | null
          sort_order: number
          word: string
        }
        Insert: {
          created_at?: string
          example_en?: string | null
          id?: number
          lesson_id?: string | null
          meaning_my?: string | null
          pronunciation?: string | null
          section_id?: string | null
          sort_order?: number
          word: string
        }
        Update: {
          created_at?: string
          example_en?: string | null
          id?: number
          lesson_id?: string | null
          meaning_my?: string | null
          pronunciation?: string | null
          section_id?: string | null
          sort_order?: number
          word?: string
        }
        Relationships: [
          {
            foreignKeyName: "vocabulary_items_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
  public: {
    Enums: {},
  },
} as const
