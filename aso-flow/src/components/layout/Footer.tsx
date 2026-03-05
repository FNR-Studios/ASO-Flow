export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="w-full bg-foreground text-zinc-500 py-6 px-8 border-t border-white/5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Lado Esquerdo */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-zinc-300 tracking-tight">
            ASO Flow
          </span>
          <span className="hidden md:inline text-zinc-700">|</span>
          <p className="text-[11px] uppercase tracking-wider">
            © {currentYear} Todos os direitos reservados
          </p>
        </div>

        {/* Lado Direito: Links Compactos */}
        <nav className="flex gap-6 text-[11px] uppercase tracking-widest font-medium">
          <a href="#" className="hover:text-zinc-100 transition-colors">
            Termos
          </a>
          <a href="#" className="hover:text-zinc-100 transition-colors">
            Privacidade
          </a>
          <a href="#" className="hover:text-zinc-100 transition-colors">
            Suporte
          </a>
        </nav>
        
      </div>
    </footer>
  )
}