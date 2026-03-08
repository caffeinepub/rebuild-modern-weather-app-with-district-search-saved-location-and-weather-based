import { Heart, Music, TreePine, Trophy } from "lucide-react";
import { useI18n } from "../../i18n/useI18n";
import type { EventType } from "../../lib/eventPlannerCriteria";
import { Card } from "../ui/card";

interface EventTypeSelectorProps {
  selectedEventType: EventType | null;
  onEventTypeChange: (eventType: EventType) => void;
}

export function EventTypeSelector({
  selectedEventType,
  onEventTypeChange,
}: EventTypeSelectorProps) {
  const { t } = useI18n();

  const eventTypes: Array<{
    id: EventType;
    icon: typeof TreePine;
    color: string;
  }> = [
    { id: "picnic", icon: TreePine, color: "text-green-500" },
    { id: "wedding", icon: Heart, color: "text-pink-500" },
    { id: "concert", icon: Music, color: "text-purple-500" },
    { id: "sports", icon: Trophy, color: "text-amber-500" },
  ];

  return (
    <div>
      <h3 className="text-base sm:text-lg font-semibold mb-3">
        {t("eventPlanner.selectEventType")}
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {eventTypes.map((type) => {
          const Icon = type.icon;
          const isSelected = selectedEventType === type.id;
          return (
            <Card
              key={type.id}
              className={`glass-surface p-4 rounded-xl cursor-pointer transition-all hover:scale-105 ${
                isSelected
                  ? "ring-2 ring-primary shadow-glow"
                  : "hover:bg-foreground/5"
              }`}
              onClick={() => onEventTypeChange(type.id)}
            >
              <div className="flex flex-col items-center gap-2 text-center">
                <div
                  className={`w-12 h-12 rounded-full bg-foreground/10 flex items-center justify-center ${type.color}`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-sm font-medium">
                  {t(`eventPlanner.eventType.${type.id}`)}
                </span>
                <p className="text-xs text-foreground/60">
                  {t(`eventPlanner.eventType.${type.id}.desc`)}
                </p>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
