import { Upload, X, FileText } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface AttachmentUploaderProps {
  onFilesChange?: (files: File[]) => void;
  maxFiles?: number;
  accept?: string;
}

const AttachmentUploader = ({ onFilesChange, maxFiles = 5, accept }: AttachmentUploaderProps) => {
  const [files, setFiles] = useState<File[]>([]);

  const handleAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newFiles = [...files, ...Array.from(e.target.files)].slice(0, maxFiles);
    setFiles(newFiles);
    onFilesChange?.(newFiles);
    e.target.value = "";
  };

  const handleRemove = (idx: number) => {
    const newFiles = files.filter((_, i) => i !== idx);
    setFiles(newFiles);
    onFilesChange?.(newFiles);
  };

  return (
    <div className="space-y-3">
      <label className="flex flex-col items-center gap-2 p-6 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors">
        <Upload className="w-6 h-6 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Clique ou arraste arquivos aqui</span>
        <span className="text-xs text-muted-foreground">Máximo {maxFiles} arquivos</span>
        <input type="file" className="hidden" multiple onChange={handleAdd} accept={accept} />
      </label>
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((f, i) => (
            <div key={i} className="flex items-center gap-3 p-2 rounded-md bg-muted/50 text-sm">
              <FileText className="w-4 h-4 text-primary shrink-0" />
              <span className="flex-1 truncate text-foreground">{f.name}</span>
              <span className="text-xs text-muted-foreground">{(f.size / 1024).toFixed(0)} KB</span>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleRemove(i)}>
                <X className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AttachmentUploader;
