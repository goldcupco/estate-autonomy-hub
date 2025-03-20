export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      call_records: {
        Row: {
          call_id: string
          contact_name: string
          created_at: string | null
          duration: number | null
          id: string
          lead_id: string | null
          notes: string | null
          phone_number: string
          provider_id: string
          provider_type: string
          recording_url: string | null
          timestamp: string | null
          user_id: string
        }
        Insert: {
          call_id: string
          contact_name: string
          created_at?: string | null
          duration?: number | null
          id?: string
          lead_id?: string | null
          notes?: string | null
          phone_number: string
          provider_id: string
          provider_type: string
          recording_url?: string | null
          timestamp?: string | null
          user_id: string
        }
        Update: {
          call_id?: string
          contact_name?: string
          created_at?: string | null
          duration?: number | null
          id?: string
          lead_id?: string | null
          notes?: string | null
          phone_number?: string
          provider_id?: string
          provider_type?: string
          recording_url?: string | null
          timestamp?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "call_records_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_leads: {
        Row: {
          campaign_id: string
          created_at: string | null
          id: string
          lead_id: string
        }
        Insert: {
          campaign_id: string
          created_at?: string | null
          id?: string
          lead_id: string
        }
        Update: {
          campaign_id?: string
          created_at?: string | null
          id?: string
          lead_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_leads_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_leads_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          access_restricted: boolean | null
          assigned_users: Json | null
          budget: number | null
          created_at: string | null
          created_by: string
          description: string | null
          end_date: string | null
          id: string
          metrics: Json | null
          name: string
          start_date: string | null
          status: string
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_restricted?: boolean | null
          assigned_users?: Json | null
          budget?: number | null
          created_at?: string | null
          created_by: string
          description?: string | null
          end_date?: string | null
          id?: string
          metrics?: Json | null
          name: string
          start_date?: string | null
          status: string
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_restricted?: boolean | null
          assigned_users?: Json | null
          budget?: number | null
          created_at?: string | null
          created_by?: string
          description?: string | null
          end_date?: string | null
          id?: string
          metrics?: Json | null
          name?: string
          start_date?: string | null
          status?: string
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      communication_providers: {
        Row: {
          config: Json | null
          created_at: string | null
          id: string
          is_default: boolean | null
          name: string
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          config?: Json | null
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          config?: Json | null
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      contracts: {
        Row: {
          amount: number | null
          buyer_id: string | null
          contract_type: string
          created_at: string | null
          description: string | null
          document_id: string | null
          end_date: string | null
          id: string
          property_id: string | null
          seller_id: string | null
          start_date: string | null
          status: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount?: number | null
          buyer_id?: string | null
          contract_type: string
          created_at?: string | null
          description?: string | null
          document_id?: string | null
          end_date?: string | null
          id?: string
          property_id?: string | null
          seller_id?: string | null
          start_date?: string | null
          status: string
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number | null
          buyer_id?: string | null
          contract_type?: string
          created_at?: string | null
          description?: string | null
          document_id?: string | null
          end_date?: string | null
          id?: string
          property_id?: string | null
          seller_id?: string | null
          start_date?: string | null
          status?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contracts_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          created_at: string | null
          description: string | null
          file_path: string
          file_size: number | null
          file_type: string
          id: string
          name: string
          related_to_id: string | null
          related_to_type: string | null
          tags: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          file_path: string
          file_size?: number | null
          file_type: string
          id?: string
          name: string
          related_to_id?: string | null
          related_to_type?: string | null
          tags?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          file_path?: string
          file_size?: number | null
          file_type?: string
          id?: string
          name?: string
          related_to_id?: string | null
          related_to_type?: string | null
          tags?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          address: string | null
          assigned_to: string | null
          city: string | null
          created_at: string | null
          email: string | null
          first_name: string
          id: string
          last_contact_date: string | null
          last_name: string
          lead_source: string | null
          lead_type: string
          next_follow_up: string | null
          notes: string | null
          phone: string | null
          stage: string | null
          state: string | null
          status: string
          tags: Json | null
          updated_at: string | null
          user_id: string
          zip: string | null
        }
        Insert: {
          address?: string | null
          assigned_to?: string | null
          city?: string | null
          created_at?: string | null
          email?: string | null
          first_name: string
          id?: string
          last_contact_date?: string | null
          last_name: string
          lead_source?: string | null
          lead_type: string
          next_follow_up?: string | null
          notes?: string | null
          phone?: string | null
          stage?: string | null
          state?: string | null
          status: string
          tags?: Json | null
          updated_at?: string | null
          user_id: string
          zip?: string | null
        }
        Update: {
          address?: string | null
          assigned_to?: string | null
          city?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string
          id?: string
          last_contact_date?: string | null
          last_name?: string
          lead_source?: string | null
          lead_type?: string
          next_follow_up?: string | null
          notes?: string | null
          phone?: string | null
          stage?: string | null
          state?: string | null
          status?: string
          tags?: Json | null
          updated_at?: string | null
          user_id?: string
          zip?: string | null
        }
        Relationships: []
      }
      letter_records: {
        Row: {
          address: string | null
          content: string
          created_at: string | null
          id: string
          lead_id: string | null
          recipient: string
          status: string
          timestamp: string | null
          tracking_number: string | null
          user_id: string
        }
        Insert: {
          address?: string | null
          content: string
          created_at?: string | null
          id?: string
          lead_id?: string | null
          recipient: string
          status: string
          timestamp?: string | null
          tracking_number?: string | null
          user_id: string
        }
        Update: {
          address?: string | null
          content?: string
          created_at?: string | null
          id?: string
          lead_id?: string | null
          recipient?: string
          status?: string
          timestamp?: string | null
          tracking_number?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "letter_records_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      list_items: {
        Row: {
          created_at: string | null
          id: string
          item_id: string
          item_type: string
          list_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          item_id: string
          item_type: string
          list_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          item_id?: string
          item_type?: string
          list_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "list_items_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "lists"
            referencedColumns: ["id"]
          },
        ]
      }
      lists: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      phone_numbers: {
        Row: {
          capabilities: Json | null
          created_at: string | null
          id: string
          is_primary: boolean | null
          label: string | null
          phone_number: string
          provider_id: string | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          capabilities?: Json | null
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          label?: string | null
          phone_number: string
          provider_id?: string | null
          status: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          capabilities?: Json | null
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          label?: string | null
          phone_number?: string
          provider_id?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "phone_numbers_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "communication_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      properties: {
        Row: {
          address: string
          bathrooms: number | null
          bedrooms: number | null
          city: string
          created_at: string | null
          description: string | null
          features: Json | null
          id: string
          images: Json | null
          listing_date: string | null
          lot_size: number | null
          mls_number: string | null
          price: number | null
          property_type: string | null
          square_feet: number | null
          state: string
          status: string
          updated_at: string | null
          user_id: string
          year_built: number | null
          zip: string
        }
        Insert: {
          address: string
          bathrooms?: number | null
          bedrooms?: number | null
          city: string
          created_at?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          images?: Json | null
          listing_date?: string | null
          lot_size?: number | null
          mls_number?: string | null
          price?: number | null
          property_type?: string | null
          square_feet?: number | null
          state: string
          status: string
          updated_at?: string | null
          user_id: string
          year_built?: number | null
          zip: string
        }
        Update: {
          address?: string
          bathrooms?: number | null
          bedrooms?: number | null
          city?: string
          created_at?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          images?: Json | null
          listing_date?: string | null
          lot_size?: number | null
          mls_number?: string | null
          price?: number | null
          property_type?: string | null
          square_feet?: number | null
          state?: string
          status?: string
          updated_at?: string | null
          user_id?: string
          year_built?: number | null
          zip?: string
        }
        Relationships: []
      }
      sms_records: {
        Row: {
          contact_name: string
          created_at: string | null
          direction: string
          id: string
          lead_id: string | null
          message: string
          phone_number: string
          provider_id: string
          sms_id: string
          timestamp: string | null
          user_id: string
        }
        Insert: {
          contact_name: string
          created_at?: string | null
          direction: string
          id?: string
          lead_id?: string | null
          message: string
          phone_number: string
          provider_id: string
          sms_id: string
          timestamp?: string | null
          user_id: string
        }
        Update: {
          contact_name?: string
          created_at?: string | null
          direction?: string
          id?: string
          lead_id?: string | null
          message?: string
          phone_number?: string
          provider_id?: string
          sms_id?: string
          timestamp?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sms_records_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_delete_property: {
        Args: {
          property_id: string
        }
        Returns: boolean
      }
      admin_update_property: {
        Args: {
          property_id: string
          property_data: Json
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
