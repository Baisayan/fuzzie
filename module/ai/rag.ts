import { pineconeIndex } from "@/lib/pinecone";
import { embed } from "ai";
import { google, type GoogleEmbeddingModelOptions } from "@ai-sdk/google";

export async function generateEmbedding(text: string) {
  const { embedding } = await embed({
    model: google.embedding("gemini-embedding-001"),
    value: text,
    providerOptions: {
      google: {
        outputDimensionality: 768,
      } satisfies GoogleEmbeddingModelOptions,
    },
  });

  return embedding;
}

export async function indexCodebase(
  repoId: string,
  files: { path: string; content: string }[],
) {
  const vectors = [];

  for (const file of files) {
    if (!file.content?.trim()) continue;
    const content = `File: ${file.path}\n\n${file.content}`.slice(0, 8000);

    try {
      const embedding = await generateEmbedding(content);
      vectors.push({
        id: `${repoId}-${file.path.replace(/\//g, "_")}`,
        values: embedding,
        metadata: {
          repoId,
          filePath: file.path,
          content: content,
        },
      });
    } catch (error) {
      throw new Error(`Failed to embed ${file.path}: ${error}`);
    }
  }

  if (vectors.length > 0) {
    const batchSize = 100;

    for (let i = 0; i < vectors.length; i += batchSize) {
      const batch = vectors.slice(i, i + batchSize);
      await pineconeIndex.upsert({
        records: batch,
      });
    }
  }

  console.log("Indexing complete");
}

export async function retrieveContext(
  query: string,
  repoId: string,
  topK: number = 5,
) {
  const embedding = await generateEmbedding(query);

  const results = await pineconeIndex.query({
    vector: embedding,
    filter: { repoId },
    topK,
    includeMetadata: true,
  });

  return results.matches
    .map((match) => match.metadata?.content as string)
    .filter(Boolean);
}
