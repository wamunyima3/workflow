import { Zap } from "lucide-react"

export default function Loading() {
  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm z-50">
      <div className="relative">
        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
        <div className="relative bg-card p-4 rounded-2xl shadow-2xl border border-white/10">
          <Zap className="h-12 w-12 text-primary animate-pulse" />
        </div>
      </div>
      <div className="mt-8 space-y-2 text-center">
        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500 animate-pulse">
          Workflow
        </h2>
        <div className="flex items-center gap-1 justify-center">
          <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
          <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
          <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" />
        </div>
      </div>
    </div>
  )
}
