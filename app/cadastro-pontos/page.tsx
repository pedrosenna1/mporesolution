"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Pencil, Trash2, ArrowLeft } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

interface Ponto {
  id: string
  nome: string
  largura: number
  altura: number
}

export default function CadastroPontos() {
  const [pontos, setPontos] = useState<Ponto[]>([])
  const [nome, setNome] = useState("")
  const [largura, setLargura] = useState("")
  const [altura, setAltura] = useState("")
  const [editandoId, setEditandoId] = useState<string | null>(null)

  // Carregar pontos do localStorage ao iniciar
  useEffect(() => {
    const pontosArmazenados = localStorage.getItem("pontos")
    if (pontosArmazenados) {
      setPontos(JSON.parse(pontosArmazenados))
    }
  }, [])

  // Salvar pontos no localStorage sempre que mudar
  useEffect(() => {
    localStorage.setItem("pontos", JSON.stringify(pontos))
  }, [pontos])

  const limparFormulario = () => {
    setNome("")
    setLargura("")
    setAltura("")
    setEditandoId(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!nome || !largura || !altura) {
      toast({
        title: "Erro",
        description: "Todos os campos são obrigatórios",
        variant: "destructive",
      })
      return
    }

    const larguraNum = Number.parseInt(largura)
    const alturaNum = Number.parseInt(altura)

    if (isNaN(larguraNum) || isNaN(alturaNum) || larguraNum <= 0 || alturaNum <= 0) {
      toast({
        title: "Erro",
        description: "Largura e altura devem ser números positivos",
        variant: "destructive",
      })
      return
    }

    if (editandoId) {
      // Editando um ponto existente
      setPontos(
        pontos.map((ponto) =>
          ponto.id === editandoId ? { ...ponto, nome, largura: larguraNum, altura: alturaNum } : ponto,
        ),
      )
      toast({
        title: "Sucesso",
        description: "Ponto atualizado com sucesso",
      })
    } else {
      // Adicionando novo ponto
      const novoPonto: Ponto = {
        id: Date.now().toString(),
        nome,
        largura: larguraNum,
        altura: alturaNum,
      }
      setPontos([...pontos, novoPonto])
      toast({
        title: "Sucesso",
        description: "Ponto cadastrado com sucesso",
      })
    }

    limparFormulario()
  }

  const handleEditar = (ponto: Ponto) => {
    setNome(ponto.nome)
    setLargura(ponto.largura.toString())
    setAltura(ponto.altura.toString())
    setEditandoId(ponto.id)
  }

  const handleExcluir = (id: string) => {
    setPontos(pontos.filter((ponto) => ponto.id !== id))
    toast({
      title: "Sucesso",
      description: "Ponto excluído com sucesso",
    })
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center mb-6">
        <Link href="/" className="mr-4">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Cadastro de Pontos</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>{editandoId ? "Editar Ponto" : "Novo Ponto"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome do Ponto</Label>
                <Input
                  id="nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Recepção, Sala de Reuniões"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="largura">Largura (pixels)</Label>
                  <Input
                    id="largura"
                    type="number"
                    value={largura}
                    onChange={(e) => setLargura(e.target.value)}
                    placeholder="Ex: 1920"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="altura">Altura (pixels)</Label>
                  <Input
                    id="altura"
                    type="number"
                    value={altura}
                    onChange={(e) => setAltura(e.target.value)}
                    placeholder="Ex: 1080"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                {editandoId && (
                  <Button type="button" variant="outline" onClick={limparFormulario}>
                    Cancelar
                  </Button>
                )}
                <Button type="submit">{editandoId ? "Atualizar" : "Cadastrar"}</Button>
              </div>
              <div className="mt-4 text-xs text-muted-foreground">
                <p>Os pontos cadastrados são salvos automaticamente no seu navegador.</p>
                <p>Você pode editar ou excluir pontos a qualquer momento usando os botões na tabela.</p>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pontos Cadastrados ({pontos.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {pontos.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <p>Nenhum ponto cadastrado ainda.</p>
                <p className="text-sm mt-2">Use o formulário ao lado para adicionar seu primeiro ponto.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Resolução</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pontos.map((ponto) => (
                    <TableRow key={ponto.id}>
                      <TableCell className="font-medium">{ponto.nome}</TableCell>
                      <TableCell>
                        {ponto.largura} x {ponto.altura}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" size="icon" onClick={() => handleEditar(ponto)}>
                            <Pencil className="h-4 w-4" />
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="icon">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir o ponto "{ponto.nome}"? Esta ação não pode ser
                                  desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleExcluir(ponto.id)}>Excluir</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
      <Toaster />
    </div>
  )
}
