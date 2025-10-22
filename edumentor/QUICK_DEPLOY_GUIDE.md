# 🚀 Quick Deployment Guide

## Problem: Hosted Site Shows Old Code

Your Firebase hosted site is serving old/cached code even after deploying new fixes.

---

## ✅ Quick Fix (Choose One Method)

### **Method 1: Use Automated Script (RECOMMENDED)**

#### For PowerShell:
```powershell
cd edumentor
.\deploy.ps1
```

#### For Command Prompt:
```cmd
cd edumentor
deploy.bat
```

The script will:
1. ✅ Delete old build folder
2. ✅ Create fresh production build
3. ✅ Deploy to Firebase with force flag
4. ✅ Show you next steps

---

### **Method 2: Manual Deployment**

```bash
# Navigate to edumentor folder
cd edumentor

# Delete old build
Remove-Item -Recurse -Force build

# Create fresh build
npm run build

# Deploy to Firebase
firebase deploy --only hosting --
```

---

## 🔍 After Deployment

### **Step 1: Clear Browser Cache**
- **Windows:** Press `Ctrl + Shift + R`
- **Mac:** Press `Cmd + Shift + R`

### **Step 2: Test in Incognito Mode**
1. Open new incognito/private window
2. Go to your hosted URL
3. Check if fixes appear

### **Step 3: Verify Fixes Work**
- ✅ No "Profile fetch timeout" error
- ✅ No refresh token errors
- ✅ Profile data displays correctly
- ✅ Display name check works properly

---

## ⚠️ If Changes Still Don't Appear

### Wait for CDN Cache
- Firebase CDN cache can take **2-5 minutes** to clear
- Be patient and try again after waiting

### Force Clear Everything
```bashforce
# In edumentor folder
Remove-Item -Recurse -Force build
Remove-Item -Recurse -Force node_modules
npm install
npm run build
firebase deploy --only hosting --force
```

### Check Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to **Hosting** → **Release history**
4. Check latest deployment timestamp
5. Should show deployment within last few minutes

---

## 📝 Best Practice

**ALWAYS** use the deployment script (`deploy.ps1` or `deploy.bat`) instead of manual commands. It ensures:
- ✅ Old build is deleted
- ✅ Fresh build is created
- ✅ Deployment uses force flag
- ✅ No cached files are deployed

---

## 🎯 Common Mistakes to Avoid

❌ **Don't do:** `firebase deploy` (without deleting build folder first)
✅ **Do:** Use deployment script or delete build first

❌ **Don't do:** Deploy without `--force` flag
✅ **Do:** Always use `firebase deploy --only hosting --force`

❌ **Don't do:** Test immediately after deployment
✅ **Do:** Wait 2-3 minutes, then test in incognito

---

## 🔧 Troubleshooting

### "Firebase command not found"
```bash
npm install -g firebase-tools
firebase login
```

### "Build failed"
```bash
# Check for errors in console
# Fix any linter errors
# Then run deployment script again
```

### "Permission denied"
- Close VS Code and any other programs
- Run PowerShell/CMD as Administrator
- Try deployment script again

---

## 📞 Quick Commands Reference

```bash
# Clean deployment
Remove-Item -Recurse -Force build && npm run build && firebase deploy --only hosting --force

# Check Firebase login
firebase login

# List Firebase projects
firebase projects:list

# Check current project
firebase use
```

---

## ✨ Summary

1. **Use deployment script** (`deploy.ps1` or `deploy.bat`)
2. **Wait 2-3 minutes** after deployment
3. **Clear browser cache** (Ctrl+Shift+R)
4. **Test in incognito mode**
5. **Verify all fixes work**

That's it! Your hosted site will now show the latest code with all fixes.

