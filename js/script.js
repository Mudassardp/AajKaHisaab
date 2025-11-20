document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const userStatus = document.getElementById('userStatus');
    const userTypeDisplay = document.getElementById('userTypeDisplay');
    const syncStatus = document.getElementById('syncStatus');
    const logoutBtn = document.getElementById('logoutBtn');
    const loginSection = document.getElementById('loginSection');
    const adminLoginModal = document.getElementById('adminLoginModal');
    const githubConfigModal = document.getElementById('githubConfigModal');
    const adminSections = document.getElementById('adminSections');
    const adminPasswordInput = document.getElementById('adminPasswordInput');
    const confirmAdminLoginBtn = document.getElementById('confirmAdminLoginBtn');
    const cancelAdminLoginBtn = document.getElementById('cancelAdminLoginBtn');
    const loginAsAdminBtn = document.getElementById('loginAsAdminBtn');
    const refreshDataBtn = document.getElementById('refreshDataBtn');
    const storageTypeElement = document.getElementById('storageType');
    
    const createBtn = document.getElementById('createBtn');
    const participantsSection = document.getElementById('participantsSection');
    const sheetSection = document.getElementById('sheetSection');
    const editParticipantsSection = document.getElementById('editParticipantsSection');
    const sheetName = document.getElementById('sheetName');
    const participantsList = document.getElementById('participantsList');
    const createSheetBtn = document.getElementById('createSheetBtn');
    const tableBody = document.getElementById('tableBody');
    const calculateBtn = document.getElementById('calculateBtn');
    const saveCloseBtn = document.getElementById('saveCloseBtn');
    const closeSheetBtn = document.getElementById('closeSheetBtn');
    const deleteSheetBtn = document.getElementById('deleteSheetBtn');
    const editParticipantsBtn = document.getElementById('editParticipantsBtn');
    const updateParticipantsBtn = document.getElementById('updateParticipantsBtn');
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    const adminSheetActions = document.getElementById('adminSheetActions');
    
    const totalParticipantsElement = document.getElementById('totalParticipants');
    const totalSpentElement = document.getElementById('totalSpent');
    const totalMealsElement = document.getElementById('totalMeals');
    const costPerMealElement = document.getElementById('costPerMeal');
    const oneMealCountElement = document.getElementById('oneMealCount');
    const twoMealsCountElement = document.getElementById('twoMealsCount');
    const threeMealsCountElement = document.getElementById('threeMealsCount');
    const settlementList = document.getElementById('settlementList');
    const sheetsList = document.getElementById('sheetsList');
    const noSheetsMessage = document.getElementById('noSheetsMessage');
    const deleteModal = document.getElementById('deleteModal');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
    const customParticipantInput = document.getElementById('customParticipantInput');
    const addCustomParticipantBtn = document.getElementById('addCustomParticipantBtn');
    const editCustomParticipantInput = document.getElementById('editCustomParticipantInput');
    const editAddCustomParticipantBtn = document.getElementById('editAddCustomParticipantBtn');
    const editParticipantsList = document.getElementById('editParticipantsList');
    
    // Application State
    let selectedParticipants = [];
    let currentSheetData = null;
    let savedSheets = [];
    let isAdmin = false;
    
    // ⚠️ GITHUB CONFIGURATION - READ THIS CAREFULLY ⚠️
    const GITHUB_CONFIG = {
        username: 'mudassardp',                    // Your GitHub username
        repository: 'hisaabkitaab-data',           // Repository name
        branch: 'main',                            // Branch name
        filePath: 'data/sheets.json',              // File path in repository
        token: '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'  // ← SET THIS TO YOUR TOKEN OR NULL TO TEST LOCALLY
        // token: 'ghp_your_actual_token_here'    // Uncomment and add your real token
    };
    
    const ADMIN_PASSWORD = "226622";
    const DEFAULT_PARTICIPANTS = [
        "Rizwan", "Aarif", "Abdul Razzaq", "Haris", "Mauzam", 
        "Masif", "Mudassar", "Shahid", "Mansoor Kotawdekar", 
        "Mansoor Wasta", "Mohsin", "Ubedulla", "Abdul Alim", "Sabir", "Aftab"
    ];
    
    // Initialize Application
    initApp();
    
    function initApp() {
        setupEventListeners();
        checkAdminStatus();
        loadData();
        hideGithubConfigModal();
    }
    
    function setupEventListeners() {
        // User Management
        loginAsAdminBtn.addEventListener('click', showAdminLoginModal);
        confirmAdminLoginBtn.addEventListener('click', handleAdminLogin);
        cancelAdminLoginBtn.addEventListener('click', hideAdminLoginModal);
        logoutBtn.addEventListener('click', handleLogout);
        
        // Data Management
        refreshDataBtn.addEventListener('click', loadData);
        
        // Sheet Management
        createBtn.addEventListener('click', showParticipantsSection);
        createSheetBtn.addEventListener('click', createNewSheet);
        calculateBtn.addEventListener('click', calculateShares);
        saveCloseBtn.addEventListener('click', saveAndCloseSheet);
        closeSheetBtn.addEventListener('click', closeSheet);
        deleteSheetBtn.addEventListener('click', showDeleteConfirmation);
        confirmDeleteBtn.addEventListener('click', deleteCurrentSheet);
        cancelDeleteBtn.addEventListener('click', hideDeleteConfirmation);
        
        // Participants Management
        addCustomParticipantBtn.addEventListener('click', () => addCustomParticipant(customParticipantInput, participantsList));
        customParticipantInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') addCustomParticipant(customParticipantInput, participantsList);
        });
        editAddCustomParticipantBtn.addEventListener('click', () => addCustomParticipantToEdit(editCustomParticipantInput, editParticipantsList));
        editCustomParticipantInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') addCustomParticipantToEdit(editCustomParticipantInput, editParticipantsList);
        });
        
        // Edit Participants
        editParticipantsBtn.addEventListener('click', openEditParticipants);
        updateParticipantsBtn.addEventListener('click', updateParticipants);
        cancelEditBtn.addEventListener('click', cancelEditParticipants);
    }
    
    // GitHub Cloud Storage Functions - FIXED VERSION
    function hideGithubConfigModal() {
        if (githubConfigModal) {
            githubConfigModal.style.display = 'none';
        }
    }
    
    async function loadData() {
        setSyncStatus('syncing', 'Loading...');
        
        try {
            // If no GitHub token, use local storage only
            if (!GITHUB_CONFIG.token) {
                console.log('No GitHub token configured, using local storage only');
                loadFromLocalStorage();
                setSyncStatus('success', 'Local storage only');
                updateStorageUI('Local Storage');
                loadSavedSheets();
                return;
            }
            
            const data = await loadDataFromGitHub();
            if (data && data.sheets) {
                savedSheets = data.sheets;
                setSyncStatus('success', 'Synced with cloud');
                updateStorageUI('GitHub Cloud');
            } else {
                loadFromLocalStorage();
                setSyncStatus('success', 'Local data loaded');
                updateStorageUI('Local Storage');
            }
        } catch (error) {
            console.error('Load data error:', error);
            loadFromLocalStorage();
            setSyncStatus('error', 'Cloud load failed - using local');
            updateStorageUI('Local Storage');
        }
        
        loadSavedSheets();
    }
    
    async function loadDataFromGitHub() {
        try {
            // Validate GitHub configuration
            if (!GITHUB_CONFIG.username || !GITHUB_CONFIG.repository) {
                throw new Error('GitHub configuration is incomplete');
            }

            const rawUrl = `https://raw.githubusercontent.com/${GITHUB_CONFIG.username}/${GITHUB_CONFIG.repository}/${GITHUB_CONFIG.branch}/${GITHUB_CONFIG.filePath}?t=${Date.now()}`;
            console.log('Loading from GitHub URL:', rawUrl);
            
            const response = await fetch(rawUrl);
            console.log('GitHub raw response status:', response.status);

            if (response.ok) {
                const text = await response.text();
                console.log('GitHub raw response text length:', text.length);

                let data;
                try {
                    data = JSON.parse(text);
                    console.log('Successfully parsed GitHub data');
                } catch (parseError) {
                    console.error('JSON parse error:', parseError);
                    return null;
                }

                // Check if GitHub has data or is empty
                const hasSheets = data.sheets && data.sheets.length > 0;
                console.log('GitHub has sheets:', hasSheets);

                if (hasSheets) {
                    // GitHub has data - use it
                    return data;
                } else {
                    // GitHub is empty - check local storage
                    loadFromLocalStorage();
                    
                    if (savedSheets.length > 0 && isAdmin) {
                        // Upload local data to GitHub (admin only)
                        console.log('Uploading local data to GitHub...');
                        await saveDataToGitHub(savedSheets);
                        return { sheets: savedSheets };
                    } else {
                        return { sheets: [] };
                    }
                }
                
            } else if (response.status === 404) {
                // File doesn't exist yet
                console.log('GitHub file not found (404)');
                loadFromLocalStorage();
                return { sheets: savedSheets };
            } else {
                throw new Error(`GitHub response: ${response.status}`);
            }
        } catch (error) {
            console.error('Failed to load from GitHub:', error);
            loadFromLocalStorage();
            return { sheets: savedSheets };
        }
    }
    
    async function saveDataToGitHub(data) {
        // STEP 1: If no GitHub token, save to local storage only
        if (!GITHUB_CONFIG.token) {
            console.log('No GitHub token, saving to local storage only');
            localStorage.setItem('hisaabKitaabSheets', JSON.stringify(data));
            setSyncStatus('success', 'Saved locally (no cloud config)');
            return true;
        }
        
        if (!isAdmin) {
            console.log('Not admin, skipping GitHub save');
            return false;
        }
        
        setSyncStatus('syncing', 'Saving to cloud...');
        
        try {
            // STEP 2: Validate GitHub configuration
            if (!GITHUB_CONFIG.username || !GITHUB_CONFIG.repository || !GITHUB_CONFIG.token) {
                throw new Error('GitHub configuration is incomplete');
            }

            // STEP 3: Check token format
            if (!GITHUB_CONFIG.token.startsWith('ghp_') && !GITHUB_CONFIG.token.startsWith('github_pat_')) {
                throw new Error('Invalid GitHub token format. Token should start with ghp_ or github_pat_');
            }

            const apiUrl = `https://api.github.com/repos/${GITHUB_CONFIG.username}/${GITHUB_CONFIG.repository}/contents/${GITHUB_CONFIG.filePath}`;
            console.log('GitHub API URL:', apiUrl);

            // STEP 4: Get current file SHA (needed for update)
            let sha = null;
            try {
                const getResponse = await fetch(apiUrl, {
                    headers: {
                        'Authorization': `Bearer ${GITHUB_CONFIG.token}`,
                        'Accept': 'application/vnd.github.v3+json',
                        'User-Agent': 'HisaabKitaab-App'
                    }
                });

                if (getResponse.ok) {
                    const fileInfo = await getResponse.json();
                    sha = fileInfo.sha;
                    console.log('Found existing file, SHA:', sha);
                } else if (getResponse.status !== 404) {
                    const errorText = await getResponse.text();
                    throw new Error(`GitHub API error (GET): ${getResponse.status} - ${errorText}`);
                } else {
                    console.log('File does not exist yet, will create new file');
                }
            } catch (getError) {
                console.error('Error getting file info:', getError);
                throw getError;
            }

            // STEP 5: Prepare data for GitHub
            const githubData = {
                sheets: data,
                lastUpdated: new Date().toISOString(),
                app: 'HisaabKitaab',
                version: '1.0'
            };

            // STEP 6: Convert data to base64 properly
            const contentString = JSON.stringify(githubData, null, 2);
            const contentBase64 = btoa(unescape(encodeURIComponent(contentString)));
            
            console.log('Data prepared for GitHub, content length:', contentString.length);

            // STEP 7: Prepare the request body
            const requestBody = {
                message: `HisaabKitaab update: ${new Date().toLocaleString()}`,
                content: contentBase64,
                branch: GITHUB_CONFIG.branch
            };

            // Add SHA if we're updating an existing file
            if (sha) {
                requestBody.sha = sha;
            }

            console.log('Sending request to GitHub...');

            // STEP 8: Update file on GitHub
            const updateResponse = await fetch(apiUrl, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${GITHUB_CONFIG.token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/vnd.github.v3+json',
                    'User-Agent': 'HisaabKitaab-App'
                },
                body: JSON.stringify(requestBody)
            });

            console.log('GitHub response status:', updateResponse.status);

            if (updateResponse.ok) {
                const result = await updateResponse.json();
                console.log('GitHub save successful:', result);
                setSyncStatus('success', 'Saved to cloud');
                
                // Also update local storage as backup
                localStorage.setItem('hisaabKitaabSheets', JSON.stringify(data));
                return true;
            } else {
                const errorText = await updateResponse.text();
                console.error('GitHub API error response:', errorText);
                
                let errorMessage = `GitHub API error: ${updateResponse.status}`;
                if (updateResponse.status === 401) {
                    errorMessage = 'GitHub authentication failed. Please check your token.';
                } else if (updateResponse.status === 403) {
                    errorMessage = 'GitHub access forbidden. Please check repository permissions.';
                } else if (updateResponse.status === 404) {
                    errorMessage = 'Repository not found. Please check repository name and permissions.';
                }
                
                throw new Error(errorMessage);
            }
        } catch (error) {
            console.error('GitHub save error:', error);
            setSyncStatus('error', 'Cloud save failed');
            
            // Fallback to local storage
            localStorage.setItem('hisaabKitaabSheets', JSON.stringify(data));
            
            // Show detailed error message for debugging
            alert(`Cloud save failed: ${error.message}\n\nData has been saved locally.`);
            return false;
        }
    }
    
    function loadFromLocalStorage() {
        const localData = localStorage.getItem('hisaabKitaabSheets');
        if (localData) {
            try {
                savedSheets = JSON.parse(localData);
                console.log('Loaded from local storage, sheets count:', savedSheets.length);
            } catch (e) {
                console.error('Error parsing local storage data:', e);
                savedSheets = [];
            }
        } else {
            savedSheets = [];
            console.log('No local storage data found');
        }
    }
    
    function setSyncStatus(type, message) {
        if (syncStatus) {
            syncStatus.textContent = message;
            syncStatus.className = `sync-status ${type}`;
        }
    }
    
    function updateStorageUI(type) {
        if (storageTypeElement) {
            storageTypeElement.textContent = type;
            if (type === 'GitHub Cloud') {
                storageTypeElement.className = 'cloud-storage-badge';
            } else {
                storageTypeElement.className = 'local-storage-badge';
            }
        }
    }
    
    // User Management Functions
    function checkAdminStatus() {
        const savedAdminStatus = localStorage.getItem('hisaabKitaabAdmin');
        if (savedAdminStatus === 'true') {
            isAdmin = true;
            updateUIForAdmin();
        } else {
            isAdmin = false;
            updateUIForViewer();
        }
    }
    
    function showAdminLoginModal() {
        adminLoginModal.style.display = 'flex';
        adminPasswordInput.value = '';
        adminPasswordInput.focus();
    }
    
    function hideAdminLoginModal() {
        adminLoginModal.style.display = 'none';
    }
    
    function handleAdminLogin() {
        const password = adminPasswordInput.value.trim();
        if (password === ADMIN_PASSWORD) {
            isAdmin = true;
            localStorage.setItem('hisaabKitaabAdmin', 'true');
            updateUIForAdmin();
            hideAdminLoginModal();
            alert('Admin login successful!');
        } else {
            alert('Incorrect password. Please try again.');
            adminPasswordInput.value = '';
            adminPasswordInput.focus();
        }
    }
    
    function handleLogout() {
        isAdmin = false;
        localStorage.removeItem('hisaabKitaabAdmin');
        updateUIForViewer();
        closeSheet();
        alert('Logged out successfully.');
    }
    
    function updateUIForAdmin() {
        userTypeDisplay.textContent = 'Admin Mode';
        if (logoutBtn) logoutBtn.style.display = 'inline-block';
        if (loginSection) loginSection.style.display = 'none';
        if (adminSections) adminSections.style.display = 'block';
        if (calculateBtn) calculateBtn.style.display = 'inline-block';
        if (saveCloseBtn) saveCloseBtn.style.display = 'inline-block';
        if (adminSheetActions) adminSheetActions.style.display = 'flex';
        if (closeSheetBtn) closeSheetBtn.style.display = 'none';
        loadSavedSheets();
    }
    
    function updateUIForViewer() {
        userTypeDisplay.textContent = 'Viewer Mode';
        if (logoutBtn) logoutBtn.style.display = 'none';
        if (loginSection) loginSection.style.display = 'block';
        if (adminSections) adminSections.style.display = 'none';
        if (calculateBtn) calculateBtn.style.display = 'none';
        if (saveCloseBtn) saveCloseBtn.style.display = 'none';
        if (adminSheetActions) adminSheetActions.style.display = 'none';
        if (participantsSection) participantsSection.style.display = 'none';
        if (editParticipantsSection) editParticipantsSection.style.display = 'none';
        if (closeSheetBtn) closeSheetBtn.style.display = 'inline-block';
        loadSavedSheets();
    }
    
    // Sheet Management Functions
    function showParticipantsSection() {
        if (!isAdmin) return;
        
        participantsList.innerHTML = '';
        DEFAULT_PARTICIPANTS.forEach(participantName => {
            const participant = document.createElement('li');
            participant.className = 'participant';
            
            const checkboxContainer = document.createElement('div');
            checkboxContainer.className = 'checkbox-container';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `participant_${participantName.replace(/\s+/g, '_')}`;
            checkbox.value = participantName;
            checkbox.checked = true;
            
            const label = document.createElement('label');
            label.htmlFor = checkbox.id;
            label.className = 'participant-name';
            label.textContent = participantName;
            
            checkboxContainer.appendChild(checkbox);
            checkboxContainer.appendChild(label);
            participant.appendChild(checkboxContainer);
            participantsList.appendChild(participant);
        });
        
        customParticipantInput.value = '';
        participantsSection.style.display = 'block';
        participantsSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    function createNewSheet() {
        if (!isAdmin) return;
        
        selectedParticipants = [];
        const checkboxes = document.querySelectorAll('#participantsList input[type="checkbox"]:checked');
        checkboxes.forEach(checkbox => {
            selectedParticipants.push(checkbox.value);
        });
        
        if (selectedParticipants.length === 0) {
            alert('Please select at least one participant');
            return;
        }
        
        const now = new Date();
        const dateTimeString = now.toLocaleString();
        const sheetId = 'sheet_' + Date.now();
        
        sheetName.textContent = `Kharcha-${dateTimeString}`;
        
        currentSheetData = {
            id: sheetId,
            name: `Kharcha-${dateTimeString}`,
            date: dateTimeString,
            participants: selectedParticipants,
            expenses: {},
            createdAt: new Date().toISOString()
        };
        
        selectedParticipants.forEach(participant => {
            currentSheetData.expenses[participant] = {
                spent: 0,
                meals: 3,
                toBePaid: 0
            };
        });
        
        renderExpenseTable();
        participantsSection.style.display = 'none';
        sheetSection.style.display = 'block';
        resetSummary();
        sheetSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    function renderExpenseTable() {
        tableBody.innerHTML = '';
        
        selectedParticipants.forEach(participant => {
            const row = document.createElement('tr');
            
            // Participant Name
            const nameCell = document.createElement('td');
            nameCell.textContent = participant;
            
            // Spent Amount
            const spentCell = document.createElement('td');
            spentCell.className = 'amount-cell';
            
            if (isAdmin) {
                const spentInput = document.createElement('input');
                spentInput.type = 'number';
                spentInput.min = '0';
                spentInput.step = '0.01';
                spentInput.value = currentSheetData.expenses[participant].spent;
                spentInput.dataset.participant = participant;
                spentInput.addEventListener('input', function() {
                    currentSheetData.expenses[participant].spent = parseFloat(this.value) || 0;
                });
                spentCell.appendChild(spentInput);
            } else {
                spentCell.textContent = currentSheetData.expenses[participant].spent.toFixed(2) + ' SAR';
            }
            
            // Meals
            const mealsCell = document.createElement('td');
            mealsCell.className = 'meals-cell';
            
            if (isAdmin) {
                const mealsSelect = document.createElement('select');
                mealsSelect.dataset.participant = participant;
                
                [1, 2, 3].forEach(mealCount => {
                    const option = document.createElement('option');
                    option.value = mealCount.toString();
                    option.textContent = `${mealCount} Meal${mealCount > 1 ? 's' : ''}`;
                    mealsSelect.appendChild(option);
                });
                
                mealsSelect.value = currentSheetData.expenses[participant].meals.toString();
                mealsSelect.addEventListener('change', function() {
                    currentSheetData.expenses[participant].meals = parseInt(this.value);
                });
                mealsCell.appendChild(mealsSelect);
            } else {
                mealsCell.textContent = currentSheetData.expenses[participant].meals;
            }
            
            // To Be Paid
            const toBePaidCell = document.createElement('td');
            toBePaidCell.className = 'amount-cell';
            toBePaidCell.textContent = currentSheetData.expenses[participant].toBePaid.toFixed(2) + ' SAR';
            toBePaidCell.dataset.participant = participant;
            
            row.appendChild(nameCell);
            row.appendChild(spentCell);
            row.appendChild(mealsCell);
            row.appendChild(toBePaidCell);
            tableBody.appendChild(row);
        });
        
        // Total Row
        const totalRow = document.createElement('tr');
        totalRow.className = 'total-row';
        totalRow.innerHTML = `
            <td>Total</td>
            <td class="amount-cell" id="totalSpentCell">0.00 SAR</td>
            <td></td>
            <td></td>
        `;
        tableBody.appendChild(totalRow);
    }
    
    function calculateShares() {
        if (!isAdmin) return;
        
        let totalSpent = 0;
        let totalMeals = 0;
        let oneMealCount = 0, twoMealsCount = 0, threeMealsCount = 0;
        
        selectedParticipants.forEach(participant => {
            totalSpent += currentSheetData.expenses[participant].spent;
            totalMeals += currentSheetData.expenses[participant].meals;
            
            switch(currentSheetData.expenses[participant].meals) {
                case 1: oneMealCount++; break;
                case 2: twoMealsCount++; break;
                case 3: threeMealsCount++; break;
            }
        });
        
        const costPerMeal = totalMeals > 0 ? totalSpent / totalMeals : 0;
        
        // Update Summary
        totalParticipantsElement.textContent = selectedParticipants.length;
        document.getElementById('totalSpentCell').textContent = totalSpent.toFixed(2) + ' SAR';
        totalSpentElement.textContent = totalSpent.toFixed(2) + ' SAR';
        totalMealsElement.textContent = totalMeals;
        costPerMealElement.textContent = costPerMeal.toFixed(2) + ' SAR';
        oneMealCountElement.textContent = oneMealCount;
        twoMealsCountElement.textContent = twoMealsCount;
        threeMealsCountElement.textContent = threeMealsCount;
        
        // Calculate To Be Paid
        selectedParticipants.forEach(participant => {
            const spentAmount = currentSheetData.expenses[participant].spent;
            const mealsAttended = currentSheetData.expenses[participant].meals;
            const shareAmount = costPerMeal * mealsAttended;
            const toBePaid = shareAmount - spentAmount;
            
            currentSheetData.expenses[participant].toBePaid = toBePaid;
            
            const toBePaidCell = document.querySelector(`td[data-participant="${participant}"]`);
            if (toBePaidCell) {
                toBePaidCell.textContent = toBePaid.toFixed(2) + ' SAR';
                toBePaidCell.style.color = toBePaid > 0 ? '#e74c3c' : toBePaid < 0 ? '#2ecc71' : '#2c3e50';
            }
        });
        
        currentSheetData.totalSpent = totalSpent;
        currentSheetData.totalMeals = totalMeals;
        currentSheetData.costPerMeal = costPerMeal;
        currentSheetData.lastUpdated = new Date().toISOString();
        
        generateSettlementSuggestions();
    }
    
    function generateSettlementSuggestions() {
        const creditors = [];
        const debtors = [];
        
        selectedParticipants.forEach(participant => {
            const balance = currentSheetData.expenses[participant].toBePaid;
            if (balance < 0) {
                creditors.push({ name: participant, amount: -balance });
            } else if (balance > 0) {
                debtors.push({ name: participant, amount: balance });
            }
        });
        
        creditors.sort((a, b) => b.amount - a.amount);
        debtors.sort((a, b) => b.amount - a.amount);
        
        const settlements = [];
        let i = 0, j = 0;
        
        while (i < creditors.length && j < debtors.length) {
            const creditor = creditors[i];
            const debtor = debtors[j];
            const settlementAmount = Math.min(creditor.amount, debtor.amount);
            
            if (settlementAmount > 0.01) {
                settlements.push({
                    from: debtor.name,
                    to: creditor.name,
                    amount: settlementAmount.toFixed(2)
                });
                
                creditor.amount -= settlementAmount;
                debtor.amount -= settlementAmount;
                
                if (creditor.amount < 0.01) i++;
                if (debtor.amount < 0.01) j++;
            } else {
                if (creditor.amount <= debtor.amount) i++;
                else j++;
            }
        }
        
        settlementList.innerHTML = '';
        if (settlements.length === 0) {
            settlementList.innerHTML = '<div class="no-settlements">All balances are settled! 🎉</div>';
        } else {
            settlements.forEach(settlement => {
                const settlementItem = document.createElement('div');
                settlementItem.className = 'settlement-item';
                settlementItem.innerHTML = `
                    <span><strong>${settlement.from}</strong></span>
                    <span class="settlement-arrow">→</span>
                    <span><strong>${settlement.to}</strong></span>
                    <span class="settlement-amount">${settlement.amount} SAR</span>
                `;
                settlementList.appendChild(settlementItem);
            });
        }
    }
    
    function saveAndCloseSheet() {
        if (!isAdmin) return;
        saveSheet();
        closeSheet();
    }
    
    function saveSheet() {
        if (!currentSheetData || !isAdmin) return;
        
        calculateShares();
        
        const existingIndex = savedSheets.findIndex(sheet => sheet.id === currentSheetData.id);
        if (existingIndex !== -1) {
            savedSheets[existingIndex] = currentSheetData;
        } else {
            savedSheets.push(currentSheetData);
        }
        
        saveDataToGitHub(savedSheets);
        loadSavedSheets();
        alert('Sheet saved successfully!');
    }
    
    function closeSheet() {
        sheetSection.style.display = 'none';
        participantsSection.style.display = 'none';
        editParticipantsSection.style.display = 'none';
        currentSheetData = null;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    function showDeleteConfirmation() {
        if (!isAdmin) return;
        deleteModal.style.display = 'flex';
    }
    
    function hideDeleteConfirmation() {
        deleteModal.style.display = 'none';
    }
    
    function deleteCurrentSheet() {
        if (!currentSheetData || !isAdmin) return;
        
        savedSheets = savedSheets.filter(sheet => sheet.id !== currentSheetData.id);
        saveDataToGitHub(savedSheets);
        loadSavedSheets();
        closeSheet();
        hideDeleteConfirmation();
        alert('Sheet deleted successfully!');
    }
    
    // Participants Management Functions
    function addCustomParticipant(inputElement, listElement) {
        if (!isAdmin) return;
        
        const customName = inputElement.value.trim();
        if (!customName) {
            alert('Please enter a participant name');
            return;
        }
        
        const existingParticipants = Array.from(listElement.children).map(item => 
            item.querySelector('.participant-name').textContent
        );
        
        if (existingParticipants.includes(customName)) {
            alert('This participant already exists in the list');
            inputElement.value = '';
            return;
        }
        
        const participant = document.createElement('li');
        participant.className = 'participant custom-participant';
        participant.innerHTML = `
            <div class="checkbox-container">
                <input type="checkbox" id="custom_${Date.now()}" value="${customName}" checked>
                <label for="custom_${Date.now()}" class="participant-name">${customName}</label>
            </div>
        `;
        listElement.appendChild(participant);
        inputElement.value = '';
        alert(`Participant "${customName}" added successfully!`);
    }
    
    function addCustomParticipantToEdit(inputElement, listElement) {
        if (!isAdmin) return;
        
        const customName = inputElement.value.trim();
        if (!customName) {
            alert('Please enter a participant name');
            return;
        }
        
        const existingParticipants = Array.from(listElement.children).map(item => 
            item.querySelector('.edit-participant-name').textContent
        );
        
        if (existingParticipants.includes(customName)) {
            alert('This participant already exists in the list');
            inputElement.value = '';
            return;
        }
        
        addParticipantToEditList(customName);
        inputElement.value = '';
    }
    
    function addParticipantToEditList(participantName) {
        const participantItem = document.createElement('li');
        participantItem.className = 'edit-participant-item';
        participantItem.innerHTML = `
            <span class="edit-participant-name">${participantName}</span>
            <button class="remove-participant-btn" title="Remove Participant">🗑️</button>
        `;
        
        participantItem.querySelector('.remove-participant-btn').addEventListener('click', function() {
            participantItem.remove();
        });
        
        editParticipantsList.appendChild(participantItem);
    }
    
    function openEditParticipants() {
        if (!isAdmin || !currentSheetData) return;
        
        editParticipantsList.innerHTML = '';
        selectedParticipants.forEach(participant => {
            addParticipantToEditList(participant);
        });
        
        editCustomParticipantInput.value = '';
        editParticipantsSection.style.display = 'block';
        sheetSection.style.display = 'none';
        editParticipantsSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    function updateParticipants() {
        if (!isAdmin) return;
        
        const updatedParticipants = Array.from(editParticipantsList.children).map(item => 
            item.querySelector('.edit-participant-name').textContent
        );
        
        if (updatedParticipants.length === 0) {
            alert('Please add at least one participant');
            return;
        }
        
        selectedParticipants = updatedParticipants;
        currentSheetData.participants = updatedParticipants;
        
        // Initialize expenses for new participants
        updatedParticipants.forEach(participant => {
            if (!currentSheetData.expenses[participant]) {
                currentSheetData.expenses[participant] = { spent: 0, meals: 3, toBePaid: 0 };
            }
        });
        
        // Remove expenses for deleted participants
        Object.keys(currentSheetData.expenses).forEach(participant => {
            if (!updatedParticipants.includes(participant)) {
                delete currentSheetData.expenses[participant];
            }
        });
        
        renderExpenseTable();
        calculateShares();
        editParticipantsSection.style.display = 'none';
        sheetSection.style.display = 'block';
        alert('Participants updated successfully!');
    }
    
    function cancelEditParticipants() {
        editParticipantsSection.style.display = 'none';
        sheetSection.style.display = 'block';
    }
    
    function resetSummary() {
        totalParticipantsElement.textContent = '0';
        totalSpentElement.textContent = '0.00 SAR';
        totalMealsElement.textContent = '0';
        costPerMealElement.textContent = '0.00 SAR';
        oneMealCountElement.textContent = '0';
        twoMealsCountElement.textContent = '0';
        threeMealsCountElement.textContent = '0';
        settlementList.innerHTML = '<div class="no-settlements">Calculate shares to see settlement suggestions</div>';
    }
    
    function loadSavedSheets() {
        if (savedSheets.length === 0) {
            noSheetsMessage.style.display = 'block';
            sheetsList.style.display = 'none';
            return;
        }
        
        noSheetsMessage.style.display = 'none';
        sheetsList.style.display = 'block';
        sheetsList.innerHTML = '';
        
        savedSheets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        savedSheets.forEach(sheet => {
            const sheetItem = document.createElement('li');
            sheetItem.className = 'sheet-item';
            
            const sheetInfo = document.createElement('div');
            sheetInfo.innerHTML = `
                <strong>${sheet.name}</strong>
                <div class="sheet-date">Created: ${sheet.date}</div>
            `;
            
            const sheetActions = document.createElement('div');
            sheetActions.className = 'sheet-item-actions';
            
            // Only show delete button for admin
            if (isAdmin) {
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'delete-sheet-btn';
                deleteBtn.innerHTML = '🗑️';
                deleteBtn.title = 'Delete Sheet';
                deleteBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    if (confirm(`Are you sure you want to delete "${sheet.name}"?`)) {
                        deleteSheet(sheet.id);
                    }
                });
                sheetActions.appendChild(deleteBtn);
            }
            
            sheetItem.appendChild(sheetInfo);
            sheetItem.appendChild(sheetActions);
            
            sheetItem.addEventListener('click', function() {
                openSheet(sheet.id);
            });
            
            sheetsList.appendChild(sheetItem);
        });
    }
    
    function deleteSheet(sheetId) {
        if (!isAdmin) return;
        
        savedSheets = savedSheets.filter(sheet => sheet.id !== sheetId);
        saveDataToGitHub(savedSheets);
        loadSavedSheets();
        
        if (currentSheetData && currentSheetData.id === sheetId) {
            closeSheet();
        }
        
        alert('Sheet deleted successfully!');
    }
    
    function openSheet(sheetId) {
        const sheet = savedSheets.find(s => s.id === sheetId);
        if (!sheet) {
            alert('Sheet not found!');
            return;
        }
        
        currentSheetData = JSON.parse(JSON.stringify(sheet));
        selectedParticipants = currentSheetData.participants;
        sheetName.textContent = currentSheetData.name;
        
        renderExpenseTableWithSavedData(); // FIXED: Use the corrected function
        
        sheetSection.style.display = 'block';
        participantsSection.style.display = 'none';
        editParticipantsSection.style.display = 'none';
        sheetSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    // FIXED FUNCTION: Properly render saved data when reopening sheets
    function renderExpenseTableWithSavedData() {
        tableBody.innerHTML = '';
        
        selectedParticipants.forEach(participant => {
            const row = document.createElement('tr');
            
            // Participant Name
            const nameCell = document.createElement('td');
            nameCell.textContent = participant;
            
            // Spent Amount
            const spentCell = document.createElement('td');
            spentCell.className = 'amount-cell';
            
            if (isAdmin) {
                const spentInput = document.createElement('input');
                spentInput.type = 'number';
                spentInput.min = '0';
                spentInput.step = '0.01';
                // FIX: Use saved data with proper fallback
                spentInput.value = currentSheetData.expenses[participant]?.spent || 0;
                spentInput.dataset.participant = participant;
                spentInput.addEventListener('input', function() {
                    currentSheetData.expenses[participant].spent = parseFloat(this.value) || 0;
                });
                spentCell.appendChild(spentInput);
            } else {
                spentCell.textContent = (currentSheetData.expenses[participant]?.spent || 0).toFixed(2) + ' SAR';
            }
            
            // Meals
            const mealsCell = document.createElement('td');
            mealsCell.className = 'meals-cell';
            
            if (isAdmin) {
                const mealsSelect = document.createElement('select');
                mealsSelect.dataset.participant = participant;
                
                [1, 2, 3].forEach(mealCount => {
                    const option = document.createElement('option');
                    option.value = mealCount.toString();
                    option.textContent = `${mealCount} Meal${mealCount > 1 ? 's' : ''}`;
                    mealsSelect.appendChild(option);
                });
                
                // FIX: Use saved data with proper fallback
                mealsSelect.value = (currentSheetData.expenses[participant]?.meals || 3).toString();
                mealsSelect.addEventListener('change', function() {
                    currentSheetData.expenses[participant].meals = parseInt(this.value);
                });
                mealsCell.appendChild(mealsSelect);
            } else {
                mealsCell.textContent = currentSheetData.expenses[participant]?.meals || 3;
            }
            
            // To Be Paid
            const toBePaidCell = document.createElement('td');
            toBePaidCell.className = 'amount-cell';
            toBePaidCell.textContent = (currentSheetData.expenses[participant]?.toBePaid || 0).toFixed(2) + ' SAR';
            toBePaidCell.dataset.participant = participant;
            
            row.appendChild(nameCell);
            row.appendChild(spentCell);
            row.appendChild(mealsCell);
            row.appendChild(toBePaidCell);
            tableBody.appendChild(row);
        });
        
        // Calculate and display totals
        let totalSpent = 0;
        let totalMeals = 0;
        let oneMealCount = 0, twoMealsCount = 0, threeMealsCount = 0;
        
        selectedParticipants.forEach(participant => {
            totalSpent += currentSheetData.expenses[participant]?.spent || 0;
            totalMeals += currentSheetData.expenses[participant]?.meals || 3;
            
            const meals = currentSheetData.expenses[participant]?.meals || 3;
            switch(meals) {
                case 1: oneMealCount++; break;
                case 2: twoMealsCount++; break;
                case 3: threeMealsCount++; break;
                default: threeMealsCount++; break;
            }
        });
        
        const costPerMeal = totalMeals > 0 ? totalSpent / totalMeals : 0;
        
        // Update Summary Display
        totalParticipantsElement.textContent = selectedParticipants.length;
        totalSpentElement.textContent = totalSpent.toFixed(2) + ' SAR';
        totalMealsElement.textContent = totalMeals;
        costPerMealElement.textContent = costPerMeal.toFixed(2) + ' SAR';
        oneMealCountElement.textContent = oneMealCount;
        twoMealsCountElement.textContent = twoMealsCount;
        threeMealsCountElement.textContent = threeMealsCount;
        
        // Calculate and display To Be Paid amounts
        selectedParticipants.forEach(participant => {
            const spentAmount = currentSheetData.expenses[participant]?.spent || 0;
            const mealsAttended = currentSheetData.expenses[participant]?.meals || 3;
            const shareAmount = costPerMeal * mealsAttended;
            const toBePaid = shareAmount - spentAmount;
            currentSheetData.expenses[participant].toBePaid = toBePaid;
            
            const toBePaidCell = document.querySelector(`td[data-participant="${participant}"]`);
            if (toBePaidCell) {
                toBePaidCell.textContent = toBePaid.toFixed(2) + ' SAR';
                toBePaidCell.style.color = toBePaid > 0 ? '#e74c3c' : toBePaid < 0 ? '#2ecc71' : '#2c3e50';
            }
        });
        
        // Add Total Row
        const totalRow = document.createElement('tr');
        totalRow.className = 'total-row';
        totalRow.innerHTML = `
            <td>Total</td>
            <td class="amount-cell">${totalSpent.toFixed(2)} SAR</td>
            <td>${totalMeals}</td>
            <td></td>
        `;
        tableBody.appendChild(totalRow);
        
        generateSettlementSuggestions();
    }
});