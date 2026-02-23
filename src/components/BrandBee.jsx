function BrandBee({ size = 24, className = '' }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M11.5 9.5C9.5 6 4.5 4.5 2.5 6.5C0.5 8.5 2.5 14 5.5 14C8.5 14 11.5 9.5 11.5 9.5Z" />
      <path d="M12.5 9.5C14.5 6 19.5 4.5 21.5 6.5C23.5 8.5 21.5 14 18.5 14C15.5 14 12.5 9.5 12.5 9.5Z" />
      <path d="M8 12.5S10 11 12 11S16 12.5 16 12.5" />
      <path d="M8.5 15.5S10.5 14 12.5 14S16.5 15.5 16.5 15.5" />
      <path
        d="M12 9V17.5C12 19.5 10.5 21 8.5 21S5 19.5 5 17.5V9"
        transform="translate(3.5, -1)"
        fill="currentColor"
        fillOpacity="0.2"
        stroke="none"
      />
      <path d="M8.5 9C8.5 9 10.5 7 12.5 7C14.5 7 16.5 9 16.5 9V17C16.5 19 14.5 21 12.5 21C10.5 21 8.5 19 8.5 17V9Z" />
      <line x1="12.5" y1="21" x2="12.5" y2="23" strokeWidth="2" />
    </svg>
  )
}

export default BrandBee
