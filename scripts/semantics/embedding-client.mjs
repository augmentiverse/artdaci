let embeddingStatus = null;

export async function getEmbeddingStatus() {
  if (embeddingStatus) return embeddingStatus;
  try {
    const response = await fetch("/api/semantic-embeddings", {
      method: "GET",
      headers: { Accept: "application/json" }
    });
    if (!response.ok) throw new Error(`Embedding status HTTP ${response.status}`);
    embeddingStatus = await response.json();
  } catch {
    embeddingStatus = {
      configured: false,
      model: null,
      mode: "local-vector-fallback"
    };
  }
  return embeddingStatus;
}

function cosine(a, b) {
  let dot = 0;
  let aa = 0;
  let bb = 0;
  const length = Math.min(a.length, b.length);
  for (let index = 0; index < length; index += 1) {
    dot += a[index] * b[index];
    aa += a[index] * a[index];
    bb += b[index] * b[index];
  }
  if (!aa || !bb) return 0;
  return dot / Math.sqrt(aa * bb);
}

export async function rerankWithNeuralEmbeddings(query, results) {
  const status = await getEmbeddingStatus();
  if (!status.configured || !results.length) {
    return { mode: "local-vector-fallback", model: null, results };
  }

  const candidates = results.slice(0, 12);
  const texts = [
    query,
    ...candidates.map((item) => [
      item.label || "",
      item.subtitle || "",
      item.description || "",
      item.rationale || "",
      item.prompt || ""
    ].filter(Boolean).join(" · "))
  ];

  try {
    const response = await fetch("/api/semantic-embeddings", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ texts })
    });
    if (!response.ok) throw new Error(`Embedding search HTTP ${response.status}`);
    const payload = await response.json();
    const [queryEmbedding, ...candidateEmbeddings] = payload.embeddings || [];
    if (!Array.isArray(queryEmbedding) || candidateEmbeddings.length !== candidates.length) {
      throw new Error("Invalid embedding payload");
    }

    const rescored = candidates.map((item, index) => {
      const neuralScore = Math.max(0, cosine(queryEmbedding, candidateEmbeddings[index]));
      return {
        ...item,
        neuralScore,
        score: (Number(item.score) || 0) * 0.72 + neuralScore * 0.28,
        reasons: [...new Set([...(item.reasons || []), neuralScore >= 0.25 ? "embedding" : null].filter(Boolean))]
      };
    }).sort((a, b) => b.score - a.score);

    return {
      mode: "graph+neural-embedding",
      model: payload.model || status.model || null,
      results: rescored
    };
  } catch {
    return { mode: "local-vector-fallback", model: null, results };
  }
}
