
"use client";

import { motion } from "framer-motion";
import { clsx } from "clsx";

export function ScrollReveal({ children, className, delay = 0, width = "100%" }) {
  return (
    <div style={{ width, overflow: "visible" }}>
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 75 },
          visible: { opacity: 1, y: 0 },
        }}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, delay: delay, ease: "easeOut" }}
        className={clsx(className)}
      >
        {children}
      </motion.div>
    </div>
  );
}

export function FadeIn({ children, className, delay = 0 }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: delay }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

export function SlideIn({ children, className, direction = "left", delay = 0 }) {
    const variants = {
        hidden: { x: direction === "left" ? -100 : 100, opacity: 0 },
        visible: { x: 0, opacity: 1 }
    };

    return (
        <motion.div
            variants={variants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: delay, ease: "easeOut" }}
            className={className}
        >
            {children}
        </motion.div>
    );
}
