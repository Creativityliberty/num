// Embeddings and RAG Handler - Text embeddings for semantic search and RAG
// Supports Gemini embedding models with task-specific optimization
// Embedding Model Manager - Manages embedding models and configurations
export class EmbeddingModelManager {
    models = {
        'gemini-embedding-001': {
            inputLimit: 2048,
            outputDimensions: [128, 256, 512, 768, 1536, 3072],
        },
    };
    recommendedDimensions = [768, 1536, 3072];
    defaultDimension = 3072;
    // Get model info
    getModelInfo(model) {
        return this.models[model] || null;
    }
    // Get recommended dimensions
    getRecommendedDimensions() {
        return this.recommendedDimensions;
    }
    // Get default dimension
    getDefaultDimension() {
        return this.defaultDimension;
    }
    // Validate dimension
    isValidDimension(model, dimension) {
        const info = this.models[model];
        if (!info)
            return false;
        return info.outputDimensions.includes(dimension);
    }
    // Get MTEB scores by dimension
    getMTEBScores() {
        return {
            2048: 68.16,
            1536: 68.17,
            768: 67.99,
            512: 67.55,
            256: 66.19,
            128: 63.31,
        };
    }
}
// Embedding Generator - Generates embeddings for text
export class EmbeddingGenerator {
    modelManager;
    constructor() {
        this.modelManager = new EmbeddingModelManager();
    }
    // Generate embedding for single text
    generateEmbedding(text, config) {
        const dimension = config.outputDimensionality || this.modelManager.getDefaultDimension();
        const taskType = config.taskType || 'SEMANTIC_SIMILARITY';
        // Simulate embedding generation
        const embedding = this.generateRandomEmbedding(dimension);
        return {
            text,
            embedding,
            dimension,
            taskType,
        };
    }
    // Generate embeddings for multiple texts
    generateEmbeddings(texts, config) {
        return texts.map(text => this.generateEmbedding(text, config));
    }
    // Generate random embedding (simulation)
    generateRandomEmbedding(dimension) {
        return Array.from({ length: dimension }, () => Math.random() * 2 - 1);
    }
    // Normalize embedding (L2 normalization)
    normalizeEmbedding(embedding) {
        const norm = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
        if (norm === 0)
            return embedding;
        return embedding.map(val => val / norm);
    }
    // Get model manager
    getModelManager() {
        return this.modelManager;
    }
}
// Similarity Calculator - Calculates semantic similarity between embeddings
export class SimilarityCalculator {
    // Calculate cosine similarity
    cosineSimilarity(embedding1, embedding2) {
        if (embedding1.length !== embedding2.length) {
            throw new Error('Embeddings must have same dimension');
        }
        let dotProduct = 0;
        let magnitude1 = 0;
        let magnitude2 = 0;
        for (let i = 0; i < embedding1.length; i++) {
            dotProduct += embedding1[i] * embedding2[i];
            magnitude1 += embedding1[i] * embedding1[i];
            magnitude2 += embedding2[i] * embedding2[i];
        }
        if (magnitude1 === 0 || magnitude2 === 0)
            return 0;
        return dotProduct / (Math.sqrt(magnitude1) * Math.sqrt(magnitude2));
    }
    // Calculate similarity between two texts (given embeddings)
    calculateSimilarity(text1, text2, embedding1, embedding2) {
        const similarity = this.cosineSimilarity(embedding1, embedding2);
        return {
            text1,
            text2,
            similarity,
            isRelevant: similarity > 0.5, // Threshold for relevance
        };
    }
    // Find most similar documents
    findMostSimilar(queryEmbedding, documentEmbeddings, topK = 5) {
        const similarities = documentEmbeddings.map(doc => ({
            text: doc.text || '',
            similarity: this.cosineSimilarity(queryEmbedding, doc.embedding),
        }));
        const results = similarities.sort((a, b) => b.similarity - a.similarity).slice(0, topK);
        return results.map(r => ({
            content: r.text || '',
            similarity: r.similarity,
        }));
    }
}
// RAG System - Retrieval-Augmented Generation system
export class RAGSystem {
    embeddingGenerator;
    similarityCalculator;
    documentStore = new Map();
    constructor() {
        this.embeddingGenerator = new EmbeddingGenerator();
        this.similarityCalculator = new SimilarityCalculator();
    }
    // Index documents
    indexDocuments(documents, config) {
        for (const doc of documents) {
            const embedding = this.embeddingGenerator.generateEmbedding(doc, config);
            if (embedding && embedding.embedding && embedding.embedding.length > 0) {
                this.indexDocument(doc, embedding.embedding, embedding.embedding.length);
            }
        }
    }
    // Index document
    indexDocument(doc, embedding, dimension) {
        this.documentStore.set(`doc_${this.documentStore.size}`, {
            text: doc,
            embedding,
        });
    }
    // Retrieve relevant documents
    retrieveDocuments(query, config, topK = 5) {
        const queryResult = this.embeddingGenerator.generateEmbedding(query, config);
        const documents = Array.from(this.documentStore.values());
        const retrievedDocs = this.similarityCalculator.findMostSimilar(queryResult.embedding, documents, topK);
        return {
            query,
            documents: documents.map(d => d.text),
            retrievedDocs,
            topK,
        };
    }
    // Get document count
    getDocumentCount() {
        return this.documentStore.size;
    }
    // Clear document store
    clearDocuments() {
        this.documentStore.clear();
    }
    // Get use cases
    getUseCases() {
        return {
            'Retrieval-Augmented Generation': [
                'Enhance generated text with relevant information',
                'Improve factual accuracy and coherence',
                'Ground responses in knowledge bases',
            ],
            'Information Retrieval': [
                'Search for semantically similar documents',
                'Find relevant articles or web pages',
                'Document discovery',
            ],
            'Search Reranking': [
                'Prioritize most relevant results',
                'Score results against query semantically',
                'Improve search ranking',
            ],
            'Anomaly Detection': [
                'Identify outliers in embeddings',
                'Detect unusual patterns',
                'Find hidden trends',
            ],
            'Classification': [
                'Categorize text automatically',
                'Sentiment analysis',
                'Spam detection',
            ],
            'Clustering': [
                'Group similar documents',
                'Organize content',
                'Market research',
            ],
        };
    }
}
// Embeddings and RAG Handler - Orchestrates all embedding and RAG operations
export class EmbeddingsRAGHandler {
    embeddingGenerator;
    similarityCalculator;
    ragSystem;
    constructor() {
        this.embeddingGenerator = new EmbeddingGenerator();
        this.similarityCalculator = new SimilarityCalculator();
        this.ragSystem = new RAGSystem();
    }
    // Generate embedding
    generateEmbedding(text, config) {
        return this.embeddingGenerator.generateEmbedding(text, config);
    }
    // Generate embeddings batch
    generateEmbeddings(texts, config) {
        return this.embeddingGenerator.generateEmbeddings(texts, config);
    }
    // Calculate similarity
    calculateSimilarity(text1, text2, embedding1, embedding2) {
        return this.similarityCalculator.calculateSimilarity(text1, text2, embedding1, embedding2);
    }
    // Index documents for RAG
    indexDocuments(documents, config) {
        this.ragSystem.indexDocuments(documents, config);
    }
    // Retrieve documents for RAG
    retrieveDocuments(query, config, topK) {
        return this.ragSystem.retrieveDocuments(query, config, topK);
    }
    // Get task types
    getTaskTypes() {
        return {
            SEMANTIC_SIMILARITY: 'Assess text similarity',
            CLASSIFICATION: 'Classify texts by labels',
            CLUSTERING: 'Cluster texts by similarity',
            RETRIEVAL_DOCUMENT: 'Optimize for document search',
            RETRIEVAL_QUERY: 'Optimize for search queries',
            CODE_RETRIEVAL_QUERY: 'Retrieve code by natural language',
            QUESTION_ANSWERING: 'Find documents answering questions',
            FACT_VERIFICATION: 'Retrieve evidence for fact-checking',
        };
    }
    // Get vector database recommendations
    getVectorDatabaseRecommendations() {
        return {
            'Google Cloud': 'BigQuery, AlloyDB, Cloud SQL',
            'ChromaDB': 'Open-source vector database',
            'Qdrant': 'Vector search engine',
            'Weaviate': 'Vector database platform',
            'Pinecone': 'Managed vector database',
        };
    }
    // Get comprehensive stats
    getComprehensiveStats() {
        return {
            models: this.embeddingGenerator.getModelManager().getModelInfo('gemini-embedding-001') || {},
            taskTypes: this.getTaskTypes(),
            useCases: this.ragSystem.getUseCases(),
            vectorDatabases: this.getVectorDatabaseRecommendations(),
            documentCount: this.ragSystem.getDocumentCount(),
        };
    }
}
// Export factory function
export function createEmbeddingsRAGHandler() {
    return new EmbeddingsRAGHandler();
}
