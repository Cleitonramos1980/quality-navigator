import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface Props {
  label?: string;
  className?: string;
}

const ExportActionsBar = ({ label = "Exportar Excel", className }: Props) => {
  const handleExport = () => {
    toast({ title: "Exportação iniciada", description: "O arquivo Excel será gerado em instantes." });
  };
  return (
    <Button variant="outline" size="sm" onClick={handleExport} className={className}>
      <Download className="h-4 w-4 mr-1" />
      {label}
    </Button>
  );
};

export default ExportActionsBar;
