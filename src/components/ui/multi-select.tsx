import * as React from "react"
import { X, Check, ChevronsUpDown, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"

export interface Option {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  searchable?: boolean;
  creatable?: boolean;
  isGrid?: boolean;
  maxCount?: number;
}

export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = "Select...",
  searchable = false,
  creatable = false,
  isGrid = false,
  maxCount = 2,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState("")

  const toggleOption = (optValue: string) => {
    if (value.includes(optValue)) {
      onChange(value.filter((v) => v !== optValue))
    } else {
      onChange([...value, optValue])
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && creatable && inputValue.trim() !== "") {
      e.preventDefault();
      const val = inputValue.trim();
      if (!value.includes(val)) {
        onChange([...value, val]);
      }
      setInputValue("");
    }
  }

  // Find labels for selected values
  const selectedItems = value.map(val => {
    const opt = options.find(o => o.value === val);
    return opt ? opt : { value: val, label: val };
  });

  const filteredOptions = options.filter(opt => 
    opt.label.toLowerCase().includes(inputValue.toLowerCase())
  );

  const visibleItems = selectedItems.slice(0, maxCount);
  const hiddenCount = selectedItems.length - maxCount;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex min-h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 h-auto py-1.5"
          )}
        >
          <div className="flex items-center gap-1 flex-1 text-left overflow-hidden">
            {selectedItems.length === 0 && (
              <span className="text-muted-foreground truncate">{placeholder}</span>
            )}
            {visibleItems.map((item) => (
              <Badge 
                key={item.value}
                variant="secondary"
                className="rounded-sm px-1.5 font-normal flex items-center gap-1 shrink-0 max-w-[120px]"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleOption(item.value);
                }}
              >
                <span className="truncate">{item.label}</span>
                <X className="h-3 w-3 hover:text-foreground text-muted-foreground shrink-0" />
              </Badge>
            ))}
            {hiddenCount > 0 && (
              <Badge variant="secondary" className="rounded-sm px-1.5 font-normal shrink-0">
                +{hiddenCount}
              </Badge>
            )}
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50 ml-2" />
        </button>
      </PopoverTrigger>
      <PopoverContent 
        className={cn("p-0", isGrid ? "w-[95vw] sm:w-auto min-w-[250px] max-w-[95vw] sm:max-w-[600px] md:max-w-[700px]" : "w-[--radix-popover-trigger-width] min-w-[200px]")} 
        align="start"
      >
        {searchable && (
          <div className="flex items-center border-b px-3 text-muted-foreground focus-within:text-foreground">
            <Search className="h-4 w-4 mr-2" />
            <Input 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="border-0 focus-visible:ring-0 shadow-none px-0 h-11 bg-transparent"
              placeholder={creatable ? "Type to add a tag, press Enter..." : "Search..."}
            />
          </div>
        )}
        <div className={cn(
          "overflow-y-auto p-3",
          isGrid ? "max-h-[350px] grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-2" : "max-h-[200px] flex flex-col p-1"
        )}>
          {filteredOptions.length === 0 && !creatable && (
            <div className={cn("py-6 text-center text-sm text-muted-foreground", isGrid ? "col-span-full" : "")}>
              No results found.
            </div>
          )}
          {filteredOptions.map((opt) => {
            const isSelected = value.includes(opt.value);
            return isGrid ? (
              <div
                key={opt.value}
                className="flex cursor-pointer select-none items-center gap-3 rounded-md px-2 py-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                onClick={() => toggleOption(opt.value)}
              >
                <div className={cn(
                  "flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border",
                  isSelected ? "bg-primary border-primary text-primary-foreground" : "border-primary/50 opacity-50"
                )}>
                  {isSelected && <Check className="h-3 w-3" />}
                </div>
                <span className={cn("truncate", isSelected ? "font-medium text-foreground" : "text-muted-foreground")}>{opt.label}</span>
              </div>
            ) : (
              <div
                key={opt.value}
                className={cn(
                  "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                  isSelected ? "bg-accent text-accent-foreground" : ""
                )}
                onClick={() => toggleOption(opt.value)}
              >
                <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                  {isSelected && <Check className="h-4 w-4" />}
                </span>
                {opt.label}
              </div>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
