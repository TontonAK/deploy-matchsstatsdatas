export default function RefereeCardIcon(isYellowCard: boolean) {
  return (
    <svg height="24" width="24" viewBox="0 0 24 24" className="shrink-0">
      <rect
        x="5.82031"
        y="0.601562"
        width="24"
        height="24"
        rx="1"
        transform="rotate(20 5.82031 0.601562)"
        fill={isYellowCard ? "#FDE000" : "#FD0000"}
      ></rect>
    </svg>
  );
}
