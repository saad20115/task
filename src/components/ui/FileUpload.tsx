'use client';

import React, { useCallback, useState } from 'react';
import { Upload, X, File, Image, Link2 } from 'lucide-react';
import { cn, formatFileSize } from '@/lib/utils';
import Button from './Button';
import Input from './Input';

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  onLinkAdded?: (url: string, name: string) => void;
  maxFiles?: number;
  accept?: string;
  selectedFiles?: File[];
  onRemoveFile?: (index: number) => void;
}

export default function FileUpload({
  onFilesSelected,
  onLinkAdded,
  maxFiles = 10,
  accept = 'image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar',
  selectedFiles = [],
  onRemoveFile,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkName, setLinkName] = useState('');

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const files = Array.from(e.dataTransfer.files).slice(0, maxFiles - selectedFiles.length);
      if (files.length > 0) onFilesSelected(files);
    },
    [maxFiles, selectedFiles.length, onFilesSelected]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, maxFiles - selectedFiles.length);
    if (files.length > 0) onFilesSelected(files);
    e.target.value = '';
  };

  const handleAddLink = () => {
    if (linkUrl && linkName && onLinkAdded) {
      onLinkAdded(linkUrl, linkName);
      setLinkUrl('');
      setLinkName('');
      setShowLinkInput(false);
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image size={16} className="text-emerald-500" />;
    return <File size={16} className="text-slate-400" />;
  };

  return (
    <div className="space-y-3">
      <div
        className={cn(
          'border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 cursor-pointer',
          isDragging
            ? 'border-brand-400 bg-brand-50'
            : 'border-slate-200 hover:border-brand-300 hover:bg-slate-50'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-upload-input')?.click()}
      >
        <input
          id="file-upload-input"
          type="file"
          className="hidden"
          multiple
          accept={accept}
          onChange={handleFileSelect}
        />
        <Upload size={28} className="mx-auto text-slate-400 mb-2" />
        <p className="text-sm font-medium text-slate-600">اسحب الملفات هنا أو اضغط للاختيار</p>
        <p className="text-xs text-slate-400 mt-1">صور، PDF، مستندات، ملفات مضغوطة</p>
      </div>

      {/* Link input */}
      <div className="flex gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => setShowLinkInput(!showLinkInput)}>
          <Link2 size={14} />
          إضافة رابط
        </Button>
      </div>

      {showLinkInput && (
        <div className="flex gap-2 items-end p-3 bg-slate-50 rounded-xl">
          <Input
            placeholder="اسم الرابط"
            value={linkName}
            onChange={(e) => setLinkName(e.target.value)}
            className="flex-1"
          />
          <Input
            placeholder="https://..."
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            className="flex-1"
            dir="ltr"
          />
          <Button type="button" size="sm" onClick={handleAddLink}>إضافة</Button>
        </div>
      )}

      {/* Selected files list */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          {selectedFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100"
            >
              {getFileIcon(file)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700 truncate">{file.name}</p>
                <p className="text-xs text-slate-400">{formatFileSize(file.size)}</p>
              </div>
              {onRemoveFile && (
                <button
                  type="button"
                  onClick={() => onRemoveFile(index)}
                  className="p-1 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <X size={14} className="text-slate-400" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
