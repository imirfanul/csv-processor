# CSV Processor

A Node.js package for processing large CSV files in chunks, designed for modular and flexible use with any database or data handling system.

## Installation

Install the package via npm:

```bash
npm install @imirfanul/csv-processor
```

## Usage

### Importing the Package

First, import the necessary classes from the package:

```typescript
import { CSVProcessor, CSVProcessorConfig, ChunkHandler } from '@imirfanul/csv-processor';
```

### Configuration

Configure the CSVProcessor with the desired chunk size and CSV file path:

```typescript
const csvProcessorConfig: CSVProcessorConfig = {
  chunkSize: 100000,
  csvFilePath: 'path/to/your/large_file.csv',
};

const csvProcessor = new CSVProcessor(csvProcessorConfig);
```

### Chunk Handler

Define a `chunkHandler` function that processes each chunk of data. This can be customized to perform any operation, such as inserting data into a database.

Example with PostgreSQL:

```typescript
import { Pool } from 'pg';

const dbConfig = {
  user: 'username',
  host: 'localhost',
  database: 'your_database',
  password: 'password',
  port: 5432,
};

const pool = new Pool(dbConfig);

const chunkHandler: ChunkHandler = async (chunk) => {
  const client = await pool.connect();
  try {
    const values = chunk.map(row => `(${Object.values(row).map(val => `'${val}'`).join(',')})`).join(',');
    const columns = Object.keys(chunk[0]).map(col => `"${col}"`).join(',');

    const query = `INSERT INTO your_table (${columns}) VALUES ${values}`;
    await client.query(query);
    console.log(`Inserted ${chunk.length} rows`);
  } catch (error) {
    console.error('Error inserting chunk:', error);
  } finally {
    client.release();
  }
};
```

### Processing the CSV

Call the `processCSV` method with the `chunkHandler`:

```typescript
csvProcessor.processCSV(chunkHandler).then(() => {
  console.log('CSV processing complete.');
}).catch(error => {
  console.error('Error during CSV processing:', error);
});
```

## Example Project

Here is a full example combining all the pieces together:

```typescript
import { CSVProcessor, CSVProcessorConfig, ChunkHandler } from 'your-package-name';
import { Pool } from 'pg';

const dbConfig = {
  user: 'username',
  host: 'localhost',
  database: 'your_database',
  password: 'password',
  port: 5432,
};

const pool = new Pool(dbConfig);

const csvProcessorConfig: CSVProcessorConfig = {
  chunkSize: 100000,
  csvFilePath: 'path/to/your/large_file.csv',
};

const csvProcessor = new CSVProcessor(csvProcessorConfig);

const chunkHandler: ChunkHandler = async (chunk) => {
  const client = await pool.connect();
  try {
    const values = chunk.map(row => `(${Object.values(row).map(val => `'${val}'`).join(',')})`).join(',');
    const columns = Object.keys(chunk[0]).map(col => `"${col}"`).join(',');

    const query = `INSERT INTO your_table (${columns}) VALUES ${values}`;
    await client.query(query);
    console.log(`Inserted ${chunk.length} rows`);
  } catch (error) {
    console.error('Error inserting chunk:', error);
  } finally {
    client.release();
  }
};

csvProcessor.processCSV(chunkHandler).then(() => {
  console.log('CSV processing complete.');
}).catch(error => {
  console.error('Error during CSV processing:', error);
});
```

## License

This package is licensed under the MIT License. See the [LICENSE](LICENSE) file for more information.
