interface TimeSpinnerProps {
  value: string;
  onChange: (time: string) => void;
  minHour?: number;
}

export function TimeSpinner({ value, onChange, minHour = 6 }: TimeSpinnerProps) {
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const currentIndex = hours.indexOf(Number(value.split(':')[0]));

  const increment = () => {
    const next = (currentIndex + 1) % hours.length;
    onChange(`${hours[next].toString().padStart(2, '0')}:00`);
  };

  const decrement = () => {
    const prev = (currentIndex - 1 + hours.length) % hours.length;
    onChange(`${hours[prev].toString().padStart(2, '0')}:00`);
  };

  return (
    <div className="flex items-center gap-3 w-full">
      <button onClick={decrement} className="px-3 py-2 bg-gray-500 rounded">▲</button>

      <div className="flex-1 text-center font-semibold bg-gray-500 text-lg">
        {value}
      </div>

      <button onClick={increment} className="px-3 py-2 bg-gray-500 rounded">▼</button>
    </div>
  );
}
