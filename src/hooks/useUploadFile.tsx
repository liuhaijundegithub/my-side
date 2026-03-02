import { UploadFile } from '@/common/components';
import { useState, useCallback } from 'react';
import { UploadFileProps } from '@/common/components/uploadFile/UploadFile';

const useUploadFile = (props: UploadFileProps) => {
  const [list, setList] = useState<UniFileItem[]>([]);

  const onFileChange = (files: UniFileItem[]) => {
    setList(files);
  };

  const Component = () => {
    return <UploadFile
      { ...props }
      list={list}
      onFileChange={onFileChange}
    />;
  };

  return {
    list,
    UploadFile: useCallback(Component, [list])
  };
};

export default useUploadFile;