export function esDeOtroCasino(
  sedeActual?: { clave: string } | null,
  sedeDelBono?: { clave: string } | null,
) {
  return !!sedeActual && !!sedeDelBono && sedeActual.clave !== sedeDelBono.clave
}
