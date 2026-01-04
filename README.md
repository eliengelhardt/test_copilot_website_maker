# LTL Weight/Volume Checker - Firebase Web App

A Firebase web application that allows workers to enter an LTL (Less Than Truckload) row number, reads corresponding Google Sheets sku_to_variation data, calculates total weight and volume per parent SKU, and validates against configurable thresholds.

## Features

- **LTL Row Lookup**: Enter an LTL row number to fetch data from Google Sheets
- **Weight/Volume Calculation**: Automatically calculates totals per parent SKU and overall
- **Threshold Validation**: Checks against configurable thresholds with tolerance (Formula F2)
- **Multi-User Support**: Firebase Authentication enables multiple users to access the app simultaneously
- **Real-Time Tracking**: All checks are logged to Firebase Realtime Database
- **User-Friendly Interface**: Modern, responsive design with clear visual feedback
- **Google Sheets Integration**: Reads data directly from Google Sheets API
- **Warnings**: Alerts users if spreadsheets aren't converted to Google Sheets format

## Setup Instructions

### Prerequisites

- Node.js and npm installed
- Firebase CLI installed (`npm install -g firebase-tools`)
- A Google Cloud project with Google Sheets API enabled
- A Firebase project

### 1. Firebase Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Firebase Authentication (Anonymous sign-in)
3. Enable Firebase Realtime Database
4. Get your Firebase configuration from Project Settings

### 2. Google Sheets API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable Google Sheets API for your project
3. Create an API key (restrict it to Google Sheets API)
4. Prepare your Google Sheet with `sku_to_variation` data in this format:
   - Column A: Parent SKU
   - Column B: Child SKU  
   - Column C: Weight (lbs)
   - Column D: Volume (cu ft)
   - Column E: Quantity
5. Share the spreadsheet (at least view access) and note the Spreadsheet ID

### 3. Configuration

Edit `config.js` and replace the placeholder values:

```javascript
const firebaseConfig = {
    apiKey: "your-api-key",
    authDomain: "your-project.firebaseapp.com",
    databaseURL: "https://your-project.firebaseio.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "your-sender-id",
    appId: "your-app-id"
};

const GOOGLE_SHEETS_API_KEY = "your-google-sheets-api-key";
const SPREADSHEET_ID = "your-spreadsheet-id";
```

Adjust thresholds if needed:

```javascript
const THRESHOLDS = {
    maxWeightPerSKU: 1000,  // pounds
    maxVolumePerSKU: 100,   // cubic feet
    maxTotalWeight: 10000,  // pounds
    maxTotalVolume: 1000    // cubic feet
};

const TOLERANCE_PERCENT = 0.05; // 5% tolerance (Formula F2)
```

### 4. Deployment

1. Login to Firebase:
   ```bash
   firebase login
   ```

2. Initialize Firebase in your project directory:
   ```bash
   firebase init
   ```
   - Select Hosting and Database
   - Choose your Firebase project
   - Use current directory as public directory
   - Configure as single-page app: Yes

3. Deploy to Firebase:
   ```bash
   firebase deploy
   ```

4. Access your app at the provided Firebase Hosting URL

## Local Development

To test locally:

1. Start a local server:
   ```bash
   firebase serve
   ```
   or use any HTTP server:
   ```bash
   python -m http.server 8000
   ```

2. Open `http://localhost:8000` in your browser

## Usage

1. Open the web app in your browser
2. Enter an LTL row number (positive integer)
3. Click "Check LTL" or press Enter
4. View the breakdown of weights and volumes per parent SKU
5. Review the validation status against thresholds
6. All checks are automatically logged for tracking

## Architecture

- **Frontend**: Pure HTML, CSS, and JavaScript (no build step required)
- **Authentication**: Firebase Anonymous Authentication for multi-user support
- **Database**: Firebase Realtime Database for logging user activities
- **Data Source**: Google Sheets API for sku_to_variation data
- **Hosting**: Firebase Hosting for deployment

## Validation Logic

The app validates against thresholds similar to `check_that_draft_folders_are_good`:

1. **Total Weight**: Sum of all items must be ≤ maxTotalWeight
2. **Total Volume**: Sum of all items must be ≤ maxTotalVolume  
3. **Per-SKU Weight**: Each parent SKU weight must be ≤ maxWeightPerSKU
4. **Per-SKU Volume**: Each parent SKU volume must be ≤ maxVolumePerSKU

**Tolerance (Formula F2)**: All thresholds apply a tolerance percentage (default 5%), meaning the actual limit is `threshold × (1 + tolerance)`.

## Security

- Firebase Database rules ensure only authenticated users can read/write
- Google Sheets API key should be restricted to your domain
- All user actions are logged with timestamp and user ID

## Troubleshooting

**"Google Sheets API is not configured"**: The app will use mock data for demonstration. Configure the API key and spreadsheet ID in `config.js`.

**"Warning: The spreadsheet may not be converted to Google Sheets format"**: Ensure your spreadsheet is a native Google Sheet (not just uploaded Excel/CSV).

**Authentication issues**: Check that Firebase Authentication is enabled in your Firebase Console.

## License

MIT