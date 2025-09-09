import React from 'react';

type UploadButtonProps = {
  accept?: string;
  disabled?: boolean;
  className?: string;
  label?: string;
  onFile: (file: File) => Promise<void> | void;
};

const UploadButton: React.FC<UploadButtonProps> = ({ accept, disabled, className, label = 'Selecionar arquivo', onFile }) => {
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [fileName, setFileName] = React.useState<string>('');
  const [isBusy, setIsBusy] = React.useState<boolean>(false);

  const handleClick = () => {
    if (disabled || isBusy) return;
    inputRef.current?.click();
  };

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.currentTarget.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setIsBusy(true);
    try {
      await onFile(file);
    } finally {
      setIsBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className={className}>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleClick}
          disabled={disabled || isBusy}
          className="inline-flex items-center gap-2 rounded bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isBusy ? 'Enviando...' : label}
        </button>
        {fileName && (
          <span className="max-w-[260px] truncate text-sm text-gray-700" title={fileName}>{fileName}</span>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
};

export default UploadButton;


