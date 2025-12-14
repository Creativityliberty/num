import crypto from "node:crypto";
import http from "node:http";
import https from "node:https";

export async function downloadToString(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const h = url.startsWith("https") ? https : http;
    h.get(url, (res) => {
      if (res.statusCode && res.statusCode >= 400) {
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }
      let data = "";
      res.setEncoding("utf-8");
      res.on("data", (c) => (data += c));
      res.on("end", () => resolve(data));
    }).on("error", reject);
  });
}

export function sha256(text: string): string {
  return crypto.createHash("sha256").update(text).digest("hex");
}
