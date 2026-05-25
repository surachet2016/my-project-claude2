export default function DefaultAvatar({ size = 40, bgColor = '#E8EEF4', iconColor = '#9DAEC2' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background Circle */}
      <circle cx="50" cy="50" r="50" fill={bgColor} />

      {/* Head */}
      <circle cx="50" cy="37" r="16" fill={iconColor} />

      {/* Body / Shoulders */}
      <ellipse cx="50" cy="82" rx="26" ry="20" fill={iconColor} />
    </svg>
  );
}
