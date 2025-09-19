import { useState, useRef } from 'react';
import { Upload, X, File, Image } from 'lucide-react';
import { Button } from './button';
import { cn } from '../../lib/utils';

interface FileUploadProps {
  onFilesChange: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in MB
  maxFiles?: number;
  className?: string;
}

interface FileWithPreview extends File {
  preview?: string;
}

export function FileUpload({
  onFilesChange,
  accept = '.pdf,.jpg,.jpeg,.png,.pptx,.docx',
  multiple = true,
  maxSize = 10,
  maxFiles = 5,
  className
}: FileUploadProps) {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (file.size > maxSize * 1024 * 1024) {
      return `File ${file.name} is too large. Maximum size is ${maxSize}MB.`;
    }
    
    const allowedTypes = accept.split(',').map(type => type.trim());
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!allowedTypes.includes(fileExtension)) {
      return `File ${file.name} has an unsupported format.`;
    }
    
    return null;
  };

  const processFiles = (fileList: FileList) => {
    const newFiles: FileWithPreview[] = [];
    const newErrors: string[] = [];

    Array.from(fileList).forEach(file => {
      const error = validateFile(file);
      if (error) {
        newErrors.push(error);
        return;
      }

      if (files.length + newFiles.length >= maxFiles) {
        newErrors.push(`Maximum ${maxFiles} files allowed.`);
        return;
      }

      const fileWithPreview = file as FileWithPreview;
      
      // Create preview for images
      if (file.type.startsWith('image/')) {
        fileWithPreview.preview = URL.createObjectURL(file);
      }
      
      newFiles.push(fileWithPreview);
    });

    setErrors(newErrors);
    
    if (newFiles.length > 0) {
      const updatedFiles = [...files, ...newFiles];
      setFiles(updatedFiles);
      onFilesChange(updatedFiles);
    }
  };

  const removeFile = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    onFilesChange(updatedFiles);
    
    // Revoke preview URL to prevent memory leaks
    if (files[index].preview) {
      URL.revokeObjectURL(files[index].preview!);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFiles(e.target.files);
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return Image;
    }
    return File;
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div
        className={cn(
          'relative border-2 border-dashed rounded-lg p-6 transition-colors',
          dragActive 
            ? 'border-indigo-500 bg-indigo-50' 
            : 'border-slate-300 hover:border-slate-400'
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="text-center">
          <Upload className="mx-auto h-12 w-12 text-slate-400" />
          <div className="mt-4">
            <p className="text-sm text-slate-600">
              <span className="font-medium text-indigo-600 hover:text-indigo-500">
                Click to upload
              </span>{' '}
              or drag and drop
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {accept.replace(/\./g, '').toUpperCase()} up to {maxSize}MB each
            </p>
          </div>
        </div>
      </div>

      {errors.length > 0 && (
        <div className="space-y-1">
          {errors.map((error, index) => (
            <p key={index} className="text-sm text-red-600">{error}</p>
          ))}
        </div>
      )}

      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-slate-700">Uploaded Files</h4>
          <div className="grid gap-2">
            {files.map((file, index) => {
              const FileIcon = getFileIcon(file);
              return (
                <div
                  key={index}
                  className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg"
                >
                  {file.preview ? (
                    <img
                      src={file.preview}
                      alt={file.name}
                      className="h-10 w-10 object-cover rounded"
                    />
                  ) : (
                    <FileIcon className="h-10 w-10 text-slate-400" />
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}