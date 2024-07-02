"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const csvProcessor_1 = require("../csvProcessor");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
describe("CSVProcessor", () => {
    const testCSVFilePath = path.join(__dirname, "test.csv");
    before(() => {
        // Create a sample CSV file for testing
        const csvData = `id,name,age\n1,John Doe,30\n2,Jane Doe,25\n3,Jim Beam,35\n`;
        fs.writeFileSync(testCSVFilePath, csvData);
    });
    after(() => {
        // Clean up the sample CSV file
        fs.unlinkSync(testCSVFilePath);
    });
    it("should process CSV in chunks", async () => {
        const config = {
            chunkSize: 2,
            csvFilePath: testCSVFilePath
        };
        const csvProcessor = new csvProcessor_1.CSVProcessor(config);
        const chunks = [];
        const chunkHandler = async (chunk) => {
            chunks.push(chunk);
            return Promise.resolve();
        };
        await csvProcessor.processCSV(chunkHandler);
        (0, chai_1.expect)(chunks).to.have.length(2);
        (0, chai_1.expect)(chunks[0]).to.have.length(2);
        (0, chai_1.expect)(chunks[1]).to.have.length(1);
        (0, chai_1.expect)(chunks[0][0]).to.deep.equal({
            id: "1",
            name: "John Doe",
            age: "30"
        });
        (0, chai_1.expect)(chunks[0][1]).to.deep.equal({
            id: "2",
            name: "Jane Doe",
            age: "25"
        });
        (0, chai_1.expect)(chunks[1][0]).to.deep.equal({
            id: "3",
            name: "Jim Beam",
            age: "35"
        });
    });
    it("should handle an error in chunk handler gracefully", async () => {
        const config = {
            chunkSize: 2,
            csvFilePath: testCSVFilePath
        };
        const csvProcessor = new csvProcessor_1.CSVProcessor(config);
        const error = new Error("Test error");
        const chunkHandler = async (chunk) => {
            if (chunk.length > 1) {
                return Promise.reject(error);
            }
            return Promise.resolve();
        };
        try {
            await csvProcessor.processCSV(chunkHandler);
        }
        catch (err) {
            (0, chai_1.expect)(err).to.equal(error);
        }
    });
});
