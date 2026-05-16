import type { Intention } from '@/lib/types'
import { INTENTION_LABELS } from '@/lib/types'

export default function IntentionBadge({
  intention,
  small = false,
}: {
  intention: Intention
  small?: boolean
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full bg-e-primary-dim text-e-primary border border-e-primary/20 ${
        small ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1'
      }`}
    >
      {INTENTION_LABELS[intention]}
    </span>
  )
}