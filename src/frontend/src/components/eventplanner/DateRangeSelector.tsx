import { Calendar } from "lucide-react";
import { useI18n } from "../../i18n/useI18n";

interface DateRangeSelectorProps {
  dateRange: { start: Date; end: Date } | null;
  onRangeChange: (range: { start: Date; end: Date }) => void;
  maxDays: number;
}

export function DateRangeSelector({
  dateRange,
  onRangeChange,
  maxDays,
}: DateRangeSelectorProps) {
  const { t, locale } = useI18n();

  const formatDate = (date: Date) => {
    const intlLocale = locale === "tr" ? "tr-TR" : "en-US";
    return new Intl.DateTimeFormat(intlLocale, {
      month: "short",
      day: "numeric",
    }).format(date);
  };

  const handleStartChange = (days: number) => {
    const start = new Date();
    start.setDate(start.getDate() + days);
    const end = new Date(start);
    end.setDate(end.getDate() + (maxDays - 1));
    onRangeChange({ start, end });
  };

  if (!dateRange) return null;

  const daysDiff = Math.floor(
    (dateRange.start.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
  );

  return (
    <div>
      <h3 className="text-base sm:text-lg font-semibold mb-3">
        {t("eventPlanner.dateRange")}
      </h3>
      <div className="glass-surface p-4 rounded-xl">
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium">
            {formatDate(dateRange.start)} - {formatDate(dateRange.end)}
          </span>
        </div>

        <div className="space-y-2">
          <p className="text-xs text-foreground/60">
            {t("eventPlanner.startFrom")}
          </p>
          <div className="flex gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => handleStartChange(0)}
              className={`px-3 py-2 rounded-lg text-sm transition-all ${
                daysDiff === 0
                  ? "bg-primary text-primary-foreground"
                  : "glass-surface hover:bg-foreground/5"
              }`}
            >
              {t("eventPlanner.today")}
            </button>
            <button
              type="button"
              onClick={() => handleStartChange(1)}
              className={`px-3 py-2 rounded-lg text-sm transition-all ${
                daysDiff === 1
                  ? "bg-primary text-primary-foreground"
                  : "glass-surface hover:bg-foreground/5"
              }`}
            >
              {t("eventPlanner.tomorrow")}
            </button>
            <button
              type="button"
              onClick={() => handleStartChange(7)}
              className={`px-3 py-2 rounded-lg text-sm transition-all ${
                daysDiff === 7
                  ? "bg-primary text-primary-foreground"
                  : "glass-surface hover:bg-foreground/5"
              }`}
            >
              {t("eventPlanner.nextWeek")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
