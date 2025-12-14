export interface EmbeddingConfig {
    model: string;
    taskType?: TaskType;
    outputDimensionality?: number;
}
export interface EmbeddingResult {
    text: string;
    embedding: number[];
    dimension: number;
    taskType: TaskType;
}
export interface SimilarityResult {
    text1: string;
    text2: string;
    similarity: number;
    isRelevant: boolean;
}
export interface RAGContext {
    query: string;
    documents: string[];
    retrievedDocs: Array<{
        content: string;
        similarity: number;
    }>;
    topK: number;
}
export type TaskType = 'SEMANTIC_SIMILARITY' | 'CLASSIFICATION' | 'CLUSTERING' | 'RETRIEVAL_DOCUMENT' | 'RETRIEVAL_QUERY' | 'CODE_RETRIEVAL_QUERY' | 'QUESTION_ANSWERING' | 'FACT_VERIFICATION';
export declare class EmbeddingModelManager {
    private models;
    private recommendedDimensions;
    private defaultDimension;
    getModelInfo(model: string): {
        inputLimit: number;
        outputDimensions: number[];
    } | null;
    getRecommendedDimensions(): number[];
    getDefaultDimension(): number;
    isValidDimension(model: string, dimension: number): boolean;
    getMTEBScores(): Record<number, number>;
}
export declare class EmbeddingGenerator {
    private modelManager;
    constructor();
    generateEmbedding(text: string, config: EmbeddingConfig): EmbeddingResult;
    generateEmbeddings(texts: string[], config: EmbeddingConfig): EmbeddingResult[];
    private generateRandomEmbedding;
    normalizeEmbedding(embedding: number[]): number[];
    getModelManager(): EmbeddingModelManager;
}
export declare class SimilarityCalculator {
    cosineSimilarity(embedding1: number[], embedding2: number[]): number;
    calculateSimilarity(text1: string, text2: string, embedding1: number[], embedding2: number[]): SimilarityResult;
    findMostSimilar(queryEmbedding: number[], documentEmbeddings: Array<{
        text: string;
        embedding: number[];
    }>, topK?: number): Array<{
        text: string;
        similarity: number;
    }>;
}
export declare class RAGSystem {
    private embeddingGenerator;
    private similarityCalculator;
    private documentStore;
    constructor();
    indexDocuments(documents: string[], config: EmbeddingConfig): void;
    indexDocument(doc: string, embedding: number[], dimension: number): void;
    retrieveDocuments(query: string, config: EmbeddingConfig, topK?: number): RAGContext;
    getDocumentCount(): number;
    clearDocuments(): void;
    getUseCases(): Record<string, string[]>;
}
export declare class EmbeddingsRAGHandler {
    private embeddingGenerator;
    private similarityCalculator;
    private ragSystem;
    constructor();
    generateEmbedding(text: string, config: EmbeddingConfig): EmbeddingResult;
    generateEmbeddings(texts: string[], config: EmbeddingConfig): EmbeddingResult[];
    calculateSimilarity(text1: string, text2: string, embedding1: number[], embedding2: number[]): SimilarityResult;
    indexDocuments(documents: string[], config: EmbeddingConfig): void;
    retrieveDocuments(query: string, config: EmbeddingConfig, topK?: number): RAGContext;
    getTaskTypes(): Record<TaskType, string>;
    getVectorDatabaseRecommendations(): Record<string, string>;
    getComprehensiveStats(): {
        models: Record<string, unknown>;
        taskTypes: Record<TaskType, string>;
        useCases: Record<string, string[]>;
        vectorDatabases: Record<string, string>;
        documentCount: number;
    };
}
export declare function createEmbeddingsRAGHandler(): EmbeddingsRAGHandler;
