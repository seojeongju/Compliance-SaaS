# Compliance-SaaS (Certi-Mate)

개인 창업자를 위한 AI 규제/인증 가이드 서비스입니다.

## 프로젝트 구조

- **web-app**: Next.js 메인 앱 (Cloudflare Pages 배포)
- **(Future) python-service**: HWP/PDF 문서 생성 마이크로서비스

## 기술 스택

- **Frontend**: Next.js 15, React, Tailwind CSS, Framer Motion
- **Backend**: Next.js Edge API Routes
- **Database**: Cloudflare D1
- **Storage**: Cloudflare R2 (생성 문서)
- **Auth**: D1 + 세션 쿠키 (자체 구현)
- **AI**: OpenAI API (GPT-4o)
- **배포**: Cloudflare Pages (`compliance-saas-5jq.pages.dev`)

## 로컬 개발

```bash
cd web-app
npm install
cp .env.example .env.local   # OPENAI_API_KEY 등 입력
npm run dev
```

> D1/R2 바인딩은 Cloudflare Pages/Workers 환경에서만 동작합니다. 로컬 DB 테스트는 `npm run db:migrate:local` 후 `wrangler pages dev`를 사용하세요.

## Cloudflare 인프라

| 리소스 | 이름 | ID/비고 |
|--------|------|---------|
| D1 | `compliance-saas-db` | `14e04fa6-3afe-40a5-b1b6-592102dbbc76` |
| R2 | `compliance-saas-documents` | 문서 markdown 저장 |
| Pages | `compliance-saas` | Root: `web-app/` |

### D1 마이그레이션

```bash
cd web-app
npm run db:migrate:remote   # 프로덕션
npm run db:migrate:local    # 로컬
```

### Pages Secrets (필수)

| Secret | 용도 |
|--------|------|
| `OPENAI_API_KEY` | AI 진단 |
| `AUTH_SECRET` | 세션/토큰 (설정됨) |
| `BIZINFO_API_KEY` | [기업마당 지원사업정보 API](https://www.bizinfo.go.kr/apiDetail.do?id=bizinfoApi) 인증키 (data.go.kr 키와 별도) |
| `CRON_SECRET` | subsidy sync cron (설정됨) |
| `CLOUDFLARE_API_TOKEN` | 이메일 REST 발송 (선택) |

### 관리자 계정

회원가입 후 D1에서 실행:

```sql
UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';
```

## 주요 기능

1. **AI 규제 진단**: 제품 정보 기반 인증/허가 절차 진단
2. **맞춤형 로드맵**: 단계별 가이드, 예상 비용/기간
3. **정부지원사업 매칭**: 기업마당 실시간 공고 + AI 하이브리드
4. **서류 자동 작성**: AI 초안 생성 (R2 저장)

---

Developed by (주)와우쓰리디
