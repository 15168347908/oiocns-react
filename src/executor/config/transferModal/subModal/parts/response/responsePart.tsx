import React, { useState } from 'react';
import MonacoEditor from '../monacor';
import { AxiosResponse } from 'axios';

interface IProps {
  resp?: AxiosResponse;
}

const ResponsePart: React.FC<IProps> = (props: IProps) => {
  const [resp] = useState<AxiosResponse | undefined>(props.resp);
  return (
    <MonacoEditor
      height={1200}
      style={{ margin: 10 }}
      options={{ value: resp?.data, readOnly: true }}
    />
  );
};

export default ResponsePart;
