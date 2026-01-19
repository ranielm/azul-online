import React from 'react';

export const VersionFooter: React.FC = () => {
    return (
        <div className="fixed bottom-1 left-2 z-50 text-[10px] text-slate-600 dark:text-slate-500 pointer-events-none font-mono opacity-50 select-none">
            v{__APP_VERSION__}
        </div>
    );
};
