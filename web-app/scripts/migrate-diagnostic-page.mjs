import fs from "fs";

const path = new URL("../src/app/dashboard/diagnostic/page.tsx", import.meta.url);
let s = fs.readFileSync(path, "utf8");

s = s.replace(
    "import { createSupabaseClient } from '../../../lib/supabaseClient';",
    `import { getSession } from '../../../lib/auth-client';
import { deleteDiagnosticResult, fetchProfile, listDiagnosticResults, saveDiagnosticResult } from '../../../lib/diagnostic-client';`
);

s = s.replace(
    /async function getAuthHeaders\(\): Promise<Record<string, string>> \{[\s\S]*?\n    \}/m,
    `async function getAuthHeaders(): Promise<Record<string, string>> {
        const user = await getSession();
        if (!user) return {};
        return {};
    }`
);

s = s.replace(
    /async function fetchAndLoadResult\(id: string\) \{[\s\S]*?\n    \}/m,
    `async function fetchAndLoadResult(id: string) {
        try {
            const items = await listDiagnosticResults();
            const data = items.find((item) => (item as { id: string }).id === id);
            if (data) loadHistoryItem(data);
        } catch (err) {
            console.error("Failed to load diagnostic from URL:", err);
        }
    }`
);

s = s.replace(
    /async function loadUserTier\(\) \{[\s\S]*?\n    \}/m,
    `async function loadUserTier() {
        try {
            const { user, profile } = await fetchProfile();
            if (user && profile) {
                const p = profile as { tier?: string; role?: string };
                setUserTier((p.tier as "free" | "pro") || "free");
                setUserRole((p.role as "admin" | "user") || "user");
            }
        } catch (e) {
            console.error("Profile load error", e);
        }
    }`
);

s = s.replace(
    /async function loadHistory\(\) \{[\s\S]*?\n    \}/m,
    `async function loadHistory() {
        try {
            const user = await getSession();
            if (user) {
                const data = await listDiagnosticResults();
                setHistory(data.slice(0, 6) as typeof history);
            } else {
                setHistory([]);
            }
        } catch (e) {
            console.error("History load error", e);
        }
    }`
);

s = s.replace(
    /const supabase = createSupabaseClient\(\);\s*const \{ data: \{ user \} \} = await supabase\.auth\.getUser\(\);/g,
    "const user = await getSession();"
);

s = s.replace(
    /const supabase = createSupabaseClient\(\);\s*const \{ error \} = await \(supabase as any\)\.from\('diagnostic_results'\)\.delete\(\)\.eq\('id', id\);\s*if \(error\) throw error;/g,
    'const res = await deleteDiagnosticResult(id); if (!res.ok) throw new Error("Delete failed");'
);

function replaceSaveBlock(fnName, config) {
    const re = new RegExp(
        `const ${fnName} = async \\(\\) => \\{[\\s\\S]*?try \\{[\\s\\S]*?\\} catch \\(e\\) \\{[\\s\\S]*?\\}\\s*\\};`,
        "m"
    );
    s = s.replace(re, config);
}

replaceSaveBlock("handleSaveLabel", `const handleSaveLabel = async () => {
        if (!labelResult) return;
        try {
            const user = await getSession();
            if (!user) { alert("로그인이 필요합니다."); return; }
            const id = await saveDiagnosticResult({
                userId: user.id,
                product_name: labelResult.product_name,
                description: \`\${labelResult.model_name} - 표시사항 제작\`,
                category: "label",
                result_json: labelResult,
                tool_type: "label",
            });
            if (id) setCurrentId(id);
            alert("라벨 도안이 성공적으로 저장되었습니다.");
            loadHistory();
        } catch (e) {
            console.error(e);
            alert("저장 중 오류가 발생했습니다.");
        }
    };`);

replaceSaveBlock("handleSaveIpCheck", `const handleSaveIpCheck = async () => {
        if (!ipResult) return;
        try {
            const user = await getSession();
            if (!user) { alert("로그인이 필요합니다."); return; }
            const id = await saveDiagnosticResult({
                userId: user.id,
                product_name: ipFormData.productName,
                description: ipFormData.description,
                category: ipFormData.category,
                result_json: ipResult,
                tool_type: "ip_check",
            });
            if (id) setCurrentId(id);
            alert("지재권 검사 결과가 성공적으로 저장되었습니다.");
            loadHistory();
        } catch (e) {
            console.error(e);
            alert("저장 중 오류가 발생했습니다.");
        }
    };`);

