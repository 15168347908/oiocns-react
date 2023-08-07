import OioForm from '@/components/Common/FormDesign/OioFormNext';
import { kernel, model, schema } from '../../../ts/base';
import { IBelong } from '@/ts/core';
import { useEffect, useState } from 'react';
import React from 'react';
import { Tabs, Button } from 'antd';
import FormRender, { useForm } from 'form-render';
interface IProps {
  allowEdit: boolean;
  belong: IBelong;
  forms: schema.XForm[];
  data: model.InstanceDataModel;
  useformRule?: boolean;
  getFormData: (id: string) => model.FormEditData;
  onChanged?: (id: string, data: model.FormEditData, changedData?: Object) => void;
}

// const PrimaryForm: React.FC<IProps> = (props) => {
//   if (props.forms.length < 1) return <></>;
//   const form = props.forms[0];
//   if (!props.data.fields[form.id]) return <></>;
//   const fields = props.data.fields[form.id];
//   const formData = props.getFormData(form.id);
//   const [data, setData] = useState(
//     formData.after.length > 0 ? formData.after[0] : undefined,
//   );
//   useEffect(() => {
//     if (!data) {
//       kernel.anystore.createThing(props.belong.userId, '').then((res) => {
//         if (res.success && res.data) {
//           setData(res.data);
//         }
//       });
//     }
//   }, []);
//   if (!data) return <></>;
//   return (
//     <OioForm
//       key={form.id}
//       form={form}
//       fields={fields}
//       fieldsValue={data}
//       belong={props.belong}
//       disabled={!props.allowEdit}
//       submitter={{
//         resetButtonProps: {
//           style: { display: 'none' },
//         },
//         render: (_: any, _dom: any) => <></>,
//       }}
//       onValuesChange={(_val, vals) => {
//         if (props.allowEdit) {
//           Object.keys(vals).forEach((k) => {
//             data[k] = vals[k];
//             props.data.primary[k] = vals[k];
//           });
//           formData.after = [data];
//           props.onChanged?.apply(this, [form.id, formData, _val]);
//           setData({ ...data });
//         }
//       }}
//     />
//   );
// };
const FormRenders: React.FC<IProps> = (props) => {
  const formIns: any = useForm();
  if (props.forms.length < 1) return <></>;
  const form = props.forms[0];

  if (!props.data.fields[form.id]) return <></>;
  const fields = props.data.fields[form.id];
  const formData = props.getFormData(form.id);
  const [data, setData] = useState(
    formData.after.length > 0 ? formData.after[0] : undefined,
  );
  useEffect(() => {
    if (!data) {
      kernel.anystore.createThing(props.belong.userId, '').then((res) => {
        if (res.success && res.data) {
          setData(res.data);
        }
      });
    }
    //初始化数据
    formIns.setValues(data);
  }, []);
  if (!data) return <></>;
  const onFinish = (formData: any, errors: any) => {
    console.log('formData:', formData, 'errors', errors);
    Object.keys(formData).forEach((k) => {
      data[k] = formData[k];
      props.data.primary[k] = formData[k];
    });
    formData.after = [data];
    props.onChanged?.apply(this, [form.id, formData]);
    setData({ ...data });
  };
  const watch = {
    // # 为全局
    '#': (val: any) => {
      console.log('表单的实时数据为：', val);
      Object.keys(val).forEach((k) => {
        data[k] = val[k];
        props.data.primary[k] = val[k];
      });
      val.after = [data];
      props.onChanged?.apply(this, [form.id, val]);
      setData({ ...data });
    },
  };
  return (
    props.forms.map((formResult) => {
      const rule = formResult.rule && JSON.parse(formResult.rule);
      if (!rule?.schema) { return <></> }
      return <div>
        <FormRender form={formIns} schema={rule.schema} disabled={!props.allowEdit} watch={watch} />
        {
          props.allowEdit && <Button type="primary" onClick={formIns.submit}>
            提交
          </Button>
        }

      </div>
    })
  );
};




export default FormRenders;
