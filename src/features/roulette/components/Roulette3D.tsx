import { Suspense, useEffect, useMemo, useRef } from 'react'
import { MonitorX } from 'lucide-react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import * as THREE from 'three'
import type { Group, Mesh } from 'three'
import {
  POINTER_WORLD_ANGLE,
  RED_NUMBERS,
  ROULETTE_COLORS,
  ROULETTE_NUMBERS,
  SEGMENT_ANGLE,
  TOTAL_POCKETS,
} from '../constants/roulette.constants'
import type { Roulette3DProps, RouletteSpinCommand } from '../types/roulette.types'
import {
  clamp,
  createAnnularSectorGeometry,
  easeOutQuart,
  easeOutQuint,
  lerp,
  normalizePositiveAngle,
  smoothStep,
} from '../utils/rouletteGeometry'

const TAU = Math.PI * 2
const POCKET_INNER_RADIUS = 2.72
const POCKET_OUTER_RADIUS = 3.62
const POCKET_TEXT_RADIUS = 3.22
const POCKET_TOP_Y = 0.56
const BALL_OUTER_RADIUS = 3.85
const BALL_POCKET_RADIUS = 3.23
const BALL_ORBIT_Y = 0.78

// Los números se dibujan como texturas de canvas 2D en vez de <Text> de drei
// (troika-three-text) porque su generación de SDF requiere la extensión WebGL
// ANGLE_instanced_arrays, ausente en algunos entornos con WebGL limitado/software.
function createNumberTexture(label: string): THREE.CanvasTexture {
  const size = 128
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size

  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.clearRect(0, 0, size, size)
    ctx.font = '800 64px Inter, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.lineJoin = 'round'
    ctx.lineWidth = 10
    ctx.strokeStyle = '#080503'
    ctx.strokeText(label, size / 2, size / 2 + 2)
    ctx.fillStyle = '#FFFFFF'
    ctx.fillText(label, size / 2, size / 2 + 2)
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.needsUpdate = true
  return texture
}

interface AnimationState {
  commandId: number
  targetPocket: number
  startedAtMs: number
  durationMs: number
  startWheelRotation: number
  endWheelRotation: number
  startBallAngle: number
  endBallAngle: number
}

interface RouletteSceneProps {
  spinCommand?: RouletteSpinCommand | null
  onSpinComplete?: (targetPocket: number) => void
  preview: boolean
  quality: 'medium' | 'high'
}

