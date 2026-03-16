interface SkeletonProps {
  width?: string
  height?: string
  borderRadius?: string
  style?: React.CSSProperties
}

export default function Skeleton({ width = '100%', height = '16px', borderRadius = '6px', style }: SkeletonProps) {
  return (
    <div
      className="animate-pulse"
      style={{
        width,
        height,
        borderRadius,
        background: 'rgba(255,255,255,.07)',
        ...style,
      }}
    />
  )
}
