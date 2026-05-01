const ALL = 0;
const SELECTIVE = 1;

export const drawBorder = (color?: string, selected?: boolean) => {
  if (ALL) return `1px solid ${color || "red"}`;
  if (SELECTIVE && selected) return `1px solid ${color || "red"}`;
  return "none";
};
