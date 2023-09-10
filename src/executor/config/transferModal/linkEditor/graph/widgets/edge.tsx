export const generateEdge = () => {
  return {
    attrs: {
      line: {
        stroke: '#A2B1C3',
        strokeDasharray: '5 5',
      },
    },
    zIndex: -1,
    connector: 'smooth',
  };
};
