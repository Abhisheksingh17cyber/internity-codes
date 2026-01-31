"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface GoHomeProps {
    trigger: boolean;
    onReset?: () => void;
}

export function GoHome({ trigger, onReset }: GoHomeProps) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (trigger) {
            setVisible(true);
            const timer = setTimeout(() => {
                if (onReset) onReset();
                setVisible(false);
            }, 3000); // Show for 3 seconds then hide
            return () => clearTimeout(timer);
        }
    }, [trigger, onReset]);

    if (!visible) return null;

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black animate-in fade-in duration-300">
            <h1 className="text-6xl md:text-9xl font-black text-white tracking-tighter text-center animate-bounce">
                GO HOME
            </h1>
            <p className="mt-8 text-xl text-neutral-400 font-mono tracking-widest uppercase">
                Not your type of work
            </p>
        </div>
    );
}
