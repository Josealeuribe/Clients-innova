// TRAGAMONEDAS 3D DE GIRA Y GANA
//
// Reemplaza en la portada de Gira y Gana a la ruleta 3D (Roulette3D), que se
// conserva intacta porque la sigue usando la página /ruleta. Boceto de
// referencia: shared/assets/images/tragamonedas.webp — de él se toma la FORMA
// clásica (cabezal, ventana con 3 rodillos, panel inferior, bandeja y palanca
// con bola roja), vestida con la identidad de Gran Casino Cúcuta.
//
// DOS MODOS
//
//   · Vitrina (portada de Gira y Gana): gira sola cada pocos segundos y al
//     clic en la palanca. El resultado es decorativo.
//   · Controlado (página /ruleta, props `giro` / `onPalanca`): no gira sola.
//     La página pide el giro al servidor y le manda la combinación en la que
//     debe parar (combinacionPara). La máquina NUNCA decide un premio: el
//     sorteo vive en server/src/utils/sorteoPremios.ts y planTragamonedas.ts.
//
// Todo se dibuja en el navegador: geometría de three.js y texturas pintadas en
// <canvas> (rodillos, cabezal, panel). No se descarga ningún modelo ni mapa de
// entorno, así que no depende de CDNs externos.
import { Suspense, useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, type ThreeEvent } from '@react-three/fiber'
import { ContactShadows, Environment, Float, Lightformer, PresentationControls, RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { MonitorX } from 'lucide-react'

// ------------------------------------------------------------------ símbolos

export type Simbolo = '7' | 'BAR' | '🍒' | '🍎' | '🍌' | '🍋' | '🍉' | '🔔' | '🍇' | '⭐'

// Cada rodillo lleva los mismos 10 símbolos en distinto orden, como en una
// máquina real: así las tres columnas no se ven iguales.
const RODILLOS: Simbolo[][] = [
  ['7', '🍒', 'BAR', '🍎', '🍋', '🔔', '🍌', '🍉', '🍇', '⭐'],
  ['🍌', '7', '🍉', 'BAR', '🍒', '⭐', '🍎', '🔔', '🍋', '🍇'],
  ['🍎', '🔔', '7', '🍇', 'BAR', '🍋', '🍒', '⭐', '🍉', '🍌'],
]
const N = 10
const PASO = (Math.PI * 2) / N

// Combinación ganadora de cada bono (la que se ve en la línea de pago). Es
// también lo que explica la tabla de premios de la máquina y de /ruleta.
export const SIMBOLO_DE_PREMIO: Record<string, Simbolo> = {
  'bono-10000': '🍒',
  'bono-20000': '🔔',
  'bono-50000': '7',
}

/** Tres símbolos para la línea de pago según el resultado del servidor. */
export function combinacionPara(clavePremio: string | null): [Simbolo, Simbolo, Simbolo] {
  if (clavePremio) {
    // Un premio desconocido (retirado) se entrega como el bono de $10.000.
    const s = SIMBOLO_DE_PREMIO[clavePremio] ?? '🍒'
    return [s, s, s]
  }
  // Giro sin premio: cualquier combinación que NO sea tres iguales. A veces
  // sale "casi" (dos iguales), como en una máquina de verdad.
  const todos = RODILLOS[0]
  const azar = () => todos[Math.floor(Math.random() * todos.length)]
  for (;;) {
    const c: [Simbolo, Simbolo, Simbolo] = [azar(), azar(), azar()]
    if (Math.random() < 0.35) c[1] = c[0]
    if (!(c[0] === c[1] && c[1] === c[2])) return c
  }
}

/** Orden para la máquina: girar y detenerse en `simbolos`. */
export interface GiroTragamonedas {
  id: number
  simbolos: [Simbolo, Simbolo, Simbolo]
}

// Medidas del rodillo (unidades de escena).
const R_RODILLO = 0.75
const ANCHO_RODILLO = 0.8
const SEP_RODILLO = 0.06

// Paleta de la marca.
const C = {
  oro: '#D4AF37',
  oroClaro: '#F0C847',
  oroOscuro: '#A0832A',
  rojo: '#B52020',
  rojoOscuro: '#7B1515',
  crema: '#F5E6C8',
  negro: '#0a0805',
}

const FUENTE_EMOJI = '"Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif'

// ------------------------------------------------------------------ texturas

function crearCanvas(w: number, h: number) {
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  return [canvas, canvas.getContext('2d')!] as const
}

function aTextura(canvas: HTMLCanvasElement) {
  const t = new THREE.CanvasTexture(canvas)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 8
  return t
}

function textoDorado(ctx: CanvasRenderingContext2D, y0: number, y1: number) {
  const g = ctx.createLinearGradient(0, y0, 0, y1)
  g.addColorStop(0, '#FFF1B8')
  g.addColorStop(0.35, C.oroClaro)
  g.addColorStop(0.7, C.oro)
  g.addColorStop(1, C.oroOscuro)
  return g
}

// Un símbolo centrado en (0,0). El rodillo va acostado, así que quien llama
// gira el lienzo 90° antes de dibujar (ver texturaRodillo).
function dibujarSimbolo(ctx: CanvasRenderingContext2D, s: Simbolo, alto: number) {
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  if (s === '7') {
    ctx.font = `900 ${alto * 1.05}px Georgia, "Times New Roman", serif`
    ctx.lineJoin = 'round'
    ctx.lineWidth = alto * 0.09
    ctx.strokeStyle = C.oroOscuro
    ctx.strokeText('7', 0, alto * 0.04)
    const g = ctx.createLinearGradient(0, -alto / 2, 0, alto / 2)
    g.addColorStop(0, '#FF4A3D')
    g.addColorStop(1, '#A3120C')
    ctx.fillStyle = g
    ctx.fillText('7', 0, alto * 0.04)
    return
  }
  if (s === 'BAR') {
    const w = alto * 1.45
    const h = alto * 0.42
    ctx.fillStyle = '#111'
    ctx.beginPath()
    ctx.roundRect(-w / 2, -h / 2, w, h, h * 0.18)
    ctx.fill()
    ctx.strokeStyle = C.oro
    ctx.lineWidth = alto * 0.035
    ctx.stroke()
    ctx.fillStyle = '#fff'
    ctx.font = `900 ${h * 0.72}px Inter, Arial, sans-serif`
    ctx.fillText('BAR', 0, h * 0.05)
    return
  }
  // El color de relleno tiene que ser OPACO: el navegador aplica su alfa
  // también a los emojis, y con el color semitransparente de los separadores
  // las frutas salían desteñidas.
  ctx.fillStyle = '#000'
  ctx.font = `${alto * 0.86}px ${FUENTE_EMOJI}`
  ctx.fillText(s, 0, alto * 0.06)
}

function texturaRodillo(simbolos: Simbolo[]) {
  // Proporción de cada casilla = arco del rodillo / ancho del rodillo, para que
  // los símbolos no salgan estirados al envolver el cilindro.
  const celdaU = 220
  const celdaV = Math.round(celdaU * (ANCHO_RODILLO / (R_RODILLO * PASO)))
  const [canvas, ctx] = crearCanvas(celdaU * N, celdaV)

  const fondo = ctx.createLinearGradient(0, 0, 0, celdaV)
  fondo.addColorStop(0, '#E9E2D2')
  fondo.addColorStop(0.5, '#FFFDF7')
  fondo.addColorStop(1, '#E9E2D2')
  ctx.fillStyle = fondo
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  simbolos.forEach((s, i) => {
    // Separador entre casillas.
    ctx.fillStyle = 'rgba(160,131,42,0.35)'
    ctx.fillRect(i * celdaU, 0, 3, celdaV)
    ctx.save()
    // La U de la textura recorre el rodillo de abajo hacia arriba en pantalla,
    // así que el símbolo se dibuja girado 90° para que quede derecho.
    ctx.translate(i * celdaU + celdaU / 2, celdaV / 2)
    ctx.rotate(Math.PI / 2)
    dibujarSimbolo(ctx, s, celdaU * 0.84)
    ctx.restore()
  })
  const t = aTextura(canvas)
  t.wrapS = THREE.RepeatWrapping
  return t
}

// Puntos de luz pintados (como los bombillos del boceto).
function bombillosPintados(ctx: CanvasRenderingContext2D, cx: number, cy: number, rx: number, ry: number, n: number) {
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2
    const x = cx + Math.cos(a) * rx
    const y = cy + Math.sin(a) * ry
    const g = ctx.createRadialGradient(x, y, 0, x, y, 9)
    g.addColorStop(0, '#FFFBE6')
    g.addColorStop(0.5, C.oroClaro)
    g.addColorStop(1, 'rgba(240,200,71,0)')
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(x, y, 9, 0, Math.PI * 2)
    ctx.fill()
  }
}

