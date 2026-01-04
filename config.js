// Firebase configuration
// Replace these values with your actual Firebase project configuration
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT_ID.firebaseio.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Google Sheets configuration
// Replace with your actual Google Sheets API key and spreadsheet ID
const GOOGLE_SHEETS_API_KEY = "YOUR_GOOGLE_SHEETS_API_KEY";
const SPREADSHEET_ID = "YOUR_SPREADSHEET_ID";
const SHEET_NAME = "sku_to_variation";

// Thresholds configuration (based on check_that_draft_folders_are_good logic)
const THRESHOLDS = {
    maxWeightPerSKU: 1000, // pounds
    maxVolumePerSKU: 100,  // cubic feet
    maxTotalWeight: 10000, // pounds for entire LTL
    maxTotalVolume: 1000   // cubic feet for entire LTL
};

// Tolerance formula F2: Tolerance percentage
const TOLERANCE_PERCENT = 0.05; // 5% tolerance
