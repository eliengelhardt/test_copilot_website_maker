// Current user
let currentUser = null;

// Initialize Firebase (with error handling)
let auth = null;
let database = null;

try {
    if (typeof firebase !== 'undefined') {
        firebase.initializeApp(firebaseConfig);
        auth = firebase.auth();
        database = firebase.database();
    } else {
        console.warn('Firebase SDK not loaded. Running in offline mode with mock data.');
    }
} catch (error) {
    console.error('Firebase initialization error:', error);
    console.warn('Running in offline mode with mock data.');
}

// Initialize authentication
if (auth) {
    auth.onAuthStateChanged((user) => {
        if (user) {
            currentUser = user;
            const userInfoDiv = document.getElementById('user-info');
            userInfoDiv.innerHTML = 'Logged in as: ';
            
            const emailSpan = document.createElement('span');
            emailSpan.textContent = user.email || 'Anonymous';
            userInfoDiv.appendChild(emailSpan);
            
            const signOutBtn = document.createElement('button');
            signOutBtn.textContent = 'Sign Out';
            signOutBtn.className = 'sign-out-btn';
            signOutBtn.onclick = signOut;
            userInfoDiv.appendChild(signOutBtn);
        } else {
            // Sign in anonymously for multi-user access
            auth.signInAnonymously().catch((error) => {
                console.error('Authentication error:', error);
                showError('Authentication failed. Please refresh the page.');
            });
        }
    });
} else {
    // Offline mode
    document.getElementById('user-info').textContent = 'Offline mode (Firebase not configured)';
}

function signOut() {
    if (auth) {
        auth.signOut();
    }
    location.reload();
}

// Main function to check LTL
async function checkLTL() {
    const ltlRowInput = document.getElementById('ltl-row');
    const ltlRow = parseInt(ltlRowInput.value);
    
    if (!ltlRow || ltlRow < 1) {
        showError('Please enter a valid LTL row number (must be >= 1)');
        return;
    }

    // Clear previous results
    clearResults();
    
    // Show loading
    document.getElementById('loading').style.display = 'block';
    document.getElementById('results-section').style.display = 'none';

    try {
        // Fetch data from Google Sheets
        const sheetData = await fetchGoogleSheetData(ltlRow);
        
        if (!sheetData || sheetData.length === 0) {
            showError(`No data found for LTL row ${ltlRow}`);
            return;
        }

        // Calculate weight and volume per parent SKU
        const calculations = calculateWeightVolume(sheetData);
        
        // Display results
        displayResults(calculations, ltlRow);
        
        // Log to Firebase for multi-user tracking
        logToFirebase(ltlRow, calculations);
        
    } catch (error) {
        console.error('Error:', error);
        showError(`Error processing LTL row ${ltlRow}: ${error.message}`);
    } finally {
        document.getElementById('loading').style.display = 'none';
    }
}

// Fetch data from Google Sheets
async function fetchGoogleSheetData(ltlRow) {
    try {
        // Check if Google Sheets API is properly configured
        if (!GOOGLE_SHEETS_API_KEY || 
            GOOGLE_SHEETS_API_KEY.startsWith('YOUR_') || 
            GOOGLE_SHEETS_API_KEY.length < 20) {
            showWarning('Google Sheets API is not configured. Using mock data for demonstration.');
            return getMockData(ltlRow);
        }

        const range = `${SHEET_NAME}!A${ltlRow}:Z${ltlRow}`;
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${range}?key=${GOOGLE_SHEETS_API_KEY}`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            // Check if sheet is not a Google Sheet
            if (response.status === 400) {
                showWarning('Warning: The spreadsheet may not be converted to Google Sheets format. Please ensure the sheet is a Google Sheet.');
            }
            throw new Error(`Google Sheets API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.values || data.values.length === 0) {
            return null;
        }
        
        // Parse the row data into structured format
        return parseSheetRow(data.values[0]);
        
    } catch (error) {
        console.error('Error fetching Google Sheets data:', error);
        throw error;
    }
}

// Parse sheet row into structured data
function parseSheetRow(row) {
    // Expected format: [Parent SKU, Child SKU, Weight, Volume, Quantity, ...]
    // This is a sample parser - adjust based on actual sheet structure
    const items = [];
    
    // Assuming columns: A=Parent SKU, B=Child SKU, C=Weight, D=Volume, E=Quantity
    if (row.length >= 5) {
        const parentSKU = row[0];
        const childSKU = row[1];
        const weight = parseFloat(row[2]) || 0;
        const volume = parseFloat(row[3]) || 0;
        const quantity = parseInt(row[4]) || 1;
        
        items.push({
            parentSKU,
            childSKU,
            weight,
            volume,
            quantity
        });
    }
    
    return items;
}