// Confeti de "7" y "$" de fondo, como el estampado del boceto.
function estampado(ctx: CanvasRenderingContext2D, w: number, h: number, semilla: number) {
  let s = semilla
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  for (let i = 0; i < 70; i++) {
    ctx.fillStyle = i % 3 === 0 ? 'rgba(240,200,71,0.22)' : 'rgba(255,255,255,0.08)'
    ctx.font = `700 ${18 + rnd() * 16}px Georgia, serif`
    ctx.fillText(i % 2 ? '7' : '$', rnd() * w, rnd() * h)
  }
}

function marcoDorado(ctx: CanvasRenderingContext2D, w: number, h: number, grosor: number) {
  ctx.strokeStyle = textoDorado(ctx, 0, h)
  ctx.lineWidth = grosor
  ctx.strokeRect(grosor / 2, grosor / 2, w - grosor, h - grosor)
  ctx.strokeStyle = 'rgba(240,200,71,0.45)'
  ctx.lineWidth = 2
  ctx.strokeRect(grosor * 1.8, grosor * 1.8, w - grosor * 3.6, h - grosor * 3.6)
}

function texturaCabezal() {
  const [w, h] = [1024, 380]
  const [canvas, ctx] = crearCanvas(w, h)
  const g = ctx.createLinearGradient(0, 0, 0, h)
  g.addColorStop(0, '#3A0707')
  g.addColorStop(0.5, C.rojoOscuro)
  g.addColorStop(1, '#2A0404')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)
  estampado(ctx, w, h, 7)
  marcoDorado(ctx, w, h, 14)

  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = '900 132px Georgia, "Times New Roman", serif'
  ctx.lineWidth = 10
  ctx.strokeStyle = '#2A0404'
  ctx.strokeText('GRAN CASINO', w / 2, 150)
  ctx.fillStyle = textoDorado(ctx, 90, 210)
  ctx.fillText('GRAN CASINO', w / 2, 150)

  // Óvalo con el 7, como el emblema central del boceto.
  ctx.fillStyle = 'rgba(10,8,5,0.6)'
  ctx.beginPath()
  ctx.ellipse(w / 2, 285, 230, 56, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = C.oro
  ctx.lineWidth = 4
  ctx.stroke()
  ctx.font = '800 40px Inter, Arial, sans-serif'
  ctx.fillStyle = C.crema
  ctx.fillText('♦  C Ú C U T A  ♦', w / 2, 287)
  return aTextura(canvas)
}

