import { createAvatar } from '@dicebear/core'
import { funEmoji } from '@dicebear/collection'

export interface AvatarOptions {
  eyes?: string
  mouth?: string
  backgroundColor?: string
}

export const AVATAR_EYES = ['closed', 'closed2', 'glasses', 'love', 'pissed', 'plain', 'shades', 'stars', 'wink']
export const AVATAR_MOUTHS = ['lilSmile', 'wideSmile', 'tongueOut', 'open', 'kissing', 'sad', 'explode', 'smileTeeth']
export const AVATAR_COLORS = ['b6e3f4', 'ffd5dc', 'd4f0c0', 'fbe7c6', 'e0d4f0', 'c8b8f0', 'f0e4d4', '2a2535']

function buildSvg(seed: string, options?: AvatarOptions): string {
  return createAvatar(funEmoji, {
    seed,
    eyes: options?.eyes ? [options.eyes as any] : undefined,
    mouth: options?.mouth ? [options.mouth as any] : undefined,
    backgroundColor: options?.backgroundColor ? [options.backgroundColor] : undefined,
    radius: 50,
    size: 128,
  }).toString()
}

export default function Avatar({
  seed,
  size = 40,
  options,
}: {
  seed: string
  size?: number
  options?: AvatarOptions
}) {
  const svg = buildSvg(seed, options)
  const dataUrl = `data:image/svg+xml,${encodeURIComponent(svg)}`

  return (
    <img
      src={dataUrl}
      width={size}
      height={size}
      alt=""
      style={{ flexShrink: 0 }}
      className="rounded-full"
    />
  )
}