// Calculate weight and volume per parent SKU
function calculateWeightVolume(sheetData) {
    const parentSKUs = {};
    
    sheetData.forEach(item => {
        const parent = item.parentSKU;
        
        if (!parentSKUs[parent]) {
            parentSKUs[parent] = {
                totalWeight: 0,
                totalVolume: 0,
                items: []
            };
        }
        
        const itemWeight = item.weight * item.quantity;
        const itemVolume = item.volume * item.quantity;
        
        parentSKUs[parent].totalWeight += itemWeight;
        parentSKUs[parent].totalVolume += itemVolume;
        parentSKUs[parent].items.push({
            ...item,
            calculatedWeight: itemWeight,
            calculatedVolume: itemVolume
        });
    });
    
    return parentSKUs;
}

// Display results
function displayResults(calculations, ltlRow) {
    const resultsSection = document.getElementById('results-section');
    const breakdownContainer = document.getElementById('breakdown-container');
    const summaryContainer = document.getElementById('summary-container');
    const validationContainer = document.getElementById('validation-container');
    
    // Clear containers
    breakdownContainer.innerHTML = '';
    summaryContainer.innerHTML = '';
    validationContainer.innerHTML = '';
    
    // Calculate totals
    let totalWeight = 0;
    let totalVolume = 0;
    
    // Helper function to safely escape HTML
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // Create breakdown table for each parent SKU
    Object.keys(calculations).forEach(parentSKU => {
        const data = calculations[parentSKU];
        totalWeight += data.totalWeight;
        totalVolume += data.totalVolume;
        
        const parentSKUSafe = escapeHtml(parentSKU);
        
        const tableHTML = `
            <div class="parent-sku-section">
                <h4 class="parent-sku-title">Parent SKU: ${parentSKUSafe}</h4>
                <table class="breakdown-table">
                    <thead>
                        <tr>
                            <th>Child SKU</th>
                            <th>Unit Weight (lbs)</th>
                            <th>Unit Volume (cu ft)</th>
                            <th>Quantity</th>
                            <th>Total Weight (lbs)</th>
                            <th>Total Volume (cu ft)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.items.map(item => `
                            <tr>
                                <td>${escapeHtml(item.childSKU)}</td>
                                <td>${item.weight.toFixed(2)}</td>
                                <td>${item.volume.toFixed(2)}</td>
                                <td>${item.quantity}</td>
                                <td>${item.calculatedWeight.toFixed(2)}</td>
                                <td>${item.calculatedVolume.toFixed(2)}</td>
                            </tr>
                        `).join('')}
                        <tr class="parent-sku-total-row">
                            <td colspan="4">Parent SKU Total</td>
                            <td>${data.totalWeight.toFixed(2)}</td>
                            <td>${data.totalVolume.toFixed(2)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
        
        breakdownContainer.innerHTML += tableHTML;
    });
    
    // Display summary
    summaryContainer.innerHTML = `
        <div class="summary-card">
            <div class="summary-item">
                <h4>Total Weight</h4>
                <p>${totalWeight.toFixed(2)} lbs</p>
            </div>
            <div class="summary-item">
                <h4>Total Volume</h4>
                <p>${totalVolume.toFixed(2)} cu ft</p>
            </div>
            <div class="summary-item">
                <h4>Parent SKUs</h4>
                <p>${Object.keys(calculations).length}</p>
            </div>
            <div class="summary-item">
                <h4>LTL Row</h4>
                <p>${ltlRow}</p>
            </div>
        </div>
    `;
    
    // Validate against thresholds with tolerance
    const validations = validateThresholds(calculations, totalWeight, totalVolume);
    
    validationContainer.innerHTML = validations.map(v => `
        <div class="validation-item">
            <h4>${v.name}</h4>
            <div class="validation-status ${v.pass ? 'pass' : 'fail'}">
                <span class="status-icon">${v.pass ? '✓' : '✗'}</span>
                <span>${v.message}</span>
            </div>
        </div>
    `).join('');
    
    resultsSection.style.display = 'block';
}

// Validate against thresholds with tolerance (Formula F2)
function validateThresholds(calculations, totalWeight, totalVolume) {
    const validations = [];
    
    // Apply tolerance: actual threshold = configured threshold * (1 + tolerance)
    const toleranceMultiplier = 1 + TOLERANCE_PERCENT;
    
    // Check total weight
    const maxTotalWeightWithTolerance = THRESHOLDS.maxTotalWeight * toleranceMultiplier;
    validations.push({
        name: 'Total Weight Threshold',
        pass: totalWeight <= maxTotalWeightWithTolerance,
        message: `Total weight: ${totalWeight.toFixed(2)} lbs (Threshold: ${THRESHOLDS.maxTotalWeight} lbs, with ${(TOLERANCE_PERCENT * 100).toFixed(1)}% tolerance: ${maxTotalWeightWithTolerance.toFixed(2)} lbs)`
    });
    
    // Check total volume
    const maxTotalVolumeWithTolerance = THRESHOLDS.maxTotalVolume * toleranceMultiplier;
    validations.push({
        name: 'Total Volume Threshold',
        pass: totalVolume <= maxTotalVolumeWithTolerance,
        message: `Total volume: ${totalVolume.toFixed(2)} cu ft (Threshold: ${THRESHOLDS.maxTotalVolume} cu ft, with ${(TOLERANCE_PERCENT * 100).toFixed(1)}% tolerance: ${maxTotalVolumeWithTolerance.toFixed(2)} cu ft)`
    });
    
    // Check per-SKU weight
    const maxWeightPerSKUWithTolerance = THRESHOLDS.maxWeightPerSKU * toleranceMultiplier;
    Object.keys(calculations).forEach(parentSKU => {
        const data = calculations[parentSKU];
        validations.push({
            name: `Weight for ${parentSKU}`,
            pass: data.totalWeight <= maxWeightPerSKUWithTolerance,
            message: `${data.totalWeight.toFixed(2)} lbs (Threshold: ${THRESHOLDS.maxWeightPerSKU} lbs, with ${(TOLERANCE_PERCENT * 100).toFixed(1)}% tolerance: ${maxWeightPerSKUWithTolerance.toFixed(2)} lbs)`
        });
    });
    
    // Check per-SKU volume
    const maxVolumePerSKUWithTolerance = THRESHOLDS.maxVolumePerSKU * toleranceMultiplier;
    Object.keys(calculations).forEach(parentSKU => {
        const data = calculations[parentSKU];
        validations.push({
            name: `Volume for ${parentSKU}`,
            pass: data.totalVolume <= maxVolumePerSKUWithTolerance,
            message: `${data.totalVolume.toFixed(2)} cu ft (Threshold: ${THRESHOLDS.maxVolumePerSKU} cu ft, with ${(TOLERANCE_PERCENT * 100).toFixed(1)}% tolerance: ${maxVolumePerSKUWithTolerance.toFixed(2)} cu ft)`
        });
    });
    
    return validations;
}

// Log to Firebase for multi-user tracking
function logToFirebase(ltlRow, calculations) {
    if (!currentUser || !database) {
        console.log('Skipping Firebase logging (offline mode)');
        return;
    }
    
    const timestamp = new Date().toISOString();
    const logData = {
        ltlRow,
        timestamp,
        userId: currentUser.uid,
        email: currentUser.email || 'anonymous',
        summary: {
            parentSKUCount: Object.keys(calculations).length,
            totalWeight: Object.values(calculations).reduce((sum, data) => sum + data.totalWeight, 0),
            totalVolume: Object.values(calculations).reduce((sum, data) => sum + data.totalVolume, 0)
        }
    };
    
    // Save to Firebase Realtime Database
    database.ref('ltl_checks').push(logData).catch(error => {
        console.error('Error logging to Firebase:', error);
    });
}

// Utility functions
function showError(message) {
    const warnings = document.getElementById('warnings');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error';
    errorDiv.textContent = message;
    warnings.innerHTML = '';
    warnings.appendChild(errorDiv);
}

function showWarning(message) {
    const warnings = document.getElementById('warnings');
    const warningDiv = document.createElement('div');
    warningDiv.className = 'warning';
    warningDiv.textContent = message;
    warnings.appendChild(warningDiv);
}

function clearResults() {
    document.getElementById('warnings').innerHTML = '';
    document.getElementById('results-section').style.display = 'none';
}

// Mock data for demonstration when Google Sheets API is not configured
function getMockData(ltlRow) {
    // Generate mock data based on row number for demonstration
    const mockItems = [
        {
            parentSKU: `PARENT-${ltlRow}`,
            childSKU: `CHILD-${ltlRow}-001`,
            weight: 25.5,
            volume: 3.2,
            quantity: 10
        },
        {
            parentSKU: `PARENT-${ltlRow}`,
            childSKU: `CHILD-${ltlRow}-002`,
            weight: 15.0,
            volume: 2.1,
            quantity: 20
        },
        {
            parentSKU: `PARENT-${ltlRow}-B`,
            childSKU: `CHILD-${ltlRow}-003`,
            weight: 40.0,
            volume: 5.5,
            quantity: 5
        }
    ];
    
    return mockItems;
}

// Allow Enter key to trigger check
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('ltl-row').addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            checkLTL();
        }
    });
});
