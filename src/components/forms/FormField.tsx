import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface FormFieldProps {
  label: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
  hint?: string;
  error?: string;
  fieldId?: string;
}

const FormField = ({ label, required, children, className, hint, error, fieldId }: FormFieldProps) => (
  <div className={cn("space-y-1.5", className)}>
    <Label htmlFor={fieldId} className="text-sm font-medium text-foreground">
      {label}
      {required && <span className="text-destructive ml-0.5">*</span>}
    </Label>
    {children}
    {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    {error && <p className="text-xs text-destructive">{error}</p>}
  </div>
);

export default FormField;
