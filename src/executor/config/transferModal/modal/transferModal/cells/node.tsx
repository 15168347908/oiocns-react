import EntityIcon from '@/components/Common/GlobalComps/entityIcon';
import { model } from '@/ts/base';
import { XTarget } from '@/ts/base/schema';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
  PauseCircleOutlined,
  StopOutlined,
} from '@ant-design/icons';
import { Graph, Node } from '@antv/x6';
import React, { createRef, memo, useEffect, useState } from 'react';
import { MenuItemType } from 'typings/globelType';
import cls from './../index.module.less';
import { ITransfer } from '@/ts/core';
import { TransferStore } from './graph';
import { message } from 'antd';
import GraphEditor from './../widgets/graphEditor';

interface IProps {
  node: Node;
  graph: Graph;
}

const useNode = (node: Node, graph: Graph) => {
  const store = graph.getPlugin<TransferStore>('TransferStore');
  const transfer = store?.transfer;
  const [data, setData] = useState(transfer?.getNode(node.id) ?? node.getData());
  const initStatus = data.status ?? store?.initStatus ?? 'Editable';
  const [status, setStatus] = useState<model.NStatus>(initStatus);
  useEffect(() => {
    const id = transfer?.command.subscribe(async (type, cmd, args) => {
      switch (type) {
        case 'running': {
          const [node, error] = args;
          if (node.id == data.id) {
            switch (cmd) {
              case 'start':
              case 'completed':
                setStatus(node.status);
                break;
              case 'error':
                setStatus('Error');
                message.error(error.message);
                break;
            }
          }
          break;
        }
        case 'node': {
          switch (cmd) {
            case 'delete':
              if (args.id == node.id) {
                node.remove();
              }
              break;
            case 'update':
              if (args.id == node.id) {
                setData(args);
              }
              break;
          }
          break;
        }
      }
    });
    return () => {
      transfer?.command.unsubscribe(id!);
    };
  });
  return {
    data,
    setData,
    status,
    setStatus,
    store,
    transfer,
  };
};

export const GraphNode: React.FC<IProps> = memo(({ node, graph }) => {
  const { store, transfer, data } = useNode(node, graph);
  const nextTransfer = transfer?.getTransfer((data as model.SubTransfer).nextId);
  const status = store?.initStatus ?? 'Editable';
  const event = store?.initEvent ?? 'EditRun';
  return (
    <div
      className={`${cls.transferNode} ${cls['border']}`}
      onMouseEnter={() => transfer?.command.emitter('node', 'showRemove', node)}
      onMouseLeave={() => transfer?.command.emitter('node', 'closeRemove', node)}
      onDoubleClick={() => transfer?.command.emitter('tools', 'edit', data)}>
      {nextTransfer && (
        <GraphEditor
          current={nextTransfer}
          options={{ background: { color: '#F2F7FA' } }}
          initStatus={status}
          initEvent={event}
        />
      )}
      {status == 'Editable' && <Remove node={node} transfer={transfer} />}
      {status == 'Editable' && <ContextMenu node={node} transfer={transfer} />}
    </div>
  );
});

export const ProcessingNode: React.FC<IProps> = ({ node, graph }) => {
  const { data, store, transfer, status } = useNode(node, graph);
  const initStatus = store?.initStatus;
  const editStatus = ['Editable', 'Completed', 'Error'];
  return (
    <div
      className={`${cls['flex-row']} ${cls['container']} ${cls['border']}`}
      onMouseEnter={() => transfer?.command.emitter('node', 'showRemove', node)}
      onMouseLeave={() => transfer?.command.emitter('node', 'closeRemove', node)}
      onDoubleClick={() => transfer?.command.emitter('tools', 'edit', data)}>
      <Tag typeName={data.typeName} transfer={transfer} />
      <Status status={status} />
      <Info name={data.name} />
      {initStatus == 'Editable' && editStatus.indexOf(status) != -1 && (
        <Remove node={node} transfer={transfer} />
      )}
      {initStatus == 'Editable' && editStatus.indexOf(status) != -1 && (
        <ContextMenu node={node} transfer={transfer} />
      )}
    </div>
  );
};

interface RemoveProps {
  node: Node;
  transfer?: ITransfer;
}

