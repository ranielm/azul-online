import React, { useState } from 'react';

interface UserAvatarProps {
    src?: string | null;
    name: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl',
};

// Get initials from name (e.g., "Raniel Mendonça" -> "RM")
function getInitials(name: string): string {
    if (!name) return '?';

    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) {
        return parts[0].charAt(0).toUpperCase();
    }

    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function UserAvatar({ src, name, size = 'md', className = '' }: UserAvatarProps) {
    const [imageError, setImageError] = useState(false);

    const showImage = src && !imageError;
    const initials = getInitials(name);
    const sizeClass = sizeClasses[size];

    if (showImage) {
        return (
            <img
                src={src}
                alt={name}
                className={`
          ${sizeClass}
          rounded-full object-cover
          border-2 border-slate-600
          bg-slate-700
          ${className}
        `}
                onError={() => setImageError(true)}
                referrerPolicy="no-referrer"
            />
        );
    }

    // Fallback to initials
    return (
        <div
            className={`
        ${sizeClass}
        rounded-full
        bg-gradient-to-br from-blue-500 to-blue-600
        border-2 border-blue-400
        flex items-center justify-center
        font-bold text-white
        ${className}
      `}
            title={name}
        >
            {initials}
        </div>
    );
}
