export const circle = {
  r: 4,
  magnet: true,
  stroke: 'transparent',
  strokeWidth: 1,
  fill: 'transparent',
};

export const outGroup = {
  position: {
    name: 'right',
    args: {
      dx: -32,
    },
  },
  attrs: {
    circle: circle,
  },
};

export const inGroup = {
  position: 'left',
  attrs: {
    circle: circle,
  },
};
