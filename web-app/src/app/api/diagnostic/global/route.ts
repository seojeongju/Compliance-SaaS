import { OpenAI } from "openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
import { NextResponse } from "next/server";

export const runtime = "edge";

const GlobalRoadmapSchema = z.object({
    target_country: z.string().describe("Target export country name"),
    key_certifications: z.array(z.object({
        name: z.string().describe("Certification name (e.g., CE, FCC, FDA)"),
        description: z.string().describe("Brief description of the certification"),
        mandatory: z.boolean().describe("Whether this certification is mandatory"),
    })).describe("List of key certifications required"),
    regulatory_authority: z.string().describe("Main regulatory authority (e.g., FDA, CPSC)"),
    estimated_timeline: z.string().describe("Estimated time required for compliance"),
    estimated_cost: z.string().describe("Estimated cost range for compliance"),
    process_steps: z.array(z.string()).describe("Step-by-step guide for compliance"),
    customs_tips: z.string().describe("Tips for passing customs clearance"),
});

export async function POST(req: Request) {
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });

    try {
        const body = await req.json();
        const { productName, category, targetCountry, description } = body;

        if (!productName || !targetCountry) {
            return NextResponse.json(
                { error: "Product information is incomplete" },
                { status: 400 }
            );
        }

        const prompt = `
        You are an expert in International Trade Compliance and Product Certifications.
        Generate a comprehensive compliance roadmap for exporting the following product to ${targetCountry}.

        Product Info:
        - Name: ${productName}
        - Category: ${category}
        - Description: ${description}
        - Target Country: ${targetCountry}

        1. Identify the mandatory certifications (e.g., FDA for US food/drugs, CE for EU machinery, FCC for US electronics).
        2. Identify the main regulatory authority.
        3. Estimate the timeline and cost for obtaining these certifications.
        4. Provide a step-by-step guide.
        5. Provide tips for customs clearance.

        Respond in Korean.
        `;

        const completion = await openai.chat.completions.parse({
            model: "gpt-4o-2024-08-06",
            messages: [
                { role: "system", content: "You are a specialist in global product compliance and export regulations." },
                { role: "user", content: prompt },
            ],
            response_format: zodResponseFormat(GlobalRoadmapSchema, "global_roadmap"),
        });

        const result = completion.choices[0].message.parsed;

        return NextResponse.json(result);
    } catch (error) {
        console.error("Global Roadmap API Error:", error);
        return NextResponse.json(
            { error: "Failed to generate global roadmap." },
            { status: 500 }
        );
    }
}
