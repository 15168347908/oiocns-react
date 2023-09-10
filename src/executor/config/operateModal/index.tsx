import React from 'react';
import { schema } from '@/ts/base';
import { IBelong, IDirectory, IEntity } from '@/ts/core';
import PullMember from './pullMember';
import JoinTarget from './joinTarget';
import SpeciesModal from './speciesModal';
import WorkModal from './workModal';
import orgCtrl from '@/ts/controller';
import LabelsModal from './labelsModal';
import ReportModal from './reportModal';
import LinkModal from '../transferModal/linkEditor';
import RequestModal from '../transferModal/apiEditor/layout/index';
import MapperModal from '../transferModal/mapper/parts/modal';

interface IProps {
  cmd: string;
  entity: IEntity<schema.XEntity>;
  finished: () => void;
}

const OperateModal: React.FC<IProps> = ({ cmd, entity, finished }) => {
  const reloadFinish = () => {
    finished();
    orgCtrl.changCallback();
  };
  switch (cmd) {
    case 'pull':
      return (
        <PullMember current={(entity as IDirectory).target} finished={reloadFinish} />
      );
    case 'open':
      switch (entity.typeName) {
        case '事项配置':
        case '实体配置':
          return <LabelsModal finished={finished} current={entity as any} />;
        case '办事':
          return <WorkModal finished={finished} current={entity as any} />;
        case '字典':
        case '分类':
          return <SpeciesModal finished={finished} current={entity as any} />;
        case '报表':
          return <ReportModal finished={finished} current={entity as any} />;
        case '链接':
          return <LinkModal finished={finished} current={entity as any} />;
        case '请求':
          return <RequestModal finished={finished} current={entity as any} />;
        case '映射':
          return <MapperModal finished={finished} link={entity as any}/>
        default:
          return <></>;
      }
    default:
      if (cmd.startsWith('join')) {
        return (
          <JoinTarget
            cmd={cmd}
            current={(entity as IDirectory).target as IBelong}
            finished={finished}
          />
        );
      }
      return <></>;
  }
};

export default OperateModal;
