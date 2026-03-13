// app/api/proxy/route.ts
import { NextRequest } from "next/server";

const PROXY_PATH = "/api/proxy";

function extractRealUrl(url: string): string {
    // Unwrap any number of proxy wrappings
    let current = url;
    while (true) {
        try {
            const parsed = new URL(current);
            if (parsed.pathname === PROXY_PATH) {
                const inner = parsed.searchParams.get("url");
                if (inner) {
                    current = decodeURIComponent(inner);
                    continue;
                }
            }
        } catch { }
        break;
    }
    return current;
}

export async function GET(req: NextRequest) {
    const rawUrl = req.nextUrl.searchParams.get("url");
    if (!rawUrl) return new Response("Missing URL", { status: 400 });

    // Unwrap any nested proxy URLs
    const url = extractRealUrl(rawUrl);

    const response = await fetch(url);
    const contentType = response.headers.get("Content-Type") || "";

    if (contentType.includes("mpegurl") || url.includes(".m3u8")) {
        const text = await response.text();
        const baseUrl = url.substring(0, url.lastIndexOf("/") + 1);

        // Use absolute origin to avoid /api/api double-prefix
        const origin = req.nextUrl.origin; // e.g. http://localhost:3000

        const rewritten = text
            .split("\n")
            .map((line) => {
                const trimmed = line.trim();
                if (!trimmed || trimmed.startsWith("#")) return line;

                // Already a full proxied URL — unwrap and re-proxy cleanly
                const realSegmentUrl = trimmed.startsWith("http")
                    ? extractRealUrl(trimmed)
                    : baseUrl + trimmed;

                return `${origin}${PROXY_PATH}?url=${encodeURIComponent(realSegmentUrl)}`;
            })
            .join("\n");

        return new Response(rewritten, {
            headers: {
                "Content-Type": "application/vnd.apple.mpegurl",
                "Access-Control-Allow-Origin": "*",
            },
        });
    }

    // Binary segment (.ts)
    const buffer = await response.arrayBuffer();
    return new Response(buffer, {
        headers: {
            "Content-Type": contentType || "video/mp2t",
            "Access-Control-Allow-Origin": "*",
        },
    });
}