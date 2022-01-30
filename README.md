# PropertyGrubber
Site specific web scrapper tool to extract data off of a real estate properties website.

## Usage
`node index.js [batchID] [batchSourceFile] [batchSize]`

- Batch ID: How the data will be identified, in date format: `YYYY-MM-DD`
- Batch Source File: Path to the source file in json format.
- Batch Size: Number of records to process. Optional.

### Example
For a source json file called `source-file.json`

Fetch all records:
`node index.js 2022-02-01 ./source-file.json`

Fetch 10 records:
`node index.js 2022-02-01 ./source-file.json 10`
