import http from "http";
import https from "https";

/**
 * Custom fetcher that uses Node's standard HTTP/HTTPS modules to force HTTP/1.1.
 * This prevents the ERR_SSL_DECRYPTION_FAILED_OR_BAD_RECORD_MAC error in Node.js
 * when fetching from HTTPS endpoints behind Cloudflare/Render load balancers.
 */
export async function fetchHttp1<T>(url: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https:") ? https : http;
    
    client.get(url, (res) => {
      if (res.statusCode && (res.statusCode < 200 || res.statusCode >= 300)) {
        return reject(new Error(`HTTP Error Status: ${res.statusCode}`));
      }
      
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      
      res.on("end", () => {
        try {
          resolve(JSON.parse(data));
        } catch (err) {
          reject(new Error(`Failed to parse JSON response: ${(err as Error).message}`));
        }
      });
    }).on("error", (err) => {
      reject(err);
    });
  });
}
