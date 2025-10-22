# How to Restart Development Server

## Why Restart is Needed
After code changes are made, sometimes the development server needs to be restarted for changes to take effect, especially for:
- Major component updates
- New dependencies
- Configuration changes
- Bug fixes that aren't hot-reloading properly

## How to Restart

### Method 1: Stop and Start (RECOMMENDED)
1. **Go to the terminal where `npm start` is running**
2. **Press `Ctrl + C`** to stop the server
3. **Wait for the server to stop completely**
4. **Run `npm start` again**:
   ```bash
   npm start
   ```

### Method 2: Kill and Restart (If Ctrl+C doesn't work)
1. **Close the terminal window**
2. **Open a new terminal**
3. **Navigate to project folder**:
   ```bash
   cd edumentor
   ```
4. **Start the server**:
   ```bash
   npm start
   ```

### Method 3: Clear Cache and Restart
If changes still don't appear:
```bash
# Stop the server (Ctrl+C)

# Clear npm cache (optional)
npm cache clean --force

# Remove node_modules (optional, only if needed)
# Remove-Item -Recurse -Force node_modules
# npm install

# Start the server
npm start
```

## After Restarting

1. **Wait for "Compiled successfully!"** message
2. **Clear browser cache**: Press `Ctrl + Shift + R`
3. **Refresh the page**: Press `F5`
4. **Check the changes**: Go to profile page and verify

## If Changes Still Don't Appear

1. **Hard refresh browser**: `Ctrl + Shift + R`
2. **Clear browser data**:
   - Press `F12` to open DevTools
   - Right-click refresh button
   - Select "Empty Cache and Hard Reload"
3. **Try incognito mode**: Open new private window
4. **Check console for errors**: Press `F12` → Console tab

## Quick Restart Commands

```bash
# Navigate to project
cd edumentor

# Stop server (Ctrl+C), then:
npm start

# Or in one line (PowerShell):
# Note: Ctrl+C first, then run:
npm start
```

## Expected Behavior After Restart

After restarting and refreshing:
- ✅ Empty arrays should show "Not specified"
- ✅ No colored circles for empty fields
- ✅ Filled fields show proper tags
- ✅ Console has no errors

