import { Upload, X, FileText } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

interface AttachmentUploaderProps {
  onFilesChange?: (files: File[]) => void;
  onValidationError?: (message: string) => void;
  maxFiles?: number;
  maxFileSizeMB?: number;
  accept?: string;
  disabled?: boolean;
}

function parseAcceptExtensions(accept?: string): Set<string> {
  if (!accept) return new Set();
  const tokens = accept
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);

  return new Set(tokens.filter((token) => token.startsWith(".")));
}

function parseAcceptMimeGroups(accept?: string): Set<string> {
  if (!accept) return new Set();
  const tokens = accept
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);

  return new Set(tokens.filter((token) => token.includes("/") && !token.startsWith(".")));
}

function fileKey(file: File): string {
  return `${file.name}|${file.size}|${file.lastModified}`;
}

const AttachmentUploader = ({
  onFilesChange,
  onValidationError,
  maxFiles = 5,
  maxFileSizeMB = 25,
  accept,
  disabled = false,
}: AttachmentUploaderProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [lastError, setLastError] = useState<string>("");

  const acceptedExtensions = useMemo(() => parseAcceptExtensions(accept), [accept]);
  const acceptedMimeGroups = useMemo(() => parseAcceptMimeGroups(accept), [accept]);
  const maxBytes = maxFileSizeMB * 1024 * 1024;

  const validateType = (file: File): boolean => {
    if (!accept) return true;

    const fileName = file.name.toLowerCase();
    const extension = fileName.includes(".") ? `.${fileName.split(".").pop()}` : "";
    if (acceptedExtensions.has(extension)) return true;

    const mimeType = file.type.toLowerCase();
    if (!mimeType) return acceptedExtensions.size === 0;

    if (acceptedMimeGroups.has(mimeType)) return true;

    for (const accepted of acceptedMimeGroups.values()) {
      if (accepted.endsWith("/*") && mimeType.startsWith(accepted.slice(0, -1))) {
        return true;
      }
    }

    return false;
  };

  const emitValidationError = (message: string) => {
    setLastError(message);
    onValidationError?.(message);
  };

  const handleAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || disabled) return;

    const candidateFiles = Array.from(e.target.files);
    const existingKeys = new Set(files.map(fileKey));
    const next = [...files];

    for (const candidate of candidateFiles) {
      if (next.length >= maxFiles) {
        emitValidationError(`Limite atingido: máximo de ${maxFiles} arquivos.`);
        break;
      }

      if (existingKeys.has(fileKey(candidate))) {
        emitValidationError(`Arquivo duplicado ignorado: ${candidate.name}`);
        continue;
      }

      if (candidate.size > maxBytes) {
        emitValidationError(`Arquivo acima do limite (${maxFileSizeMB}MB): ${candidate.name}`);
        continue;
      }

      if (!validateType(candidate)) {
        emitValidationError(`Tipo de arquivo não permitido: ${candidate.name}`);
        continue;
      }

      next.push(candidate);
      existingKeys.add(fileKey(candidate));
    }

    setFiles(next);
    onFilesChange?.(next);
    e.target.value = "";
  };

  const handleRemove = (idx: number) => {
    const newFiles = files.filter((_, i) => i !== idx);
    setFiles(newFiles);
    onFilesChange?.(newFiles);
  };

  return (
    <div className="space-y-3">
      <label
        className={`flex flex-col items-center gap-2 p-6 border-2 border-dashed border-border rounded-lg transition-colors ${
          disabled
            ? "cursor-not-allowed opacity-60"
            : "cursor-pointer hover:border-primary/50 hover:bg-muted/30"
        }`}
      >
        <Upload className="w-6 h-6 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Clique ou arraste arquivos aqui</span>
        <span className="text-xs text-muted-foreground">Máximo {maxFiles} arquivos • até {maxFileSizeMB}MB por arquivo</span>
        <input type="file" className="hidden" multiple onChange={handleAdd} accept={accept} disabled={disabled} />
      </label>

      {lastError && <p className="text-xs text-destructive">{lastError}</p>}

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((f, i) => (
            <div key={fileKey(f)} className="flex items-center gap-3 p-2 rounded-md bg-muted/50 text-sm">
              <FileText className="w-4 h-4 text-primary shrink-0" />
              <span className="flex-1 truncate text-foreground">{f.name}</span>
              <span className="text-xs text-muted-foreground">{(f.size / 1024).toFixed(0)} KB</span>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleRemove(i)} disabled={disabled}>
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
