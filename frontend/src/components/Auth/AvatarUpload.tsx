import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface AvatarUploadProps {
  avatar: string | null;
  onAvatarChange: (avatar: string | null) => void;
  borderColor?: string;
  size?: 'sm' | 'md' | 'lg';
}

const BORDER_COLORS = [
  '#006DB2', // Blue
  '#D93844', // Red
  '#E6A745', // Yellow
  '#606C76', // Black/Slate
  '#14B8A6', // Teal (first player)
];

export function AvatarUpload({
  avatar,
  onAvatarChange,
  borderColor,
  size = 'lg',
}: AvatarUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);

  const currentBorderColor = borderColor || BORDER_COLORS[selectedColorIndex];

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  };

  const borderWidth = {
    sm: '3px',
    md: '4px',
    lg: '5px',
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onAvatarChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const cycleColor = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedColorIndex((prev) => (prev + 1) % BORDER_COLORS.length);
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleClick}
        className={`
          ${sizeClasses[size]} rounded-full cursor-pointer relative
          flex items-center justify-center overflow-hidden
          transition-all duration-300
        `}
        style={{
          border: `${borderWidth[size]} solid ${currentBorderColor}`,
          boxShadow: `0 0 20px ${currentBorderColor}40, inset 0 0 20px rgba(0,0,0,0.3)`,
          background: avatar
            ? 'transparent'
            : 'linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
        }}
      >
        {avatar ? (
          <img
            src={avatar}
            alt="Avatar"
            className="w-full h-full object-cover"
          />
        ) : (
          <svg
            className="w-1/2 h-1/2 text-slate-400"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        )}

        {/* Hover overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full"
        >
          <svg
            className="w-8 h-8 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </motion.div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </motion.div>

      {/* Color selector dots */}
      {!borderColor && (
        <div className="flex gap-2">
          {BORDER_COLORS.map((color, index) => (
            <motion.button
              key={color}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedColorIndex(index);
              }}
              className={`
                w-4 h-4 rounded-full transition-all duration-200
                ${selectedColorIndex === index ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900' : ''}
              `}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      )}

      {avatar && (
        <motion.button
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={(e) => {
            e.stopPropagation();
            onAvatarChange(null);
          }}
          className="text-xs text-slate-400 hover:text-red-400 transition-colors"
        >
          Remove
        </motion.button>
      )}
    </div>
  );
}
