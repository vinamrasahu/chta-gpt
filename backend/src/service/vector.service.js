const { Pinecone } = require('@pinecone-database/pinecone');

const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

const chatGptIndex = pc.index('chat-gpt');


// ---------------------------
async function withTimeout(promise, ms = 8000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);

  try {
    return await promise(controller.signal);
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('⏳ Pinecone request timed out');
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}


// ---------------------------
async function createMemory({ vectors, metadata, messageId }) {
  try {
    await withTimeout(async (signal) => {
      return await chatGptIndex.upsert([
        {
          id: messageId,
          values: vectors,
          metadata: metadata,
        },
      ], { signal });
    }, 8000);
  } catch (err) {
    console.error("❌ Pinecone Upsert Error:", err.message);
  }
}


// ---------------------------
async function querryMemory({ querryvector, limit, metadata }) {
  try {
    const result = await withTimeout(async (signal) => {
      return await chatGptIndex.query(
        {
          vector: querryvector,
          topK: limit,
          filter: metadata ? metadata : undefined,
          includeMetadata: true,
        },
        { signal }
      );
    }, 8000);

    return result.matches || [];
  } catch (err) {
    console.error("❌ Pinecone Query Error:", err.message);
    return [];
  }
}

module.exports = {
  createMemory,
  querryMemory
};
