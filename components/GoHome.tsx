"use client";

import { useEffect, useRef } from "react";

interface GoHomeProps {
    trigger: boolean;
    onReset?: () => void;
}

export function GoHome({ trigger, onReset }: GoHomeProps) {
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (trigger) {
            // Clear any existing timer
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
            
            // Set timer to reset after 3 seconds
            timerRef.current = setTimeout(() => {
                if (onReset) onReset();
            }, 3000);
        }

        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, [trigger, onReset]);

    if (!trigger) return null;

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
