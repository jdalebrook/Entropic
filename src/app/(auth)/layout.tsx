export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-stone-950 px-6">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-light text-stone-100 text-center mb-2 tracking-wide">
          ENTROPIC
        </h1>
        <p className="text-stone-500 text-center text-sm mb-10">
          solo personas
        </p>
        {children}
      </div>
    </div>
  )
}
