// Central registry for `type` prop values across primitive components.
// Import these instead of hardcoding string literals — typos in a raw
// string ("secondry") fail silently at runtime; typos here don't compile.

export const ButtonType = Object.freeze({
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  DESTRUCTIVE: 'destructive',
  DISABLED: 'disabled',
});

export const ToggleType = Object.freeze({
  FUNCTIONAL: 'functional',
  DISABLED: 'disabled',
});