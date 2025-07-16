"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DropdownFilterItemProps {
  label: string;
  value: string | undefined;
  options: Array<{ value: string | number; label: string }>;
  onChange: (value: string | undefined) => void;
  placeholder?: string;
}

const FilterItem = ({
  label,
  value,
  options,
  onChange,
  placeholder = "Seleccionar...",
}: DropdownFilterItemProps) => {
  return (
    <div className="flex items-center">
      <span className="text-content-muted flex-1 text-sm">{label}</span>
      <Select
        value={value}
        onValueChange={(newValue) => {
          onChange(newValue);
        }}
      >
        <SelectTrigger className="min-w-48 flex-1">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="max-h-96">
          {options.map((option) => (
            <SelectItem key={option.value} value={String(option.value)}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default FilterItem;
