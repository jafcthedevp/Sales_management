/**
 * Tipos de TypeScript generados para la base de datos de Supabase
 * Representa la estructura de todas las tablas y sus relaciones
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: 'admin' | 'contador'
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role?: 'admin' | 'contador'
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          role?: 'admin' | 'contador'
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      sales: {
        Row: {
          id: string
          cel_vendedor: string
          numero_cliente: string
          nombre_cliente: string | null
          metodo_pago: string
          metodo_pago_1: string | null
          monto: number
          region: 'LIMA' | 'PROVINCIA' | null
          fecha_venta: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          cel_vendedor: string
          numero_cliente: string
          nombre_cliente?: string | null
          metodo_pago: string
          metodo_pago_1?: string | null
          monto: number
          region?: 'LIMA' | 'PROVINCIA' | null
          fecha_venta?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          cel_vendedor?: string
          numero_cliente?: string
          nombre_cliente?: string | null
          metodo_pago?: string
          metodo_pago_1?: string | null
          monto?: number
          region?: 'LIMA' | 'PROVINCIA' | null
          fecha_venta?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      upload_logs: {
        Row: {
          id: string
          filename: string
          uploaded_by: string | null
          records_count: number | null
          success_count: number | null
          error_count: number | null
          errors_detail: Json | null
          status: 'processing' | 'completed' | 'failed' | 'partial'
          created_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          filename: string
          uploaded_by?: string | null
          records_count?: number | null
          success_count?: number | null
          error_count?: number | null
          errors_detail?: Json | null
          status?: 'processing' | 'completed' | 'failed' | 'partial'
          created_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          filename?: string
          uploaded_by?: string | null
          records_count?: number | null
          success_count?: number | null
          error_count?: number | null
          errors_detail?: Json | null
          status?: 'processing' | 'completed' | 'failed' | 'partial'
          created_at?: string
          completed_at?: string | null
        }
      }
      export_logs: {
        Row: {
          id: string
          exported_by: string | null
          filters_applied: Json | null
          records_count: number | null
          filename: string | null
          created_at: string
        }
        Insert: {
          id?: string
          exported_by?: string | null
          filters_applied?: Json | null
          records_count?: number | null
          filename?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          exported_by?: string | null
          filters_applied?: Json | null
          records_count?: number | null
          filename?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_user_active: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Tipos de ayuda para usar en la aplicación
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Sale = Database['public']['Tables']['sales']['Row']
export type UploadLog = Database['public']['Tables']['upload_logs']['Row']
export type ExportLog = Database['public']['Tables']['export_logs']['Row']

export type UserRole = 'admin' | 'contador'
export type Region = 'LIMA' | 'PROVINCIA'
export type UploadStatus = 'processing' | 'completed' | 'failed' | 'partial'
