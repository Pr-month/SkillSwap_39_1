import { useRef, useState } from 'react';
import styles from './dragAndDrop.module.css';

type DragAndDropUploaderProps = {
  placeholder: string;
  label: string;
  multiple?: boolean;
  value?: File[];
  onChange?: (files: File[]) => void;
  error?: string;
  onBlur?: () => void;
  className?: string;
};

export const DragAndDrop: React.FC<DragAndDropUploaderProps> = ({
  placeholder,
  label,
  multiple = false,
  onChange,
  error,
  onBlur,
  className,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (onChange) onChange(files);
    if (onBlur) onBlur();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (onChange) onChange(files);
    if (onBlur) onBlur();
  };

  return (
    <div className={className}>
      <div
        className={`${styles.picsContainer} ${isDragging ? styles.dragging : ''}`}
        onDragOver={e => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <p className={styles.labelPlaceholder}>{placeholder}</p>
        <label htmlFor="pics" className={styles.picsLabel}>
          {label}
        </label>
      </div>

      <input
        id="pics"
        type="file"
        multiple={multiple}
        ref={inputRef}
        style={{ display: 'none' }}
        onChange={handleInputChange}
        onBlur={onBlur}
      />
      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
};
