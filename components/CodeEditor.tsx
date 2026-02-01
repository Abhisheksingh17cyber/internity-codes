"use client";

import Editor, { OnMount } from "@monaco-editor/react";
import { useRef } from "react";
import type { editor } from "monaco-editor";

interface CodeEditorProps {
    language: string;
    code: string;
    onChange: (value: string | undefined) => void;
}

export function CodeEditor({ language, code, onChange }: CodeEditorProps) {
    const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

    const handleEditorDidMount: OnMount = (editor) => {
        editorRef.current = editor;
    };

    return (
        <div className="h-full w-full bg-black border border-neutral-800 rounded-md overflow-hidden">
            <Editor
                height="100%"
                defaultLanguage="javascript"
                language={language}
                value={code}
                theme="vs-dark"
                onChange={onChange}
                onMount={handleEditorDidMount}
                options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    padding: { top: 16 },
                    scrollBeyondLastLine: false,
                    fontFamily: "JetBrains Mono, monospace"
                }}
            />
        </div>
    );
}
