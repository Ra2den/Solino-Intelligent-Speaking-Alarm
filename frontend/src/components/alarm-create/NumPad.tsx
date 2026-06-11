import React from 'react';

export type NumPadProps = {
  value?: string;
  onChange?: (value: string) => void;
  onConfirm?: () => void;
  onClear?: () => void;
};

const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

function formatDisplayValue(value = '') {
  if (!value) return 'Enter time';
  const digits = value.replace(/\D/g, '').slice(0, 4).padStart(4, '0');
  return `${digits.slice(0, 2)}:${digits.slice(2, 4)}`;
}

function appendDigit(value: string, key: string) {
  return `${value}${key}`.replace(/\D/g, '').slice(0, 4);
}

export function NumPad({ value = '', onChange, onConfirm, onClear }: NumPadProps) {
  const formattedValue = formatDisplayValue(value);

  const handlePress = (key: string) => {
    if (!onChange) return;
    onChange(appendDigit(value, key));
  };

  return (
    <div className="num-pad">
      <div className="num-pad__display">{formattedValue}</div>
      <div className="grid grid-cols-3 gap-2.5 font-medium text-black hover:bg-gray-200">
        {keys.map((key) => (
          <button
            key={key}
            type="button"
            className="flex h-15 w-17 items-center justify-center bg-white px-3 py-1.25 text-[25px] rounded-[10px]"
            onClick={() => handlePress(key)}
          >
            {key}
          </button>
        ))}
        <button
          type="button"
          className="flex h-15 w-17 items-center justify-center bg-white px-3 py-1.25 text-[20px] rounded-[10px]"
          onClick={onClear}
        >
          Clear
        </button>
        <button
          type="button"
          className="flex h-15 w-17 items-center justify-center bg-white px-3 py-1.25 text-[20px] rounded-[10px]"
          onClick={onConfirm}
        >
          OK
        </button>
      </div>
    </div>
  );
}

export default NumPad;