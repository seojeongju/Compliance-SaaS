import { OpenAI } from "openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
import { NextResponse } from "next/server";

export const runtime = "edge";

// --- Schema Definitions ---

const SubsidySchema = z.object({
    analysis_summary: z.string().describe("Executive summary of why these subsidies were chosen for this user"),
    recommended_subsidies: z.array(z.object({
        title: z.string().describe("Name of the government support project"),
        agency: z.string().describe("Managing agency (e.g., MSS, KOTRA, KISA)"),
        budget: z.string().describe("Support scale/amount (e.g., Up to 50M KRW)"),
        deadline: z.string().describe("Application deadline or status"),
        eligibility: z.string().describe("Key eligibility criteria"),
        description: z.string().describe("What is supported (e.g., test costs, consulting)"),
        relevance_score: z.number().describe("Matching score 0-100"),
        link: z.string().describe("Likely portal or search keyword for this project")
    })).describe("List of matched government support programs"),
    strategy_advice: z.string().describe("Strategic advice for successful application"),
});

// --- API Handler ---

export async function POST(req: Request) {
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });

    try {
        const body = await req.json();
        const { productName, category, companyStage, location, interestArea } = body;

        // In a real scenario, this would also query a live database of government projects.
        // For this implementation, we use AI's knowledge of the latest Korean support trends (K-Startup, Bizinfo, etc.)

        const prompt = `
        You are a government support project (subsidy) consultant for Korean startups and SMEs.
        Find the best matching government projects (정부지원사업) for the following company based on the current 2024-2025 support landscape in South Korea.

        Company/Product Info:
        - Product: ${productName}
        - Category: ${category}
        - Stage: ${companyStage || "Start-up"}
        - Location: ${location || "Seoul/Gyeonggi"}
        - Target Area: ${interestArea || "Certification & Export"}

        1. Search for projects related to '인증 지원' (Certification support), '해외 마케팅' (Export/Marketing), 'R&D', or '바우처 사업' (Voucher programs).
        2. Specifically look for: 
           - 해외규격인증획득지원사업 (KTR/KTL)
           - 수출바우처 (Export Voucher)
           - 스타트업 해외진출지원
           - 중소기업 혁신바우처
        3. Provide at least 3-4 highly relevant projects.
        4. Include a 'relevance_score' reflecting how well it matches the user's category.

        Respond in Korean.
        `;

        const completion = await openai.chat.completions.parse({
            model: "gpt-4o-2024-08-06",
            messages: [
                { role: "system", content: "You are a professional consultant for Korean government subsidies and support programs." },
                { role: "user", content: prompt },
            ],
            response_format: zodResponseFormat(SubsidySchema, "subsidy_matching"),
        });

        const result = completion.choices[0].message.parsed;

        return NextResponse.json(result);
    } catch (error) {
        console.error("Subsidy API Error:", error);
        return NextResponse.json(
            { error: "Failed to match government subsidies." },
            { status: 500 }
        );
    }
}
