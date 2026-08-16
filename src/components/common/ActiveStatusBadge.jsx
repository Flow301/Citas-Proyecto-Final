import { Badge } from "@/components/ui/badge"

export function ActiveStatusBadge({ active }) {
  return (
    <Badge variant={active ? "default" : "secondary"}>
      {active ? "Activo" : "Inactivo"}
    </Badge>
  )
}