function texturaPanelInferior() {
  const [w, h] = [1024, 680]
  const [canvas, ctx] = crearCanvas(w, h)
  const g = ctx.createRadialGradient(w / 2, h / 2, 40, w / 2, h / 2, w * 0.7)
  g.addColorStop(0, '#8E1A1A')
  g.addColorStop(0.6, C.rojoOscuro)
  g.addColorStop(1, '#240303')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)
  estampado(ctx, w, h, 21)
  marcoDorado(ctx, w, h, 16)

  const [cx, cy, rx, ry] = [w / 2, h / 2 + 10, 380, 210]
  ctx.fillStyle = 'rgba(10,8,5,0.72)'
  ctx.beginPath()
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = textoDorado(ctx, cy - ry, cy + ry)
  ctx.lineWidth = 10
  ctx.stroke()
  bombillosPintados(ctx, cx, cy, rx + 34, ry + 34, 40)

  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = '900 58px Inter, Arial, sans-serif'
  ctx.fillStyle = C.crema
  ctx.fillText('GIRA  Y  GANA', cx, cy - 128)

  ctx.font = '900 230px Georgia, "Times New Roman", serif'
  ctx.lineWidth = 16
  ctx.strokeStyle = C.oroOscuro
  ctx.strokeText('777', cx, cy + 18)
  const r = ctx.createLinearGradient(0, cy - 100, 0, cy + 120)
  r.addColorStop(0, '#FF5446')
  r.addColorStop(1, '#9E100B')
  ctx.fillStyle = r
  ctx.fillText('777', cx, cy + 18)

  ctx.font = '800 31px Inter, Arial, sans-serif'
  ctx.fillStyle = textoDorado(ctx, cy + 120, cy + 170)
  ctx.fillText('$10.000 · $20.000 · $50.000', cx, cy + 150)
  return aTextura(canvas)
}

