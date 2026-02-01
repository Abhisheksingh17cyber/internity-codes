"use client";

import { useState } from "react";
import { CodeEditor } from "@/components/CodeEditor";
import { Button } from "@/components/ui/button";
import { GoHome } from "@/components/GoHome";
import { Play, LogOut, Sparkles, Shield, X, AlertTriangle, CheckCircle, ChevronRight } from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";

interface CodeError {
    line: number;
    message: string;
    severity: 'error' | 'warning';
}

interface ValidationResult {
    hasErrors: boolean;
    errorCount: number;
    warningCount: number;
    errors: CodeError[];
    correctedCode: string;
    explanation: string;
}

export function DashboardClient({ user }: { user: { name?: string | null; email?: string | null; role?: string } }) {
    const [code, setCode] = useState("// Start coding here...\n// Write your code and click 'Run Code' to check for errors");
    const [language, setLanguage] = useState("javascript");
    const [explanation, setExplanation] = useState("");
    const [loading, setLoading] = useState(false);
    const [crashTrigger, setCrashTrigger] = useState(false);
    const [output, setOutput] = useState<string[]>([]);
    
    // Error handling states
    const [showErrorMessage, setShowErrorMessage] = useState(false);
    const [showErrorDetails, setShowErrorDetails] = useState(false);
    const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
    const [validating, setValidating] = useState(false);
    
    // Mobile menu state
    const [showMobileAI, setShowMobileAI] = useState(false);

    const handleRun = async () => {
        setOutput([]);
        setShowErrorMessage(false);
        setShowErrorDetails(false);
        setValidationResult(null);
        setValidating(true);
        
        setOutput(prev => [...prev, `> Analyzing ${language} code...`]);
        
        try {
            const res = await fetch("/api/validate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code, language })
            });
            
            const result: ValidationResult = await res.json();
            setValidationResult(result);
            
            if (result.hasErrors) {
                // Show the funny error message first
                setShowErrorMessage(true);
                setOutput(prev => [...prev, `> ❌ Found ${result.errorCount} error(s) and ${result.warningCount} warning(s)`]);
            } else if (result.warningCount > 0) {
                setOutput(prev => [...prev, `> ⚠️ Found ${result.warningCount} warning(s)`]);
                setShowErrorDetails(true);
            } else {
                // Success!
                setOutput(prev => [...prev, `> ✅ Code compiled successfully!`]);
                setOutput(prev => [...prev, `> Running...`]);
                
                setTimeout(() => {
                    if (code.includes("print") || code.includes("console.log") || code.includes("cout") || code.includes("System.out")) {
                        const match = code.match(/["'](.*?)["']/);
                        const printContent = match ? match[1] : "Hello World";
                        setOutput(prev => [...prev, printContent]);
                    } else {
                        setOutput(prev => [...prev, "Program executed successfully. (No output captured)"]);
                    }
                    setOutput(prev => [...prev, `> Process finished with exit code 0`]);
                }, 500);
            }
        } catch {
            setCrashTrigger(true);
        } finally {
            setValidating(false);
        }
    };

    const handleDismissError = () => {
        setShowErrorMessage(false);
        setShowErrorDetails(true);
    };

    const handleExplain = async () => {
        setLoading(true);
        setExplanation("");
        try {
            const res = await fetch("/api/explain", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code, language })
            });
            const data = await res.json();
            setExplanation(data.explanation);
        } catch {
            setCrashTrigger(true);
        } finally {
            setLoading(false);
        }
    };

    const applyCorrectedCode = () => {
        if (validationResult?.correctedCode) {
            setCode(validationResult.correctedCode);
            setShowErrorDetails(false);
            setValidationResult(null);
            setOutput(prev => [...prev, `> Applied corrected code`]);
        }
    };

    return (
        <div className="h-screen flex flex-col bg-black text-white selection:bg-white selection:text-black overflow-hidden">
            <GoHome trigger={crashTrigger} onReset={() => setCrashTrigger(false)} />

            {/* Funny Error Message Overlay */}
            {showErrorMessage && (
                <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-gradient-to-br from-red-950 to-neutral-900 border-2 border-red-500/50 rounded-2xl p-6 md:p-10 max-w-lg w-full text-center relative shadow-2xl shadow-red-500/20 animate-shake animate-pulse-glow">
                        <button 
                            onClick={handleDismissError}
                            className="absolute top-4 right-4 text-neutral-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
                        >
                            <X className="w-6 h-6" />
                        </button>
                        
                        <div className="text-6xl md:text-8xl mb-6 animate-bounce">😭</div>
                        
                        <h2 className="text-2xl md:text-4xl font-black text-red-400 mb-4 tracking-tight uppercase">
                            GO HOME
                        </h2>
                        <p className="text-xl md:text-2xl font-bold text-white mb-6">
                            CODING IS NOT FOR YOU
                        </p>
                        
                        <div className="bg-black/50 rounded-xl p-4 mb-6 border border-red-500/30">
                            <p className="text-red-400 font-mono text-sm md:text-base">
                                💀 Found {validationResult?.errorCount || 0} error(s) in your code 💀
                            </p>
                        </div>
                        
                        <p className="text-neutral-500 text-xs mb-4">
                            (jk, everyone makes mistakes, let&apos;s fix them! 💪)
                        </p>
                        
                        <Button 
                            onClick={handleDismissError}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-3 rounded-full text-sm md:text-base"
                        >
                            Show me my mistakes 😤
                            <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                </div>
            )}

            {/* Error Details Overlay */}
            {showErrorDetails && validationResult && (
                <div className="fixed inset-0 bg-black/80 z-40 flex items-center justify-center p-4 overflow-auto">
                    <div className="bg-neutral-900 border border-neutral-700 rounded-2xl p-4 md:p-6 max-w-2xl w-full max-h-[90vh] overflow-auto relative">
                        <button 
                            onClick={() => setShowErrorDetails(false)}
                            className="absolute top-4 right-4 text-neutral-400 hover:text-white transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                        
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-red-400" />
                            Code Analysis Results
                        </h2>
                        
                        {/* Summary */}
                        <div className="grid grid-cols-2 gap-3 mb-6">
                            <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 text-center">
                                <div className="text-3xl font-bold text-red-400">{validationResult.errorCount}</div>
                                <div className="text-xs text-red-300">Errors</div>
                            </div>
                            <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-4 text-center">
                                <div className="text-3xl font-bold text-yellow-400">{validationResult.warningCount}</div>
                                <div className="text-xs text-yellow-300">Warnings</div>
                            </div>
                        </div>
                        
                        {/* Error List */}
                        <div className="mb-6">
                            <h3 className="text-sm font-semibold text-neutral-400 mb-3 uppercase tracking-wider">Issues Found</h3>
                            <div className="space-y-2 max-h-40 overflow-auto">
                                {validationResult.errors.map((error, i) => (
                                    <div 
                                        key={i} 
                                        className={`p-3 rounded-lg text-sm font-mono flex items-start gap-2 ${
                                            error.severity === 'error' 
                                                ? 'bg-red-500/10 border border-red-500/30 text-red-300' 
                                                : 'bg-yellow-500/10 border border-yellow-500/30 text-yellow-300'
                                        }`}
                                    >
                                        <span className="shrink-0">Line {error.line}:</span>
                                        <span className="text-neutral-300">{error.message}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        {/* Corrected Code */}
                        {validationResult.correctedCode && validationResult.correctedCode !== code && (
                            <div className="mb-6">
                                <h3 className="text-sm font-semibold text-neutral-400 mb-3 uppercase tracking-wider flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-400" />
                                    Suggested Fix
                                </h3>
                                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                                    <pre className="text-sm font-mono text-green-300 overflow-auto max-h-40 whitespace-pre-wrap">
                                        {validationResult.correctedCode}
                                    </pre>
                                </div>
                                <Button 
                                    onClick={applyCorrectedCode}
                                    className="mt-3 w-full bg-green-600 hover:bg-green-700"
                                >
                                    Apply Corrected Code
                                </Button>
                            </div>
                        )}
                        
                        <Button 
                            onClick={() => setShowErrorDetails(false)}
                            variant="outline"
                            className="w-full border-neutral-700"
                        >
                            Close
                        </Button>
                    </div>
                </div>
            )}

            {/* Navbar - Mobile Responsive */}
            <header className="h-14 md:h-14 border-b border-neutral-800 flex items-center justify-between px-3 md:px-6 bg-neutral-950 shrink-0">
                <div className="font-bold text-lg md:text-xl tracking-tighter flex items-center gap-2">
                    <div className="w-2 h-2 md:w-3 md:h-3 bg-white rounded-full animate-pulse"></div>
                    <span className="hidden sm:inline">INTERNITY-CODES</span>
                    <span className="sm:hidden">IC</span>
                </div>
                <div className="flex items-center gap-2 md:gap-4">
                    {user.role === 'ADMIN' && (
                        <Link href="/admin" className="hidden md:block">
                            <Button variant="outline" size="sm" className="border-red-500/50 hover:bg-red-500/20 text-red-400 gap-2">
                                <Shield className="h-4 w-4" />
                                <span className="hidden lg:inline">Admin Panel</span>
                            </Button>
                        </Link>
                    )}
                    <div className="hidden md:flex flex-col items-end">
                        <span className="text-sm font-medium text-white">
                            {user.name || "Developer"}
                        </span>
                        <span className="text-xs text-neutral-500 flex items-center gap-1">
                            <span className="max-w-32 truncate">{user.email}</span>
                            {user.role === 'ADMIN' && <span className="bg-white text-black text-[10px] px-1 rounded font-bold">ADMIN</span>}
                        </span>
                    </div>
                    
                    {/* Mobile: AI Panel Toggle */}
                    <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => setShowMobileAI(!showMobileAI)} 
                        className="md:hidden border-neutral-800 hover:bg-neutral-900 text-white"
                    >
                        <Sparkles className="h-4 w-4" />
                    </Button>
                    
                    <Button variant="outline" size="icon" onClick={() => signOut()} className="border-neutral-800 hover:bg-neutral-900 text-white">
                        <LogOut className="h-4 w-4" />
                    </Button>
                </div>
            </header>

            {/* Main Content - Mobile Responsive */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
                {/* Editor Panel */}
                <div className="flex-1 flex flex-col p-2 md:p-4 gap-2 md:gap-4 md:border-r border-neutral-800 overflow-hidden">
                    {/* Controls */}
                    <div className="flex flex-wrap justify-between items-center gap-2">
                        <div className="flex items-center gap-2 md:gap-3">
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="bg-neutral-900 border border-neutral-800 rounded px-2 md:px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-white transition-all text-neutral-300"
                            >
                                <option value="javascript">JavaScript</option>
                                <option value="python">Python</option>
                                <option value="java">Java</option>
                                <option value="cpp">C++</option>
                            </select>
                            <span className="text-xs text-neutral-600 hidden sm:inline">
                                index.{language === 'javascript' ? 'js' : language === 'python' ? 'py' : language === 'cpp' ? 'cpp' : 'java'}
                            </span>
                        </div>

                        <Button 
                            onClick={handleRun} 
                            disabled={validating} 
                            className="gap-2 bg-white text-black hover:bg-neutral-200 text-sm px-3 md:px-4"
                        >
                            <Play className="h-4 w-4 fill-current" /> 
                            <span className="hidden sm:inline">Run Code</span>
                            <span className="sm:hidden">Run</span>
                        </Button>
                    </div>

                    {/* Code Editor */}
                    <div className="flex-1 border border-neutral-800 rounded-md overflow-hidden relative min-h-[200px]">
                        <CodeEditor
                            code={code}
                            onChange={(val) => setCode(val || "")}
                            language={language}
                        />
                        <div className="absolute bottom-0 left-0 right-0 h-6 bg-neutral-900 border-t border-neutral-800 flex items-center px-3 text-[10px] text-neutral-500 justify-between">
                            <span>Ln 1, Col 1</span>
                            <span>UTF-8</span>
                        </div>
                    </div>

                    {/* Terminal */}
                    <div className="h-32 md:h-48 bg-neutral-950 border border-neutral-800 rounded-md flex flex-col shrink-0">
                        <div className="px-3 py-1 border-b border-neutral-800 text-xs font-mono text-neutral-400 flex items-center justify-between">
                            <span>TERMINAL</span>
                            {validating && <span className="text-yellow-400 animate-pulse">Analyzing...</span>}
                        </div>
                        <div className="p-2 md:p-3 font-mono text-xs md:text-sm text-neutral-300 overflow-auto flex-1">
                            {output.length === 0 && <span className="text-neutral-600 italic">Ready to run...</span>}
                            {output.map((line, i) => (
                                <div key={i} className={`${line.includes('❌') ? 'text-red-400' : line.includes('✅') ? 'text-green-400' : line.includes('⚠️') ? 'text-yellow-400' : ''}`}>
                                    {line}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* AI Panel - Desktop */}
                <div className="hidden md:flex w-80 lg:w-96 flex-col bg-neutral-950/50">
                    <div className="p-4 lg:p-6 border-b border-neutral-800 flex justify-between items-center">
                        <h2 className="font-semibold text-neutral-200 uppercase tracking-widest text-xs">AI Assistant</h2>
                        <Sparkles className="h-4 w-4 text-neutral-500" />
                    </div>

                    <div className="flex-1 p-4 lg:p-6 overflow-auto">
                        <div className="bg-neutral-900/50 rounded-lg p-3 lg:p-4 border border-neutral-800 mb-4">
                            <p className="text-xs text-neutral-400 mb-2">Capabilities</p>
                            <ul className="text-xs text-neutral-500 space-y-1 list-disc list-inside">
                                <li>Code Explanation</li>
                                <li>Error Detection</li>
                                <li>Auto Correction</li>
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
                                    <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    <p>Click &quot;Explain Code&quot; to get AI analysis</p>
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

                {/* AI Panel - Mobile Slide-in */}
                {showMobileAI && (
                    <div className="absolute inset-0 bg-black/90 z-30 md:hidden animate-in slide-in-from-right">
                        <div className="h-full flex flex-col bg-neutral-950">
                            <div className="p-4 border-b border-neutral-800 flex justify-between items-center">
                                <h2 className="font-semibold text-neutral-200 uppercase tracking-widest text-xs">AI Assistant</h2>
                                <button onClick={() => setShowMobileAI(false)}>
                                    <X className="h-5 w-5 text-neutral-400" />
                                </button>
                            </div>

                            <div className="flex-1 p-4 overflow-auto">
                                <div className="bg-neutral-900/50 rounded-lg p-3 border border-neutral-800 mb-4">
                                    <p className="text-xs text-neutral-400 mb-2">Capabilities</p>
                                    <ul className="text-xs text-neutral-500 space-y-1 list-disc list-inside">
                                        <li>Code Explanation</li>
                                        <li>Error Detection</li>
                                        <li>Auto Correction</li>
                                    </ul>
                                </div>

                                <div className="text-sm text-neutral-300 leading-relaxed whitespace-pre-wrap font-mono">
                                    {loading ? (
                                        <div className="flex items-center gap-2 text-neutral-500">
                                            <span className="w-2 h-2 bg-white rounded-full animate-bounce"></span>
                                            Analyzing...
                                        </div>
                                    ) : explanation ? (
                                        explanation
                                    ) : (
                                        <div className="text-center mt-10 text-neutral-600">
                                            <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                            <p>Click below to get AI analysis</p>
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
                )}
            </div>
        </div>
    );
}
