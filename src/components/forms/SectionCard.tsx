import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

const SectionCard = ({ title, description, children, className }: SectionCardProps) => (
  <div className={cn("glass-card rounded-lg p-6 space-y-4", className)}>
    <div>
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      {description && <p className="text-sm text-muted-foreground mt-0.5">{description}</p>}
    </div>
    {children}
  </div>
);

export default SectionCard;
