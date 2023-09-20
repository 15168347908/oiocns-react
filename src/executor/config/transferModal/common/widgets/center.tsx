import { ITransfer } from '@/ts/core';
import React, { ReactNode, useEffect, useState } from 'react';
import { model } from '@/ts/base';
import { MappingModal, RequestModal, StoreModal, TransferModal } from '../..';

interface IProps {
  current: ITransfer;
}

const Editable: React.FC<IProps> = ({ current }) => {
  const [center, setCenter] = useState<ReactNode>();
  useEffect(() => {
    const id = current.command.subscribe(async (type, cmd, args) => {
      if (type != 'tools') return;
      switch (cmd) {
        case 'edit':
          switch (args.typeName) {
            case '请求':
              setCenter(
                <RequestModal
                  finished={() => setCenter(<></>)}
                  transfer={current}
                  current={args}
                />,
              );
              break;
            case '映射':
              setCenter(
                <MappingModal
                  finished={() => setCenter(<></>)}
                  transfer={current}
                  current={args}
                />,
              );
              break;
            case '存储':
              setCenter(
                <StoreModal
                  finished={() => setCenter(<></>)}
                  transfer={current}
                  current={args}
                />,
              );
              break;
            case '子图':
              const node = args as model.SubTransfer;
              const nextId = node.nextId;
              const nextTransfer = current.getTransfer(nextId);
              setCenter(
                <>
                  {nextTransfer && (
                    <TransferModal
                      current={nextTransfer}
                      finished={() => setCenter(<></>)}
                    />
                  )}
                </>,
              );
              break;
          }
          break;
      }
    });
    return () => {
      current.command.unsubscribe(id);
    };
  });
  return <>{center}</>;
};

export default Editable;
