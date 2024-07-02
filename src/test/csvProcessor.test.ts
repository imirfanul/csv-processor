import { expect } from "chai"
import { CSVProcessor, CSVProcessorConfig } from "../csvProcessor"
import * as fs from "fs"
import * as path from "path"

describe("CSVProcessor", () => {
	const testCSVFilePath = path.join(__dirname, "test.csv")

	before(() => {
		// Create a sample CSV file for testing
		const csvData = `id,name,age\n1,John Doe,30\n2,Jane Doe,25\n3,Jim Beam,35\n`
		fs.writeFileSync(testCSVFilePath, csvData)
	})

	after(() => {
		// Clean up the sample CSV file
		fs.unlinkSync(testCSVFilePath)
	})

	it("should process CSV in chunks", async () => {
		const config: CSVProcessorConfig = {
			chunkSize: 2,
			csvFilePath: testCSVFilePath
		}

		const csvProcessor = new CSVProcessor(config)

		const chunks: any[][] = []
		const chunkHandler = async (chunk: any[]) => {
			chunks.push(chunk)
			return Promise.resolve()
		}

		await csvProcessor.processCSV(chunkHandler)

		expect(chunks).to.have.length(2)
		expect(chunks[0]).to.have.length(2)
		expect(chunks[1]).to.have.length(1)
		expect(chunks[0][0]).to.deep.equal({
			id: "1",
			name: "John Doe",
			age: "30"
		})
		expect(chunks[0][1]).to.deep.equal({
			id: "2",
			name: "Jane Doe",
			age: "25"
		})
		expect(chunks[1][0]).to.deep.equal({
			id: "3",
			name: "Jim Beam",
			age: "35"
		})
	})

	it("should handle an error in chunk handler gracefully", async () => {
		const config: CSVProcessorConfig = {
			chunkSize: 2,
			csvFilePath: testCSVFilePath
		}

		const csvProcessor = new CSVProcessor(config)

		const error = new Error("Test error")
		const chunkHandler = async (chunk: any[]) => {
			if (chunk.length > 1) {
				return Promise.reject(error)
			}
			return Promise.resolve()
		}

		try {
			await csvProcessor.processCSV(chunkHandler)
		} catch (err) {
			expect(err).to.equal(error)
		}
	})
})
