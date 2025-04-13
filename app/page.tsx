import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8 text-center">Sistema de Verificação de Resolução de Vídeos</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <div className="border rounded-lg p-6 flex flex-col items-center text-center">
          <h2 className="text-xl font-semibold mb-4">Cadastro de Pontos</h2>
          <p className="mb-6 text-muted-foreground">
            Cadastre os pontos da sua empresa e as resoluções recomendadas para cada um deles. Você poderá visualizar,
            editar e gerenciar todos os pontos cadastrados.
          </p>
          <Link href="/cadastro-pontos">
            <Button size="lg">Acessar Cadastro</Button>
          </Link>
        </div>

        <div className="border rounded-lg p-6 flex flex-col items-center text-center">
          <h2 className="text-xl font-semibold mb-4">Verificação de Vídeos</h2>
          <p className="mb-6 text-muted-foreground">
            Faça upload de um vídeo e verifique se ele atende à resolução recomendada para um ponto específico. O
            sistema analisará automaticamente a compatibilidade.
          </p>
          <Link href="/verificacao-videos">
            <Button size="lg">Acessar Verificação</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
