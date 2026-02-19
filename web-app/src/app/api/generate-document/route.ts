import { NextResponse } from "next/server";
import { z } from "zod";
import { OpenAI } from "openai";
import { createSupabaseClient } from "../../../lib/supabaseClient";

export const runtime = "edge";

// Define the response schema using Zod
const DocumentSchema = z.object({
    title: z.string(),
    content: z.string(), // Markdown or HTML content for the document
    sections: z.array(
        z.object({
            heading: z.string(),
            body: z.string(),
        })
    ),
});

export async function POST(req: Request) {
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });

    try {
        const { productName, category, description, documentType, diagnosticId } = await req.json();

        if (!productName || !category || !description || !documentType) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const supabase = createSupabaseClient();

        // Get user session to save correctly
        // Note: In Edge runtime, auth.getUser() works if headers/cookies are passed, 
        // but since we call it from the same origin, it should work.
        const { data: { user } } = await supabase.auth.getUser();

        const prompt = `
    You are a professional regulatory compliance consultant for Korean startups.
    Based on the following product information, generate a draft for the "${documentType}" document.
    
    Product Name: ${productName}
    Category: ${category}
    Description: ${description}
    Document Type: ${documentType}

    The document should be professional, formal, and written in Korean.
    It should include standard sections required for this type of document (e.g., product overview, technical specifications, safety measures).
    If specific details are missing, use placeholders like "[구체적인 수치 입력 필요]" or "[제조사 정보 입력 필요]".

    Respond in JSON format corresponding to the following structure:
    {
      "title": "Document Title",
      "content": "Full document content in Markdown format...",
      "sections": [
        { "heading": "Section 1", "body": "Content for section 1..." },
        { "heading": "Section 2", "body": "Content for section 2..." }
      ]
    }
    `;

        const completion = await openai.chat.completions.parse({
            model: "gpt-4o-2024-08-06",
            messages: [
                { role: "system", content: "You are a helpful compliance assistant for Korean startups." },
                { role: "user", content: prompt },
            ],
            response_format: { type: "json_object" },
        });

        // Clean up the response content to ensure it is valid JSON
        const aiContent = completion.choices[0].message.content;
        if (!aiContent) throw new Error("No content generated");

        const parsedData = JSON.parse(aiContent);

        // Save result to Supabase
        const { error: dbError } = await (supabase as any)
            .from('documents')
            .insert([
                {
                    user_id: user?.id || null, // Associate with user if logged in
                    diagnostic_id: diagnosticId || null, // Link to diagnostic if provided
                    title: parsedData.title,
                    doc_type: documentType,
                    content: parsedData.content,
                    status: 'draft',
                }
            ]);

        if (dbError) {
            console.error("Supabase Save Error:", dbError);
        }

        return NextResponse.json(parsedData);

    } catch (error) {
        console.error("Error generating document:", error);
        return NextResponse.json(
            { error: "Failed to generate document" },
            { status: 500 }
        );
    }
}
