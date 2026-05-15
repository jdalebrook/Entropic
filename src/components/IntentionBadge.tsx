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
      className={`inline-flex items-center rounded-full bg-amber-900/40 text-amber-400 border border-amber-800/50 ${
        small ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1'
      }`}
    >
      {INTENTION_LABELS[intention]}
    </span>
  )
}
