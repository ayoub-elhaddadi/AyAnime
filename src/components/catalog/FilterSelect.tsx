"use client";

import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterSelectProps {
    label: string;
    value: string;
    options: { label: string; value: string }[];
    onChange: (value: string) => void;
    className?: string;
}

export function FilterSelect({ label, value, options, onChange, className }: FilterSelectProps) {
    return (
        <div className={cn("space-y-2", className)}>
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">
                {label}
            </label>
            <div className="relative group">
                <select
                    className="w-full h-11 pl-4 pr-10 rounded-xl bg-zinc-950 border border-white/5 text-sm text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all appearance-none cursor-pointer hover:bg-zinc-900"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                >
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none transition-transform group-hover:translate-y-[-40%]">
                    <ChevronDown size={14} />
                </div>
            </div>
        </div>
    );
}
