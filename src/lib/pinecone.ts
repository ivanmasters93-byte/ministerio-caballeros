import { Pinecone } from '@pinecone-database/pinecone';
import { Anthropic } from '@anthropic-ai/sdk';

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function getVectorDatabase() {
  if (!process.env.PINECONE_API_KEY) {
    console.warn('Pinecone API key not configured');
    return null;
  }

  try {
    const index = pinecone.Index(process.env.PINECONE_INDEX_NAME || 'ministerio-caballeros');
    return index;
  } catch (error) {
    console.error('Failed to initialize Pinecone index:', error);
    return null;
  }
}

/**
 * Generate embedding for text using Anthropic
 */
export async function generateEmbedding(text: string): Promise<number[] | null> {
  if (!text) return null;

  try {
    // Using Claude to generate embeddings would be done through an embedding model
    // For now, we'll use a placeholder that can be replaced with a dedicated embedding service
    console.log('Embedding generation placeholder for:', text.substring(0, 50));
    // This should be replaced with actual embedding generation
    // Currently, Anthropic doesn't offer embeddings, so we'd need another service
    // like sentence-transformers or OpenAI embeddings
    return null;
  } catch (error) {
    console.error('Failed to generate embedding:', error);
    return null;
  }
}

/**
 * Index document in Pinecone
 */
export async function indexDocument(documentId: string, content: string, metadata?: Record<string, unknown>) {
  try {
    const index = await getVectorDatabase();
    if (!index) {
      console.warn('Pinecone not available');
      return null;
    }

    const embedding = await generateEmbedding(content);
    if (!embedding) {
      console.warn('Could not generate embedding');
      return null;
    }

    // Upsert vector to Pinecone
    await index.upsert([
      {
        id: documentId,
        values: embedding,
        metadata: {
          documentId,
          ...metadata,
        },
      },
    ]);

    return { id: documentId, success: true };
  } catch (error) {
    console.error('Failed to index document:', error);
    return null;
  }
}

/**
 * Search documents using vector similarity
 */
export async function searchDocuments(query: string, topK: number = 5) {
  try {
    const index = await getVectorDatabase();
    if (!index) {
      console.warn('Pinecone not available');
      return [];
    }

    const queryEmbedding = await generateEmbedding(query);
    if (!queryEmbedding) {
      console.warn('Could not generate query embedding');
      return [];
    }

    const results = await index.query({
      vector: queryEmbedding,
      topK,
      includeMetadata: true,
    });

    return results.matches || [];
  } catch (error) {
    console.error('Failed to search documents:', error);
    return [];
  }
}

/**
 * Delete document from Pinecone
 */
export async function deleteDocument(documentId: string) {
  try {
    const index = await getVectorDatabase();
    if (!index) {
      console.warn('Pinecone not available');
      return false;
    }

    await index.deleteOne(documentId);
    return true;
  } catch (error) {
    console.error('Failed to delete document:', error);
    return false;
  }
}
