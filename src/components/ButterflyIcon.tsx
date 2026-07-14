/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';

interface ButterflyIconProps {
  size?: number;
  className?: string;
  isAnimated?: boolean;
  speedMultiplier?: number;
}

export default function ButterflyIcon({
  size = 28,
  className = 'text-rosegold',
  isAnimated = true,
  speedMultiplier = 1
}: ButterflyIconProps) {
  // SVG of an elegant, artistic butterfly
  const baseDuration = 0.8 / speedMultiplier;

  return (
    <div className={`relative inline-block ${className}`} style={{ width: size, height: size }}>
      <motion.svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        animate={isAnimated ? {
          y: [-1.5, 1.5, -1.5],
          rotate: [-2, 2, -2]
        } : {}}
        transition={isAnimated ? {
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        } : {}}
      >
        {/* Left Wings */}
        <motion.path
          d="M50 50 C38 22 10 15 10 40 C10 56 32 62 50 50Z"
          fill="currentColor"
          transform-origin="50px 50px"
          animate={isAnimated ? {
            rotateY: [0, 55, 0],
            skewY: [0, 6, 0]
          } : {}}
          transition={isAnimated ? {
            duration: baseDuration,
            repeat: Infinity,
            ease: "easeInOut"
          } : {}}
        />
        <motion.path
          d="M50 50 C40 60 22 72 22 82 C22 90 38 86 50 50Z"
          fill="currentColor"
          opacity="0.8"
          transform-origin="50px 50px"
          animate={isAnimated ? {
            rotateY: [0, 50, 0],
            skewY: [0, 4, 0]
          } : {}}
          transition={isAnimated ? {
            duration: baseDuration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: baseDuration * 0.1
          } : {}}
        />

        {/* Right Wings */}
        <motion.path
          d="M50 50 C62 22 90 15 90 40 C90 56 68 62 50 50Z"
          fill="currentColor"
          transform-origin="50px 50px"
          animate={isAnimated ? {
            rotateY: [0, -55, 0],
            skewY: [0, -6, 0]
          } : {}}
          transition={isAnimated ? {
            duration: baseDuration,
            repeat: Infinity,
            ease: "easeInOut"
          } : {}}
        />
        <motion.path
          d="M50 50 C60 60 78 72 78 82 C78 90 62 86 50 50Z"
          fill="currentColor"
          opacity="0.8"
          transform-origin="50px 50px"
          animate={isAnimated ? {
            rotateY: [0, -50, 0],
            skewY: [0, -4, 0]
          } : {}}
          transition={isAnimated ? {
            duration: baseDuration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: baseDuration * 0.1
          } : {}}
        />

        {/* Antennae */}
        <path
          d="M49 45 C46 35 39 31 38 32"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.9"
        />
        <path
          d="M51 45 C54 35 61 31 62 32"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.9"
        />

        {/* Slender Body */}
        <rect
          x="48.5"
          y="42"
          width="3"
          height="24"
          rx="1.5"
          fill="currentColor"
        />
      </motion.svg>
    </div>
  );
}
