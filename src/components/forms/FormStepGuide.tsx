import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export interface FormStepItem {
  id: string;
  label: string;
  complete: boolean;
  anchorId: string;
}

interface FormStepGuideProps {
  title: string;
  steps: FormStepItem[];
  className?: string;
}

const FormStepGuide = ({ title, steps, className }: FormStepGuideProps) => {
  const completed = steps.filter((step) => step.complete).length;
  const progress = steps.length > 0 ? Math.round((completed / steps.length) * 100) : 0;
  const nextStep = steps.find((step) => !step.complete);

  const goTo = (anchorId: string) => {
    const el = document.getElementById(anchorId);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className={cn("glass-card rounded-lg p-4 space-y-3", className)}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground">
            {completed}/{steps.length} etapas concluídas
          </p>
        </div>
        {nextStep ? (
          <Button variant="outline" size="sm" onClick={() => goTo(nextStep.anchorId)}>
            Próxima etapa
          </Button>
        ) : (
          <span className="text-xs font-medium text-success">Formulário completo</span>
        )}
      </div>
      <Progress value={progress} className="h-2" />
      <div className="flex flex-wrap gap-2">
        {steps.map((step, index) => (
          <Button
            key={step.id}
            variant={step.complete ? "default" : "outline"}
            size="sm"
            className="h-7 text-xs"
            onClick={() => goTo(step.anchorId)}
          >
            {index + 1}. {step.label}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default FormStepGuide;
