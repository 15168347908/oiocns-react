import { ILink } from '@/ts/core/thing/config';
import { Graph, Path, Platform } from '@antv/x6';
import { Selection } from '@antv/x6-plugin-selection';
import { register } from '@antv/x6-react-shape';
import { edgeRegistering } from './edge';
import { inGroup, outGroup } from './group';
import { ProcessingNode } from './node';
import React from 'react';

/**
 * 创建画布
 * @param ref html 元素引用
 * @param link 链接数据
 * @returns
 */
export const createGraph = (ref: React.RefObject<HTMLDivElement>, link: ILink): Graph => {
  const graph: Graph = new Graph({
    container: ref.current!,
    grid: true,
    autoResize: true,
    panning: true,
    mousewheel: true,
    highlighting: {
      magnetAdsorbed: {
        name: 'stroke',
        args: {
          attrs: {
            fill: '#fff',
            stroke: '#31d0c6',
            strokeWidth: 4,
          },
        },
      },
    },
    connecting: {
      snap: true,
      allowBlank: false,
      highlight: true,
      allowLoop: false,
      sourceAnchor: {
        name: 'left',
        args: {
          dx: Platform.IS_SAFARI ? 4 : 8,
        },
      },
      targetAnchor: {
        name: 'right',
        args: {
          dx: Platform.IS_SAFARI ? 4 : -8,
        },
      },
      createEdge() {
        return graph.createEdge({
          shape: 'data-processing-curve',
          attrs: {
            line: {
              strokeDasharray: '5 5',
            },
          },
          zIndex: -1,
        });
      },
      validateConnection({ sourceMagnet, targetMagnet }) {
        if (sourceMagnet?.getAttribute('port-group') === 'in') {
          return false;
        }
        return targetMagnet?.getAttribute('port-group') === 'in';
      },
    },
    background: {
      color: '#F2F7FA',
    },
  });
  using(graph);
  registering();
  if (link.metadata.data) {
    graph.fromJSON(link.metadata.data);
  }
  graph.centerContent();
  return graph;
};

/**
 * 注册自定义组件
 */
const registering = () => {
  edgeRegistering();
  Graph.registerConnector(
    'curveConnector',
    (sourcePoint, targetPoint) => {
      const gap = Math.abs(targetPoint.x - sourcePoint.x);
      const path = new Path();
      path.appendSegment(Path.createSegment('M', sourcePoint.x - 4, sourcePoint.y));
      path.appendSegment(Path.createSegment('L', sourcePoint.x + 12, sourcePoint.y));
      // 水平三阶贝塞尔曲线
      path.appendSegment(
        Path.createSegment(
          'C',
          sourcePoint.x < targetPoint.x
            ? sourcePoint.x + gap / 2
            : sourcePoint.x - gap / 2,
          sourcePoint.y,
          sourcePoint.x < targetPoint.x
            ? targetPoint.x - gap / 2
            : targetPoint.x + gap / 2,
          targetPoint.y,
          targetPoint.x - 6,
          targetPoint.y,
        ),
      );
      path.appendSegment(Path.createSegment('L', targetPoint.x + 2, targetPoint.y));
      return path.serialize();
    },
    true,
  );
  register({
    shape: 'data-processing-dag-node',
    width: 180,
    height: 48,
    component: ProcessingNode,
    ports: {
      groups: {
        in: inGroup,
        out: outGroup,
      },
    },
  });
  Graph.registerNode(
    'custom-node-width-port',
    {
      inherit: 'rect',
      width: 100,
      height: 40,
      attrs: {
        body: {
          stroke: '#8f8f8f',
          strokeWidth: 1,
          fill: '#fff',
          rx: 6,
          ry: 6,
        },
      },
      ports: {
        groups: {
          top: {
            position: 'top',
            attrs: {
              circle: {
                magnet: true,
                stroke: '#8f8f8f',
                r: 5,
              },
            },
            label: {
              position: 'top',
            },
          },
          bottom: {
            position: 'bottom',
            attrs: {
              circle: {
                magnet: true,
                stroke: '#8f8f8f',
                r: 5,
              },
            },
            label: {
              position: 'top',
            },
          },
        },
      },
    },
    true,
  );
};

/**
 * 使用插件
 * @param graph 画布
 */
const using = (graph: Graph) => {
  graph.use(
    new Selection({
      enabled: true,
      multiple: true,
      rubberband: true,
      movable: true,
      showNodeSelectionBox: true,
    }),
  );
};
