import { XMapping } from '@/ts/base/schema';
import { IBelong, IDirectory, IFileInfo } from '@/ts/core';
import { IMapping } from '@/ts/core/thing/config';
import { ProTable } from '@ant-design/pro-components';
import { Button, Modal } from 'antd';
import React, { useState } from 'react';
import Mapper from './mapper';

interface IProps {
  current: IDirectory;
}

const MappingTable: React.FC<IProps> = ({ current }) => {
  const [data, setData] = useState<readonly IMapping[]>(
    current.configs
      .filter((item) => item.typeName == '配置')
      .map((item) => item as IMapping),
  );
  return (
    <ProTable<IFileInfo<XMapping>>
      dataSource={data}
      search={false}
      cardProps={{ bodyStyle: { padding: 0 } }}
      scroll={{ y: 300 }}
      columns={[
        {
          title: '序号',
          valueType: 'index',
          width: 50,
        },
        {
          title: '原表单',
          dataIndex: 'sourceName',
        },
        {
          title: '目标表单',
          dataIndex: 'targetName',
        },
        {
          title: '映射字段',
          render: (_, entity) => {
            entity;
            return <span>已映射 {entity.metadata.mappings?.length ?? 0} 个字段</span>;
          },
        },
      ]}
      toolBarRender={() => {
        return [
          <Button
            onClick={() => {
              Modal.confirm({
                icon: <></>,
                width: 800,
                content: <Mapper status="edit" belong={current.target as IBelong} />,
              });
            }}>
            新增
          </Button>,
        ];
      }}
    />
  );
};

export default MappingTable;
