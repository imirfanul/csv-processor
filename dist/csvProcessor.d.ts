export interface CSVProcessorConfig {
    chunkSize: number;
    csvFilePath: string;
}
export type ChunkHandler = (chunk: any[]) => Promise<void>;
export declare class CSVProcessor {
    private config;
    constructor(config: CSVProcessorConfig);
    processCSV(chunkHandler: ChunkHandler): Promise<void>;
}
