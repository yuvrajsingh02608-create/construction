#!/bin/bash

# =========================================================================
# NJIB APK GENERATION SCRIPT
# This script automates the build process for Android.
# =========================================================================

set -e

echo "🚀 Step 1: Building Web Assets..."
npm run build || { echo "❌ Web build failed. Make sure you are in the project root."; exit 1; }

echo "🔄 Step 2: Syncing with Capacitor..."
npx cap sync android || { echo "❌ Capacitor sync failed."; exit 1; }

echo "🏗️ Step 3: Compiling Android APK..."
cd android
chmod +x gradlew
./gradlew assembleDebug || { echo "❌ Android build failed. Check your Android SDK/Java setup."; exit 1; }

echo ""
echo "✅ SUCCESS! Your APK is ready."
echo "📍 Location: $(pwd)/app/build/outputs/apk/debug/app-debug.apk"
echo ""
echo "You can now install this on your phone."
