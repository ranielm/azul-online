import React from 'react';
import { Factory as FactoryType, TileSelection, CenterPool as CenterPoolType } from '@shared/types';
import { Factory } from './Factory';
import { CenterPool } from './CenterPool';

interface FactoryDisplayProps {
  factories: FactoryType[];
  centerPool: CenterPoolType;
  onSelectTiles: (selection: TileSelection) => void;
  selectedTiles: TileSelection | null;
  disabled?: boolean;
}

export function FactoryDisplay({
  factories,
  centerPool,
  onSelectTiles,
  selectedTiles,
  disabled = false,
}: FactoryDisplayProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wide">
          Factories
        </h3>
        <div className="flex flex-wrap gap-4 justify-center">
          {factories.map((factory, index) => (
            <Factory
              key={index}
              tiles={factory}
              factoryIndex={index}
              onSelectTiles={onSelectTiles}
              selectedTiles={selectedTiles}
              disabled={disabled}
            />
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wide">
          Center
        </h3>
        <CenterPool
          centerPool={centerPool}
          onSelectTiles={onSelectTiles}
          selectedTiles={selectedTiles}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
