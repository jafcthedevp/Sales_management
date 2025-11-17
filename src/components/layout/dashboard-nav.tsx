'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  ShoppingCart,
  Upload,
  Download,
  Users,
} from 'lucide-react'
import type { UserRole } from '@/types/database.types'

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  adminOnly?: boolean
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Ventas',
    href: '/ventas',
    icon: ShoppingCart,
  },
  {
    title: 'Cargar Datos',
    href: '/upload',
    icon: Upload,
    adminOnly: true,
  },
  {
    title: 'Exportar',
    href: '/export',
    icon: Download,
  },
  {
    title: 'Usuarios',
    href: '/usuarios',
    icon: Users,
    adminOnly: true,
  },
]

interface DashboardNavProps {
  role: UserRole
}

export function DashboardNav({ role }: DashboardNavProps) {
  const pathname = usePathname()
  const isAdmin = role === 'admin'

  // Filtrar items según el rol
  const filteredItems = navItems.filter(
    (item) => !item.adminOnly || (item.adminOnly && isAdmin)
  )

  return (
    <aside className="hidden w-64 border-r bg-white lg:block">
      <nav className="flex flex-col gap-1 p-4">
        {filteredItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <Icon className="h-5 w-5" />
              {item.title}
            </Link>
          )
        })}
      </nav>

      {/* Footer del sidebar */}
      <div className="absolute bottom-0 left-0 right-0 border-t bg-gray-50 p-4">
        <p className="text-xs text-gray-500 text-center">
          Sistema de Gestión v1.0
        </p>
      </div>
    </aside>
  )
}
