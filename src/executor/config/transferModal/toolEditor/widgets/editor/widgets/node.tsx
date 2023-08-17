import { IRequest } from '@/ts/core/thing/request';
import { Graph, Node } from '@antv/x6';
import { Dropdown } from 'antd';
import React from 'react';
import { IconBaseProps } from 'react-icons';
import { AiOutlineCheck, AiOutlineLoading } from 'react-icons/ai';
import cls from './../index.module.less';

export enum ExecStatus {
  Stop = 'stop',
  Running = 'running',
}

export enum NodeType {
  Request = 'request',
  Script = 'script',
}

const config: IconBaseProps = { size: 12, color: '#9498df' };
const statusMap: { [key: string]: React.ReactNode } = {
  [ExecStatus.Stop]: <AiOutlineCheck {...config} />,
  [ExecStatus.Running]: <AiOutlineLoading {...config} />,
};

interface NodeData {
  nodeType: NodeType;
  request: IRequest;
  status: ExecStatus;
}

interface NodeOptions {
  graph: Graph;
  position: { x: number; y: number };
}

export const addNode = (props: NodeOptions & NodeData) => {
  const { graph, nodeType, position, request } = props;
  switch (nodeType) {
    case NodeType.Request:
      graph.addNode({
        shape: 'data-processing-dag-node',
        position: position,
        data: {
          nodeType: nodeType,
          request: request,
          status: ExecStatus.Stop,
        },
      });
    default:
      break;
  }
};

interface Info {
  node: Node;
  graph: Graph;
}

export const ProcessingNode: React.FC<Info> = ({ node }) => {
  const { request, nodeType, status } = node.getData() as NodeData;
  const Next: React.FC<any> = () => {
    switch (nodeType) {
      case NodeType.Request:
        let items = Object.keys(NodeType).map((key) => {
          return {
            key: key,
            label: key,
          };
        });
        return (
          <Dropdown
            menu={{
              items: items,
              onClick: () => {},
            }}
          />
        );
      default:
        return <></>;
    }
  };
  return (
    <div className={`${cls['container']} ${cls['flex-row']}`}>
      <div>{request.name}</div>
      {statusMap[status]}
    </div>
  );
};
