
"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { clsx } from "clsx";

/**
 * Animated Grid Background
 */
export function GridPattern({ className }) {
  return (
    <div className={clsx("absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]", className)}>
      <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-20 blur-[100px]" />
    </div>
  );
}

/**
 * Meteor Shower Effect
 * Spawns from Top and Left, falling diagonally To Bottom-Right
 */
export function MeteorShower({ count = 20, minDelay = 0, maxDelay = 4000 }) {
    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-0">
            {[...Array(count)].map((_, i) => (
                <Meteor key={i} delay={Math.random() * (maxDelay - minDelay) + minDelay} />
            ))}
        </div>
    );
}



function Meteor({ delay }) {
    const [animationKey, setAnimationKey] = useState(0); 
    const [animConfig, setAnimConfig] = useState(null);

    useEffect(() => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        const startSide = Math.random() < 0.5 ? 'top' : 'left';
        let startX, startY;

        if (startSide === 'top') {
            startX = Math.random() * width;
            startY = -100;
        } else {
            startX = -100;
            startY = Math.random() * height * 0.7;
        }

        // Dynamic Angle: Random between 30 and 60 degrees (diagonal down-right variability)
        const angle = Math.random() * 30 + 30; // 30 to 60 degrees
        const rad = angle * (Math.PI / 180);
        
        // Calculate end point based on angle
        const travelDist = Math.max(width, height) * 1.5;
        const endX = startX + travelDist * Math.cos(rad);
        const endY = startY + travelDist * Math.sin(rad);
        
        // Constant Very Slow Duration (25s) 
        const duration = 25; 
        // Reduced gap: 0-1.5s delay max
        const currentDelay = animationKey === 0 ? delay / 1000 : Math.random() * 1.5;

        // Rotation: Point the tail back.
        // Moving down-right (e.g., 45 deg). Tail should point up-left (225 deg).
        // CSS rotate is clockwise from right? 
        // 0 = Right. 45 = Down-Right. 
        // Meteor head is "right" end of span? No, width is length.
        // Gradient: White -> Transparent (Left -> Right).
        // Head is Left. Tail is Right.
        // To point Head (Left) to Bottom-Right:
        // Rotate 180 (Head Right) + Angle.
        // e.g. Angle 45. Rotate 225. Head points Down-Right.
        const rotation = 180 + angle;

        setAnimConfig({
            initial: { top: startY, left: startX, opacity: 0 },
            animate: { top: endY, left: endX, opacity: [0, 1, 1, 0] },
            transition: {
                duration: duration,
                delay: currentDelay, 
                ease: "linear",
            },
            style: {
                width: Math.random() * 80 + 20 + "px",
                background: "linear-gradient(to right, rgba(255,255,255,0.5), transparent)",
                transform: `rotate(${rotation}deg)` 
            }
        });

    }, [animationKey, delay]);

    if (!animConfig) return null;

    return (
        <motion.span
            key={animationKey} // Force remount on key change to ensure fresh animation
            className="absolute h-0.5 w-0.5 rounded-[9999px] bg-white shadow-[0_0_0_1px_#ffffff10]"
            initial={animConfig.initial}
            animate={animConfig.animate}
            transition={animConfig.transition}
            style={animConfig.style}
            onAnimationComplete={() => {
                setAnimationKey(prev => prev + 1); 
            }}
        />
    );
}

/**
 * Pulsing Red Glow Effect
 */
export function RedGlowPulse() {
    return (
        <motion.div 
            className="fixed inset-0 pointer-events-none -z-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.15, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        >
            <div className="absolute top-0 right-0 w-[80vw] h-[80vh] bg-gradient-radial from-red-600/20 to-transparent rounded-full blur-[100px]" />
            <div className="absolute bottom-0 left-0 w-[80vw] h-[80vh] bg-gradient-radial from-red-900/10 to-transparent rounded-full blur-[100px]" />
        </motion.div>
    );
}

/**
 * Twinkling Stars Static Background
 */
export function Starfield() {
    return (
        <div className="absolute inset-0 w-full h-full -z-20">
            {[...Array(50)].map((_, i) => (
                <div
                    key={i}
                    className="absolute bg-white rounded-full opacity-20"
                    style={{
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                        width: `${Math.random() * 2}px`,
                        height: `${Math.random() * 2}px`,
                        animation: `pulse ${Math.random() * 3 + 2}s infinite`
                    }}
                />
            ))}
        </div>
    );
}
