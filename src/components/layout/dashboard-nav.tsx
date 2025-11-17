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
    <aside className="hidden w-64 border-r bg-background lg:flex lg:flex-col h-screen sticky top-0">
      <nav className="flex flex-col gap-1 p-4 flex-1 overflow-y-auto">
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
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              {item.title}
            </Link>
          )
        })}
      </nav>

      {/* Footer del sidebar */}
      <div className="border-t bg-muted p-4 mt-auto">
        <p className="text-xs text-muted-foreground text-center">
          Sistema de Gestión v1.0
        </p>
      </div>
    </aside>
  )
}
