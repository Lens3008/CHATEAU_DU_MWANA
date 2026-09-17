export interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
  size?: 'sm' | 'md'
  children: React.ReactNode
  className?: string
}

export function Badge({ 
  variant = 'default', 
  size = 'md', 
  children, 
  className = '' 
}: BadgeProps) {
  const baseClasses = 'inline-flex items-center font-medium rounded-full'
  
  const variantClasses = {
    default: 'bg-slate-100 text-slate-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-amber-100 text-amber-700',
    error: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700'
  }
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-xs'
  }
  
  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}>
      {children}
    </span>
  )
}

export function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { variant: 'success' | 'warning' | 'error' | 'info' | 'default', label: string }> = {
    CONFIRMED: { variant: 'success', label: 'Confirmée' },
    COMPLETED: { variant: 'success', label: 'Terminée' },
    CANCELLED: { variant: 'error', label: 'Annulée' },
    DRAFT: { variant: 'info', label: 'Brouillon' },
    PENDING: { variant: 'warning', label: 'En attente' },
    PAID: { variant: 'success', label: 'Payé' },
    PARTIAL: { variant: 'warning', label: 'Partiel' },
    NEW: { variant: 'warning', label: 'Nouveau' },
    READ: { variant: 'info', label: 'Lu' },
    REPLIED: { variant: 'success', label: 'Répondu' }
  }
  
  const config = statusConfig[status] || { variant: 'default', label: status }
  
  return <Badge variant={config.variant}>{config.label}</Badge>
}