function texturaTabla() {
  // La franja de premios sobre los rodillos ("WINS" en el boceto).
  const [w, h] = [1024, 120]
  const [canvas, ctx] = crearCanvas(w, h)
  ctx.fillStyle = '#120E07'
  ctx.fillRect(0, 0, w, h)
  marcoDorado(ctx, w, h, 6)
  const grupos: [string, string][] = [
    ['🍒🍒🍒', '$10.000'],
    ['7 7 7', '$50.000'],
    ['🔔🔔🔔', '$20.000'],
  ]
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  grupos.forEach(([simb, premio], i) => {
    const x = (w / 3) * i + w / 6
    if (simb.startsWith('7')) {
      ctx.font = '900 54px Georgia, serif'
      ctx.fillStyle = '#FF4A3D'
    } else {
      ctx.font = `44px ${FUENTE_EMOJI}`
      ctx.fillStyle = '#fff'
    }
    ctx.fillText(simb, x, 46)
    ctx.font = '800 26px Inter, Arial, sans-serif'
    ctx.fillStyle = C.oroClaro
    ctx.fillText(premio, x, 94)
    if (i > 0) {
      ctx.fillStyle = 'rgba(212,175,55,0.4)'
      ctx.fillRect((w / 3) * i, 18, 2, h - 36)
    }
  })
  return aTextura(canvas)
}

function texturaCorona() {
  const [w, h] = [640, 160]
  const [canvas, ctx] = crearCanvas(w, h)
  const g = ctx.createLinearGradient(0, 0, 0, h)
  g.addColorStop(0, '#1A1408')
  g.addColorStop(1, '#0A0805')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = '900 96px Georgia, serif'
  ctx.fillStyle = textoDorado(ctx, 30, 130)
  ctx.fillText('JACKPOT', w / 2, h / 2 + 6)
  return aTextura(canvas)
}

// ------------------------------------------------------------------ materiales

function useMateriales() {
  return useMemo(
    () => ({
      oro: new THREE.MeshStandardMaterial({ color: C.oro, metalness: 1, roughness: 0.26 }),
      oroBrillante: new THREE.MeshStandardMaterial({ color: C.oroClaro, metalness: 1, roughness: 0.14 }),
      cromo: new THREE.MeshStandardMaterial({ color: '#E8E4DA', metalness: 1, roughness: 0.12 }),
      negro: new THREE.MeshStandardMaterial({ color: '#0E0C08', metalness: 0.4, roughness: 0.45 }),
      rojo: new THREE.MeshPhysicalMaterial({ color: '#C8161A', metalness: 0.1, roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.05 }),
    }),
    [],
  )
}

// ------------------------------------------------------------------ escena

const easeOutBack = (t: number) => {
  const c1 = 1.25
  const c3 = c1 + 1
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
}

interface GiroRodillo {
  desde: number
  hasta: number
  inicio: number
  duracion: number
}

interface PropsMaquina {
  vitrina: boolean
  giro?: GiroTragamonedas | null
  onGiroCompleto?: () => void
  onPalanca?: () => void
}

