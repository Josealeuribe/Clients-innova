import { useState } from 'react'
import type { BusquedaPorDocumento, CanjePreview } from '@/shared/api/types'
import { cajeroService, getCajeroError } from '../services/cajero.service'
import { buildCanjeSuccessMessage } from '../utils/cajeroFormatters'


interface Options {
  token: string | null | undefined
  onCanjeConfirmado?: () => void
}

export function useCajeroOperaciones({ token, onCanjeConfirmado }: Options) {
  const [codigo, setCodigo] = useState('')
  const [preview, setPreview] = useState<CanjePreview | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [searching, setSearching] = useState(false)
  const [canjeando, setCanjeando] = useState(false)

  const [doc, setDoc] = useState('')
  const [encontrado, setEncontrado] = useState<BusquedaPorDocumento | null>(null)
  const [docError, setDocError] = useState<string | null>(null)
  const [buscandoDoc, setBuscandoDoc] = useState(false)

  const buscarCodigo = async () => {
    if (!token || !codigo.trim()) return

    setError(null)
    setSuccess(null)
    setPreview(null)
    setSearching(true)

    try {
      const result = await cajeroService.buscarCodigo(token, codigo.trim())
      setPreview(result)
    } catch (err) {
      setError(getCajeroError(err, 'No se pudo buscar el código.'))
    } finally {
      setSearching(false)
    }
  }

  const confirmarCodigo = async () => {
    if (!token || !preview) return

    setError(null)
    setCanjeando(true)

    try {
      const result = await cajeroService.confirmarCanje(token, preview.codigo)
      setSuccess(buildCanjeSuccessMessage(result))
      setPreview(null)
      setCodigo('')
      onCanjeConfirmado?.()
    } catch (err) {
      setError(getCajeroError(err, 'No se pudo confirmar el canje.'))
    } finally {
      setCanjeando(false)
    }
  }

  const buscarDocumento = async () => {
    if (!token || !doc.trim()) return

    setDocError(null)
    setEncontrado(null)
    setSuccess(null)
    setBuscandoDoc(true)

    try {
      setEncontrado(await cajeroService.buscarPorDocumento(token, doc.trim()))
    } catch (err) {
      setDocError(getCajeroError(err, 'No se pudo buscar el documento.'))
    } finally {
      setBuscandoDoc(false)
    }
  }

  const confirmarDocumento = async () => {
    if (!token || !encontrado?.bono) return

    setDocError(null)
    setCanjeando(true)

    try {
      const result = await cajeroService.confirmarCanje(token, encontrado.bono.codigo)
      setSuccess(buildCanjeSuccessMessage(result))
      onCanjeConfirmado?.()

      // Igual que en el componente original: refresca la ficha para reflejar
      // inmediatamente que el bono ya quedó reclamado.
      setEncontrado(await cajeroService.buscarPorDocumento(token, encontrado.cliente.docNumero))
    } catch (err) {
      setDocError(getCajeroError(err, 'No se pudo confirmar el canje.'))
    } finally {
      setCanjeando(false)
    }
  }

  return {
    codigo,
    setCodigo,
    preview,
    error,
    success,
    searching,
    canjeando,
    buscarCodigo,
    confirmarCodigo,
    doc,
    setDoc,
    encontrado,
    docError,
    buscandoDoc,
    buscarDocumento,
    confirmarDocumento,
  }
}
