import { NextResponse } from "next/server";
import { z } from "zod";
import { OpenAI } from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
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
    당신은 대한민국 하드웨어 스타트업 및 중소기업을 위한 규제 준수 및 행정 서류 전문 컨설턴트입니다.
    다음 제품 정보를 바탕으로 "${documentType}" 문서의 고품질 초안을 작성하십시오.

    제품 정보:
    - 제품명: ${productName}
    - 카테고리: ${category}
    - 제품 설명: ${description}
    - 문서 유형: ${documentType}

    지시 사항:
    1. 대한민국 법령(전기용품 및 생활용품 안전관리법, 전파법 등) 및 공공기관 제출 표준 양식에 부합하는 공식적인 한국어를 사용하십시오.
    2. 전문적인 법적/기술적 용어를 정확하게 사용하십시오.
    3. 문서 내에 구체적인 수치가 필요한 부분은 "[ ]" 또는 "[입력 필요]"와 같은 형태로 명확히 표시하여 사용자가 수정할 수 있게 하십시오.
    4. 다음 섹션들을 반드시 포함하십시오:
       - 문서 개요 및 목적
       - 제품의 주요 사양 및 특징
       - 관련 법규 및 준수 사항
       - 안전성 확보 방안 또는 사후 관리 계획
       - 결언 및 확인 서명란

    응답은 반드시 아래의 JSON 형식을 따르십시오:
    {
      "title": "문서 제목",
      "content": "문서 전체 내용을 구조화된 마크다운 형식으로 담은 문자열",
      "sections": [
        { "heading": "섹션 제목", "body": "섹션 세부 본문 내용" }
      ]
    }
    `;

        const completion = await openai.chat.completions.parse({
            model: "gpt-4o-2024-08-06",
            messages: [
                { role: "system", content: "당신은 한국의 제품 인증 및 행정 서류 작성 전문가입니다. 모든 응답은 법적 표준을 준수하는 정중한 공문서 형식이어야 합니다." },
                { role: "user", content: prompt },
            ],
            response_format: zodResponseFormat(DocumentSchema, "document_draft"),
        });

        const parsedData = completion.choices[0].message.parsed;
        if (!parsedData) throw new Error("문서 생성 실패");

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
