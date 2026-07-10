interface SkeletonProps {
  width?: string
  height?: string
  borderRadius?: string
  style?: React.CSSProperties
}

export default function Skeleton({ width = '100%', height = '16px', borderRadius = '6px', style }: SkeletonProps) {
  return (
    <div
      className="ember-skeleton"
      style={{
        width,
        height,
        borderRadius,
        ...style,
      }}
    />
  )
}
