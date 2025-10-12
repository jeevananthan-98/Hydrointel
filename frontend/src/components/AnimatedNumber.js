import React, { useEffect } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';

/**
 * A cool, animated progress circle component.
 * It uses Framer Motion to provide a smooth, visually appealing animation
 * for a progress value from 0 to 100%.
 *
 * @param {object} props
 * @param {number} props.value The percentage value to display (0-100).
 * @param {string} props.label A label for the progress circle (e.g., "Recharge").
 * @param {string} props.color The color of the progress circle.
 * @param {string} props.size The size of the circle (e.g., "120", "150").
 */
const SmoothProgressCircle = ({ value, label, color, size = "150" }) => {
  const motionValue = useMotionValue(0);
  const strokeDasharray = useTransform(motionValue, (latest) => [
    (latest / 100) * (314),
    314,
  ]);

  useEffect(() => {
    const animation = motionValue.set(0);
    const timeout = setTimeout(() => {
      motionValue.set(value);
    }, 100);

    return () => clearTimeout(timeout);
  }, [value, motionValue]);

  const circleStyle = {
    strokeDasharray,
    strokeDashoffset: 0,
    strokeLinecap: 'round',
    strokeWidth: '10',
    transition: 'stroke-dasharray 1.5s ease-out',
  };

  const svgSize = parseInt(size, 10);
  const viewBoxSize = 100;
  const radius = 50;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="relative" style={{ width: svgSize, height: svgSize }}>
        <svg
          viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
          className="transform -rotate-90"
        >
          {/* Background Circle */}
          <circle
            cx={radius}
            cy={radius}
            r={radius}
            fill="transparent"
            stroke="#1F2937"
            strokeWidth="10"
          />
          {/* Progress Circle */}
          <motion.circle
            cx={radius}
            cy={radius}
            r={radius}
            fill="transparent"
            stroke={color}
            style={circleStyle}
          />
        </svg>

        {/* Text inside the circle */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
          <motion.span className="text-3xl font-bold">
            {Math.round(value)}%
          </motion.span>
          <span className="text-sm text-gray-400 mt-1">{label}</span>
        </div>
      </div>
    </div>
  );
};

export default SmoothProgressCircle;
