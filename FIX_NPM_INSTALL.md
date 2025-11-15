# Fix npm install Errors

## Problem
- `npm error No versions available for supabase-js`
- `ts-node-dev is not recognized` (because install failed)

## Solutions (Try in Order)

### Solution 1: Clear npm cache and retry
```powershell
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json

# Try install again
npm install
```

### Solution 2: Use specific registry
```powershell
# Clear cache first
npm cache clean --force

# Install with explicit registry
npm install --registry https://registry.npmjs.org/
```

### Solution 3: Check Node.js version
```powershell
# Check Node version (need 18+)
node --version

# If version is too old, update Node.js from nodejs.org
```

### Solution 4: Install packages one by one (if above fails)
```powershell
npm install express cors dotenv helmet morgan
npm install openai supabase-js twilio zod
npm install ws node-fetch apn jsonwebtoken
npm install --save-dev @types/node @types/express @types/cors @types/morgan
npm install --save-dev @types/ws @types/jsonwebtoken
npm install --save-dev typescript ts-node ts-node-dev
npm install --save-dev eslint swagger-jsdoc swagger-ui-express
```

### Solution 5: Use yarn instead (if npm keeps failing)
```powershell
# Install yarn globally
npm install -g yarn

# Use yarn to install
yarn install
```

---

## After Successful Install

1. Verify `node_modules` folder exists
2. Verify `package-lock.json` has content
3. Run: `npm run dev`

---

## If Still Failing

Check:
- Internet connection
- Firewall/proxy blocking npm registry
- Corporate network restrictions
- Try: `npm config set registry https://registry.npmjs.org/`

