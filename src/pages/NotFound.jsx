import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="not-found-page">
      <div className="not-found-card">
        <div className="not-found-title font-bungee">
          <span>4</span>
          <span className="not-found-monster">
            {/* Monster SVG */}
            <svg viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg">
              <ellipse cx="60" cy="75" rx="50" ry="55" fill="#E8576D"/>
              {/* Horns */}
              <path d="M35 25L30 5L42 30Z" fill="#F5C842"/>
              <path d="M85 25L90 5L78 30Z" fill="#F5C842"/>
              {/* Eyes */}
              <circle cx="42" cy="65" r="8" fill="#fff"/>
              <circle cx="78" cy="65" r="8" fill="#fff"/>
              <circle cx="44" cy="63" r="4" fill="#1B1B2F"/>
              <circle cx="80" cy="63" r="4" fill="#1B1B2F"/>
              <circle cx="45" cy="62" r="1.5" fill="#fff"/>
              <circle cx="81" cy="62" r="1.5" fill="#fff"/>
              {/* Freckles */}
              <circle cx="30" cy="80" r="3" fill="#D14A5E"/>
              <circle cx="33" cy="88" r="2.5" fill="#D14A5E"/>
              <circle cx="87" cy="80" r="3" fill="#D14A5E"/>
              <circle cx="90" cy="88" r="2.5" fill="#D14A5E"/>
              {/* Mouth with teeth */}
              <path d="M35 92C35 92 45 110 60 110C75 110 85 92 85 92Z" fill="#fff"/>
              <path d="M40 92V102" stroke="#E8E8E8" strokeWidth="1"/>
              <path d="M50 92V105" stroke="#E8E8E8" strokeWidth="1"/>
              <path d="M60 92V107" stroke="#E8E8E8" strokeWidth="1"/>
              <path d="M70 92V105" stroke="#E8E8E8" strokeWidth="1"/>
              <path d="M80 92V102" stroke="#E8E8E8" strokeWidth="1"/>
            </svg>
          </span>
          <span>4</span>
        </div>
        <p className="not-found-text">Oops! Lost? Let's take you to the right page.</p>
        <Link to="/" className="btn-back-home">BACK TO HOME</Link>
      </div>
    </div>
  );
}