const Remove: React.FC<RemoveProps> = ({ node, transfer }) => {
  const style = { color: '#9498df', fontSize: 12 };
  const [show, setShow] = useState<boolean>(false);
  useEffect(() => {
    const id = transfer?.command.subscribe((type, cmd, args) => {
      if (type == 'node') {
        switch (cmd) {
          case 'showRemove':
            if (args.id == node.id) {
              setShow(true);
            }
            break;
          case 'closeRemove':
            if (args.id == node.id) {
              setShow(false);
            }
            break;
        }
      }
    });
    return () => {
      return transfer?.command.unsubscribe(id!);
    };
  });
  return (
    <>
      {show && (
        <CloseCircleOutlined
          style={style}
          className={cls.remove}
          onClick={() => node.remove()}
        />
      )}
    </>
  );
};

export interface StatusProps {
  status: model.NStatus;
}

export const Status: React.FC<StatusProps> = ({ status }) => {
  switch (status) {
    case 'Editable':
      return <PauseCircleOutlined style={{ color: '#9498df', fontSize: 18 }} />;
    case 'Viewable':
      return <PauseCircleOutlined style={{ color: '#9498df', fontSize: 18 }} />;
    case 'Running':
      return <LoadingOutlined style={{ color: '#9498df', fontSize: 18 }} />;
    case 'Completed':
      return <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 18 }} />;
    case 'Error':
      return <StopOutlined style={{ color: '#ff4d4f', fontSize: 18 }} />;
  }
};

interface TagProps {
  typeName: string;
  transfer?: ITransfer;
}

const Tag: React.FC<TagProps> = ({ typeName, transfer }) => {
  const belongId = transfer?.metadata.belongId ?? '';
  return (
    <div className={cls['tag']}>
      <div className={`${cls['tag-item']} ${cls['text-overflow']}`}>{typeName}</div>
      <div className={`${cls['tag-item']} ${cls['text-overflow']}`}>
        {transfer?.findMetadata<XTarget>(belongId)?.name ?? '归属'}
      </div>
    </div>
  );
};

interface ContextProps {
  transfer?: ITransfer;
  node: Node;
}

const ContextMenu: React.FC<ContextProps> = ({ transfer, node }) => {
  const menus: { [key: string]: MenuItemType } = {
    open: {
      key: 'edit',
      label: '打开',
      itemType: '打开',
      children: [],
    },
    update: {
      key: 'update',
      label: '更新',
      itemType: '更新',
      children: [],
    },
    copy: {
      key: 'copy',
      label: '复制',
      itemType: '复制',
      children: [],
    },
    delete: {
      key: 'delete',
      label: '删除',
      itemType: '删除',
      children: [],
    },
  };
  const div = createRef<HTMLDivElement>();
  const [menu, setMenu] = useState<boolean>();
  const [pos, setPos] = useState<{ x: number; y: number }>();
  useEffect(() => {
    div.current?.focus();
    const id = transfer?.command.subscribe((type, cmd, args) => {
      if (type == 'node' && cmd == 'contextmenu') {
        if (args.node.id == node.id) {
          const position = node.getPosition();
          setMenu(true);
          setPos({ x: args.x - position.x, y: args.y - position.y });
        }
      }
    });
    return () => {
      transfer?.command.unsubscribe(id!);
    };
  });
  return (
    <>
      {menu && (
        <div
          ref={div}
          style={{ left: pos?.x, top: pos?.y }}
          onContextMenu={(e) => e.stopPropagation()}
          className={`${cls['context-menu']} ${cls['context-border']}`}
          tabIndex={0}
          onBlur={() => setMenu(false)}>
          <ul className={`${cls['dropdown']}`}>
            {Object.keys(menus)
              .map((key) => menus[key])
              .map((item) => {
                return (
                  <li
                    key={item.key}
                    className={`${cls['item']}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      transfer?.command.emitter('tools', item.key, node);
                    }}>
                    {item.label}
                  </li>
                );
              })}
          </ul>
        </div>
      )}
    </>
  );
};

interface InfoProps {
  name: string;
}

// 节点信息
const Info: React.FC<InfoProps> = ({ name }) => {
  return (
    <div className={`${cls['flex-row']} ${cls['info']} ${cls['border']}`}>
      <EntityIcon entityId={name} />
      <div style={{ marginLeft: 10 }}>{name}</div>
    </div>
  );
};
