import * as THREE from 'three'

interface AnnularSectorOptions {
  innerRadius: number
  outerRadius: number
  startAngle: number
  endAngle: number
  height: number
}

/**
 * Genera una cuña anular extruida. La figura se crea en XY y luego se gira
 * para que la extrusión represente altura real sobre el eje Y.
 */
export function createAnnularSectorGeometry({
  innerRadius,
  outerRadius,
  startAngle,
  endAngle,
  height,
}: AnnularSectorOptions): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape()

  const innerStartX = Math.cos(startAngle) * innerRadius
  const innerStartY = Math.sin(startAngle) * innerRadius
  const outerStartX = Math.cos(startAngle) * outerRadius
  const outerStartY = Math.sin(startAngle) * outerRadius
  const innerEndX = Math.cos(endAngle) * innerRadius
  const innerEndY = Math.sin(endAngle) * innerRadius

  shape.moveTo(innerStartX, innerStartY)
  shape.lineTo(outerStartX, outerStartY)
  shape.absarc(0, 0, outerRadius, startAngle, endAngle, false)
  shape.lineTo(innerEndX, innerEndY)
  shape.absarc(0, 0, innerRadius, endAngle, startAngle, true)
  shape.closePath()

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: height,
    steps: 1,
    curveSegments: 3,
    bevelEnabled: true,
    bevelSegments: 1,
    bevelSize: 0.018,
    bevelThickness: 0.025,
  })

  geometry.rotateX(-Math.PI / 2)
  geometry.computeVertexNormals()
  return geometry
}

export function normalizePositiveAngle(angle: number): number {
  const tau = Math.PI * 2
  return ((angle % tau) + tau) % tau
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function lerp(start: number, end: number, amount: number): number {
  return start + (end - start) * amount
}

export function easeOutQuint(value: number): number {
  return 1 - Math.pow(1 - value, 5)
}

export function easeOutQuart(value: number): number {
  return 1 - Math.pow(1 - value, 4)
}

export function smoothStep(value: number): number {
  const t = clamp(value, 0, 1)
  return t * t * (3 - 2 * t)
}