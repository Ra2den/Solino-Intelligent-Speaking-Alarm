import { useEffect, useState } from 'react';

export type NumPadProps = {
  value?: string;
  onChange?: (value: string) => void;
  onConfirm?: () => void;
  onClear?: () => void;
};

const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

//truncate to 4 digits and only numbers allowed
function normalizeDigits(value = '') {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  return digits === '0000' ? '' : digits;
}

function appendDigit(value: string, key: string) {
  // Treat the default 0000 as empty input so the first user digit is visible.
  const current = normalizeDigits(value);

  // Removes any non-digit characters and limits to 4 digits.
  const appended = `${current}${key}`.replace(/\D/g, '').slice(0, 4);

  return appended;
}

export function NumPad({ value = '', onChange, onClear }: NumPadProps) {
  const [displayValue, setDisplayValue] = useState(() => normalizeDigits(value));

  useEffect(() => {
    setDisplayValue(normalizeDigits(value));
  }, [value]);


  const handlePress = (key: string) => {
    const nextValue = appendDigit(displayValue, key);

    setDisplayValue(nextValue);
    if (!onChange) return;
    onChange(nextValue);
  };

  const handleBackspace = () => {
    const current = normalizeDigits(displayValue);
    const next = current.slice(0, -1);

    setDisplayValue(next);
    onChange?.(next);
  };

  return (
    <div className="num-pad w-[500px]">
      <div className="grid grid-cols-3 gap-2.5 font-medium text-black hover:bg-gray-200">
        {keys.map((key) => (
          <button
            key={key}
            type="button"
            className="flex h-25 w-30 items-center justify-center bg-white text-[25px] leading-none font-medium opacity-50 rounded-[15px] text-black"
            onClick={() => handlePress(key)}
            aria-label={`Digit ${key}`}
          >
            {key}
          </button>
        ))}
        <button
          type="button"
          className="flex h-25 w-30 items-center justify-center bg-white text-[20px] leading-none font-medium opacity-50 rounded-[15px] text-black"
          onClick={handleBackspace}
          aria-label="Backspace"
        >
          Back
        </button>
        <button
          type="button"
          className="flex h-25 w-30 items-center justify-center bg-white text-[20px] leading-none font-medium opacity-50 rounded-[15px] text-black"
          onClick={() => {
            setDisplayValue('');
            onClear?.();
          }}
          aria-label="Clear"
        >
          Clear
        </button>
      </div>
    </div>
  );
}

export default NumPad;