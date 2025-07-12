"use client";

import { Fragment } from "react";
import { SelectOption } from "../form/select";
import { SelectFilter } from "./select-filter";

export interface FilterConfig {
    placeholder: string;
    value: string;
    onChange: (v: string) => void;
    options: SelectOption[];
    width?: string;
}

interface ToolbarFiltersProps {
    filters: FilterConfig[];
}

export function ToolbarFilters({ filters }: ToolbarFiltersProps) {
    return (
        <Fragment>
            {filters.map((f, i) => (
                <SelectFilter key={i} {...f} />
            ))}
        </Fragment>
    );
}
