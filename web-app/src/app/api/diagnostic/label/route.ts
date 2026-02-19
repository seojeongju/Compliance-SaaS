import { OpenAI } from "openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
import { NextResponse } from "next/server";
import { createSupabaseClient } from "../../../lib/supabaseClient";

export const runtime = "edge";

// --- Schema Definitions ---

const LabelContentSchema = z.object({
    product_name: z.string().describe("Legal product name to be displayed"),
    model_name: z.string().describe("Model name or type"),
    capacity: z.string().describe("Capacity, weight, or count"),
    manufacturer: z.string().describe("Manufacturer or Importer name"),
    country_of_origin: z.string().describe("Country of manufacture"),
    manufacturing_date: z.string().describe("Manufacturing date marking guidline"),
    precautions: z.string().describe("Required usage precautions"),
    kc_mark_guideline: z.string().describe("Guideline for KC mark placement and size"),
    recycle_mark: z.string().describe("Recycle mark type (e.g., Plastic, Paper)"),
    additional_info: z.string().describe("Any other legally required information"),
});

// --- API Handler ---

export async function POST(req: Request) {
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });

    try {
        const body = await req.json();
        const { productName, productType, weight, manufacturer, precautions, userId } = body;

        if (!productName || !productType) {
            return NextResponse.json(
                { error: "Product information is incomplete" },
                { status: 400 }
            );
        }

        const prompt = `
        You are an expert in Korean Product Labeling Laws (Quality Management and Safety Control of Industrial Products Act, Fair Labeling and Advertising Act).
        Generate the mandatory labeling content for the following product to be printed on its package.

        Product Info:
        - Name: ${productName}
        - Type/Model: ${productType}
        - Capacity/Weight: ${weight}
        - Manufacturer: ${manufacturer}
        - User Input Precautions: ${precautions || "None"}

        1. Identify the 'Legal Product Category' (e.g., Household Chemical Product, Industrial Product, Cosmetics).
        2. Based on the category, generate the EXACT text required for the label.
        3. Include standard precautions for this type of product.
        4. Provide guidelines for KC mark and Recycle mark.
        
        Respond in Korean.
        `;

        const completion = await openai.chat.completions.parse({
            model: "gpt-4o-2024-08-06",
            messages: [
                { role: "system", content: "You are a specialist in Korean product compliance and labeling." },
                { role: "user", content: prompt },
            ],
            response_format: zodResponseFormat(LabelContentSchema, "label_content"),
        });

        const result = completion.choices[0].message.parsed;

        // Save result to Supabase (Optional: Create a new table 'detail_diagnostic_results' or store in JSON)
        // For now, we just return the result to the client.

        return NextResponse.json(result);
    } catch (error) {
        console.error("Label Maker API Error:", error);
        return NextResponse.json(
            { error: "Failed to generate label content." },
            { status: 500 }
        );
    }
}
