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

export function NumPad({ value = '', onChange, onConfirm, onClear }: NumPadProps) {
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

  return (
    <div className="num-pad">
      <div className="grid grid-cols-3 gap-2.5 font-medium text-black hover:bg-gray-200">
        {keys.map((key) => (
          <button
            key={key}
            type="button"
            className="flex h-15 w-17 items-center justify-center bg-white px-3 py-1.25 text-[25px] leading-none font-medium opacity-50 rounded-[15px] text-black"
            onClick={() => handlePress(key)}
          >
            {key}
          </button>
        ))}
        <button
          type="button"
          className="flex h-15 w-17 items-center justify-center bg-white px-3 py-1.25 text-[20px] leading-none font-medium opacity-50 rounded-[15px] text-black"
          onClick={() => {
            setDisplayValue('');
            onClear?.();
          }}
        >
          Clear
        </button>
        <button
          type="button"
          className="flex h-15 w-17 items-center justify-center bg-white px-3 py-1.25 text-[20px] leading-none font-medium opacity-50 rounded-[15px] text-black"
          onClick={onConfirm}
        >
          OK
        </button>
      </div>
    </div>
  );
}

export default NumPad;