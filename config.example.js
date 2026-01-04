// Example Firebase configuration
// Copy this file to config.js and update with your actual values

const firebaseConfig = {
    apiKey: "AIzaSyExample123456789abcdefghijk",
    authDomain: "your-project.firebaseapp.com",
    databaseURL: "https://your-project-default-rtdb.firebaseio.com",
    projectId: "your-project-id",
    storageBucket: "your-project-id.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef1234567890"
};

// Google Sheets configuration
// Get your API key from Google Cloud Console: https://console.cloud.google.com/
// Get the Spreadsheet ID from your Google Sheets URL:
// https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_HERE/edit
const GOOGLE_SHEETS_API_KEY = "AIzaSyExample_GoogleSheetsApiKey";
const SPREADSHEET_ID = "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms";
const SHEET_NAME = "sku_to_variation";

// Thresholds configuration
// These values should match the logic in check_that_draft_folders_are_good
const THRESHOLDS = {
    maxWeightPerSKU: 1000,  // Maximum weight per parent SKU in pounds
    maxVolumePerSKU: 100,   // Maximum volume per parent SKU in cubic feet
    maxTotalWeight: 10000,  // Maximum total weight for entire LTL in pounds
    maxTotalVolume: 1000    // Maximum total volume for entire LTL in cubic feet
};

// Tolerance formula F2
// The tolerance percentage applied to all thresholds
// Example: 0.05 = 5% tolerance, so a 1000 lb threshold becomes 1050 lb
const TOLERANCE_PERCENT = 0.05;