function RouletteBase() {
  const studPositions = useMemo(() => {
    return Array.from({ length: 28 }, (_, index) => {
      const angle = (index / 28) * TAU
      return [Math.cos(angle) * 4.48, 0.42, Math.sin(angle) * 4.48] as const
    })
  }, [])

  return (
    <group>
      {/* Cuerpo grueso de madera: esta altura es la que elimina el aspecto plano. */}
      <mesh position={[0, -0.42, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[4.93, 5.24, 0.92, 128]} />
        <meshPhysicalMaterial
          color={ROULETTE_COLORS.woodDark}
          roughness={0.2}
          metalness={0.04}
          clearcoat={1}
          clearcoatRoughness={0.14}
        />
      </mesh>

      <mesh position={[0, 0.02, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[4.82, 4.96, 0.34, 128]} />
        <meshPhysicalMaterial
          color={ROULETTE_COLORS.wood}
          roughness={0.22}
          metalness={0.05}
          clearcoat={1}
          clearcoatRoughness={0.12}
        />
      </mesh>

      <mesh position={[0, 0.23, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <torusGeometry args={[4.42, 0.29, 28, 144]} />
        <meshPhysicalMaterial
          color={ROULETTE_COLORS.woodLight}
          roughness={0.18}
          metalness={0.08}
          clearcoat={1}
          clearcoatRoughness={0.1}
        />
      </mesh>

      <mesh position={[0, 0.42, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[4.12, 0.16, 24, 128]} />
        <meshStandardMaterial
          color={ROULETTE_COLORS.gold}
          metalness={0.92}
          roughness={0.16}
        />
      </mesh>

      <mesh position={[0, 0.52, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <torusGeometry args={[3.92, 0.29, 28, 128]} />
        <meshPhysicalMaterial
          color="#5B3B1A"
          metalness={0.65}
          roughness={0.19}
          clearcoat={0.7}
        />
      </mesh>

      {studPositions.map((position, index) => (
        <mesh key={index} position={position} castShadow>
          <sphereGeometry args={[0.075, 14, 14]} />
          <meshStandardMaterial
            color={index % 2 === 0 ? ROULETTE_COLORS.goldLight : ROULETTE_COLORS.gold}
            metalness={0.9}
            roughness={0.14}
          />
        </mesh>
      ))}

      {/* Sombra interior que marca la separación entre mueble y rotor. */}
      <mesh position={[0, 0.3, 0]} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
        <torusGeometry args={[3.74, 0.11, 20, 128]} />
        <meshStandardMaterial color="#080503" roughness={0.88} />
      </mesh>
    </group>
  )
}

function PocketRing() {
  const pocketData = useMemo(() => {
    const angularGap = 0.009

    return ROULETTE_NUMBERS.map((number, index) => {
      const start = index * SEGMENT_ANGLE + angularGap
      const end = (index + 1) * SEGMENT_ANGLE - angularGap
      const middle = (start + end) / 2
      const isGreen = number === '0'
      const isRed = RED_NUMBERS.has(number)

      return {
        number,
        index,
        middle,
        geometry: createAnnularSectorGeometry({
          innerRadius: POCKET_INNER_RADIUS,
          outerRadius: POCKET_OUTER_RADIUS,
          startAngle: start,
          endAngle: end,
          height: 0.24,
        }),
        texture: createNumberTexture(number),
        color: isGreen
          ? ROULETTE_COLORS.green
          : isRed
            ? ROULETTE_COLORS.red
            : ROULETTE_COLORS.black,
        emissive: isGreen
          ? '#082C16'
          : isRed
            ? '#320606'
            : '#020201',
      }
    })
  }, [])

  useEffect(() => {
    return () => {
      pocketData.forEach(({ geometry, texture }) => {
        geometry.dispose()
        texture.dispose()
      })
    }
  }, [pocketData])

  return (
    <group position={[0, 0.29, 0]}>
      {pocketData.map(({ number, index, middle, geometry, texture, color, emissive }) => (
        <group key={number}>
          <mesh geometry={geometry} castShadow receiveShadow>
            <meshPhysicalMaterial
              color={color}
              emissive={emissive}
              emissiveIntensity={0.18}
              roughness={0.3}
              metalness={0.08}
              clearcoat={0.45}
              clearcoatRoughness={0.22}
            />
          </mesh>

          {/* Un grupo rotado mantiene el número alineado con cada casillero. */}
          <group rotation={[0, middle - Math.PI / 2, 0]}>
            <mesh
              position={[0, 0.285, -POCKET_TEXT_RADIUS]}
              rotation={[-Math.PI / 2, 0, index > TOTAL_POCKETS / 2 ? Math.PI : 0]}
            >
              <planeGeometry args={[0.34, 0.34]} />
              <meshBasicMaterial
                map={texture}
                transparent
                depthWrite={false}
                toneMapped={false}
              />
            </mesh>
          </group>
        </group>
      ))}

      <mesh position={[0, 0.1, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[POCKET_OUTER_RADIUS + 0.04, 0.075, 18, 128]} />
        <meshStandardMaterial
          color={ROULETTE_COLORS.gold}
          metalness={0.92}
          roughness={0.18}
        />
      </mesh>

      <mesh position={[0, 0.12, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[POCKET_INNER_RADIUS - 0.03, 0.085, 18, 128]} />
        <meshStandardMaterial
          color={ROULETTE_COLORS.goldDark}
          metalness={0.85}
          roughness={0.21}
        />
      </mesh>
    </group>
  )
}

function InnerBowl() {
  const points = useMemo(
    () => [
      new THREE.Vector2(0.46, 0.82),
      new THREE.Vector2(0.72, 0.75),
      new THREE.Vector2(1.25, 0.61),
      new THREE.Vector2(1.85, 0.43),
      new THREE.Vector2(2.34, 0.29),
      new THREE.Vector2(2.66, 0.27),
    ],
    [],
  )

  return (
    <group>
      <mesh castShadow receiveShadow>
        <latheGeometry args={[points, 128]} />
        <meshPhysicalMaterial
          color="#35170E"
          metalness={0.16}
          roughness={0.21}
          clearcoat={1}
          clearcoatRoughness={0.13}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0, 0.29, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[2.48, 0.08, 18, 128]} />
        <meshStandardMaterial
          color="#8E261F"
          metalness={0.48}
          roughness={0.2}
        />
      </mesh>
    </group>
  )
}

function CentralTurret() {
  const armPositions = useMemo(
    () => [
      [0.58, 1.44, 0] as const,
      [-0.58, 1.44, 0] as const,
      [0, 1.44, 0.58] as const,
      [0, 1.44, -0.58] as const,
    ],
    [],
  )

  return (
    <group>
      <mesh position={[0, 0.55, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.7, 0.86, 0.32, 64]} />
        <meshStandardMaterial color="#241109" metalness={0.36} roughness={0.24} />
      </mesh>

      <mesh position={[0, 0.76, 0]} castShadow>
        <cylinderGeometry args={[0.58, 0.69, 0.18, 64]} />
        <meshStandardMaterial
          color={ROULETTE_COLORS.gold}
          metalness={0.94}
          roughness={0.15}
        />
      </mesh>

      <mesh position={[0, 1.02, 0]} castShadow>
        <cylinderGeometry args={[0.29, 0.43, 0.46, 48]} />
        <meshPhysicalMaterial
          color="#6B2C16"
          metalness={0.22}
          roughness={0.17}
          clearcoat={1}
        />
      </mesh>

      <mesh position={[0, 1.28, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.29, 0.18, 48]} />
        <meshStandardMaterial
          color={ROULETTE_COLORS.goldLight}
          metalness={0.95}
          roughness={0.12}
        />
      </mesh>

      <mesh position={[0, 1.5, 0]} castShadow>
        <sphereGeometry args={[0.22, 28, 28]} />
        <meshStandardMaterial
          color="#7B351C"
          metalness={0.28}
          roughness={0.16}
        />
      </mesh>

      <mesh position={[0, 1.75, 0]} castShadow>
        <cylinderGeometry args={[0.13, 0.19, 0.34, 36]} />
        <meshStandardMaterial
          color={ROULETTE_COLORS.gold}
          metalness={0.96}
          roughness={0.12}
        />
      </mesh>

      <mesh position={[0, 1.97, 0]} castShadow>
        <sphereGeometry args={[0.17, 24, 24]} />
        <meshStandardMaterial
          color={ROULETTE_COLORS.goldLight}
          metalness={0.96}
          roughness={0.1}
        />
      </mesh>

      {/* Brazos elevados del eje. */}
      <mesh position={[0, 1.44, 0]} castShadow>
        <boxGeometry args={[1.25, 0.11, 0.11]} />
        <meshStandardMaterial
          color={ROULETTE_COLORS.gold}
          metalness={0.94}
          roughness={0.13}
        />
      </mesh>
      <mesh position={[0, 1.44, 0]} castShadow>
        <boxGeometry args={[0.11, 0.11, 1.25]} />
        <meshStandardMaterial
          color={ROULETTE_COLORS.gold}
          metalness={0.94}
          roughness={0.13}
        />
      </mesh>

      {armPositions.map((position, index) => (
        <mesh key={index} position={position} castShadow>
          <sphereGeometry args={[0.12, 18, 18]} />
          <meshStandardMaterial
            color={ROULETTE_COLORS.goldLight}
            metalness={0.95}
            roughness={0.11}
          />
        </mesh>
      ))}
    </group>
  )
}

function PointerMarker() {
  return (
    <group position={[0, 1.05, -4.35]}>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <coneGeometry args={[0.25, 0.68, 3]} />
        <meshStandardMaterial
          color={ROULETTE_COLORS.goldLight}
          emissive="#6E4A0B"
          emissiveIntensity={0.32}
          metalness={0.93}
          roughness={0.13}
        />
      </mesh>
      <mesh position={[0, 0.19, -0.24]} castShadow>
        <sphereGeometry args={[0.13, 20, 20]} />
        <meshStandardMaterial
          color={ROULETTE_COLORS.gold}
          metalness={0.95}
          roughness={0.12}
        />
      </mesh>
    </group>
  )
}

function RouletteLights() {
  return (
    <>
      <ambientLight intensity={0.42} />
      <hemisphereLight args={['#F4D7A0', '#160704', 0.58]} />

      <spotLight
        position={[4.5, 8.5, 6.5]}
        intensity={115}
        angle={0.46}
        penumbra={0.82}
        color="#FFD89A"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.0002}
      />

      <spotLight
        position={[-5.5, 4.5, -3.5]}
        intensity={48}
        angle={0.6}
        penumbra={0.9}
        color="#8C1B17"
      />

      <pointLight position={[0, 3.4, -4.8]} intensity={16} color="#E5B84E" />

      <Environment resolution={128}>
        <Lightformer
          form="ring"
          intensity={3.5}
          color="#FFDDA3"
          scale={8}
          position={[0, 6, 1]}
          rotation={[Math.PI / 2, 0, 0]}
        />
        <Lightformer
          form="rect"
          intensity={2.2}
          color="#8E1F1A"
          scale={[5, 2, 1]}
          position={[-5, 2, -2]}
          rotation={[0, Math.PI / 2, 0]}
        />
        <Lightformer
          form="rect"
          intensity={1.8}
          color="#D9A83A"
          scale={[4, 1.4, 1]}
          position={[5, 2.5, 2]}
          rotation={[0, -Math.PI / 2, 0]}
        />
      </Environment>
    </>
  )
}

function RouletteScene({
  spinCommand,
  onSpinComplete,
  preview,
  quality,
}: RouletteSceneProps) {
  const rotorRef = useRef<Group>(null)
  const ballRef = useRef<Mesh>(null)
  const animationRef = useRef<AnimationState | null>(null)
  const lastCommandIdRef = useRef<number | null>(null)
  const ballAngleRef = useRef(POINTER_WORLD_ANGLE)
  const completedCommandIdRef = useRef<number | null>(null)

  useEffect(() => {
    if (preview || !spinCommand || !rotorRef.current) return
    if (lastCommandIdRef.current === spinCommand.id) return

    lastCommandIdRef.current = spinCommand.id
    completedCommandIdRef.current = null

    const targetPocket = clamp(
      Math.floor(spinCommand.targetPocket),
      0,
      TOTAL_POCKETS - 1,
    )

    const startWheelRotation = rotorRef.current.rotation.y
    const localPocketAngle = -((targetPocket + 0.5) * SEGMENT_ANGLE)
    const correction = normalizePositiveAngle(
      POINTER_WORLD_ANGLE - localPocketAngle - startWheelRotation,
    )
    const endWheelRotation = startWheelRotation + TAU * 7 + correction

    const startBallAngle = ballAngleRef.current
    let endBallAngle = POINTER_WORLD_ANGLE - TAU * 11
    while (endBallAngle > startBallAngle - TAU * 8) {
      endBallAngle -= TAU
    }

    animationRef.current = {
      commandId: spinCommand.id,
      targetPocket,
      startedAtMs: performance.now(),
      durationMs: spinCommand.durationMs ?? 5600,
      startWheelRotation,
      endWheelRotation,
      startBallAngle,
      endBallAngle,
    }
  }, [preview, spinCommand])

  useFrame((_, delta) => {
    const rotor = rotorRef.current
    const ball = ballRef.current
    if (!rotor || !ball) return

    const animation = animationRef.current

    if (preview && !animation) {
      rotor.rotation.y += delta * 0.28
      ballAngleRef.current -= delta * 0.9
      const radius = BALL_OUTER_RADIUS
      ball.position.set(
        Math.cos(ballAngleRef.current) * radius,
        BALL_ORBIT_Y,
        Math.sin(ballAngleRef.current) * radius,
      )
      ball.rotation.x += delta * 5
      ball.rotation.z += delta * 3
      return
    }

    if (!animation) return

    const elapsed = performance.now() - animation.startedAtMs
    const progress = clamp(elapsed / animation.durationMs, 0, 1)

    const wheelProgress = easeOutQuint(progress)
    rotor.rotation.y = lerp(
      animation.startWheelRotation,
      animation.endWheelRotation,
      wheelProgress,
    )

    const ballProgress = easeOutQuart(progress)
    let ballAngle = lerp(
      animation.startBallAngle,
      animation.endBallAngle,
      ballProgress,
    )

    const dropProgress = smoothStep((progress - 0.52) / 0.36)
    const radius = lerp(BALL_OUTER_RADIUS, BALL_POCKET_RADIUS, dropProgress)

    const settling = smoothStep((progress - 0.76) / 0.24)
    const angularWobble = Math.sin(progress * 92) * (1 - settling) * 0.018
    ballAngle += angularWobble

    const bounce =
      progress > 0.68
        ? Math.abs(Math.sin((progress - 0.68) * 35)) * (1 - settling) * 0.12
        : 0
    const y = lerp(BALL_ORBIT_Y, POCKET_TOP_Y + 0.14, dropProgress) + bounce

    ballAngleRef.current = ballAngle
    ball.position.set(
      Math.cos(ballAngle) * radius,
      y,
      Math.sin(ballAngle) * radius,
    )
    ball.rotation.x += delta * 9
    ball.rotation.z += delta * 6

    if (progress >= 1) {
      rotor.rotation.y = animation.endWheelRotation
      ballAngleRef.current = POINTER_WORLD_ANGLE
      ball.position.set(
        Math.cos(POINTER_WORLD_ANGLE) * BALL_POCKET_RADIUS,
        POCKET_TOP_Y + 0.14,
        Math.sin(POINTER_WORLD_ANGLE) * BALL_POCKET_RADIUS,
      )

      animationRef.current = null

      if (completedCommandIdRef.current !== animation.commandId) {
        completedCommandIdRef.current = animation.commandId
        onSpinComplete?.(animation.targetPocket)
      }
    }
  })

  return (
    <>
      <RouletteLights />
      <group position={[0, -0.15, 0]}>
        <RouletteBase />

        <group ref={rotorRef}>
          <PocketRing />
          <InnerBowl />
          <CentralTurret />
        </group>

        <mesh ref={ballRef} castShadow position={[0, BALL_ORBIT_Y, -BALL_OUTER_RADIUS]}>
          <sphereGeometry args={[0.125, quality === 'high' ? 28 : 18, quality === 'high' ? 28 : 18]} />
          <meshPhysicalMaterial
            color="#FFFFFF"
            metalness={0.72}
            roughness={0.12}
            clearcoat={1}
            clearcoatRoughness={0.08}
          />
        </mesh>

        <PointerMarker />
      </group>
    </>
  )
}

export default function Roulette3D({
  spinCommand = null,
  onSpinComplete,
  preview = false,
  className = '',
  quality = 'high',
}: Roulette3DProps) {
  return (
    <div
      className={`relative w-full h-full min-h-[340px] ${className}`}
      style={{ pointerEvents: preview ? 'none' : 'auto' }}
      aria-label="Ruleta 3D de Gran Casino Cucuta"
    >
      <Canvas
        shadows
        dpr={quality === 'high' ? [1, 1.65] : [1, 1.25]}
        camera={{ position: [0, 6.65, 8.85], fov: 35, near: 0.1, far: 50 }}
        gl={{
          antialias: false,
          alpha: true,
          premultipliedAlpha: false,
          powerPreference: 'high-performance',
          failIfMajorPerformanceCaveat: false,
        }}
        onCreated={({ gl, scene, camera }) => {
          gl.outputColorSpace = THREE.SRGBColorSpace
          gl.toneMapping = THREE.ACESFilmicToneMapping
          gl.toneMappingExposure = 1.08
          gl.shadowMap.enabled = true
          gl.shadowMap.type = THREE.PCFShadowMap
          gl.setClearColor(0x000000, 0)
          scene.background = null
          camera.lookAt(0, 0.35, 0)
        }}
        fallback={
          <div className="w-full h-full min-h-[340px] flex flex-col items-center justify-center text-center px-6 gap-2">
            <MonitorX size={40} className="text-[#D4AF37]" />
            <p className="text-[#F5E6C8] font-semibold text-sm">
              Tu navegador no admite renderizado 3D (WebGL)
            </p>
            <p className="text-[#9A7B50] text-xs max-w-xs">
              Abre esta página en Chrome, Edge o Firefox actualizados para ver la ruleta.
            </p>
          </div>
        }
      >
        <Suspense fallback={null}>
          <RouletteScene
            spinCommand={spinCommand}
            onSpinComplete={onSpinComplete}
            preview={preview}
            quality={quality}
          />
        </Suspense>
      </Canvas>

      {/* Brillo frontal discreto para integrar el canvas con el fondo del sitio. */}
      <div
        className="pointer-events-none absolute inset-x-[8%] bottom-[2%] h-[18%] rounded-full blur-3xl"
        style={{ background: 'rgba(212,175,55,0.12)' }}
      />
    </div>
  )
}