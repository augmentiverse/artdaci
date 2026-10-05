const MAX_TEXTS = 24;
const MAX_TEXT_LENGTH = 1800;

function send(res, status, payload) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(payload));
}

function config() {
  return {
    endpoint: String(process.env.ARTDACI_EMBEDDING_ENDPOINT || "").trim(),
    model: String(process.env.ARTDACI_EMBEDDING_MODEL || "").trim(),
    apiKey: String(process.env.ARTDACI_EMBEDDING_API_KEY || "").trim()
  };
}

function normalizeTexts(value) {
  if (!Array.isArray(value)) return [];
  return value
    .slice(0, MAX_TEXTS)
    .map((item) => String(item || "").trim().slice(0, MAX_TEXT_LENGTH))
    .filter(Boolean);
}

function extractEmbeddings(payload) {
  if (Array.isArray(payload?.data)) {
    return payload.data
      .map((item) => item?.embedding)
      .filter((embedding) => Array.isArray(embedding));
  }
  if (Array.isArray(payload?.embeddings)) {
    return payload.embeddings.filter((embedding) => Array.isArray(embedding));
  }
  return [];
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    return res.end();
  }

  const configured = config();

  if (req.method === "GET") {
    return send(res, 200, {
      configured: Boolean(configured.endpoint && configured.model),
      model: configured.model || null,
      mode: configured.endpoint && configured.model ? "remote-neural-embedding" : "local-vector-fallback",
      requiredEnvironment: [
        "ARTDACI_EMBEDDING_ENDPOINT",
        "ARTDACI_EMBEDDING_MODEL",
        "ARTDACI_EMBEDDING_API_KEY (optional when provider does not require it)"
      ]
    });
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "GET, POST, OPTIONS");
    return send(res, 405, { error: "Method not allowed" });
  }

  if (!configured.endpoint || !configured.model) {
    return send(res, 503, {
      error: "Embedding provider is not configured.",
      mode: "local-vector-fallback"
    });
  }

  const body = typeof req.body === "string"
    ? JSON.parse(req.body || "{}")
    : (req.body || {});
  const texts = normalizeTexts(body.texts);
  if (!texts.length) return send(res, 400, { error: "texts[] is required." });

  const headers = { "Content-Type": "application/json" };
  if (configured.apiKey) headers.Authorization = `Bearer ${configured.apiKey}`;

  const response = await fetch(configured.endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: configured.model,
      input: texts
    })
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    return send(res, 502, {
      error: `Embedding provider HTTP ${response.status}`,
      detail: errorText.slice(0, 500)
    });
  }

  const payload = await response.json();
  const embeddings = extractEmbeddings(payload);
  if (embeddings.length !== texts.length) {
    return send(res, 502, {
      error: "Embedding provider returned an unexpected response shape.",
      expected: texts.length,
      received: embeddings.length
    });
  }

  return send(res, 200, {
    configured: true,
    mode: "remote-neural-embedding",
    model: configured.model,
    embeddings
  });
};
