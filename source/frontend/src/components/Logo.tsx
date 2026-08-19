export const Logo = ({ className = '', width = 61, height = 72 }) => {
  return (
    <svg
      className={`transition-all duration-300 ${className}`}
      width={width}
      height={height}
      viewBox='0 0 100 100'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <circle cx='50' cy='50' r='40' fill='#3B82F6' />
      <text
        x='50'
        y='50'
        fontSize='40'
        fill='white'
        textAnchor='middle'
        dominantBaseline='middle'
        fontWeight='bold'
      >
        B
      </text>
    </svg>
  )
}
