import type { CSSProperties } from 'react'

import homeIcon from '../../assets/icons/kcalix/icons8/nav-home.png'
import diaryIcon from '../../assets/icons/kcalix/icons8/nav-diary.png'
import workoutIcon from '../../assets/icons/kcalix/icons8/nav-workout.png'
import bodyIcon from '../../assets/icons/kcalix/icons8/nav-body.png'
import moreIcon from '../../assets/icons/kcalix/icons8/nav-more.png'
import coachAvatar from '../../assets/icons/kcalix/illustrated/coach-avatar.png'
import coachHero from '../../assets/icons/kcalix/illustrated/coach-hero.png'

const ICONS = {
  home: homeIcon,
  diary: diaryIcon,
  workout: workoutIcon,
  body: bodyIcon,
  more: moreIcon,
  'coach-avatar': coachAvatar,
  'coach-hero': coachHero,
} as const

export type KcalixIconName = keyof typeof ICONS

interface Props {
  name: KcalixIconName
  size?: number
  alt?: string
  className?: string
  style?: CSSProperties
}

export function KcalixIcon({ name, size = 24, alt = '', className, style }: Props) {
  return (
    <img
      src={ICONS[name]}
      width={size}
      height={size}
      alt={alt}
      aria-hidden={alt ? undefined : true}
      className={className}
      style={style}
      draggable={false}
      decoding="async"
    />
  )
}
