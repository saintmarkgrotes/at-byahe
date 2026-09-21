import { twMerge } from 'tailwind-merge';

// Joins class names and lets later classes override earlier ones,
// so `className` passed to a component can safely override its defaults.
export const cn = (...classes) => twMerge(classes.filter(Boolean).join(' '));
