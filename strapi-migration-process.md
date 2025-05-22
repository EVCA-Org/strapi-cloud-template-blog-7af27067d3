# Strapi Cloud Content Type Migration Process

This document outlines the process we followed to migrate content types from CSV files to a Strapi Cloud project, with the goal of establishing a repeatable workflow for future updates.

## Overview

We successfully implemented a workflow that allows for creating and updating content types in a Strapi Cloud project by:

1. Cloning the GitHub repository connected to Strapi Cloud
2. Creating content types directly by modifying the project files
3. Creating a script to import data from CSV files
4. Committing and pushing changes to GitHub
5. Deploying to Strapi Cloud (happens automatically when GitHub is connected)

## Content Types Created

Based on the CSV files provided, we created the following content types:

### 1. Blog
- **Fields**:
  - title (string, required)
  - slug (uid, required)
  - date (datetime)
  - category (string)
  - tag (string)
  - thumbnail (media)
  - featured (boolean)
  - author (relation to Author)
  - blurb (text)
  - content (richtext, required)

### 2. Author (Updated)
- **Fields**:
  - title (string, required)
  - slug (uid, required)
  - image (media)
  - content (richtext)
  - blogs (relation to Blog)
  - articles (relation to Article)

### 3. EVCA Team
- **Fields**:
  - name (string, required)
  - slug (uid, required)
  - headshot (media)
  - chapter (string)
  - x (string)
  - linkedin (string)
  - firm_url (string)
  - logo_url (string)
  - logo (media)
  - type (string)
  - firm (string)
  - bio (richtext)

### 4. Chapter Image
- **Fields**:
  - title (string, required)
  - slug (uid, required)
  - image (media)
  - type (enumeration: Vertical, City)
  - content (richtext)

### 5. Thesis Brief
- **Fields**:
  - title (string, required)
  - slug (uid, required)
  - cover_image_url (string)
  - investor_headshot_url (string)
  - publish_date (datetime)
  - type (string)
  - investor_name (string)
  - firm (string)
  - host_url (string)
  - featured (integer)
  - content (richtext)
  - cover_image (media)
  - investor_headshot (media)

## Step-by-Step Process

### 1. Clone the GitHub Repository

```bash
git clone https://github.com/EVCA-Org/strapi-cloud-template-blog-7af27067d3
cd strapi-cloud-template-blog-7af27067d3
```

### 2. Create Directory Structure for Content Types

For each content type, we created the necessary directory structure:

```bash
mkdir -p src/api/[content-type]/content-types/[content-type]
mkdir -p src/api/[content-type]/controllers
mkdir -p src/api/[content-type]/routes
mkdir -p src/api/[content-type]/services
```

### 3. Create Schema Files

For each content type, we created:

- `schema.json` file in `src/api/[content-type]/content-types/[content-type]/`
- `index.js` file in `src/api/[content-type]/content-types/[content-type]/`
- `index.js` file in `src/api/[content-type]/content-types/`
- Controller, service, and route files

#### Example schema.json

```json
{
  "kind": "collectionType",
  "collectionName": "blogs",
  "info": {
    "singularName": "blog",
    "pluralName": "blogs",
    "displayName": "Blog",
    "description": "Blog posts"
  },
  "options": {
    "draftAndPublish": true
  },
  "pluginOptions": {},
  "attributes": {
    "title": {
      "type": "string",
      "required": true
    },
    "slug": {
      "type": "uid",
      "targetField": "title",
      "required": true
    },
    // Additional fields...
  }
}
```

### 4. Create Data Import Script

We created a script to import data from CSV files into Strapi:

1. Install required dependencies:
```bash
npm install csv-parse axios --save-dev
```

2. Create the import script:
```bash
mkdir -p scripts/import
# Create import-csv.js file
```

The script (`scripts/import/import-csv.js`) reads CSV files and creates entries in Strapi using the API. It maps CSV columns to Strapi fields based on a configuration object.

### 5. Commit and Push Changes

```bash
git add .
git commit -m "Add content types based on CSV structure and import script"
git push origin main
```

### 6. Deploy and Import Data

Once the changes are pushed to GitHub, Strapi Cloud will automatically deploy the updated content types if automatic deployments are enabled. Otherwise, a manual deployment can be triggered from the Strapi Cloud dashboard.

After deployment, you can import the data:

1. Generate an API token in Strapi (Settings > API Tokens)
2. Run the import script:
```bash
export STRAPI_TOKEN=your_api_token_here
export STRAPI_URL=your_strapi_cloud_url
node scripts/import/import-csv.js
```

## Benefits of This Approach

1. **No Local Server Required for Development**: This approach allows for creating and updating content types without needing to run the Strapi server locally or creating an admin account for development.

2. **Version Control**: All changes are tracked in Git, providing a history of content type modifications.

3. **Collaborative Workflow**: Multiple team members can work on different content types and merge their changes.

4. **Automated Deployments**: When connected to GitHub, Strapi Cloud can automatically deploy changes when pushed to the main branch.

5. **Scriptable Data Import**: The import script allows for automated data migration from CSV files to Strapi.

## Future Improvements

1. **Script Automation**: Enhance scripts to automatically generate content types from CSV files.

2. **Media Import**: Enhance the import script to properly download and upload media files instead of just storing URLs.

3. **CI/CD Pipeline**: Set up GitHub Actions to validate content type changes and run data imports automatically.

## Conclusion

This process provides a streamlined approach to creating and updating content types in Strapi Cloud based on CSV data. By working directly with the schema files and leveraging Git for version control, we've established a reliable workflow that can be repeated for future updates. The addition of an import script further automates the process by allowing data to be migrated from CSV files to Strapi.
