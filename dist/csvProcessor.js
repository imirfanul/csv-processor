"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CSVProcessor = void 0;
const fs_1 = __importDefault(require("fs"));
const csv_parser_1 = __importDefault(require("csv-parser"));
class CSVProcessor {
    constructor(config) {
        this.config = config;
    }
    async processCSV(chunkHandler) {
        let chunk = [];
        let rowCount = 0;
        return new Promise((resolve, reject) => {
            const readStream = fs_1.default
                .createReadStream(this.config.csvFilePath)
                .pipe((0, csv_parser_1.default)())
                .on("data", (row) => {
                chunk.push(row);
                if (chunk.length === this.config.chunkSize) {
                    readStream.pause(); // Pause reading
                    chunkHandler(chunk)
                        .then(() => {
                        chunk = [];
                        readStream.resume(); // Resume reading
                    })
                        .catch((error) => {
                        console.error("Error processing chunk:", error);
                    });
                }
                rowCount++;
            })
                .on("end", async () => {
                if (chunk.length > 0) {
                    await chunkHandler(chunk);
                }
                console.log(`CSV file successfully processed. Total rows: ${rowCount}`);
                resolve();
            })
                .on("error", (error) => {
                console.error("Error reading CSV file:", error);
                reject(error);
            });
        });
    }
}
exports.CSVProcessor = CSVProcessor;
