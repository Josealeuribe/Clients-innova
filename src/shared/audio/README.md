# Audio

Sonidos de la aplicación. No hay archivos de audio: todo se sintetiza en el
navegador con Web Audio API.

## Por qué sin archivos

- **Licencias.** Los sonidos de ruleta que circulan en internet rara vez traen
  licencia clara para uso comercial. Esto es un casino real, no un demo.
- **Peso.** El bundle ya pesa ~39 MB por los videos de sede. Sumar audio
  empeora un problema abierto.
- **Sincronización.** Un loop grabado no sabe a qué velocidad va la bola. La
  síntesis usa la misma curva de desaceleración que la animación 3D, así que
  el sonido va pegado a la imagen en todo momento.

## Cómo cambiar a archivos reales

Si consiguen sonidos propios con licencia, `rouletteSound.ts` es el único
archivo a tocar. Mantengan la interfaz:

```ts
interface RouletteSound {
  spin: (durationMs: number) => void
  win: () => void
  stop: () => void
}
```

Por dentro, reemplacen la síntesis por reproducción (con `howler` o con
`Audio`/`AudioBufferSourceNode` directo) y pongan los archivos en
`src/shared/assets/audio/`. Ningún componente necesita cambiar.

## Restricción de los navegadores

El `AudioContext` solo puede crearse o reanudarse dentro de un gesto del
usuario — los navegadores bloquean el autoplay. Por eso `spin()` se llama
desde el clic en "Girar Ruleta" y no desde un efecto de montaje. Si algún día
se necesita sonido sin clic previo, no va a sonar.
