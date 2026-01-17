import React from 'react';
import { motion } from 'framer-motion';

interface ScoreTrackProps {
  score: number;
  color?: string; // Optional custom color for the marker
}

export function ScoreTrack({ score, color = 'bg-slate-900' }: ScoreTrackProps) {
  // Generate array [0...100]
  const cells = Array.from({ length: 101 }, (_, i) => i);

  // We want a grid of 20 columns per row to match standard Azul board
  // 0 is usually separate or at start.
  // The image shows 0 at top left, then 1-20, 21-40, etc.

  return (
    <div className="flex flex-col gap-1 select-none">
      <div className="grid grid-cols-[auto_1fr] gap-1">
         {/* Cell 0 separate usually, or part of the grid. 
             Based on image provided, 0 is top left separate block 
             and then 5 rows of 20? 
             Actually image shows: 0 [gap] 1 2 ... 20
             Let's try to replicate the image layout. 
             5 rows:
             1-20
             21-40
             41-60
             61-80
             81-100
             And 0 somewhere. 
             Let's keep it simple: Just a flex wrap or grid of 20 cols.
         */}
      </div>
      
      {/* 
         Let's do a CSS Grid with 20 columns. 
         But we need to handle "0". 
         Ideally, 0 is to the left of row 1.
         Let's make a custom layout.
      */}
      
      <div className="relative bg-slate-200/50 p-1 rounded-sm border border-slate-300/30">
        <div className="grid grid-cols-[repeat(20,minmax(0,1fr))] gap-[1px] auto-rows-min">
            {/* Render cells 1 to 100 */}
            {/* But wait, where does 0 go? 
                Let's put 0 in a separate box above or to the side.
            */}
        </div>
      </div>
       
       {/* Re-thinking implementation based on provided image:
           The image shows 5 rows.
           Row 1 ends with 20.
           Row 2 ends with 40.
           ...
           0 is apart.
       */}

       <div className="flex items-start gap-2">
            {/* Zero Cell */}
            <div className="relative w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center bg-white/40 border border-slate-300/50 text-[10px] sm:text-xs">
                 0
                 {score === 0 && (
                     <Marker color={color} />
                 )}
            </div>

            {/* Main Grid 1-100 */}
            <div className="grid grid-cols-[repeat(20,minmax(0,1fr))] gap-[2px] bg-slate-300/20 p-1 rounded">
                {Array.from({ length: 100 }, (_, i) => i + 1).map((num) => {
                    const isMultipleOf5 = num % 5 === 0;
                    return (
                        <div 
                            key={num} 
                            className={`
                                relative w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 
                                flex items-center justify-center 
                                text-[8px] sm:text-[10px] 
                                ${isMultipleOf5 ? 'bg-amber-200/40 font-bold text-amber-900' : 'bg-white/40 text-slate-600'}
                                border border-slate-300/30
                            `}
                        >
                            {/* Only show number if multiple of 5 or strictly needed? 
                                Image shows numbers 5, 10, 15... populated.
                                Others are empty.
                            */}
                            {isMultipleOf5 ? num : ''}
                            
                            {score === num && (
                                <Marker color={color} />
                            )}
                        </div>
                    );
                })}
            </div>
       </div>
    </div>
  );
}

function Marker({ color }: { color: string }) {
    return (
        <motion.div
            layoutId="score-marker"
            className={`absolute inset-0 m-[2px] ${color} shadow-sm rounded-sm z-10`}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
    );
}

export default ScoreTrack;
