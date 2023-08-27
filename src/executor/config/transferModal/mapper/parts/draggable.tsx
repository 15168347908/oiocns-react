import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import React, { ReactNode } from 'react';
import { generateUuid } from '@/ts/base/common';

interface IProps {
  children: ReactNode;
}

const Draggable: React.FC<IProps> = ({ children }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: generateUuid(),
  });
  const style = {
    transform: CSS.Transform.toString(transform),
  };
  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      {children}
    </div>
  );
};

export default Draggable;
