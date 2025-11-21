"use client"

import { Button } from "@/components/ui/button";

interface SourceFilterProps {
  selected: string[];
  onChange: (sources: string[]) => void;
  availableSources: { value: string; label: string }[];
}

export function SourceFilter({ selected, onChange, availableSources }: SourceFilterProps) {
  const toggleSource = (source: string) => {
    if (selected.includes(source)) {
      onChange(selected.filter(s => s !== source));
    } else {
      onChange([...selected, source]);
    }
  };

  const selectAll = () => {
    onChange(availableSources.map(s => s.value));
  };

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-muted-foreground">Source:</span>
      <Button
        variant={selected.length === availableSources.length ? "secondary" : "outline"}
        size="sm"
        onClick={selectAll}
      >
        All
      </Button>
      {availableSources.map((source) => (
        <Button
          key={source.value}
          variant={selected.includes(source.value) ? "secondary" : "outline"}
          size="sm"
          onClick={() => toggleSource(source.value)}
        >
          {source.label}
        </Button>
      ))}
    </div>
  );
}
