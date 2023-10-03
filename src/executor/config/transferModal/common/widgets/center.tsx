import { ITransfer } from '@/ts/core';
import React, { ReactNode, useEffect, useState } from 'react';
import { model } from '@/ts/base';
import {
  MappingModal,
  RequestModal,
  StoreModal,
  TransferModal,
  InputModal,
  SelectionModal,
} from '../..';
import OfficeView from '@/executor/data/open/office';
import { message } from 'antd';
import LabelsModal from '@/executor/config/operateModal/labelsModal';
import { ShareIdSet } from '@/ts/core/public/entity';

interface IProps {
  current: ITransfer;
}

const Center: React.FC<IProps> = ({ current }) => {
  const [center, setCenter] = useState<ReactNode>();
  const setEmpty = () => setCenter(<></>);
  useEffect(() => {
    const id = current.command.subscribe(async (type, cmd, args) => {
      switch (type) {
        case 'tools':
          switch (cmd) {
            case 'edit':
              switch (args.typeName) {
                case '请求':
                  setCenter(
                    <RequestModal
                      finished={setEmpty}
                      transfer={current}
                      current={args}
                    />,
                  );
                  break;
                case '映射':
                  setCenter(
                    <MappingModal
                      finished={setEmpty}
                      transfer={current}
                      current={args}
                    />,
                  );
                  break;
                case '存储':
                  setCenter(
                    <StoreModal finished={setEmpty} transfer={current} current={args} />,
                  );
                  break;
                case '子图':
                  const subTransfer = args as model.SubTransfer;
                  const nextId = subTransfer.nextId;
                  const nextTransfer = current.getTransfer(nextId);
                  setCenter(
                    <>
                      {nextTransfer && (
                        <TransferModal current={nextTransfer} finished={setEmpty} />
                      )}
                    </>,
                  );
                  break;
                case '表格':
                  const tables = args as model.Tables;
                  if (tables.file) {
                    setCenter(
                      <OfficeView
                        share={tables.file}
                        finished={setEmpty}
                        current={current.directory}
                      />,
                    );
                  } else {
                    message.error('未上传文件');
                  }
                  break;
                case '表单':
                  const formNode = args as model.Form;
                  const form = ShareIdSet.get(formNode.formId + '*');
                  if (form) {
                    setCenter(<LabelsModal current={form} finished={setEmpty} />);
                  } else {
                    message.error('未绑定表单');
                  }
                  break;
              }
              break;
            case 'open':
              break;
          }
        case 'data':
          switch (cmd) {
            case 'input': {
              const { form, formNode } = args;
              setCenter(
                <InputModal
                  current={form}
                  finished={(value) =>
                    current.command.emitter('data', 'inputCall', { value, formNode })
                  }
                />,
              );
              break;
            }
            case 'selection': {
              const { form, data, selectionNode } = args;
              setCenter(
                <SelectionModal
                  form={form}
                  data={data}
                  node={selectionNode}
                  finished={(value) =>
                    current.command.emitter('data', 'selectionCall', {
                      value,
                      selectionNode,
                    })
                  }
                />,
              );
              break;
            }
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

export default Center;
