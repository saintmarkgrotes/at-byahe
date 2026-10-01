import { createElement } from 'react';
import { isValidIsoDate, parseDate, toIsoDate } from '../../utils/date';
export default function PickerField({
  mode,
  value,
  onChange,
  placeholder,
  hasError,
  minimumDate,
  maximumDate,
}) {
  const formatted = !value
    ? ''
    : mode === 'date'
      ? toIsoDate(value)
      : `${String(value.getHours()).padStart(2, '0')}:${String(value.getMinutes()).padStart(2, '0')}`;
  return createElement('input', {
    type: mode,
    value: formatted,
    'aria-label': placeholder,
    'aria-invalid': !!hasError,
    min: mode === 'date' && minimumDate ? toIsoDate(minimumDate) : undefined,
    max: mode === 'date' && maximumDate ? toIsoDate(maximumDate) : undefined,
    onChange: (event) => {
      const input = event.target.value;
      if (!input) {
        onChange(null);
        return;
      }
      if (!event.target.validity.valid) return;
      if (mode === 'date') {
        if (isValidIsoDate(input)) onChange(parseDate(input));
      } else {
        const [hours, minutes] = input.split(':').map(Number);
        if (hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
          const date = new Date();
          date.setHours(hours, minutes, 0, 0);
          onChange(date);
        }
      }
    },
    style: {
      boxSizing: 'border-box',
      width: '100%',
      minWidth: 0,
      minHeight: 48,
      borderRadius: 12,
      padding: 12,
      border: `1px solid ${hasError ? '#DC2626' : '#D1D5DB'}`,
      backgroundColor: 'white',
      color: '#163329',
      font: 'inherit',
    },
  });
}
