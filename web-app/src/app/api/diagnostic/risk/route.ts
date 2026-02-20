
import { NextResponse } from "next/server";
import { z } from "zod";
import { OpenAI } from "openai";
import { zodResponseFormat } from "openai/helpers/zod";

const RiskAssessmentSchema = z.object({
    overall_risk_level: z.enum(["Low", "Medium", "High", "Critical"]),
    summary: z.string().describe("Executive summary of the product's safety risk profile"),
    hazard_analysis: z.array(z.object({
        hazard_item: z.string().describe("Specific potential danger (e.g., Electric shock, Choking hazard)"),
        potential_risk: z.string().describe("Scenario or description of how the hazard might occur"),
        frequency: z.number().describe("Likelihood 1-5"),
        severity: z.number().describe("Consequence impact 1-5"),
        risk_score: z.number().describe("freq * sev"),
        mitigation_strategy: z.string().describe("Specific engineering or design advice to reduce this risk")
    })),
    applicable_iso_standards: z.array(z.string()).describe("Relevant ISO/IEC/EN standards (e.g., ISO 12100, IEC 60335)"),
    certification_roadmap: z.array(z.string()).describe("Step-by-step safety certification steps")
});

export async function POST(req: Request) {
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });

    try {
        const body = await req.json();
        const { productName, category, usageEnvironment, targetUser, mainMaterials, powerSource } = body;

        const prompt = `
        You are a senior ISO safety engineer and risk assessment expert.
        Perform a professional Risk Assessment (ISO 12100 / ISO 14971 style) for the following product.

        Product Info:
        - Name: ${productName}
        - Category: ${category}
        - Usage Environment: ${usageEnvironment}
        - Target User: ${targetUser}
        - Materials: ${mainMaterials}
        - Power Source: ${powerSource}

        1. Identify potential hazards based on the materials, power source, and usage context.
        2. Assign frequency (1: Rare to 5: Frequent) and severity (1: Minor to 5: Catastrophic).
        3. Determine the overall risk level.
        4. Recommend specific ISO standards for this category.
        5. Provide a clear mitigation strategy for each hazard.

        Respond in Korean.
        `;

        const completion = await openai.chat.completions.parse({
            model: "gpt-4o-2024-08-06",
            messages: [
                { role: "system", content: "You are an expert in product safety risk assessment and ISO standards compliance." },
                { role: "user", content: prompt },
            ],
            response_format: zodResponseFormat(RiskAssessmentSchema, "risk_assessment"),
        });

        const result = completion.choices[0].message.parsed;
        return NextResponse.json(result);

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Risk assessment failed" }, { status: 500 });
    }
}