function Maquina({ vitrina, giro, onGiroCompleto, onPalanca }: PropsMaquina) {
  const m = useMateriales()
  const tex = useMemo(
    () => ({
      rodillos: RODILLOS.map(texturaRodillo),
      cabezal: texturaCabezal(),
      panel: texturaPanelInferior(),
      tabla: texturaTabla(),
      corona: texturaCorona(),
    }),
    [],
  )

  const rodillosRef = useRef<(THREE.Group | null)[]>([])
  const palancaRef = useRef<THREE.Group>(null)
  const bombillosRef = useRef<THREE.MeshStandardMaterial[]>([])
  const giros = useRef<(GiroRodillo | null)[]>([null, null, null])
  const tironRef = useRef<number | null>(null)
  const reloj = useRef(0)

  // Arranca mostrando 7-7-7 en la línea de pago.
  useEffect(() => {
    rodillosRef.current.forEach((g, i) => {
      if (g) g.rotation.x = RODILLOS[i].indexOf('7') * PASO + PASO / 2
    })
  }, [])

  // Aviso pendiente de "terminó el giro" (solo en el modo controlado).
  const avisarAlTerminar = useRef(false)
  const onCompletoRef = useRef(onGiroCompleto)
  onCompletoRef.current = onGiroCompleto

  // `destinos`: casilla en la que para cada rodillo. Sin ellos (vitrina) para
  // en una al azar. `largo` alarga el giro cuando hay un premio en juego.
  const tirar = (destinos?: number[], largo = false) => {
    if (tironRef.current !== null || giros.current.some(Boolean)) return
    tironRef.current = reloj.current
    rodillosRef.current.forEach((g, i) => {
      if (!g) return
      const destino = destinos?.[i] ?? Math.floor(Math.random() * N)
      const vueltas = (largo ? 5 : 3) + i * (largo ? 2 : 1)
      const actual = g.rotation.x
      const base = Math.ceil(actual / (Math.PI * 2)) * Math.PI * 2
      giros.current[i] = {
        desde: actual,
        hasta: base + vueltas * Math.PI * 2 + destino * PASO + PASO / 2,
        inicio: reloj.current + 0.35,
        duracion: largo ? 2.4 + i * 0.75 : 1.5 + i * 0.45,
      }
    })
  }

  // Modo controlado: cada orden nueva gira hasta los símbolos que trae.
  useEffect(() => {
    if (!giro) return
    const destinos = giro.simbolos.map((s, i) => RODILLOS[i].indexOf(s))
    avisarAlTerminar.current = true
    tirar(destinos, true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [giro?.id])

  // Modo vitrina: tira la palanca sola cada pocos segundos.
  useEffect(() => {
    if (!vitrina) return
    const primero = window.setTimeout(tirar, 1400)
    const id = window.setInterval(tirar, 6500)
    return () => {
      window.clearTimeout(primero)
      window.clearInterval(id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vitrina])

  useFrame((_, delta) => {
    reloj.current += delta
    const t = reloj.current

    // Palanca: baja rápido y vuelve con un pequeño rebote.
    const palanca = palancaRef.current
    if (palanca) {
      if (tironRef.current !== null) {
        const p = (t - tironRef.current) / 0.9
        if (p >= 1) {
          palanca.rotation.x = 0
          tironRef.current = null
        } else {
          const bajada = p < 0.3 ? p / 0.3 : 1 - easeOutBack((p - 0.3) / 0.7)
          palanca.rotation.x = Math.max(-0.05, bajada) * 1.15
        }
      }
    }

    // Rodillos.
    giros.current.forEach((g, i) => {
      const rodillo = rodillosRef.current[i]
      if (!g || !rodillo) return
      const p = Math.min(1, Math.max(0, (t - g.inicio) / g.duracion))
      rodillo.rotation.x = g.desde + (g.hasta - g.desde) * easeOutBack(p)
      if (p >= 1) giros.current[i] = null
    })
    if (avisarAlTerminar.current && !giros.current.some(Boolean) && tironRef.current === null) {
      avisarAlTerminar.current = false
      onCompletoRef.current?.()
    }

    // Bombillos en persecución; todos encendidos mientras giran los rodillos.
    const girando = giros.current.some(Boolean)
    bombillosRef.current.forEach((mat, i) => {
      if (!mat) return
      const on = girando ? Math.sin(t * 18 + i) > -0.2 : (Math.floor(t * 6) + i) % 4 === 0
      mat.emissiveIntensity = on ? 2.6 : 0.35
    })
  })

  const cursor = (v: string) => () => {
    document.body.style.cursor = v
  }
  // En el modo controlado la palanca no gira por su cuenta: le pide el giro a
  // la página (que llama al servidor y luego manda la orden).
  const alClic = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    if (onPalanca) onPalanca()
    else tirar()
  }

  // Bombillos alrededor del cabezal.
  const bombillos = useMemo(() => {
    const pts: [number, number][] = []
    const [w, h] = [3.1, 1.12]
    for (let i = 0; i <= 10; i++) pts.push([-w / 2 + (w * i) / 10, h / 2])
    for (let i = 0; i <= 10; i++) pts.push([-w / 2 + (w * i) / 10, -h / 2])
    for (let i = 1; i < 3; i++) pts.push([-w / 2, -h / 2 + (h * i) / 3], [w / 2, -h / 2 + (h * i) / 3])
    return pts
  }, [])

  const xRodillo = (i: number) => (i - 1) * (ANCHO_RODILLO + SEP_RODILLO)

  return (
    <group position={[-0.15, 0, 0]}>
      {/* ---------- Mueble ---------- */}
      <RoundedBox args={[3.2, 5.6, 1.4]} radius={0.1} smoothness={4} material={m.oro} castShadow receiveShadow />
      {/* Zócalo */}
      <RoundedBox args={[3.45, 0.28, 1.65]} radius={0.06} position={[0, -2.86, 0.05]} material={m.negro} castShadow />

      {/* ---------- Corona JACKPOT ---------- */}
      <RoundedBox args={[2.3, 0.6, 0.9]} radius={0.08} position={[0, 3.08, 0.05]} material={m.oroBrillante} castShadow />
      <mesh position={[0, 3.08, 0.505]}>
        <planeGeometry args={[2.05, 0.46]} />
        <meshStandardMaterial map={tex.corona} emissiveMap={tex.corona} emissive="#ffffff" emissiveIntensity={0.35} roughness={0.4} />
      </mesh>

      {/* ---------- Cabezal ---------- */}
      <RoundedBox args={[3.35, 1.2, 1.75]} radius={0.08} position={[0, 2.18, 0.17]} material={m.oroBrillante} castShadow />
      <mesh position={[0, 2.18, 1.05]}>
        <planeGeometry args={[3.0, 1.0]} />
        <meshStandardMaterial map={tex.cabezal} emissiveMap={tex.cabezal} emissive="#ffffff" emissiveIntensity={0.3} roughness={0.35} />
      </mesh>
      {bombillos.map(([x, y], i) => (
        <mesh key={i} position={[x, 2.18 + y, 1.07]}>
          <sphereGeometry args={[0.045, 12, 12]} />
          <meshStandardMaterial
            ref={(mat) => {
              if (mat) bombillosRef.current[i] = mat
            }}
            color="#FFF3C4"
            emissive={C.oroClaro}
            emissiveIntensity={0.35}
            toneMapped={false}
          />
        </mesh>
      ))}

      {/* ---------- Ventana de rodillos ---------- */}
      {/* Fondo oscuro detrás de los rodillos */}
      <mesh position={[0, 0.75, 0.705]}>
        <planeGeometry args={[2.9, 1.5]} />
        <meshStandardMaterial color="#050403" roughness={0.9} />
      </mesh>

      {RODILLOS.map((_, i) => (
        <group
          key={i}
          position={[xRodillo(i), 0.75, 0.66]}
          ref={(g) => {
            rodillosRef.current[i] = g
          }}
        >
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[R_RODILLO, R_RODILLO, ANCHO_RODILLO, 64, 1, true]} />
            <meshStandardMaterial map={tex.rodillos[i]} roughness={0.42} metalness={0} side={THREE.DoubleSide} />
          </mesh>
          {/* Tapas laterales cromadas */}
          {[-1, 1].map((lado) => (
            <mesh key={lado} rotation={[0, 0, Math.PI / 2]} position={[(lado * ANCHO_RODILLO) / 2, 0, 0]}>
              <cylinderGeometry args={[R_RODILLO + 0.02, R_RODILLO + 0.02, 0.025, 48]} />
              <primitive object={m.cromo} attach="material" />
            </mesh>
          ))}
        </group>
      ))}

      {/* Marco (capó) alrededor de la ventana: los rodillos se ven hundidos. */}
      <mesh position={[0, 1.58, 1.08]} material={m.cromo} castShadow>
        <boxGeometry args={[3.2, 0.34, 0.8]} />
      </mesh>
      <mesh position={[0, 1.58, 1.485]}>
        <planeGeometry args={[3.0, 0.27]} />
        <meshStandardMaterial map={tex.tabla} emissiveMap={tex.tabla} emissive="#ffffff" emissiveIntensity={0.45} />
      </mesh>
      {[-1, 1].map((lado) => (
        <mesh key={lado} position={[lado * 1.47, 0.75, 1.08]} material={m.cromo} castShadow>
          <boxGeometry args={[0.26, 1.5, 0.8]} />
        </mesh>
      ))}
      {/* Repisa inferior, más saliente, como la del boceto */}
      <RoundedBox args={[3.3, 0.24, 1.15]} radius={0.05} position={[0, -0.08, 1.2]} material={m.oroBrillante} castShadow />

      {/* Vidrio y línea de pago */}
      <mesh position={[0, 0.75, 1.47]}>
        <planeGeometry args={[2.68, 1.32]} />
        <meshPhysicalMaterial color="#ffffff" transparent opacity={0.08} roughness={0.04} metalness={0} clearcoat={1} />
      </mesh>
      <mesh position={[0, 0.75, 1.46]}>
        <boxGeometry args={[2.68, 0.022, 0.005]} />
        <meshStandardMaterial color={C.rojo} emissive="#FF2A1F" emissiveIntensity={2.2} toneMapped={false} />
      </mesh>

      {/* ---------- Panel inferior ---------- */}
      <mesh position={[0, -1.32, 0.705]}>
        <planeGeometry args={[2.95, 1.96]} />
        <meshStandardMaterial map={tex.panel} emissiveMap={tex.panel} emissive="#ffffff" emissiveIntensity={0.28} roughness={0.38} />
      </mesh>

      {/* ---------- Bandeja de monedas ---------- */}
      <RoundedBox args={[1.6, 0.42, 0.5]} radius={0.05} position={[0, -2.5, 0.9]} material={m.oroBrillante} castShadow />
      <mesh position={[0, -2.48, 1.152]}>
        <planeGeometry args={[1.35, 0.26]} />
        <meshStandardMaterial color="#050403" roughness={1} />
      </mesh>

      {/* ---------- Palanca ---------- */}
      <group position={[1.62, 0.55, 0.1]}>
        {/* Caja del mecanismo */}
        <RoundedBox args={[0.22, 0.75, 0.6]} radius={0.05} position={[0.08, 0, 0]} material={m.cromo} castShadow />
        <mesh rotation={[0, 0, Math.PI / 2]} position={[0.26, 0, 0]} material={m.oroBrillante} castShadow>
          <cylinderGeometry args={[0.2, 0.2, 0.2, 40]} />
        </mesh>
        <group
          ref={palancaRef}
          position={[0.36, 0, 0]}
          onClick={alClic}
          onPointerOver={cursor('pointer')}
          onPointerOut={cursor('auto')}
        >
          <mesh position={[0, 0.85, 0]} material={m.negro} castShadow>
            <cylinderGeometry args={[0.055, 0.07, 1.7, 24]} />
          </mesh>
          <mesh position={[0, 1.78, 0]} material={m.rojo} castShadow>
            <sphereGeometry args={[0.24, 40, 40]} />
          </mesh>
        </group>
      </group>

    </group>
  )
}

// ------------------------------------------------------------------ canvas

interface Props {
  className?: string
  /**
   * Modo controlado (página /ruleta): la máquina NO gira sola; gira cuando
   * llega una orden nueva y se detiene en sus símbolos.
   */
  giro?: GiroTragamonedas | null
  onGiroCompleto?: () => void
  /** Clic en la palanca en el modo controlado. */
  onPalanca?: () => void
}

export default function SlotMachine3D({ className = '', giro, onGiroCompleto, onPalanca }: Props) {
  const controlada = giro !== undefined || onPalanca !== undefined
  // Quien pide menos movimiento en su sistema ve la máquina quieta; la palanca
  // sigue funcionando al hacer clic. En el modo controlado nunca gira sola.
  const vitrina = useMemo(
    () =>
      !controlada &&
      (typeof window === 'undefined' || !window.matchMedia('(prefers-reduced-motion: reduce)').matches),
    [controlada],
  )

  return (
    <div className={`relative h-full w-full ${className}`} aria-label="Máquina tragamonedas 3D de Gran Casino Cúcuta">
      <Canvas
        shadows
        dpr={[1, 1.75]}
        // La máquina mide ~6,6 unidades de alto (zócalo a corona): a esta
        // distancia cabe entera con margen para el vaivén de <Float>.
        camera={{ position: [1.6, 1.0, 13.4], fov: 30, near: 0.1, far: 60 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance', failIfMajorPerformanceCaveat: false }}
        onCreated={({ gl, camera }) => {
          gl.outputColorSpace = THREE.SRGBColorSpace
          gl.toneMapping = THREE.ACESFilmicToneMapping
          gl.toneMappingExposure = 1.05
          gl.setClearColor(0x000000, 0)
          camera.lookAt(0, 0.25, 0)
        }}
        fallback={
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 px-6 text-center">
            <MonitorX size={40} className="text-[#D4AF37]" />
            <p className="text-sm font-semibold text-[#F5E6C8]">Tu navegador no admite gráficos 3D (WebGL)</p>
          </div>
        }
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.35} />
          <directionalLight position={[5, 8, 7]} intensity={1.6} castShadow shadow-mapSize={[1024, 1024]} />
          <pointLight position={[-4, 2, 4]} intensity={18} color={C.rojo} distance={14} />
          <pointLight position={[4, -1, 5]} intensity={14} color={C.oroClaro} distance={14} />

          {/* Entorno hecho de paneles de luz locales: da los reflejos del oro
              y el cromo sin descargar un mapa HDR de internet. */}
          <Environment resolution={256} frames={1}>
            <Lightformer intensity={2.2} position={[0, 5, 6]} scale={[12, 3, 1]} />
            <Lightformer intensity={1.4} position={[-6, 1, 3]} rotation-y={Math.PI / 2} scale={[8, 4, 1]} color={C.oroClaro} />
            <Lightformer intensity={1.2} position={[6, 1, 3]} rotation-y={-Math.PI / 2} scale={[8, 4, 1]} />
            <Lightformer intensity={0.8} position={[0, -4, 4]} rotation-x={Math.PI / 2} scale={[10, 3, 1]} color={C.rojo} />
          </Environment>

          {/* Se puede girar arrastrando, con límites, y vuelve sola al soltar. */}
          <PresentationControls
            global
            snap
            rotation={[0.02, -0.16, 0]}
            polar={[-0.12, 0.18]}
            azimuth={[-0.55, 0.45]}
            speed={1.4}
          >
            <Float speed={1.4} rotationIntensity={0.08} floatIntensity={0.25} floatingRange={[-0.05, 0.05]}>
              <Maquina vitrina={vitrina} giro={giro} onGiroCompleto={onGiroCompleto} onPalanca={onPalanca} />
            </Float>
          </PresentationControls>

          <ContactShadows position={[0, -3.05, 0]} opacity={0.55} scale={9} blur={2.6} far={4} color="#000000" />
        </Suspense>
      </Canvas>

      <div
        className="pointer-events-none absolute inset-x-[14%] bottom-[3%] h-[14%] rounded-full blur-3xl"
        style={{ background: 'rgba(212,175,55,0.14)' }}
      />
    </div>
  )
}
