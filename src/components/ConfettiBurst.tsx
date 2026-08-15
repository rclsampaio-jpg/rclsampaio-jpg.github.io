/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useMemo } from 'react';
import { motion } from 'motion/react';

interface ConfettiBurstProps {
  // Muda esse valor (ex: um contador ou Date.now()) pra disparar uma nova
  // explosão — o componente usa como `key` pra remontar as partículas.
  burstKey: string | number;
  colors?: string[];
  particleCount?: number;
}

// Explosão de confete tipo fogos de artifício: partículas saem de um ponto
// central em todas as direções, com gravidade puxando pra baixo no fim,
// giro e fade out. Sem lib externa, reaproveita o padrão de partículas em
// motion.div já usado em outros lugares do app (ex: visualizador de áudio).
export default function ConfettiBurst({ burstKey, colors, particleCount = 60 }: ConfettiBurstProps) {
  const palette = colors || ['#B76E79', '#EBB4A0', '#D4AF37', '#F3E5AB', '#10B981', '#FFFFFF'];

  const particles = useMemo(() => {
    return Array.from({ length: particleCount }).map((_, i) => {
      const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.5;
      const distance = 120 + Math.random() * 180;
      const isSquare = Math.random() > 0.5;
      return {
        id: i,
        color: palette[i % palette.length],
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance - 40,
        fallY: 220 + Math.random() * 160,
        rotate: (Math.random() - 0.5) * 720,
        size: 6 + Math.random() * 7,
        delay: Math.random() * 0.15,
        duration: 1.4 + Math.random() * 0.9,
        isSquare
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [burstKey, particleCount]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-[80]" aria-hidden="true">
      <div className="absolute top-1/4 left-1/2">
        {particles.map((p) => (
          <motion.span
            key={`${burstKey}-${p.id}`}
            initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 0.6 }}
            animate={{
              x: [0, p.x, p.x * 1.15],
              y: [0, p.y, p.y + p.fallY],
              opacity: [1, 1, 0],
              rotate: p.rotate,
              scale: [0.6, 1, 0.8]
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              ease: ['easeOut', 'easeIn'],
              times: [0, 0.35, 1]
            }}
            style={{
              position: 'absolute',
              width: p.size,
              height: p.isSquare ? p.size : p.size * 0.5,
              backgroundColor: p.color,
              borderRadius: p.isSquare ? 2 : 999
            }}
          />
        ))}
      </div>
    </div>
  );
}
