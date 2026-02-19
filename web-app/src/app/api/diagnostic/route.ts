import { OpenAI } from "openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
import { NextResponse } from "next/server";
import { createSupabaseClient } from "../../../lib/supabaseClient";

export const runtime = "edge";

// Define the structure of the AI response using Zod
const CertificationSchema = z.object({
    name: z.string().describe("Name of the certification or regulation (e.g., KC Broadcast Equipment Registration)"),
    type: z.enum(["legal", "safety", "hygiene", "other"]).describe("Type of regulation: legal (mandatory by law), safety, hygiene, or other"),
    description: z.string().describe("Brief explanation of why this is needed"),
    mandatory: z.boolean().describe("Whether this certification is mandatory"),
});

const DocumentSchema = z.object({
    name: z.string().describe("Name of the required document"),
    description: z.string().describe("Brief description of the document"),
});

const DiagnosticResultSchema = z.object({
    summary: z.string().describe("A brief summary of the diagnostic result"),
    probability_score: z.number().describe("Probability (0-100) that this product requires certification"),
    certifications: z.array(CertificationSchema).describe("List of required certifications"),
    estimated_cost: z.string().describe("Estimated total cost string (e.g., '150만원 ~ 200만원')"),
    estimated_duration: z.string().describe("Estimated duration string (e.g., '3 weeks')"),
    required_documents: z.array(DocumentSchema).describe("List of required documents to prepare"),
});

export async function POST(req: Request) {
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });

    try {
        const body = await req.json();
        const { productName, category, description } = body;

        if (!productName || !description) {
            return NextResponse.json(
                { error: "Product name and description are required" },
                { status: 400 }
            );
        }

        const prompt = `
    You are an expert in Korean regulatory compliance (KC certification, Food Hygiene Act, etc.).
    Analyze the following product and determine the required certifications and regulations for selling it in South Korea.

    Product Name: ${productName}
    Category: ${category}
    Description: ${description}

    Provide a detailed diagnostic report including:
    1. Mandatory certifications (KC Safety, EMC, etc.)
    2. Estimated cost and time
    3. Required documents
    
    Respond in Korean.
    `;

        const completion = await openai.chat.completions.parse({
            model: "gpt-4o-2024-08-06",
            messages: [
                { role: "system", content: "You are a helpful compliance assistant for Korean startups." },
                { role: "user", content: prompt },
            ],
            response_format: zodResponseFormat(DiagnosticResultSchema, "diagnostic_result"),
        });

        const result = completion.choices[0].message.parsed;

        // Save result to Supabase
        const supabase = createSupabaseClient();
        const { error: dbError } = await (supabase as any)
            .from('diagnostic_results')
            .insert([
                {
                    product_name: productName,
                    category: category,
                    description: description,
                    user_id: body.userId || null, // Save userId if provided
                    result_json: result,
                }
            ]);

        if (dbError) {
            console.error("Supabase Save Error:", dbError);
            // We don't fail the request, just log the error
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error("Diagnostic API Error:", error);
        return NextResponse.json(
            { error: "Failed to analyze product. Please check your API key or try again." },
            { status: 500 }
        );
    }
}
