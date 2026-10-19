import '../styles/anime-theme.css';

/**
 * 二次元动漫风格主题提供者
 * 包裹应用，提供统一的二次元风格样式
 */
export default function AnimeThemeProvider({ children }) {
  return (
    <div className="anime-body" style={{ minHeight: '100vh' }}>
      {/* 浮动装饰元素 */}
      <div className="floating-decorations">
        <span className="floating-star" style={{ position: 'fixed', top: '15%', left: '5%', fontSize: '2rem', animation: 'float 4s ease-in-out infinite', zIndex: 1 }}>⭐</span>
        <span className="floating-star" style={{ position: 'fixed', top: '60%', right: '8%', fontSize: '1.5rem', animation: 'float 5s ease-in-out infinite 1s', zIndex: 1 }}>💫</span>
        <span className="floating-star" style={{ position: 'fixed', bottom: '20%', left: '10%', fontSize: '1.8rem', animation: 'float 4.5s ease-in-out infinite 0.5s', zIndex: 1 }}>✨</span>
        <span className="floating-star" style={{ position: 'fixed', top: '40%', right: '15%', fontSize: '2.2rem', animation: 'float 3.5s ease-in-out infinite 2s', zIndex: 1 }}>🌸</span>
      </div>
      {children}
    </div>
  );
}
