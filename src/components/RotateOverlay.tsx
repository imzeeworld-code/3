export default function RotateOverlay() {
  return (
    <div className="rotate-overlay">
      <svg className="rotate-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 4a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4z"/>
        <path d="M17 8l4 4-4 4"/>
        <path d="M21 12H9"/>
      </svg>
      <div className="rotate-text">Please rotate your device</div>
      <div className="rotate-sub">
        Web Coding AIDE works best in landscape mode
        <br />
        Like a real IDE — code on the left, preview on the right
      </div>
    </div>
  );
}