replaceSaveBlock("handleSaveGlobal", `const handleSaveGlobal = async () => {
        if (!globalResult) return;
        try {
            const user = await getSession();
            if (!user) { alert("로그인이 필요합니다."); return; }
            const id = await saveDiagnosticResult({
                userId: user.id,
                product_name: globalFormData.productName,
                description: \`\${globalResult.target_country} 수출 로드맵 - \${globalFormData.category}\`,
                category: globalFormData.category,
                result_json: globalResult,
                tool_type: "global",
            });
            if (id) setCurrentId(id);
            alert("수출 로드맵이 성공적으로 저장되었습니다.");
            loadHistory();
        } catch (e) {
            console.error(e);
            alert("저장 중 오류가 발생했습니다.");
        }
    };`);

replaceSaveBlock("handleSaveSubsidy", `const handleSaveSubsidy = async () => {
        if (!subsidyResult) return;
        try {
            const user = await getSession();
            if (!user) { alert("로그인이 필요합니다."); return; }
            const id = await saveDiagnosticResult({
                userId: user.id,
                product_name: subsidyFormData.productName,
                description: \`정부지원사업 매칭 - \${subsidyFormData.interestArea}\`,
                category: subsidyFormData.category,
                result_json: {
                    ...subsidyResult,
                    company_stage: subsidyFormData.companyStage,
                    location: subsidyFormData.location,
                    interest_area: subsidyFormData.interestArea,
                },
                tool_type: "subsidy",
            });
            if (id) setCurrentId(id);
            alert("지원사업 매칭 결과가 성공적으로 저장되었습니다.");
            loadHistory();
        } catch (e) {
            console.error(e);
            alert("저장 중 오류가 발생했습니다.");
        }
    };`);

replaceSaveBlock("handleSaveRisk", `const handleSaveRisk = async () => {
        if (!riskResult) return;
        try {
            const user = await getSession();
            if (!user) { alert("로그인이 필요합니다."); return; }
            const id = await saveDiagnosticResult({
                userId: user.id,
                product_name: riskFormData.productName,
                description: riskFormData.mainMaterials,
                category: riskFormData.category,
                result_json: {
                    ...riskResult,
                    usage_env: riskFormData.usageEnvironment,
                    target_user: riskFormData.targetUser,
                    materials: riskFormData.mainMaterials,
                    power: riskFormData.powerSource,
                },
                tool_type: "risk",
            });
            if (id) setCurrentId(id);
            alert("위험성 평가 결과가 성공적으로 저장되었습니다.");
            loadHistory();
        } catch (e) {
            console.error(e);
            alert("저장 중 오류가 발생했습니다.");
        }
    };`);

s = s.replace(
    /try \{\s*const supabase = createSupabaseClient\(\);\s*const \{ data: \{ user \} \} = await supabase\.auth\.getUser\(\);\s*if \(user\) \{\s*await \(supabase as any\)\.from\('diagnostic_results'\)\.insert\(\{[\s\S]*?tool_type: 'smart_doc'[\s\S]*?\}\);\s*loadHistory\(\);\s*\}\s*\} catch \(e\)/,
    `try {
                const user = await getSession();
                if (user) {
                    await saveDiagnosticResult({
                        userId: user.id,
                        product_name: params.productName,
                        description: \`\${docType} - AI 생성 초안\`,
                        category: params.category,
                        result_json: { ...docData, doc_type: docType, original_params: params },
                        tool_type: "smart_doc",
                    });
                    loadHistory();
                }
            } catch (e)`
);

// bookmark fetches - add credentials
s = s.replace(
    'const res = await fetch("/api/subsidy/bookmarks", { headers });',
    'const res = await fetch("/api/subsidy/bookmarks", { headers, credentials: "include" });'
);
s = s.replace(
    'const res = await fetch("/api/subsidy/deadline-alerts", { headers });',
    'const res = await fetch("/api/subsidy/deadline-alerts", { headers, credentials: "include" });'
);
s = s.replace(
    '{ method: "DELETE", headers }',
    '{ method: "DELETE", headers, credentials: "include" }'
);
s = s.replace(
    'method: "POST",\n                    headers: { ...headers, "Content-Type": "application/json" },',
    'method: "POST",\n                    headers: { ...headers, "Content-Type": "application/json" },\n                    credentials: "include",'
);

fs.writeFileSync(path, s);
console.log("remaining supabase refs:", (s.match(/createSupabaseClient|supabase/g) || []).length);
