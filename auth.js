// Authentication Logic

let currentUser = null;

// Switch between login and signup tabs
function switchAuthTab(tab) {
  const loginTab = document.getElementById('loginTab');
  const signupTab = document.getElementById('signupTab');
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');

  if (tab === 'login') {
    loginTab.classList.add('active');
    signupTab.classList.remove('active');
    loginForm.style.display = 'block';
    signupForm.style.display = 'none';
  } else {
    signupTab.classList.add('active');
    loginTab.classList.remove('active');
    signupForm.style.display = 'block';
    loginForm.style.display = 'none';
  }

  // Clear error messages
  document.getElementById('loginError').textContent = '';
  document.getElementById('signupError').textContent = '';
  document.getElementById('signupSuccess').textContent = '';
}

// Login handler
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  const errorDiv = document.getElementById('loginError');

  try {
    errorDiv.textContent = '';

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    currentUser = data.user;
    await beginInitializationIfNeeded();

  } catch (error) {
    errorDiv.textContent = error.message || 'Login failed. Please try again.';
    console.error('Login error:', error);
  }
});

// Signup handler
document.getElementById('signupForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('signupEmail').value;
  const password = document.getElementById('signupPassword').value;
  const passwordConfirm = document.getElementById('signupPasswordConfirm').value;
  const errorDiv = document.getElementById('signupError');
  const successDiv = document.getElementById('signupSuccess');

  try {
    errorDiv.textContent = '';
    successDiv.textContent = '';

    if (password !== passwordConfirm) {
      throw new Error('Passwords do not match');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });

    if (error) throw error;

    // Check if email confirmation is required
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      errorDiv.textContent = 'An account with this email already exists.';
      return;
    }

    successDiv.textContent = 'Account created successfully! You can now login.';

    // Clear form
    document.getElementById('signupForm').reset();

    // Switch to login tab after 2 seconds
    setTimeout(() => {
      switchAuthTab('login');
    }, 2000);

  } catch (error) {
    errorDiv.textContent = error.message || 'Signup failed. Please try again.';
    console.error('Signup error:', error);
  }
});

// Logout handler
async function handleLogout() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    currentUser = null;
    showAuthScreen();

  } catch (error) {
    console.error('Logout error:', error);
    alert('Logout failed: ' + error.message);
  }
}

// Flag to prevent duplicate initialization
let isInitializing = false;
let hasInitialized = false;

async function beginInitializationIfNeeded() {
  if (isInitializing || hasInitialized) {
    console.log('Initialization skipped (isInitializing or hasInitialized)');
    return;
  }
  isInitializing = true;
  try {
    console.log('Starting app initialization...');
    await initializeApp();
    console.log('App initialized successfully');
    showMainApp();
    hasInitialized = true;
  } catch (error) {
    console.error('Failed to initialize app:', error);
    alert('Failed to load app: ' + error.message + '\n\nCheck console for details.');
  } finally {
    isInitializing = false;
  }
}

// Check if user is already logged in on page load
supabase.auth.onAuthStateChange(async (event, session) => {
  console.log('Auth state changed:', event);

  if (session && session.user) {
    currentUser = session.user;
    console.log('User authenticated:', currentUser.email);
    await beginInitializationIfNeeded();
  } else {
    currentUser = null;
    hasInitialized = false;
    showAuthScreen();
  }
});

// Show/hide screens
function showAuthScreen() {
  document.getElementById('authScreen').style.display = 'flex';
  document.getElementById('mainApp').style.display = 'none';

  // Clear forms
  document.getElementById('loginForm').reset();
  document.getElementById('signupForm').reset();
  document.getElementById('loginError').textContent = '';
  document.getElementById('signupError').textContent = '';
  document.getElementById('signupSuccess').textContent = '';
}

function showMainApp() {
  document.getElementById('authScreen').style.display = 'none';
  document.getElementById('mainApp').style.display = 'block';
}
