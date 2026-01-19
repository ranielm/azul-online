import { Factory as FactoryType, TileSelection, CenterPool as CenterPoolType, Tile as TileType, TileColor } from '@shared/types';
import { Factory } from './Factory';
import { CenterPool } from './CenterPool';
import { useTranslation } from '../../i18n/useLanguage';
import { Tile } from '../Tile/Tile'; // Assuming Tile component is exported from here or correct path

interface FactoryDisplayProps {
  factories: FactoryType[];
  centerPool: CenterPoolType;
  bag?: TileType[]; // Optional to support existing calls until updated
  onSelectTiles: (selection: TileSelection) => void;
  selectedTiles: TileSelection | null;
  disabled?: boolean;
}

export function FactoryDisplay({
  factories,
  centerPool,
  bag = [],
  onSelectTiles,
  selectedTiles,
  disabled = false,
}: FactoryDisplayProps) {
  const { t } = useTranslation();



  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wide">
          {t.factories}
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
          {t.center}
        </h3>
        <CenterPool
          centerPool={centerPool}
          onSelectTiles={onSelectTiles}
          selectedTiles={selectedTiles}
          disabled={disabled}
        />
      </div>

      {/* Bag Remaining */}
      {bag.length > 0 && (
        <div className="mt-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide flex justify-between items-center m-0">
            <span>{t.bag}</span>
            <span className="text-white font-bold">{bag.length}</span>
          </h3>
        </div>
      )}
    </div>
  );
}
