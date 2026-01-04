# Deployment Guide for LTL Weight/Volume Checker

## Quick Start (Local Development)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd test_copilot_website_maker
   ```

2. **Configure the application**
   ```bash
   cp config.example.js config.js
   # Edit config.js with your Firebase and Google Sheets credentials
   ```

3. **Start a local server**
   ```bash
   # Using Python 3
   python3 -m http.server 8080
   
   # Or using Node.js
   npx http-server -p 8080
   ```

4. **Open in browser**
   ```
   http://localhost:8080
   ```

## Firebase Deployment

### Step 1: Install Firebase CLI

```bash
npm install -g firebase-tools
```

### Step 2: Login to Firebase

```bash
firebase login
```

### Step 3: Initialize Firebase Project

```bash
firebase init
```

Select the following options:
- ✅ Hosting: Configure files for Firebase Hosting
- ✅ Realtime Database: Configure security rules

Configuration options:
- What do you want to use as your public directory? **.**
- Configure as a single-page app (rewrite all urls to /index.html)? **Yes**
- Set up automatic builds and deploys with GitHub? **No** (optional)
- File index.html already exists. Overwrite? **No**

### Step 4: Configure Firebase Settings

1. **Get Firebase Configuration**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project
   - Go to Project Settings > General
   - Scroll to "Your apps" section
   - Click on the Web app icon or "Add app"
   - Copy the `firebaseConfig` object

2. **Update config.js**
   ```javascript
   const firebaseConfig = {
       apiKey: "your-actual-api-key",
       authDomain: "your-project.firebaseapp.com",
       databaseURL: "https://your-project-default-rtdb.firebaseio.com",
       projectId: "your-project-id",
       storageBucket: "your-project-id.appspot.com",
       messagingSenderId: "your-sender-id",
       appId: "your-app-id"
   };
   ```

### Step 5: Enable Firebase Services

1. **Enable Authentication**
   - Go to Firebase Console > Authentication
   - Click "Get Started"
   - Enable "Anonymous" sign-in method

2. **Enable Realtime Database**
   - Go to Firebase Console > Realtime Database
   - Click "Create Database"
   - Choose location
   - Start in "test mode" (will be secured by database.rules.json)

3. **Deploy Database Rules**
   ```bash
   firebase deploy --only database
   ```

### Step 6: Deploy to Firebase Hosting

```bash
firebase deploy --only hosting
```

Your app will be live at: `https://your-project-id.firebaseapp.com`

## Google Sheets API Setup

### Step 1: Enable Google Sheets API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create a new one)
3. Navigate to "APIs & Services" > "Library"
4. Search for "Google Sheets API"
5. Click "Enable"

### Step 2: Create API Key

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy the API key
4. Click "Restrict Key" for security:
   - Under "Application restrictions", select "HTTP referrers"
   - Add your Firebase Hosting URL: `your-project-id.firebaseapp.com/*`
   - Under "API restrictions", select "Restrict key"
   - Choose "Google Sheets API"
5. Save the changes

### Step 3: Prepare Your Google Sheet

1. Create or open your Google Sheet
2. Ensure it has a sheet named `sku_to_variation` (or update SHEET_NAME in config.js)
3. Format your data in columns:
   - Column A: Parent SKU
   - Column B: Child SKU
   - Column C: Weight (in pounds)
   - Column D: Volume (in cubic feet)
   - Column E: Quantity
4. Share the spreadsheet:
   - Click "Share" button
   - Change to "Anyone with the link can view"
5. Copy the Spreadsheet ID from the URL:
   - URL format: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`

### Step 4: Update Configuration

Update `config.js`:
```javascript
const GOOGLE_SHEETS_API_KEY = "your-google-sheets-api-key";
const SPREADSHEET_ID = "your-spreadsheet-id";
const SHEET_NAME = "sku_to_variation";
```

## Configuration Options

### Thresholds

Adjust thresholds in `config.js` to match your business requirements:

```javascript
const THRESHOLDS = {
    maxWeightPerSKU: 1000,  // pounds
    maxVolumePerSKU: 100,   // cubic feet
    maxTotalWeight: 10000,  // pounds
    maxTotalVolume: 1000    // cubic feet
};
```

### Tolerance

The tolerance percentage (Formula F2) can be adjusted:

```javascript
const TOLERANCE_PERCENT = 0.05;  // 5% tolerance
```

This means:
- A threshold of 1000 lbs becomes 1050 lbs with 5% tolerance
- A threshold of 100 cu ft becomes 105 cu ft with 5% tolerance

## Security Considerations

1. **API Key Restrictions**
   - Always restrict your Google Sheets API key to specific domains
   - Never commit API keys to public repositories

2. **Firebase Database Rules**
   - The included `database.rules.json` requires authentication
   - Only authenticated users can read/write logs

3. **Sheet Permissions**
   - Keep your Google Sheet as "view only" for the public link
   - Don't include sensitive data in the sheet

## Troubleshooting

### "Firebase SDK not loaded"
- Check that you have internet connection
- Verify Firebase CDN URLs are accessible
- The app will work in offline mode with mock data

### "Google Sheets API is not configured"
- Verify your API key is correct in `config.js`
- Check that the API key is not restricted too heavily
- Ensure Google Sheets API is enabled in Google Cloud Console

### "No data found for LTL row"
- Verify the row number exists in your Google Sheet
- Check that the spreadsheet ID is correct
- Ensure the sheet name matches SHEET_NAME in config.js

### Authentication Issues
- Verify Anonymous authentication is enabled in Firebase Console
- Check browser console for detailed error messages

## Monitoring and Logs

### View User Activity

Access Firebase Console > Realtime Database to see:
- All LTL checks performed
- User IDs and timestamps
- Summary data for each check

### Browser Console

Open browser developer tools (F12) to see:
- API call status
- Calculation details
- Error messages

## Updating the Application

To update the deployed app:

1. Make changes to your local files
2. Test locally
3. Deploy updates:
   ```bash
   firebase deploy
   ```

## Cost Considerations

- **Firebase Hosting**: Free tier includes 10 GB storage, 360 MB/day transfer
- **Firebase Realtime Database**: Free tier includes 1 GB storage, 10 GB/month download
- **Firebase Authentication**: Free for anonymous auth
- **Google Sheets API**: Free for up to 100 requests per 100 seconds per user

For most use cases, the free tiers should be sufficient.
