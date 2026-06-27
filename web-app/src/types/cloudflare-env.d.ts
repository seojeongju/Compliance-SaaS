interface EmailMessage {
    send(message: {
        to: string | string[];
        from: { email: string; name?: string };
        subject: string;
        html?: string;
        text?: string;
    }): Promise<{ messageId?: string }>;
}

/// <reference types="@cloudflare/workers-types" />

export interface CloudflareEnv {
    DB: D1Database;
    STORAGE: R2Bucket;
    EMAIL?: EmailMessage;
    APP_URL?: string;
    EMAIL_FROM?: string;
    EMAIL_FROM_NAME?: string;
    AUTH_SECRET?: string;
    CRON_SECRET?: string;
    OPENAI_API_KEY?: string;
    BIZINFO_API_KEY?: string;
    PUBLIC_DATA_SERVICE_KEY?: string;
}

declare global {
    // eslint-disable-next-line no-var
    var __CF_ENV__: CloudflareEnv | undefined;
}

export {};
