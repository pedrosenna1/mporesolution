"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Upload, CheckCircle, XCircle } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Progress } from "@/components/ui/progress"

interface Ponto {
  id: string
  nome: string
  largura: number
  altura: number
}

interface VideoInfo {
  largura: number
  altura: number
  nome: string
  tamanho: string
}

export default function VerificacaoVideos() {
  const [pontos, setPontos] = useState<Ponto[]>([])
  const [pontoSelecionado, setPontoSelecionado] = useState<string>("")
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null)
  const [compativel, setCompativel] = useState<boolean | null>(null)
  const [arrastando, setArrastando] = useState(false)
  const [carregando, setCarregando] = useState(false)
  const [progresso, setProgresso] = useState(0)

  const videoRef = useRef<HTMLVideoElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Carregar pontos do localStorage ao iniciar
  useEffect(() => {
    const pontosArmazenados = localStorage.getItem("pontos")
    if (pontosArmazenados) {
      setPontos(JSON.parse(pontosArmazenados))
    }
  }, [])

  const formatarTamanhoArquivo = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"

    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const processarVideo = (arquivo: File) => {
    setCarregando(true)
    setProgresso(0)

    // Simular progresso de upload
    const intervalo = setInterval(() => {
      setProgresso((prev) => {
        if (prev >= 95) {
          clearInterval(intervalo)
          return 95
        }
        return prev + 5
      })
    }, 100)

    const url = URL.createObjectURL(arquivo)

    if (videoRef.current) {
      videoRef.current.src = url

      videoRef.current.onloadedmetadata = () => {
        clearInterval(intervalo)
        setProgresso(100)

        setTimeout(() => {
          if (videoRef.current) {
            const largura = videoRef.current.videoWidth
            const altura = videoRef.current.videoHeight

            setVideoInfo({
              nome: arquivo.name,
              largura,
              altura,
              tamanho: formatarTamanhoArquivo(arquivo.size),
            })

            verificarCompatibilidade(largura, altura)
            setCarregando(false)
          }
        }, 500)
      }

      videoRef.current.onerror = () => {
        clearInterval(intervalo)
        toast({
          title: "Erro",
          description: "Não foi possível processar o vídeo. Verifique se o formato é suportado.",
          variant: "destructive",
        })
        setCarregando(false)
        setProgresso(0)
      }
    }
  }

  const verificarCompatibilidade = (larguraVideo: number, alturaVideo: number) => {
    if (!pontoSelecionado) {
      setCompativel(null)
      toast({
        title: "Atenção",
        description: "Selecione um ponto para verificar a compatibilidade",
      })
      return
    }

    const ponto = pontos.find((p) => p.id === pontoSelecionado)

    if (ponto) {
      const compativel = larguraVideo === ponto.largura && alturaVideo === ponto.altura
      setCompativel(compativel)

      if (compativel) {
        toast({
          title: "Compatível",
          description: `O vídeo tem a resolução ideal para o ponto "${ponto.nome}"`,
        })
      } else {
        toast({
          title: "Incompatível",
          description: `O vídeo não tem a resolução ideal para o ponto "${ponto.nome}"`,
          variant: "destructive",
        })
      }
    }
  }

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const arquivo = e.target.files?.[0]
    if (arquivo) {
      if (!arquivo.type.startsWith("video/")) {
        toast({
          title: "Erro",
          description: "Por favor, selecione um arquivo de vídeo válido",
          variant: "destructive",
        })
        return
      }

      processarVideo(arquivo)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setArrastando(true)
  }

  const handleDragLeave = () => {
    setArrastando(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setArrastando(false)

    const arquivo = e.dataTransfer.files[0]
    if (arquivo) {
      if (!arquivo.type.startsWith("video/")) {
        toast({
          title: "Erro",
          description: "Por favor, arraste um arquivo de vídeo válido",
          variant: "destructive",
        })
        return
      }

      processarVideo(arquivo)
    }
  }

  const handlePontoChange = (valor: string) => {
    setPontoSelecionado(valor)

    if (videoInfo) {
      verificarCompatibilidade(videoInfo.largura, videoInfo.altura)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center mb-6">
        <Link href="/" className="mr-4">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Verificação de Vídeos</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Upload de Vídeo</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                arrastando ? "border-primary bg-primary/5" : "border-muted-foreground/25"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
            >
              {carregando ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-muted-foreground mb-2">Processando vídeo...</p>
                    <Progress value={progresso} className="h-2 w-full" />
                    <p className="text-xs text-muted-foreground mt-2">{progresso}%</p>
                  </div>
                </div>
              ) : videoInfo ? (
                <div className="space-y-4">
                  <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-muted">
                    <CheckCircle className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{videoInfo.nome}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {videoInfo.largura} x {videoInfo.altura} • {videoInfo.tamanho}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation()
                      setVideoInfo(null)
                      setCompativel(null)
                      if (inputRef.current) inputRef.current.value = ""
                    }}
                  >
                    Trocar vídeo
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-muted">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">Clique ou arraste um vídeo para esta área</p>
                    <p className="text-sm text-muted-foreground mt-1">Suporta arquivos MP4 (máx. 100MB)</p>
                  </div>
                </div>
              )}
              <input type="file" ref={inputRef} className="hidden" accept="video/mp4,video/*" onChange={handleUpload} />
            </div>

            <div className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ponto">Selecione o Ponto</Label>
                <Select value={pontoSelecionado} onValueChange={handlePontoChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um ponto" />
                  </SelectTrigger>
                  <SelectContent>
                    {pontos.length === 0 ? (
                      <SelectItem value="none" disabled>
                        Nenhum ponto cadastrado
                      </SelectItem>
                    ) : (
                      pontos.map((ponto) => (
                        <SelectItem key={ponto.id} value={ponto.id}>
                          {ponto.nome} ({ponto.largura}x{ponto.altura})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {pontos.length === 0 && (
                <div className="text-sm text-muted-foreground">
                  <Link href="/cadastro-pontos" className="text-primary hover:underline">
                    Cadastre pontos primeiro
                  </Link>{" "}
                  para poder verificar a compatibilidade.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resultado da Verificação</CardTitle>
          </CardHeader>
          <CardContent>
            {!videoInfo ? (
              <div className="text-center py-12 text-muted-foreground">
                Faça o upload de um vídeo para verificar sua resolução
              </div>
            ) : !pontoSelecionado ? (
              <div className="text-center py-12 text-muted-foreground">
                Selecione um ponto para verificar a compatibilidade
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-muted p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Informações do Vídeo</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Nome:</div>
                    <div className="font-medium">{videoInfo.nome}</div>

                    <div>Resolução:</div>
                    <div className="font-medium">
                      {videoInfo.largura} x {videoInfo.altura}
                    </div>

                    <div>Tamanho:</div>
                    <div className="font-medium">{videoInfo.tamanho}</div>
                  </div>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Ponto Selecionado</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Nome:</div>
                    <div className="font-medium">{pontos.find((p) => p.id === pontoSelecionado)?.nome}</div>

                    <div>Resolução Recomendada:</div>
                    <div className="font-medium">
                      {pontos.find((p) => p.id === pontoSelecionado)?.largura} x{" "}
                      {pontos.find((p) => p.id === pontoSelecionado)?.altura}
                    </div>
                  </div>
                </div>

                <div
                  className={`p-4 rounded-lg ${
                    compativel ? "bg-green-100 dark:bg-green-900/20" : "bg-red-100 dark:bg-red-900/20"
                  }`}
                >
                  <div className="flex items-center">
                    {compativel ? (
                      <>
                        <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400 mr-2" />
                        <div>
                          <h3 className="font-medium text-green-600 dark:text-green-400">Resolução Compatível</h3>
                          <p className="text-sm text-green-600/80 dark:text-green-400/80">
                            Este vídeo tem a resolução ideal para o ponto selecionado.
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-6 w-6 text-red-600 dark:text-red-400 mr-2" />
                        <div>
                          <h3 className="font-medium text-red-600 dark:text-red-400">Resolução Incompatível</h3>
                          <p className="text-sm text-red-600/80 dark:text-red-400/80">
                            Este vídeo não tem a resolução ideal para o ponto selecionado.
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <video ref={videoRef} className="w-full rounded-lg border hidden" controls={false} />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <Toaster />
    </div>
  )
}
