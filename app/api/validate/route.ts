import { NextResponse } from "next/server";
import OpenAI from "openai";

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

// Simple syntax validators for different languages
function validateJavaScript(code: string): CodeError[] {
    const errors: CodeError[] = [];
    const lines = code.split('\n');
    
    lines.forEach((line, index) => {
        const lineNum = index + 1;
        const trimmed = line.trim();
        
        // Check for common JS errors
        if (trimmed.includes('console.log') && !trimmed.includes('(')) {
            errors.push({ line: lineNum, message: "console.log requires parentheses", severity: 'error' });
        }
        if (trimmed.includes('funtion ')) {
            errors.push({ line: lineNum, message: "Typo: 'funtion' should be 'function'", severity: 'error' });
        }
        if (trimmed.includes('retrun ')) {
            errors.push({ line: lineNum, message: "Typo: 'retrun' should be 'return'", severity: 'error' });
        }
        if (trimmed.includes('cosnt ')) {
            errors.push({ line: lineNum, message: "Typo: 'cosnt' should be 'const'", severity: 'error' });
        }
        if (trimmed.includes('lte ')) {
            errors.push({ line: lineNum, message: "Typo: 'lte' should be 'let'", severity: 'error' });
        }
        if (trimmed.includes('varible') || trimmed.includes('variabel')) {
            errors.push({ line: lineNum, message: "Typo in variable spelling", severity: 'warning' });
        }
        if (trimmed.match(/if\s*[^(]/)) {
            errors.push({ line: lineNum, message: "if statement requires parentheses around condition", severity: 'error' });
        }
        if (trimmed.includes('===') === false && trimmed.match(/[^!=<>]==[^=]/)) {
            errors.push({ line: lineNum, message: "Consider using === instead of == for strict equality", severity: 'warning' });
        }
        // Missing semicolons (basic check)
        if (trimmed && !trimmed.endsWith(';') && !trimmed.endsWith('{') && !trimmed.endsWith('}') && !trimmed.endsWith(',') && !trimmed.startsWith('//') && !trimmed.startsWith('/*') && !trimmed.startsWith('*') && trimmed.includes('=') && !trimmed.includes('function') && !trimmed.includes('=>')) {
            errors.push({ line: lineNum, message: "Missing semicolon at end of statement", severity: 'warning' });
        }
    });
    
    // Check for unmatched brackets
    const openBrackets = (code.match(/{/g) || []).length;
    const closeBrackets = (code.match(/}/g) || []).length;
    if (openBrackets !== closeBrackets) {
        errors.push({ line: 1, message: `Unmatched curly braces: ${openBrackets} opening, ${closeBrackets} closing`, severity: 'error' });
    }
    
    const openParens = (code.match(/\(/g) || []).length;
    const closeParens = (code.match(/\)/g) || []).length;
    if (openParens !== closeParens) {
        errors.push({ line: 1, message: `Unmatched parentheses: ${openParens} opening, ${closeParens} closing`, severity: 'error' });
    }
    
    return errors;
}

function validatePython(code: string): CodeError[] {
    const errors: CodeError[] = [];
    const lines = code.split('\n');
    
    lines.forEach((line, index) => {
        const lineNum = index + 1;
        const trimmed = line.trim();
        
        // Check for common Python errors
        if (trimmed.includes('pritn(') || trimmed.includes('prnit(')) {
            errors.push({ line: lineNum, message: "Typo: should be 'print('", severity: 'error' });
        }
        if (trimmed.includes('def ') && !trimmed.includes(':')) {
            errors.push({ line: lineNum, message: "Function definition missing colon ':'", severity: 'error' });
        }
        if (trimmed.includes('if ') && !trimmed.includes(':') && !trimmed.includes('else')) {
            errors.push({ line: lineNum, message: "if statement missing colon ':'", severity: 'error' });
        }
        if (trimmed.includes('elseif ')) {
            errors.push({ line: lineNum, message: "Python uses 'elif' not 'elseif'", severity: 'error' });
        }
        if (trimmed.includes('True') === false && trimmed.includes('true')) {
            errors.push({ line: lineNum, message: "Python uses 'True' not 'true' (capital T)", severity: 'error' });
        }
        if (trimmed.includes('False') === false && trimmed.includes('false')) {
            errors.push({ line: lineNum, message: "Python uses 'False' not 'false' (capital F)", severity: 'error' });
        }
        if (trimmed.includes('&&')) {
            errors.push({ line: lineNum, message: "Python uses 'and' not '&&'", severity: 'error' });
        }
        if (trimmed.includes('||')) {
            errors.push({ line: lineNum, message: "Python uses 'or' not '||'", severity: 'error' });
        }
        if (trimmed.endsWith(';')) {
            errors.push({ line: lineNum, message: "Python doesn't require semicolons", severity: 'warning' });
        }
    });
    
    return errors;
}

function validateJava(code: string): CodeError[] {
    const errors: CodeError[] = [];
    const lines = code.split('\n');
    
    lines.forEach((line, index) => {
        const lineNum = index + 1;
        const trimmed = line.trim();
        
        if (trimmed.includes('System.out.println') && !trimmed.endsWith(';')) {
            errors.push({ line: lineNum, message: "Missing semicolon after println statement", severity: 'error' });
        }
        if (trimmed.includes('public static void main') && !trimmed.includes('String[]')) {
            errors.push({ line: lineNum, message: "main method should have 'String[] args' parameter", severity: 'error' });
        }
        if (trimmed.includes('class ') && trimmed.includes('class ') && !trimmed.match(/class\s+[A-Z]/)) {
            errors.push({ line: lineNum, message: "Class names should start with uppercase letter", severity: 'warning' });
        }
    });
    
    return errors;
}

function validateCpp(code: string): CodeError[] {
    const errors: CodeError[] = [];
    const lines = code.split('\n');
    
    lines.forEach((line, index) => {
        const lineNum = index + 1;
        const trimmed = line.trim();
        
        if (trimmed.includes('cout') && !trimmed.includes('<<')) {
            errors.push({ line: lineNum, message: "cout requires << operator", severity: 'error' });
        }
        if (trimmed.includes('cin') && !trimmed.includes('>>')) {
            errors.push({ line: lineNum, message: "cin requires >> operator", severity: 'error' });
        }
        if (trimmed.includes('#include') && !trimmed.includes('<') && !trimmed.includes('"')) {
            errors.push({ line: lineNum, message: "include directive needs <> or quotes", severity: 'error' });
        }
        if (trimmed.includes('int main') && !code.includes('return')) {
            errors.push({ line: lineNum, message: "main function should return an integer", severity: 'warning' });
        }
    });
    
    return errors;
}

function getValidator(language: string): (code: string) => CodeError[] {
    switch (language) {
        case 'javascript': return validateJavaScript;
        case 'python': return validatePython;
        case 'java': return validateJava;
        case 'cpp': return validateCpp;
        default: return validateJavaScript;
    }
}

export async function POST(req: Request) {
    try {
        const { code, language } = await req.json();
        
        // Get basic syntax errors
        const validator = getValidator(language);
        const errors = validator(code);
        
        const errorCount = errors.filter(e => e.severity === 'error').length;
        const warningCount = errors.filter(e => e.severity === 'warning').length;
        const hasErrors = errorCount > 0;
        
        // If we have OpenAI API key, get better analysis
        if (process.env.OPENAI_API_KEY && code.trim().length > 10) {
            try {
                const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
                
                const completion = await openai.chat.completions.create({
                    messages: [
                        { 
                            role: "system", 
                            content: `You are a code reviewer. Analyze the following ${language} code for errors and provide a corrected version. 
                            Respond in JSON format: {"hasErrors": boolean, "errorCount": number, "errors": [{"line": number, "message": string, "severity": "error"|"warning"}], "correctedCode": "string", "explanation": "string"}`
                        },
                        { role: "user", content: code }
                    ],
                    model: "gpt-3.5-turbo",
                });
                
                const aiResponse = completion.choices[0].message.content;
                if (aiResponse) {
                    try {
                        const parsed = JSON.parse(aiResponse);
                        return NextResponse.json(parsed);
                    } catch {
                        // Fall through to basic response
                    }
                }
            } catch {
                // Fall through to basic response
            }
        }
        
        // Generate basic corrected code
        let correctedCode = code;
        if (language === 'javascript') {
            correctedCode = code
                .replace(/funtion /g, 'function ')
                .replace(/retrun /g, 'return ')
                .replace(/cosnt /g, 'const ')
                .replace(/lte /g, 'let ');
        } else if (language === 'python') {
            correctedCode = code
                .replace(/pritn\(/g, 'print(')
                .replace(/prnit\(/g, 'print(')
                .replace(/elseif /g, 'elif ')
                .replace(/&&/g, 'and')
                .replace(/\|\|/g, 'or');
        }
        
        const result: ValidationResult = {
            hasErrors,
            errorCount,
            warningCount,
            errors,
            correctedCode,
            explanation: hasErrors 
                ? `Found ${errorCount} error(s) and ${warningCount} warning(s) in your code.`
                : warningCount > 0 
                    ? `No critical errors, but found ${warningCount} warning(s).`
                    : "Your code looks good! No errors detected."
        };
        
        return NextResponse.json(result);
        
    } catch (error) {
        return NextResponse.json({ 
            hasErrors: true, 
            errorCount: 1, 
            warningCount: 0,
            errors: [{ line: 1, message: "Error analyzing code", severity: 'error' }],
            correctedCode: "",
            explanation: "Failed to analyze code."
        }, { status: 500 });
    }
}
