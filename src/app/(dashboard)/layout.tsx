import type { Metadata } from 'next'
import { getUserProfile } from '@/lib/dal'
import { DashboardNav } from '@/components/layout/dashboard-nav'
import { DashboardHeader } from '@/components/layout/dashboard-header'

export const metadata: Metadata = {
  title: 'Dashboard - Sistema de Gestión de Ventas',
  description: 'Panel de control del sistema de gestión de ventas',
}

/**
 * Layout del Dashboard
 *
 * Este layout envuelve todas las páginas protegidas del dashboard.
 * Verifica autenticación usando el DAL antes de renderizar.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Verificar autenticación y obtener perfil
  // Si no está autenticado, el DAL redirige automáticamente a /login
  const profile = await getUserProfile()

  return (
    <div className="min-h-screen bg-muted/50">
      {/* Header superior */}
      <DashboardHeader profile={profile} />

      <div className="flex">
        {/* Sidebar de navegación */}
        <DashboardNav role={profile.role} />

        {/* Contenido principal */}
        <main className="flex-1 p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  )
}
