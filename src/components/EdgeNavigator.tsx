import React from "react";

type Props = {
  canPrev: boolean;
  canNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  /** width of the hot-zone in px (default 40) */
  zoneWidth?: number;
  /** custom labels */
  prevLabel?: string;
  nextLabel?: string;
  /** increase z-index if something sits above (default 50) */
  zIndex?: number;
};

const EdgeNavigator: React.FC<Props> = ({
  canPrev,
  canNext,
  onPrev,
  onNext,
  zoneWidth = 40,
  prevLabel = "← Go to previous section",
  nextLabel = "Go to next section →",
  zIndex = 50,
}) => {
  const zoneW = `${zoneWidth}px`;
  const z = `z-[${zIndex}]`;

  return (
    <>
      {/* Left hot-zone */}
      <button
        disabled={!canPrev}
        onClick={onPrev}
        aria-label="Previous section"
        className={`group fixed left-0 top-0 h-screen ${z}`}
        style={{ width: zoneW }}
      >
        <div
          className={`
            absolute left-2 top-1/2 -translate-y-1/2
            px-2 py-1 rounded bg-neutral-800/80 text-white text-sm
            opacity-0 group-hover:opacity-100 transition-opacity
            pointer-events-none select-none
            ${canPrev ? "" : "hidden"}
          `}
        >
          {prevLabel}
        </div>
      </button>

      {/* Right hot-zone */}
      <button
        disabled={!canNext}
        onClick={onNext}
        aria-label="Next section"
        className={`group fixed right-0 top-0 h-screen ${z}`}
        style={{ width: zoneW }}
      >
        <div
          className={`
            absolute right-2 top-1/2 -translate-y-1/2
            px-2 py-1 rounded bg-neutral-800/80 text-white text-sm
            opacity-0 group-hover:opacity-100 transition-opacity
            pointer-events-none select-none
            ${canNext ? "" : "hidden"}
          `}
        >
          {nextLabel}
        </div>
      </button>
    </>
  );
};

export default EdgeNavigator;
