"use client";

import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { SelectOption } from "../form/select";



interface SelectFilterProps {
    value: string;
    onChange: (v: string) => void;
    placeholder: string;
    options: SelectOption[];
    width?: string;          // mặc định 180px
}

export function SelectFilter({
    value,
    onChange,
    placeholder,
    options,
    width = "180px",
}: SelectFilterProps) {
    return (
        <Select value={value} onValueChange={onChange}>
            <SelectTrigger className={`w-[${width}]`}>
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
                {options.map((opt) => (
                    <SelectItem key={opt.value} value={String(opt.value)}>
                        {opt.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
