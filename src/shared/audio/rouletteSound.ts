// Sonido de la ruleta, sintetizado con Web Audio API.
//
// POR QUÉ NO HAY ARCHIVOS DE AUDIO
//
// La alternativa habitual sería una librería tipo howler.js reproduciendo
// mp3/ogg grabados. Se descartó por tres razones:
//
//   1. Licencias. Un sonido de ruleta descargado de internet casi nunca trae
//      licencia clara para uso comercial, y esto es un casino real.
//   2. Peso. El bundle ya pesa 39 MB por los videos; sumar audio empeora un
//      problema que ya existe.
//   3. Calidad. Un loop grabado no sabe a qué velocidad va la bola. Aquí los
//      ticks se generan siguiendo la MISMA curva de desaceleración que usa la
//      animación 3D, así que el sonido va perfectamente pegado a la imagen.
//
// Si más adelante consiguen sonidos propios con licencia, este módulo es el
// único punto a cambiar: la interfaz (`spin`, `win`, `stop`) se mantiene y
// por dentro se reemplaza la síntesis por reproducción de archivos.

export interface RouletteSound {
  /** Arranca el sonido del giro. `durationMs` debe ser el mismo de la animación. */
  spin: (durationMs: number) => void
  /** Fanfarria corta al revelarse el premio. */
  win: () => void
  /** Corta todo (desmontaje del componente, o si el usuario silencia). */
  stop: () => void
}

// La bola rueda por el borde hasta ~52% del giro y ahí cae al plato: es el
// mismo punto donde la animación 3D empieza `dropProgress`. Antes de eso se
// oye rodar; después, los golpes contra los separadores.
const INICIO_CAIDA = 0.52

// Cadencia de los golpes: arranca rápido al caer y se va abriendo hasta el
// último rebote.
const INTERVALO_TICK_INICIAL_MS = 55
const INTERVALO_TICK_FINAL_MS = 340

function crearRuidoBlanco(ctx: AudioContext, segundos: number): AudioBuffer {
  const muestras = Math.floor(ctx.sampleRate * segundos)
  const buffer = ctx.createBuffer(1, muestras, ctx.sampleRate)
  const datos = buffer.getChannelData(0)
  for (let i = 0; i < muestras; i++) datos[i] = Math.random() * 2 - 1
  return buffer
}

export function createRouletteSound(): RouletteSound {
  let ctx: AudioContext | null = null
  let master: GainNode | null = null
  let ruido: AudioBuffer | null = null
  let fuentesActivas: AudioScheduledSourceNode[] = []
  let temporizadores: number[] = []

  // El AudioContext solo se puede crear (o reanudar) dentro de un gesto del
  // usuario: los navegadores bloquean el autoplay. Como esto se llama desde
  // el clic en "Girar Ruleta", el gesto está garantizado.
  function asegurarContexto(): AudioContext | null {
    if (typeof window === 'undefined') return null
    if (!ctx) {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!Ctor) return null // navegador sin Web Audio: la ruleta sigue funcionando, muda
      ctx = new Ctor()
      master = ctx.createGain()
      master.gain.value = 0.32
      master.connect(ctx.destination)
      ruido = crearRuidoBlanco(ctx, 1)
    }
    if (ctx.state === 'suspended') void ctx.resume()
    return ctx
  }

  function limpiar() {
    for (const id of temporizadores) window.clearTimeout(id)
    temporizadores = []
    for (const fuente of fuentesActivas) {
      try {
        fuente.stop()
      } catch {
        // Ya había terminado por su cuenta.
      }
    }
    fuentesActivas = []
  }

  // Golpe seco de la bola contra un separador: un pulso de ruido muy corto
  // filtrado en banda, con caída exponencial. El tono sube un poco al azar
  // para que no suene a metrónomo.
  function tick(cuando: number, intensidad: number) {
    if (!ctx || !master || !ruido) return
    const fuente = ctx.createBufferSource()
    fuente.buffer = ruido

    const filtro = ctx.createBiquadFilter()
    filtro.type = 'bandpass'
    filtro.frequency.value = 1800 + Math.random() * 900
    filtro.Q.value = 9

    const envolvente = ctx.createGain()
    envolvente.gain.setValueAtTime(0, cuando)
    envolvente.gain.linearRampToValueAtTime(intensidad, cuando + 0.002)
    envolvente.gain.exponentialRampToValueAtTime(0.0001, cuando + 0.05)

    fuente.connect(filtro).connect(envolvente).connect(master)
    fuente.start(cuando)
    fuente.stop(cuando + 0.06)
    fuentesActivas.push(fuente)
  }

  // Zumbido de la bola rodando por el borde. Es ruido pasado por un
  // pasa-bajos que se va cerrando: al perder velocidad, se apaga.
  function rodadura(inicio: number, duracion: number) {
    if (!ctx || !master || !ruido) return
    const fuente = ctx.createBufferSource()
    fuente.buffer = ruido
    fuente.loop = true

    const filtro = ctx.createBiquadFilter()
    filtro.type = 'lowpass'
    filtro.frequency.setValueAtTime(2400, inicio)
    filtro.frequency.exponentialRampToValueAtTime(320, inicio + duracion)

    const envolvente = ctx.createGain()
    envolvente.gain.setValueAtTime(0, inicio)
    envolvente.gain.linearRampToValueAtTime(0.16, inicio + 0.25)
    envolvente.gain.setValueAtTime(0.16, inicio + duracion * 0.55)
    envolvente.gain.exponentialRampToValueAtTime(0.0001, inicio + duracion)

    fuente.connect(filtro).connect(envolvente).connect(master)
    fuente.start(inicio)
    fuente.stop(inicio + duracion + 0.1)
    fuentesActivas.push(fuente)
  }

  function spin(durationMs: number) {
    const audio = asegurarContexto()
    if (!audio || !master) return
    limpiar()

    const ahora = audio.currentTime
    const duracion = durationMs / 1000

    rodadura(ahora, duracion * (INICIO_CAIDA + 0.12))

    // Golpes desde que la bola cae hasta que se asienta. El intervalo crece
    // con el avance, que es lo que hace que "suene" a ruleta frenando.
    let t = INICIO_CAIDA
    while (t < 1) {
      const avance = (t - INICIO_CAIDA) / (1 - INICIO_CAIDA)
      const intervalo =
        INTERVALO_TICK_INICIAL_MS +
        (INTERVALO_TICK_FINAL_MS - INTERVALO_TICK_INICIAL_MS) * avance * avance
      // Los últimos golpes son los rebotes en la casilla: más suaves.
      tick(ahora + t * duracion, 0.5 - avance * 0.28)
      t += intervalo / durationMs
    }
  }

  // Acorde ascendente corto al revelar el premio.
  function win() {
    const audio = asegurarContexto()
    if (!audio || !master) return
    const ahora = audio.currentTime
    const notas = [523.25, 659.25, 783.99, 1046.5] // Do - Mi - Sol - Do

    notas.forEach((frecuencia, indice) => {
      const inicio = ahora + indice * 0.11
      const osc = audio.createOscillator()
      osc.type = 'triangle'
      osc.frequency.value = frecuencia

      const envolvente = audio.createGain()
      envolvente.gain.setValueAtTime(0, inicio)
      envolvente.gain.linearRampToValueAtTime(0.22, inicio + 0.02)
      envolvente.gain.exponentialRampToValueAtTime(0.0001, inicio + 0.55)

      osc.connect(envolvente).connect(master!)
      osc.start(inicio)
      osc.stop(inicio + 0.6)
      fuentesActivas.push(osc)
    })
  }

  return { spin, win, stop: limpiar }
}
