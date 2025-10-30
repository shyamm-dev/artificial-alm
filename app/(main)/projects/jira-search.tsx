"use client"

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";

interface JiraSearchProps {
  onSearchChange: (query: string) => void;
}

export function JiraSearch({ onSearchChange }: JiraSearchProps) {
  const [search, setSearch] = useState("");

  const handleChange = (value: string) => {
    setSearch(value);
    onSearchChange(value);
  };

  return (
    <div className="relative flex-1 max-w-sm">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input 
        placeholder="Search projects..." 
        className="pl-9"
        value={search}
        onChange={(e) => handleChange(e.target.value)}
      />
    </div>
  );
}
