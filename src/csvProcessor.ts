import fs from "fs"
import csv from "csv-parser"

export interface CSVProcessorConfig {
	chunkSize: number
	csvFilePath: string
}

export type ChunkHandler = (chunk: any[]) => Promise<void>

export class CSVProcessor {
	private config: CSVProcessorConfig

	constructor(config: CSVProcessorConfig) {
		this.config = config
	}

	async processCSV(chunkHandler: ChunkHandler): Promise<void> {
		let chunk: any[] = []
		let rowCount = 0

		return new Promise<void>((resolve, reject) => {
			const readStream = fs
				.createReadStream(this.config.csvFilePath)
				.pipe(csv())
				.on("data", (row) => {
					chunk.push(row)
					if (chunk.length === this.config.chunkSize) {
						readStream.pause() // Pause reading
						chunkHandler(chunk)
							.then(() => {
								chunk = []
								readStream.resume() // Resume reading
							})
							.catch((error) => {
								console.error("Error processing chunk:", error)
							})
					}
					rowCount++
				})
				.on("end", async () => {
					if (chunk.length > 0) {
						await chunkHandler(chunk)
					}
					console.log(
						`CSV file successfully processed. Total rows: ${rowCount}`
					)
					resolve()
				})
				.on("error", (error) => {
					console.error("Error reading CSV file:", error)
					reject(error)
				})
		})
	}
}
