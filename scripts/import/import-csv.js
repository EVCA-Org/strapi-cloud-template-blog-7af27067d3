'use strict';

/**
 * Import data from CSV files into Strapi
 * 
 * This script reads CSV files and creates entries in Strapi using the API.
 * 
 * Usage:
 * - Start your Strapi server
 * - Run: node scripts/import/import-csv.js
 */

const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const axios = require('axios');

// Configuration
const CSV_DIR = process.env.CSV_DIR || '/Users/danieljose/Code/strapi-migration-tools/csv-imports';
const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const STRAPI_TOKEN = process.env.STRAPI_TOKEN; // API token needs to be set as environment variable

// Import mapping configuration
const importConfig = {
  'Authors.csv': {
    contentType: 'authors',
    fieldMap: {
      'Slug': 'slug',
      'Title': 'title',
      'Image': 'image',
      'Content': 'content'
    }
  },
  'EVCA Team.csv': {
    contentType: 'evca-teams',
    fieldMap: {
      'Slug': 'slug',
      'Name': 'name',
      'Headshot': 'headshot',
      'Chapter': 'chapter',
      'X': 'x',
      'LinkedIn': 'linkedin',
      'Firm URL': 'firm_url',
      'Logo URL': 'logo_url',
      'Logo': 'logo',
      'Type': 'type',
      'Firm': 'firm',
      'Bio': 'bio'
    }
  },
  'Chapter Images.csv': {
    contentType: 'chapter-images',
    fieldMap: {
      'Slug': 'slug',
      'Title': 'title',
      'Image': 'image',
      'Type': 'type',
      'Content': 'content'
    }
  },
  'Thesis Briefs.csv': {
    contentType: 'thesis-briefs',
    fieldMap: {
      'Slug': 'slug',
      'Title': 'title',
      'Cover Image URL': 'cover_image_url',
      'Investor headshot URL': 'investor_headshot_url',
      'Publish Date': 'publish_date',
      'Type': 'type',
      'Investor Name': 'investor_name',
      'Firm': 'firm',
      'Host URL': 'host_url',
      'Featured #': 'featured',
      'Content': 'content'
    }
  },
  'Blog.csv': {
    contentType: 'blogs',
    fieldMap: {
      'Slug': 'slug',
      'Title': 'title',
      'Date': 'date',
      'Categry': 'category', // Typo in original CSV
      'Tag': 'tag',
      'Thumbnail': 'thumbnail',
      'Featured': 'featured', // Convert string to boolean in processRecord function
      'Author': 'author', // Will be handled in processRecord function
      'Blurb': 'blurb',
      'Content': 'content'
    }
  }
};

// Create Strapi API client
const strapi = axios.create({
  baseURL: STRAPI_URL,
  headers: STRAPI_TOKEN ? {
    'Authorization': `Bearer ${STRAPI_TOKEN}`
  } : {}
});

/**
 * Read and parse a CSV file
 * @param {string} filePath - Path to the CSV file
 * @returns {Array} - Array of objects representing rows in the CSV
 */
function readCSV(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return parse(content, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return [];
  }
}

/**
 * Process a record before sending to Strapi
 * @param {Object} record - CSV record
 * @param {Object} fieldMap - Field mapping configuration
 * @param {string} contentType - Content type name
 * @returns {Object} - Processed record
 */
async function processRecord(record, fieldMap, contentType) {
  const data = {};

  // Map fields from CSV to Strapi fields
  for (const [csvField, strapiField] of Object.entries(fieldMap)) {
    if (!strapiField) continue; // Skip fields that are not mapped
    
    const value = record[csvField];
    
    // Skip null or undefined values
    if (value === null || value === undefined || value === '') {
      continue;
    }
    
    // Special case for Featured field in Blog
    if (csvField === 'Featured' && contentType === 'blogs') {
      data[strapiField] = value === 'true';
      continue;
    }
    
    // Special case for Author relation in Blog
    if (csvField === 'Author' && contentType === 'blogs' && value) {
      try {
        const response = await strapi.get(`/api/authors?filters[slug]=${value}`);
        if (response.data.data && response.data.data.length > 0) {
          data[strapiField] = { connect: [response.data.data[0].id] };
        }
      } catch (error) {
        console.error(`Error looking up author: ${value}`, error.message);
      }
      continue;
    }
    
    data[strapiField] = value;
  }
  
  return data;
}

/**
 * Import data from a CSV file into Strapi
 * @param {string} fileName - Name of the CSV file
 */
async function importCSV(fileName) {
  if (!importConfig[fileName]) {
    console.warn(`No import configuration found for ${fileName}, skipping...`);
    return;
  }

  const filePath = path.join(CSV_DIR, fileName);
  console.log(`Importing data from ${filePath}...`);

  const records = readCSV(filePath);
  if (!records.length) {
    console.warn(`No records found in ${fileName}, skipping...`);
    return;
  }

  console.log(`Found ${records.length} records in ${fileName}`);

  const { contentType, fieldMap } = importConfig[fileName];
  let successCount = 0;

  for (const [index, record] of records.entries()) {
    try {
      // Process record
      const data = await processRecord(record, fieldMap, contentType);
      
      // Create the entry in Strapi
      const response = await strapi.post(`/api/${contentType}`, { data });
      
      console.log(`Successfully imported record ${index + 1}/${records.length} into ${contentType}`);
      successCount++;
    } catch (error) {
      console.error(`Error importing record ${index + 1}/${records.length} from ${fileName}:`, error.message);
      if (error.response && error.response.data) {
        console.error('Response data:', JSON.stringify(error.response.data, null, 2));
      }
    }
  }

  console.log(`Imported ${successCount}/${records.length} records from ${fileName} into ${contentType}`);
}

/**
 * Main function to import all CSV files
 */
async function importAllCSVs() {
  if (!STRAPI_TOKEN) {
    console.warn('No STRAPI_TOKEN provided. Authentication might fail when creating entries.');
  }

  try {
    // Check if CSV directory exists
    if (!fs.existsSync(CSV_DIR)) {
      console.error(`CSV directory not found: ${CSV_DIR}`);
      return;
    }

    // Import each CSV file based on the importConfig
    // The order matters here - we need to import authors before blogs to establish the relation
    for (const fileName of Object.keys(importConfig)) {
      const filePath = path.join(CSV_DIR, fileName);
      
      if (fs.existsSync(filePath)) {
        await importCSV(fileName);
      } else {
        console.warn(`File not found: ${filePath}, skipping...`);
      }
    }

    console.log('Import completed');
  } catch (error) {
    console.error('Error during import:', error);
  }
}

// Run the import
importAllCSVs().catch(console.error);
