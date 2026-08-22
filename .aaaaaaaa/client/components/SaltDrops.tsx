import { useEffect, useState } from "react";

interface SaltDrop {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
}

export default function SaltDrops() {
  const [drops, setDrops] = useState<SaltDrop[]>([]);

  useEffect(() => {
    // Generate initial salt drops
    const initialDrops: SaltDrop[] = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 2.5 + Math.random() * 1,
      size: Math.random() * 3 + 2,
    }));

    setDrops(initialDrops);

    // Add new drops periodically
    const interval = setInterval(() => {
      setDrops((prev) => [
        ...prev.slice(-7),
        {
          id: Math.random(),
          left: Math.random() * 100,
          delay: 0,
          duration: 2.5 + Math.random() * 1,
          size: Math.random() * 3 + 2,
        },
      ]);
    }, 600);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {drops.map((drop) => (
        <div
          key={drop.id}
          className="absolute animate-salt-drop"
          style={{
            left: `${drop.left}%`,
            top: "-20px",
            width: `${drop.size}px`,
            height: `${drop.size}px`,
            borderRadius: "50%",
            background: `radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.8), rgba(200, 200, 200, 0.4))`,
            boxShadow: `0 0 ${drop.size}px rgba(255, 255, 255, 0.6)`,
            animation: `salt-drop ${drop.duration}s ease-in forwards`,
            animationDelay: `${drop.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
