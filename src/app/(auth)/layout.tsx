import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Login - Sistema de Gestión de Ventas',
  description: 'Inicia sesión en el sistema de gestión de ventas',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
