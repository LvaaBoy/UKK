"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
    defaultValue?: string;
    value?: string;
    onValueChange?: (value: string) => void;
}

const TabsContext = React.createContext<{
    value?: string;
    onValueChange?: (value: string) => void;
}>({});

export const Tabs = ({ className, defaultValue, value, onValueChange, children, ...props }: TabsProps) => {
    const [activeTab, setActiveTab] = React.useState(value || defaultValue);

    const handleTabChange = (val: string) => {
        if (onValueChange) onValueChange(val);
        else setActiveTab(val);
    };

    return (
        <TabsContext.Provider value={{ value: value || activeTab, onValueChange: handleTabChange }}>
            <div className={cn("w-full", className)} {...props}>
                {children}
            </div>
        </TabsContext.Provider>
    );
};

export const TabsList = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
    return (
        <div
            className={cn(
                "inline-flex h-12 items-center justify-center rounded-3xl bg-slate-100 p-1 text-slate-500",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
};

export const TabsTrigger = ({
    className,
    value,
    children,
    ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string }) => {
    const { value: activeTab, onValueChange } = React.useContext(TabsContext);
    const isActive = activeTab === value;

    return (
        <button
            className={cn(
                "inline-flex items-center justify-center whitespace-nowrap rounded-2xl px-6 py-2 text-xs font-black transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
                isActive
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-400 hover:text-blue-500",
                className
            )}
            onClick={() => onValueChange?.(value)}
            {...props}
        >
            {children}
        </button>
    );
};

export const TabsContent = ({
    className,
    value,
    children,
    ...props
}: React.HTMLAttributes<HTMLDivElement> & { value: string }) => {
    const { value: activeTab } = React.useContext(TabsContext);
    if (activeTab !== value) return null;

    return (
        <div
            className={cn(
                "mt-6 focus-visible:outline-none",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
};
