export default function Ticker() {
  const message = "Get ready to dance: EDM Night with Lost Stories at NIT Mumbai!";

  return (
    <div className="ticker">
      <div className="ticker-content">
        {Array.from({ length: 8 }).map((_, i) => (
          <span key={i}>
            <span className="ticker-text">{message}</span>
            <span className="ticker-star">★</span>
          </span>
        ))}
      </div>
    </div>
  );
}
