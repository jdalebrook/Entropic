import { Suspense } from 'react'
import VerifyForm from './VerifyForm'

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="text-stone-500 text-sm text-center">Cargando…</div>}>
      <VerifyForm />
    </Suspense>
  )
}
