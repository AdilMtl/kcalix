export type SystemIconName =
  | 'camera'
  | 'check'
  | 'close'
  | 'gallery'
  | 'lightbulb'
  | 'loader'
  | 'search'
  | 'send'
  | 'trend'
  | 'warning'

interface Props {
  name: SystemIconName
  size?: number
  className?: string
  label?: string
}

function IconPaths({ name }: { name: SystemIconName }) {
  switch (name) {
    case 'camera':
      return <><path d="M14.5 5 13 3h-2L9.5 5H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-4.5Z" /><circle cx="12" cy="11.5" r="3.5" /></>
    case 'check':
      return <path d="m5 12 4 4L19 6" />
    case 'close':
      return <><path d="m6 6 12 12" /><path d="M18 6 6 18" /></>
    case 'gallery':
      return <><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="9" r="1.5" /><path d="m4 17 5-5 4 4 2-2 5 5" /></>
    case 'lightbulb':
      return <><path d="M9 18h6" /><path d="M10 22h4" /><path d="M8.2 14.5A7 7 0 1 1 15.8 14.5C14.7 15.4 14 16.4 14 18h-4c0-1.6-.7-2.6-1.8-3.5Z" /></>
    case 'loader':
      return <><path d="M21 12a9 9 0 1 1-2.64-6.36" /><path d="M21 4v6h-6" /></>
    case 'search':
      return <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>
    case 'send':
      return <><path d="M12 19V5" /><path d="m6 11 6-6 6 6" /></>
    case 'trend':
      return <><path d="M3 17 9 11l4 4 8-9" /><path d="M15 6h6v6" /></>
    case 'warning':
      return <><path d="M10.3 4.2 2.6 18a2 2 0 0 0 1.8 3h15.2a2 2 0 0 0 1.8-3L13.7 4.2a2 2 0 0 0-3.4 0Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></>
    default:
      return null
  }
}

export function SystemIcon({ name, size = 20, className, label }: Props) {
  const classes = [className, name === 'loader' ? 'system-icon-spin' : ''].filter(Boolean).join(' ')
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={classes || undefined}
      role={label ? 'img' : undefined}
      aria-hidden={label ? undefined : true}
    >
      {label && <title>{label}</title>}
      <IconPaths name={name} />
    </svg>
  )
}
