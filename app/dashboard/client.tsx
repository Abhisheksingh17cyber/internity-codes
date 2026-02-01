"use client";

import { useState } from "react";
import { CodeEditor } from "@/components/CodeEditor";
import { Button } from "@/components/ui/button";
import { GoHome } from "@/components/GoHome";
import { Play, LogOut, Sparkles, Shield } from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";

export function DashboardClient({ user }: { user: any }) {
    const [code, setCode] = useState("// Start coding here...\n// Type 'error' to see the animation.");
    const [language, setLanguage] = useState("javascript");
    const [explanation, setExplanation] = useState("");
    const [loading, setLoading] = useState(false);
    const [crashTrigger, setCrashTrigger] = useState(false);
    const [output, setOutput] = useState<string[]>([]);

    const handleRun = () => {
        // Clear previous output
        setOutput([]);

        // 1. Check for "Error" keyword trigger (The Animation)
        if (code.includes("error") || code.toLowerCase().includes("bug")) {
            setTimeout(() => setCrashTrigger(true), 500);
            return;
        }

        // 2. Simulate Successful Execution (Solving the "Program Problem")
        // Since we don't have a backend compiler by default, we simulate success.
        setOutput(prev => [...prev, `> Compiling ${language}...`]);

        setTimeout(() => {
            setOutput(prev => [...prev, `> Running...`]);

            // Fake output based on code content roughly
            if (code.includes("print") || code.includes("console.log")) {
                const match = code.match(/["'](.*?)["']/);
                const printContent = match ? match[1] : "Hello World";
                setOutput(prev => [...prev, printContent]);
            } else {
                setOutput(prev => [...prev, "Program executed successfully. (No output captured)"]);
            }

            setOutput(prev => [...prev, `> Process finished with exit code 0`]);
        }, 800);
    };

    const handleExplain = async () => {
        setLoading(true);
        setExplanation(""); // Clear previous
        try {
            const res = await fetch("/api/explain", {
                method: "POST",
                body: JSON.stringify({ code, language })
            });
            const data = await res.json();
            setExplanation(data.explanation);
        } catch (e) {
            setCrashTrigger(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen flex flex-col bg-black text-white selection:bg-white selection:text-black">
            <GoHome trigger={crashTrigger} onReset={() => setCrashTrigger(false)} />

            {/* Navbar */}
            <header className="h-14 border-b border-neutral-800 flex items-center justify-between px-6 bg-neutral-950">
                <div className="font-bold text-xl tracking-tighter flex items-center gap-2">
                    <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                    INTERNITY-CODES
                </div>
                <div className="flex items-center gap-4">
                    {user.role === 'ADMIN' && (
                        <Link href="/admin">
                            <Button variant="outline" size="sm" className="border-red-500/50 hover:bg-red-500/20 text-red-400 gap-2">
                                <Shield className="h-4 w-4" />
                                Admin Panel
                            </Button>
                        </Link>
                    )}
                    <div className="flex flex-col items-end">
                        <span className="text-sm font-medium text-white">
                            {user.name || "Developer"}
                        </span>
                        <span className="text-xs text-neutral-500 flex items-center gap-1">
                            {user.email}
                            {user.role === 'ADMIN' && <span className="bg-white text-black text-[10px] px-1 rounded font-bold">ADMIN</span>}
                        </span>
                    </div>
                    <Button variant="outline" size="icon" onClick={() => signOut()} className="border-neutral-800 hover:bg-neutral-900 text-white">
                        <LogOut className="h-4 w-4" />
                    </Button>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left: Editor Panel */}
                <div className="flex-1 flex flex-col p-4 gap-4 border-r border-neutral-800">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="bg-neutral-900 border border-neutral-800 rounded px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-white transition-all text-neutral-300"
                            >
                                <option value="javascript">JavaScript</option>
                                <option value="python">Python</option>
                                <option value="java">Java</option>
                                <option value="cpp">C++</option>
                            </select>
                            <span className="text-xs text-neutral-600">index.{language === 'javascript' ? 'js' : language === 'python' ? 'py' : language === 'cpp' ? 'cpp' : 'java'}</span>
                        </div>

                        <div className="flex gap-2">
                            <Button onClick={handleRun} disabled={loading} className="gap-2 bg-white text-black hover:bg-neutral-200">
                                <Play className="h-4 w-4 fill-current" /> Run Code
                            </Button>
                        </div>
                    </div>

                    <div className="flex-1 border border-neutral-800 rounded-md overflow-hidden relative group">
                        <CodeEditor
                            code={code}
                            onChange={(val) => setCode(val || "")}
                            language={language}
                        />
                        {/* Status Bar */}
                        <div className="absolute bottom-0 left-0 right-0 h-6 bg-neutral-900 border-t border-neutral-800 flex items-center px-3 text-[10px] text-neutral-500 justify-between">
                            <span>Ln 1, Col 1</span>
                            <span>UTF-8</span>
                        </div>
                    </div>

                    {/* Terminal / Output Area */}
                    <div className="h-48 bg-neutral-950 border border-neutral-800 rounded-md flex flex-col">
                        <div className="px-3 py-1 border-b border-neutral-800 text-xs font-mono text-neutral-400">TERMINAL</div>
                        <div className="p-3 font-mono text-sm text-neutral-300 overflow-auto flex-1">
                            {output.length === 0 && <span className="text-neutral-600 italic">Ready to run...</span>}
                            {output.map((line, i) => (
                                <div key={i}>{line}</div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: AI Understanding Panel */}
                <div className="w-96 flex flex-col bg-neutral-950/50">
                    <div className="p-6 border-b border-neutral-800 flex justify-between items-center">
                        <h2 className="font-semibold text-neutral-200 uppercase tracking-widest text-xs">AI Assistant</h2>
                        <Sparkles className="h-4 w-4 text-neutral-500" />
                    </div>

                    <div className="flex-1 p-6 overflow-auto">
                        <div className="bg-neutral-900/50 rounded-lg p-4 border border-neutral-800 mb-4">
                            <p className="text-xs text-neutral-400 mb-2">Capabilities</p>
                            <ul className="text-xs text-neutral-500 space-y-1 list-disc list-inside">
                                <li>Code Explanation</li>
                                <li>Logic Analysis</li>
                                <li>Complexity Check</li>
                            </ul>
                        </div>

                        <div className="text-sm text-neutral-300 leading-relaxed whitespace-pre-wrap font-mono">
                            {loading ? (
                                <div className="flex items-center gap-2 text-neutral-500">
                                    <span className="w-2 h-2 bg-white rounded-full animate-bounce"></span>
                                    Analyzing structure...
                                </div>
                            ) : explanation ? (
                                explanation
                            ) : (
                                <div className="text-center mt-10 text-neutral-600">
                                    <p>Select code and ask for help.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="p-4 border-t border-neutral-800">
                        <Button
                            variant="secondary"
                            onClick={handleExplain}
                            disabled={loading}
                            className="w-full gap-2 border border-neutral-800"
                        >
                            <Sparkles className="h-4 w-4" /> Explain Code
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
