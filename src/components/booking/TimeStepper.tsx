interface TimeStepperProps {
  value: string; 
  options: string[]; 
  onChange: (val: string) => void;
  formatTimeHour: (hour: number) => string;
}

export function TimeStepper({ value, options, onChange, formatTimeHour }: TimeStepperProps) {
  const index = options.indexOf(value);

  const prev = () => {
    if (index > 0) onChange(options[index - 1]);
  };

  const next = () => {
    if (index < options.length - 1) onChange(options[index + 1]);
  };

  return (
    <div className="flex items-center justify-center gap-6 py-4">
      <button
        onClick={prev}
        disabled={index === 0}
        className="w-12 h-12 rounded-full border flex items-center justify-center 
                   text-xl disabled:opacity-30"
      >
        –
      </button>

      <div className="text-2xl font-semibold">
        {formatTimeHour(Number(value.split(":")[0]))}
      </div>

      <button
        onClick={next}
        disabled={index === options.length - 1}
        className="w-12 h-12 rounded-full border flex items-center justify-center 
                   text-xl disabled:opacity-30"
      >
        +
      </button>
    </div>
  );
}
