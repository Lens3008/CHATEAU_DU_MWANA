import { Calendar, Users, Package, FileText, MapPin, Plus, ArrowRight } from 'lucide-react'

export function EmptyState({ 
  icon: Icon,
  title,
  message,
  action,
  actionLabel,
  actionHref
}: { 
  icon?: React.ElementType
  title: string
  message: string
  action?: () => void
  actionLabel?: string
  actionHref?: string
}) {
  const ActionComponent = actionHref ? 'a' : 'button'
  
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {Icon && (
        <div className="mb-4 w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
          <Icon className="w-8 h-8 text-slate-400" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-500 mb-6 max-w-sm">{message}</p>
      {(action || actionHref) && (
        <ActionComponent
          onClick={action}
          href={actionHref}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          {actionLabel || 'Action'}
          <ArrowRight className="w-4 h-4" />
        </ActionComponent>
      )}
    </div>
  )
}

export function EmptyReservations({ role = 'CLIENT' }: { role?: 'CLIENT' | 'ADMIN' | 'SECRETARY' }) {
  const config = {
    CLIENT: {
      title: "Aucune réservation",
      message: "Vous n'avez pas encore de réservation. Réservez votre premier événement !",
      actionLabel: "Réserver maintenant",
      actionHref: "/reserver"
    },
    ADMIN: {
      title: "Aucune réservation",
      message: "Aucune réservation n'a été créée pour le moment.",
      actionLabel: "Créer une réservation",
      actionHref: "/admin/reservations/new"
    },
    SECRETARY: {
      title: "Aucune réservation",
      message: "Aucune réservation n'a été créée pour le moment.",
      actionLabel: "Créer une réservation",
      actionHref: "/admin/reservations/new"
    }
  }
  
  const { title, message, actionLabel, actionHref } = config[role]
  
  return <EmptyState icon={Calendar} title={title} message={message} actionLabel={actionLabel} actionHref={actionHref} />
}

export function EmptyClients() {
  return (
    <EmptyState
      icon={Users}
      title="Aucun client"
      message="Aucun client n'a été enregistré pour le moment."
      actionLabel="Ajouter un client"
      actionHref="/admin/crm/clients/new"
    />
  )
}

export function EmptyInventory() {
  return (
    <EmptyState
      icon={Package}
      title="Aucun équipement"
      message="Aucun équipement n'a été enregistré dans l'inventaire."
      actionLabel="Ajouter un équipement"
      actionHref="/admin/logistics/equipments"
    />
  )
}

export function EmptyMessages() {
  return (
    <EmptyState
      icon={FileText}
      title="Aucun message"
      message="Aucun message de contact n'a été reçu pour le moment."
    />
  )
}

export function EmptyLocations() {
  return (
    <EmptyState
      icon={MapPin}
      title="Aucun lieu"
      message="Aucun lieu n'a été enregistré pour le moment."
      actionLabel="Ajouter un lieu"
      actionHref="/admin/logistics/locations"
    />
  )
}

export function EmptyNotifications() {
  return (
    <EmptyState
      icon={FileText}
      title="Aucune notification"
      message="Vous n'avez aucune notification pour le moment."
    />
  )
}
