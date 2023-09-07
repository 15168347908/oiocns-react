import SchemaForm from '@/components/SchemaForm';
import { XMapping } from '@/ts/base/schema';
import orgCtrl from '@/ts/controller';
import { IDirectory } from '@/ts/core';
import { ConfigColl, IMapping } from '@/ts/core/thing/transfer/config';
import { ProFormColumnsType, ProFormInstance } from '@ant-design/pro-components';
import React, { useRef, useState } from 'react';
import {
  MenuItem,
  defaultGenLabel,
  expand,
  loadFormsMenu,
  loadSpeciesMenu,
} from '../transferModal';

interface IProps {
  formType: string;
  current: IDirectory | IMapping;
  finished: (mapping?: IMapping) => void;
}

const getRoot = (current: IDirectory | IMapping) => {
  if (current.typeName == '目录') {
    return (current as IDirectory).target.directory;
  } else {
    return (current as IMapping).directory.target.directory;
  }
};

const getType = (current: IDirectory | IMapping) => {
  if (current.typeName == '目录') {
    return undefined;
  } else {
    return (current as IMapping).metadata.type;
  }
};

const getMenus = (current: IDirectory | IMapping, type?: string): MenuItem[] => {
  if (current.metadata.typeName == '映射') {
    type = (current as IMapping).metadata.type;
  }
  if (type) {
    switch (type) {
      case 'fields':
        return [
          loadFormsMenu(getRoot(current), (entity) => {
            return defaultGenLabel(entity, ['实体配置', '事项配置']);
          }),
        ];
      case 'specieItems':
        return [
          loadSpeciesMenu(getRoot(current), (entity) => {
            return defaultGenLabel(entity, ['分类', '字典']);
          }),
        ];
      default:
        return [];
    }
  }
  return [];
};

const getExpandKeys = (treeData: MenuItem[], type?: string) => {
  if (type) {
    switch (type) {
      case 'fields':
        return expand(treeData, ['事项配置', '实体配置']);
      case 'specieItems':
        return expand(treeData, ['字典', '分类']);
    }
  }
  return [];
};

const MappingForm: React.FC<IProps> = ({ formType, current, finished }) => {
  let initialValue = {};
  switch (formType) {
    case 'updateMapping':
      initialValue = current.metadata;
      break;
  }
  const formRef = useRef<ProFormInstance>();
  const [treeData, setTreeData] = useState<MenuItem[]>(getMenus(current));
  const [type, setType] = useState<string | undefined>(getType(current));
  const selector = (title: string, dataIndex: string): ProFormColumnsType<XMapping> => {
    return {
      title: title,
      dataIndex: dataIndex,
      valueType: 'treeSelect',
      colProps: { span: 24 },
      formItemProps: {
        rules: [{ required: true, message: title + '为必填项' }],
      },
      fieldProps: {
        fieldNames: {
          label: 'node',
          value: 'key',
          children: 'children',
        },
        showSearch: true,
        loadData: async (node: MenuItem): Promise<void> => {
          if (!node.isLeaf) {
            const type = formRef.current?.getFieldValue('type');
            switch (type) {
              case 'fields':
                let forms = await (node.item as IDirectory).loadForms();
                if (forms.length > 0) {
                  setTreeData(getMenus(current, type));
                }
                break;
              case 'specieItems':
                let species = await (node.item as IDirectory).loadSpecieses();
                if (species.length > 0) {
                  setTreeData(getMenus(current, type));
                }
                break;
            }
          }
        },
        treeNodeFilterProp: 'label',
        treeDefaultExpandedKeys: getExpandKeys(treeData, type),
        treeData: treeData,
      },
    };
  };
  const columns: ProFormColumnsType<XMapping>[] = [
    {
      title: '名称',
      dataIndex: 'name',
      colProps: { span: 12 },
      formItemProps: {
        rules: [{ required: true, message: '名称为必填项' }],
      },
    },
    {
      title: '编码',
      dataIndex: 'code',
      colProps: { span: 12 },
      formItemProps: {
        rules: [{ required: true, message: '编码为必填项' }],
      },
    },
    {
      title: '映射类型',
      dataIndex: 'type',
      valueType: 'select',
      colProps: { span: 24 },
      formItemProps: {
        rules: [{ required: true, message: '名称为必填项' }],
      },
      fieldProps: {
        options: [
          { label: '字段映射', value: 'fields' },
          { label: '字典/分类映射', value: 'specieItems' },
        ],
      },
    },
  ];
  if (type) {
    switch (type) {
      case 'fields':
        columns.push(selector('源表单', 'source'), selector('目标表单', 'target'));
        break;
      case 'specieItems':
        columns.push(
          selector('源字典/分类', 'source'),
          selector('目标字典/分类', 'target'),
        );
        break;
    }
  }
  columns.push({
    title: '备注',
    dataIndex: 'remark',
    valueType: 'textarea',
    colProps: { span: 24 },
  });

  return (
    <SchemaForm<XMapping>
      ref={formRef}
      open
      title="映射配置"
      width={640}
      columns={columns}
      initialValues={initialValue}
      rowProps={{
        gutter: [24, 0],
      }}
      layoutType="ModalForm"
      onValuesChange={(values: any) => {
        if (values.type) {
          setType(values.type);
          setTreeData(getMenus(current, values.type));
        }
      }}
      onOpenChange={(open: boolean) => {
        if (!open) {
          finished();
        }
      }}
      onFinish={async (values) => {
        switch (formType) {
          case 'newMapping': {
            values.mappings = [];
            values.typeName = '映射';
            let mapping = await (current as IDirectory).createConfig(
              ConfigColl.Mappings,
              values,
            );
            finished(mapping as IMapping);
            orgCtrl.changCallback();
            break;
          }
          case 'updateMapping': {
            let mapping = current as IMapping;
            mapping.refresh({ ...initialValue, ...values });
            finished(mapping);
            break;
          }
        }
      }}
    />
  );
};

export default MappingForm;
