"use client";

import { useState } from "react";
import { Chrome } from "@uiw/react-color";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  label?: string;
}

export const ColorPicker = ({ color, onChange, label }: ColorPickerProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex items-center gap-2">
      {label && <span className="text-sm font-medium">{label}</span>}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <div
            className="w-8 h-8 rounded border-2 border-gray-300 cursor-pointer hover:border-gray-400 transition-colors"
            style={{ backgroundColor: color }}
            onClick={() => setIsOpen(!isOpen)}
          />
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Chrome
            color={color}
            onChange={(colorResult) => {
              onChange(colorResult.hex);
            }}
            showAlpha={false}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};