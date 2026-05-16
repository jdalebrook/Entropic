export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-light text-e-text text-center mb-2 tracking-wide">
          ENTROPIC
        </h1>
        <p className="text-e-muted text-center text-sm mb-10">
          solo personas
        </p>
        {children}
      </div>
    </div>
  )
}