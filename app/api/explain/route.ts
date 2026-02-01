import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: Request) {
    try {
        const { code, language } = await req.json();

        if (!process.env.OPENAI_API_KEY) {
            // Mock Response
            return NextResponse.json({
                explanation: `[MOCK MODE: No API Key]\n\nThis ${language} code appears to be analyzing data. \n1. It defines a main function.\n2. It processes input.\n3. It outputs a result.\n\nTo see real AI analysis, add OPENAI_API_KEY to your .env file.`
            });
        }

        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

        const completion = await openai.chat.completions.create({
            messages: [
                { role: "system", content: "You are a senior developer. Explain this code simply and concisely." },
                { role: "user", content: `Explain this ${language} code:\n\n${code}` }
            ],
            model: "gpt-3.5-turbo",
        });

        return NextResponse.json({
            explanation: completion.choices[0].message.content
        });

    } catch {
        return NextResponse.json({ explanation: "Error analyzing code." }, { status: 500 });
    }
}
