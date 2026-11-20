// RESPALDO DE LA PÁGINA DE LA RULETA 3D (noviembre de 2026)
//
// /ruleta ahora juega con la tragamonedas (ver RoulettePage.tsx). Este es el
// componente principal de la página TAL COMO ERA con la ruleta, comentado
// línea por línea para no perderlo. Los modales (Confetti, PrizeModal,
// YaParticipasteModal) siguen vivos en RoulettePage.tsx, y Roulette3D.tsx con
// sus tipos y constantes no se tocaron.
//
// Para volver a la ruleta: reemplazar el componente RoulettePage de
// RoulettePage.tsx por este, quitando los "// " del inicio, y descomentar los
// imports de Roulette3D / RouletteSpinCommand / TOTAL_POCKETS de ese archivo.
// Ojo: el servidor ahora responde `premio: null` en los giros sin premio y da
// 5 giros; la ruleta asumía que todos los giros ganaban.

// // La ruleta debe girar al menos 5 segundos. Se dejan 5.8 para que la caída de
// // la bola y sus rebotes finales se alcancen a apreciar sin que se haga largo.
// const DURACION_GIRO_MS = 5800
//
// export default function RoulettePage({ navigate, onPrizeWon }: Props) {
//   // Premio ganado y aún sin reclamar. Vive por encima de esta vista para que
//   // salir a los términos y volver no lo pierda (ver PremioPendienteContext).
//   const { premioPendiente, recordar, olvidar } = usePremioPendiente()
//
//   const [isSpinning, setIsSpinning] = useState(false)
//   // Los tres arrancan de lo que haya guardado: si el visitante vuelve de leer
//   // las condiciones, la vista se vuelve a montar desde cero y esto es lo que
//   // hace que reaparezca su premio en vez de una ruleta en blanco.
//   const [wonPrizeIdx, setWonPrizeIdx] = useState<number | null>(premioPendiente?.segmentIndex ?? null)
//   const [pendingPrizeIdx, setPendingPrizeIdx] = useState<number | null>(null)
//   const [prizeTicket, setPrizeTicket] = useState<string | null>(premioPendiente?.ticket ?? null)
//   const [showModal, setShowModal] = useState(premioPendiente !== null)
//   const [showConfetti, setShowConfetti] = useState(false)
//   const [spinCommand, setSpinCommand] = useState<RouletteSpinCommand | null>(null)
//   const [spinError, setSpinError] = useState<string | null>(null)
//
//   const { cliente, bono, bonoCanjeado, token, loading: authLoading } = useAuth()
//
//   // Hasta cuándo se puede redimir cada premio. Se consulta al entrar, no al
//   // ganar: el visitante debe poder ver la fecha ANTES de decidir si gira, y
//   // hasta ahora la única forma de conocerla era ganar un bono y entrar a su
//   // cuenta.
//   const { datos: vigencias, error: vigenciasError } = useVigencias()
//
//   // La ruleta es SOLO para visitantes sin cuenta: es una promocion de
//   // captacion. Cualquier cliente con la sesion abierta queda bloqueado, tenga
//   // bono o no. Antes se exigia ademas `yaParticipo`, y eso dejaba pasar al
//   // cliente registrado sin bono, que giraba y despues no tenia como reclamar
//   // (el reclamo pasa por el registro, y su correo ya existia).
//   //
//   // Se bloquea tambien mientras la sesion se esta restaurando: hasta que /me
//   // responde no sabemos si hay cliente detras, y sin esto un clic rapido al
//   // entrar directo a /ruleta se colaba antes de la respuesta.
//   const giroBloqueado = authLoading || !!cliente
//   const [showYaParticipaste, setShowYaParticipaste] = useState(false)
//
//   // Giros que le quedan al visitante. El conteo lo lleva el servidor contra
//   // una cookie httpOnly, así que recargar la página NO lo reinicia. Se
//   // consulta al entrar para poder mostrarlo sin gastar un giro.
//   const [restantes, setRestantes] = useState<number | null>(null)
//   const [maximo, setMaximo] = useState<number | null>(null)
//
//   useEffect(() => {
//     if (cliente) return // un cliente con sesión no gira: no aplica el contador
//     fetchGirosRestantes()
//       .then((r) => {
//         setRestantes(r.restantes)
//         setMaximo(r.maximo)
//       })
//       .catch(() => {
//         // Si falla, no se bloquea al usuario: el servidor rechazará el giro
//         // igual si ya no le quedan.
//       })
//   }, [cliente])
//
//   const sinGiros = restantes === 0
//
//   // El sonido se crea una sola vez y se corta al desmontar, para que no siga
//   // sonando si el usuario navega a otra vista a mitad del giro.
//   const sonido = useRef(createRouletteSound())
//   useEffect(() => {
//     const actual = sonido.current
//     return () => actual.stop()
//   }, [])
//
//   const spin = async () => {
//     if (isSpinning || showModal) return
//
//     // Se corta antes de llamar al backend. Mientras carga la sesion no se
//     // abre el modal: todavia no hay nada que explicarle al usuario.
//     if (giroBloqueado) {
//       if (!authLoading) setShowYaParticipaste(true)
//       return
//     }
//     if (sinGiros) {
//       setSpinError(`Ya usaste tus ${maximo ?? 3} giros. Regístrate para reclamar el premio que obtuviste.`)
//       return
//     }
//
//     setSpinError(null)
//     setIsSpinning(true)
//
//     // El premio ya NO se decide aquí: el servidor hace el sorteo ponderado
//     // real y firma un ticket que se reclama al completar el registro.
//     // targetPocket sigue siendo local porque solo controla dónde se detiene
//     // visualmente la ruleta 3D (es decorativo, no revela ni afecta el premio).
//     let result
//     try {
//       result = await spinRoulette(token)
//       setRestantes(result.restantes)
//       setMaximo(result.maximo)
//     } catch (error) {
//       setIsSpinning(false)
//       setSpinError(error instanceof ApiError ? error.message : 'No se pudo girar la ruleta. Intenta de nuevo.')
//       // El backend es la autoridad: si rechazó por giros agotados, se
//       // sincroniza el contador para que el botón quede coherente.
//       void fetchGirosRestantes()
//         .then((r) => setRestantes(r.restantes))
//         .catch(() => {})
//       return
//     }
//
//     const targetPocket = Math.floor(Math.random() * TOTAL_POCKETS)
//     // Una clave fuera del catálogo es un premio retirado: el registro lo
//     // convierte en el bono de $10.000 (PRIZES[0]), así que eso es lo que se muestra.
//     const targetPrize = Math.max(0, PRIZES.findIndex((p) => p.clave === result.premio.clave))
//
//     setWonPrizeIdx(null)
//     setPendingPrizeIdx(targetPrize)
//     setPrizeTicket(result.ticket)
//     setShowModal(false)
//
//     // El sonido se dispara con el mismo comando que la animación para que
//     // vayan sincronizados. Va dentro del clic, que es el gesto de usuario que
//     // los navegadores exigen para permitir audio.
//     sonido.current.spin(DURACION_GIRO_MS)
//
//     setSpinCommand({
//       id: Date.now(),
//       targetPocket,
//       durationMs: DURACION_GIRO_MS,
//     })
//   }
//
//   const handleSpinComplete = () => {
//     if (pendingPrizeIdx === null) return
//
//     setIsSpinning(false)
//     setWonPrizeIdx(pendingPrizeIdx)
//     // Se guarda ya, no al abrir los términos: a partir de aquí el premio
//     // existe y debe sobrevivir a cualquier cambio de vista.
//     if (prizeTicket) recordar({ segmentIndex: pendingPrizeIdx, ticket: prizeTicket })
//     setShowConfetti(true)
//     sonido.current.win()
//
//     window.setTimeout(() => setShowModal(true), 500)
//     window.setTimeout(() => setShowConfetti(false), 4000)
//   }
//
//   const handleClaim = () => {
//     if (wonPrizeIdx !== null && prizeTicket) {
//       onPrizeWon((PRIZES[wonPrizeIdx] ?? PRIZES[0]).prize, prizeTicket)
//     }
//
//     // Ya pasó al registro, que lleva su propia copia del premio y del ticket:
//     // dejarlo aquí haría reaparecer el modal al volver a la ruleta.
//     olvidar()
//     setShowModal(false)
//     navigate('register')
//   }
//
//   // Cerrar con la X es renunciar al premio en esta vista: se olvida para que no
//   // vuelva a saltar solo. El ticket sigue vivo en el servidor sus 30 minutos,
//   // pero sin el modal ya no hay forma de reclamarlo desde aquí, que es
//   // justamente lo que el visitante pidió al cerrar.
//   const handleCerrarModal = () => {
//     olvidar()
//     setShowModal(false)
//   }
//
//   // Salir a leer las condiciones NO es renunciar: el premio se conserva y el
//   // botón de volver de los términos trae de vuelta a este mismo modal.
//   const handleVerCondiciones = () => {
//     setShowModal(false)
//     navigate('terms')
//   }
//
//   return (
//     <div
//       className="min-h-screen flex flex-col items-center justify-start pt-28 md:pt-32 pb-16 px-4 sm:px-6 relative overflow-hidden bg-transparent"
//       style={{
//         background: 'radial-gradient(ellipse 100% 70% at 50% 0%, rgba(139,26,26,0.3) 0%, transparent 60%)',
//       }}
//     >
//       {showConfetti && <Confetti />}
//       {showYaParticipaste && (
//         <YaParticipasteModal
//           tieneBono={!!bono}
//           bonoCanjeado={bonoCanjeado}
//           codigo={bono?.codigo ?? null}
//           onClose={() => setShowYaParticipaste(false)}
//           onVerCuenta={() => {
//             setShowYaParticipaste(false)
//             navigate('dashboard')
//           }}
//         />
//       )}
//       {showModal && wonPrizeIdx !== null && (
//         <PrizeModal
//           segmentIndex={wonPrizeIdx}
//           vigenciaHasta={
//             vigencias?.vigencias.find((v) => v.clave === (PRIZES[wonPrizeIdx] ?? PRIZES[0]).clave)?.vigenciaHasta ?? null
//           }
//           onClaim={handleClaim}
//           onClose={handleCerrarModal}
//           onVerCondiciones={handleVerCondiciones}
//         />
//       )}
//
//       <div className="w-full max-w-lg mb-4 z-10">
//         <BackButton />
//       </div>
//
//       <div className="text-center mb-1 z-10">
//         <p className="text-[#D4AF37] text-xs font-bold tracking-[0.3em] mb-2">
//           PROMOCIÓN DE BIENVENIDA
//         </p>
//         <h1 className="text-3xl md:text-4xl font-black text-[#F5E6C8]">
//           ¡Es tu momento de ganar!
//         </h1>
//         <p className="text-[#9A7B50] mt-2 text-sm max-w-sm mx-auto">
//           Presiona el botón, gira la ruleta y descubre el beneficio que tenemos para ti.
//         </p>
//
//         {/* La regla se dice ANTES de girar, no cuando ya se agotaron los
//             intentos: el jugador debe saber a qué atenerse desde el principio. */}
//         {!cliente && (
//           <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/8 px-4 py-1.5">
//             <Info size={13} className="text-[#D4AF37] flex-shrink-0" />
//             <span className="text-xs text-[#C4A97A]">
//               {restantes === null || maximo === null ? (
//                 'Tienes 3 intentos en total'
//               ) : restantes === 0 ? (
//                 <span className="text-[#eab308]">Usaste tus {maximo} intentos</span>
//               ) : (
//                 <>
//                   Tienes <strong className="text-[#D4AF37]">{maximo} intentos</strong> en total ·{' '}
//                   {restantes === 1 ? 'te queda 1' : `te quedan ${restantes}`}
//                 </>
//               )}
//             </span>
//           </div>
//         )}
//
//         {/* Hasta cuándo se puede redimir, dicho antes de girar. La fecha sale
//             de la base (no está escrita aquí), así que extender la promoción se
//             refleja en esta vista sin desplegar el frontend. */}
//         <div className="mt-3 flex justify-center">
//           <VigenciaResumen datos={vigencias} error={vigenciasError} variante="chip" />
//         </div>
//       </div>
//
//       {/* La ruleta ya no usa SVG ni rotateX. La profundidad proviene de geometría real.
//
//           `relative` es lo que ancla a Fichardo al costado derecho de la rueda:
//           sin él la mascota se posicionaría respecto a la página entera y se
//           despegaría de la ruleta en cuanto cambiara el alto de la ventana. */}
//       <div className="relative w-full max-w-[860px] h-[390px] sm:h-[500px] md:h-[590px] -mt-2 md:-mt-8 z-0">
//         <Roulette3D
//           spinCommand={spinCommand}
//           onSpinComplete={handleSpinComplete}
//           quality="high"
//           className="w-full h-full"
//         />
//
//         {/* Fichardo, al costado derecho y POR ENCIMA de la ruleta.
//             - El ancho va en % del contenedor (no en px) para que crezca y
//               encoja con la rueda: es lo que lo mantiene proporcionado entre el
//               móvil y el escritorio. El max-w evita que se desborde en pantallas
//               muy anchas, donde el contenedor ya topa en 860px.
//             - El `bottom` sube en móvil a propósito. En escritorio el botón de
//               girar queda centrado y la mascota a la derecha no lo toca, pero en
//               móvil el botón ocupa casi todo el ancho y se le echaba encima.
//             - `pointer-events-none` es imprescindible: la mascota se superpone a
//               la rueda, y sin esto se comería los clics de girar.
//             - Decorativa, así que va con alt vacío y aria-hidden para que un
//               lector de pantalla no la anuncie. */}
//         <img
//           src={fichardoBono}
//           alt=""
//           aria-hidden="true"
//           decoding="async"
//           className="
//             pointer-events-none select-none
//             absolute z-10
//             right-0 bottom-[17%] sm:bottom-[7%] md:bottom-[4%]
//             w-[30%] sm:w-[28%] max-w-[215px] min-w-[96px]
//             drop-shadow-[0_12px_28px_rgba(0,0,0,0.55)]
//           "
//         />
//       </div>
//
//       <div className="text-center -mt-7 md:-mt-12 z-10">
//         <button
//           type="button"
//           onClick={() => void spin()}
//           disabled={isSpinning || showModal || sinGiros}
//           className="px-10 py-4 rounded-full font-black text-base tracking-wide transition-all disabled:opacity-60 disabled:cursor-not-allowed"
//           style={{
//             background:
//               isSpinning || giroBloqueado || sinGiros
//                 ? 'linear-gradient(135deg, #8A7020, #6A5518)'
//                 : 'linear-gradient(135deg, #F0C847, #D4AF37, #A0832A)',
//             color: '#0a0805',
//             letterSpacing: '0.1em',
//             minWidth: 250,
//             animation: isSpinning || giroBloqueado || sinGiros ? 'none' : 'pulse-glow 2.5s ease-in-out infinite',
//             transform: isSpinning ? 'scale(0.97)' : 'scale(1)',
//           }}
//         >
//           {isSpinning
//             ? '⏳ Descubriendo tu premio...'
//             : authLoading
//             ? 'Cargando...'
//             : cliente
//             ? 'Ya tienes cuenta'
//             : sinGiros
//             ? 'Giros agotados'
//             : 'Girar Ruleta'}
//         </button>
//
//         {spinError && <p className="mt-3 text-red-400 text-xs">{spinError}</p>}
//
//         <p className="mt-3 text-[#6B5D3F] text-xs">
//           {cliente ? 'La ruleta es para nuevos jugadores' : 'Un bono por persona'} ·{' '}
//           <button
//             type="button"
//             onClick={() => navigate('terms')}
//             className="hover:text-[#9A7B50] transition-colors underline"
//           >
//             Ver términos
//           </button>
//         </p>
//       </div>
//
//       {/* El registro completo: qué premio se redime hasta cuándo. No basta con
//           el titular de arriba, porque cada premio lleva SU fecha y pueden
//           convivir varias — hoy coinciden, pero en cuanto entre un bono nuevo con
//           otra fecha esta lista es la única que lo dice sin ambigüedad. */}
//       <div className="mt-8 max-w-lg w-full z-10 relative">
//         <RegistroVigencias
//           datos={vigencias}
//           error={vigenciasError}
//           titulo="Hasta cuándo puedes redimir"
//           descripcion="Cada premio tiene su propia fecha límite. Estas son las condiciones vigentes de la promoción."
//         />
//       </div>
//
//       <div className="w-full -mx-4 sm:-mx-6 mt-auto pt-20">
//         <Footer navigate={navigate} />
//       </div>
//     </div>
//   )
// }

export {}
