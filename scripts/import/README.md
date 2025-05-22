# CSV Data Import for Strapi

This directory contains scripts to import data from CSV files into Strapi.

## Import CSV Script

The `import-csv.js` script imports data from CSV files into Strapi content types.

### Prerequisites

- Strapi server is running
- CSV files are available in the specified directory
- You have installed the required dependencies: `csv-parse` and `axios`

### Configuration

The script has the following configuration options that can be set as environment variables:

- `CSV_DIR`: Directory containing the CSV files (default: `/Users/danieljose/Code/strapi-migration-tools/csv-imports`)
- `STRAPI_URL`: URL of the Strapi server (default: `http://localhost:1337`)
- `STRAPI_TOKEN`: API token for authentication with Strapi (required for production)

### Usage

1. Generate an API token in Strapi:
   - Go to Settings > API Tokens
   - Create a new full-access token
   - Copy the generated token

2. Run the script with the token:

```bash
# Unix/Mac
export STRAPI_TOKEN=your_api_token_here
node scripts/import/import-csv.js

# Windows (CMD)
set STRAPI_TOKEN=your_api_token_here
node scripts/import/import-csv.js

# Windows (PowerShell)
$env:STRAPI_TOKEN="your_api_token_here"
node scripts/import/import-csv.js
```

### Supported CSV Files

The script is configured to import the following CSV files:

- `Blog.csv` → `blogs` content type
- `Authors.csv` → `authors` content type
- `EVCA Team.csv` → `evca-teams` content type
- `Chapter Images.csv` → `chapter-images` content type
- `Thesis Briefs.csv` → `thesis-briefs` content type

### Field Mapping

The script maps CSV columns to Strapi fields according to the configuration in the `importConfig` object.

### Media Files

Currently, the script only stores URLs for media fields. To properly import media files, you would need to:

1. Download the media files from the URLs
2. Upload them to Strapi using the upload API
3. Link the uploaded media to the corresponding entries

This functionality could be added in a future version of the script.

## Troubleshooting

- If you see authentication errors, make sure your `STRAPI_TOKEN` is valid and has sufficient permissions
- If records fail to import, check the error messages for specific issues with the data
