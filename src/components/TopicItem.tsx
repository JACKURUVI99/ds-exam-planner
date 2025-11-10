import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface TopicItemProps {
  id: string;
  text: string;
  checked: boolean;
  onToggle: (id: string) => void;
}

export const TopicItem = ({ id, text, checked, onToggle }: TopicItemProps) => {
  return (
    <div
      className="group flex items-start gap-3 py-2 px-1 rounded-lg hover:bg-muted/30 transition-all duration-200 cursor-pointer"
      onClick={() => onToggle(id)}
    >
      <div
        className={cn(
          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-all duration-300",
          checked
            ? "border-primary bg-primary scale-110"
            : "border-muted-foreground/40 group-hover:border-primary/60"
        )}
      >
        {checked && (
          <Check className="h-3.5 w-3.5 text-primary-foreground animate-in zoom-in-50 duration-200" />
        )}
      </div>
      <span
        className={cn(
          "flex-1 text-sm leading-relaxed transition-all duration-300",
          checked
            ? "text-muted-foreground line-through opacity-60"
            : "text-foreground"
        )}
      >
        {text}
      </span>
    </div>
  );
};
