import { XEntity } from '@/ts/base/schema';
import { Node } from '@antv/x6';

export function CreateNode(e: XEntity, x: number, y: number): Node.Metadata {
  return {
    id: e.id,
    label: e.name,
    x: x,
    y: y,
    width: 100,
    height: 60,
    ports: {
      groups: {
        top: {
          position: 'top',
        },
        left: {
          position: 'left',
        },
        right: {
          position: 'right',
        },
        bottom: {
          position: 'bottom',
        },
      },
      items: [
        {
          id: 'top',
          group: 'top',
        },
        {
          id: 'left',
          group: 'left',
        },
        {
          id: 'right',
          group: 'right',
        },
        {
          id: 'bottom',
          group: 'bottom',
        },
      ],
    },
  };
}
