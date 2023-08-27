import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import React, { ReactNode } from 'react';
import { generateUuid } from '@/ts/base/common';

interface IProps {
  node: ReactNode;
}

const Draggable: React.FC<IProps> = ({ node }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: generateUuid(),
  });
  const style = {
    transform: CSS.Transform.toString(transform),
  };
  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      {node}
    </div>
  );
};

export default Draggable;
