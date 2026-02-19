# Compliance-SaaS (Certi-Mate)

개인 창업자를 위한 AI 규제/인증 가이드 서비스입니다.

## 📂 프로젝트 구조

- **web-app**: Next.js 기반의 메인 웹 애플리케이션 (프론트엔드 + 백엔드 API)
  - 기술 스택: Next.js 14+ (App Router), Tailwind CSS, Framer Motion, Supabase, OpenAI
  - 배포 환경: Cloudflare Pages / Workers
- **(Future) python-service**: HWP/PDF 문서 생성 전용 마이크로서비스

## 🚀 시작 가이드 (Getting Started)

### 1. 웹 앱 실행

```bash
cd web-app
npm install
npm run dev
```

### 2. 환경 변수 설정 (.env.local)

`web-app/.env.local` 파일을 생성하고 다음 키를 입력하세요:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
```

## ✨ 주요 기능

1. **AI 규제 진단**: 제품 정보를 입력하면 필요한 인증/허가 절차를 AI가 진단합니다.
2. **맞춤형 로드맵**: 인증 획득까지의 단계별 가이드와 예상 비용/기간을 제공합니다.
3. **서류 자동 작성**: 복잡한 신청서를 AI가 초안을 작성해줍니다.

## 🛠 기술 스택 상세

- **Frontend**: Next.js, React, Tailwind CSS, Lucide React, Framer Motion
- **Backend**: Next.js API Routes (Serverless Functions)
- **Database**: Supabase (PostgreSQL + Vector)
- **AI**: OpenAI API (GPT-4o)

---

Developed by [Your Name / Team Name]
