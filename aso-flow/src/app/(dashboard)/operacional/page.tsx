"use client"

import { Button } from "@/src/components/ui/button"
import Link from "next/link"

export default function ExamePage(){
    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Panel Operacional</h1>
            <p className="text-muted-foreground">
              Opções disponíveis:
            </p>
          </div>
    
          {/* Botões de Ação */}
          <div className="flex flex-col sm:flex-row gap-4 mb-16 justify-left">
            <Link href="/operacional/procedimentos">
              <Button className="w-full sm:w-44 h-12 hover:bg-[#2a5e59] text-white font-bold text-md shadow-lg shadow-emerald-900/20 transition-all hover:scale-105">
                Exames
              </Button>
            </Link>
    
          </div>
    
    
        </div>
      )
}