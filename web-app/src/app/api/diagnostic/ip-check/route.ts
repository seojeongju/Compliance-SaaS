import { OpenAI } from "openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
import { NextResponse } from "next/server";

export const runtime = "edge";

// --- Schema Definitions ---

const IpCheckResultSchema = z.object({
    analysis_summary: z.string().describe("Executive summary of the IP risk analysis"),
    trademark_risk_score: z.number().describe("Risk score for trademark infringement (0-100)"),
    copyright_risk_score: z.number().describe("Risk score for copyright infringement (0-100)"),
    similar_brands: z.array(z.object({
        name: z.string(),
        similarity: z.string().describe("Description of similarity"),
        potential_conflict: z.string().describe("Why this brand might be a conflict")
    })).describe("List of existing brands or designs that might be similar"),
    legal_advice: z.string().describe("Specific legal precautions for the user"),
    next_steps: z.array(z.string()).describe("Actionable steps to mitigate IP risks"),
});

// --- API Handler ---

export async function POST(req: Request) {
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });

    try {
        const body = await req.json();
        const { productName, category, description, userId } = body;

        if (!productName || !category) {
            return NextResponse.json(
                { error: "Product information is incomplete" },
                { status: 400 }
            );
        }

        const prompt = `
        You are an Intellectual Property (IP) expert specializing in Korean Trademark and Copyright Law.
        Analyze the following product for potential IP infringement risks.

        Product Info:
        - Name: ${productName}
        - Category: ${category}
        - Description: ${description || "None provided"}

        1. Analyze if the name "${productName}" is likely to conflict with existing famous brands or generic terms in the ${category} category.
        2. Evaluate the potential for copyright issues if the product involves creative designs or 3D modeling as described.
        3. Identify any similar existing brands (real or hypothetical examples based on your knowledge).
        4. Provide a risk score (0-100) for both Trademark and Copyright.
        5. Give practical legal advice and next steps.

        Respond in Korean.
        `;

        const completion = await openai.chat.completions.parse({
            model: "gpt-4o-2024-08-06",
            messages: [
                { role: "system", content: "You are a specialist in Intellectual Property rights and compliance." },
                { role: "user", content: prompt },
            ],
            response_format: zodResponseFormat(IpCheckResultSchema, "ip_check_result"),
        });

        const result = completion.choices[0].message.parsed;

        return NextResponse.json(result);
    } catch (error) {
        console.error("IP Check API Error:", error);
        return NextResponse.json(
            { error: "Failed to analyze IP risks." },
            { status: 500 }
        );
    }
}
