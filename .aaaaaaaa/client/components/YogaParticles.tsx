import { useEffect, useState } from "react";

interface Particle {
  id: number;
  x: number;
  y: number;
  emoji: string;
  duration: number;
  delay: number;
  color: string;
}

export default function YogaParticles() {
  const [particles, setParticles] = useState<Particle[]>([]);

  const yogaEmojis = ["✨", "🧘", "🕉️", "🌸", "☯️", "🙏"];
  const colors = [
    "rgba(167, 139, 250, 0.8)",
    "rgba(96, 165, 250, 0.8)",
    "rgba(251, 191, 36, 0.8)",
    "rgba(248, 113, 113, 0.8)",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setParticles((prev) => [
        ...prev.slice(-4),
        {
          id: Math.random(),
          x: Math.random() * 100,
          y: Math.random() * 60,
          emoji: yogaEmojis[Math.floor(Math.random() * yogaEmojis.length)],
          duration: 3 + Math.random() * 3,
          delay: 0,
          color: colors[Math.floor(Math.random() * colors.length)],
        },
      ]);
    }, 800);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-60">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute text-2xl animate-yoga-float"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            animation: `yoga-float ${particle.duration}s ease-in-out forwards`,
            animationDelay: `${particle.delay}s`,
            filter: `drop-shadow(0 0 8px ${particle.color})`,
          }}
        >
          {particle.emoji}
        </div>
      ))}
    </div>
  );
}
