interface TimeSpinnerProps {
  value: string;
  onChange: (time: string) => void;
  /** Minimum hour allowed (0-23). Default keeps existing 24h behaviour */
  minHour?: number;
  /** Maximum hour allowed (0-23). Default keeps existing 24h behaviour */
  maxHour?: number;
}

export function TimeSpinner({
  value,
  onChange,
  minHour = 0,
  maxHour = 23,
}: TimeSpinnerProps) {
  // Build the list of allowed hours respecting bounds
  const allowedHours = Array.from({ length: 24 }, (_, i) => i).filter(
    (h) => h >= minHour && h <= maxHour
  );

  // Fallback to minHour if current value is outside bounds
  const currentHour = Number(value.split(':')[0]);
  const currentIndex = Math.max(
    0,
    allowedHours.indexOf(currentHour) === -1 ? 0 : allowedHours.indexOf(currentHour)
  );

  const increment = () => {
    const next = (currentIndex + 1) % allowedHours.length;
    onChange(`${allowedHours[next].toString().padStart(2, "0")}:00`);
  };

  const decrement = () => {
    const prev = (currentIndex - 1 + allowedHours.length) % allowedHours.length;
    onChange(`${allowedHours[prev].toString().padStart(2, "0")}:00`);
  };

  return (
    <div className="flex items-center gap-3 w-full">
      <button
        type="button"
        onClick={decrement}
        className="px-3 py-2 bg-blue-100 rounded"
        aria-label="Earlier check-in time"
      >
        ▲
      </button>

      <div className="flex-1 text-center font-semibold bg-blue-100 text-lg rounded">
        {value}
      </div>

      <button
        type="button"
        onClick={increment}
        className="px-3 py-2 bg-blue-100 rounded"
        aria-label="Later check-in time"
      >
        ▼
      </button>
    </div>
  );
}
