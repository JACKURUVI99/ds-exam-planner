import { useState } from "react";
import { ChevronDown, BookOpen } from "lucide-react";
import { TopicItem } from "./TopicItem";
import { cn } from "@/lib/utils";

interface Topic {
  id: string;
  text: string;
}

interface TopicSectionProps {
  title: string;
  emoji: string;
  topics: Topic[];
  checkedTopics: Set<string>;
  onToggleTopic: (id: string) => void;
}

export const TopicSection = ({
  title,
  emoji,
  topics,
  checkedTopics,
  onToggleTopic,
}: TopicSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  
  const completedCount = topics.filter((t) => checkedTopics.has(t.id)).length;
  const progress = (completedCount / topics.length) * 100;

  return (
    <div className="bg-gradient-card rounded-xl border border-border/50 overflow-hidden backdrop-blur-sm transition-all duration-300 hover:border-border">
      <div
        className="flex items-center justify-between p-5 cursor-pointer group"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{emoji}</span>
          <div>
            <h2 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
              {title}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {completedCount} / {topics.length} completed
              </span>
            </div>
          </div>
        </div>
        <ChevronDown
          className={cn(
            "h-5 w-5 text-muted-foreground transition-transform duration-300",
            isExpanded && "rotate-180"
          )}
        />
      </div>

      {/* Progress Bar */}
      <div className="px-5 pb-3">
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-primary transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Topics List */}
      {isExpanded && (
        <div className="px-5 pb-5 space-y-1 animate-in fade-in-50 duration-300">
          {topics.map((topic) => (
            <TopicItem
              key={topic.id}
              id={topic.id}
              text={topic.text}
              checked={checkedTopics.has(topic.id)}
              onToggle={onToggleTopic}
            />
          ))}
        </div>
      )}
    </div>
  );
};
