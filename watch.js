const fs = require("fs");
const { spawn } = require("child_process");
const path = require("path");

// المجلدات التي سنراقبها للتغييرات
const watchFolders = [
  ".",
  "src",
  "src/routes",
  "src/controllers",
  "src/models",
  "src/config",
  "src/middleware",
];

// المجلدات التي سنتجاهلها
const ignorePatterns = ["node_modules", ".git", "dist", "build"];

// أنواع الملفات التي سنراقبها
const watchExtensions = [".js", ".json", ".env"];

let serverProcess = null;
let isRestarting = false;
let restartTimeout = null;

// وظيفة لبدء تشغيل الخادم
function startServer() {
  if (isRestarting) return;
  isRestarting = true;

  if (restartTimeout) {
    clearTimeout(restartTimeout);
  }

  // تأخير قصير لتجنب إعادة التشغيل المتكررة
  restartTimeout = setTimeout(() => {
    if (serverProcess) {
      serverProcess.kill();
    }

    console.log("Starting server...");
    // استخدم 'node' كأمر منفصل لأنه يعمل مع النظام الحالي
    serverProcess = spawn("node", ["src/server.js"], { stdio: "inherit" });

    serverProcess.on("error", (err) => {
      console.error("Failed to start server:", err);
      isRestarting = false;
    });

    serverProcess.on("exit", (code, signal) => {
      if (code !== null && code !== 0) {
        console.error(`Server exited with code ${code}`);
      } else if (signal) {
        console.log(`Server was killed with signal ${signal}`);
      }
      isRestarting = false;
    });
  }, 500);
}

// التحقق مما إذا كان المسار يجب تجاهله
function shouldIgnore(filePath) {
  return ignorePatterns.some((pattern) => filePath.includes(pattern));
}

// وظيفة لإعادة تشغيل الخادم عند تغيير الملفات
function setupWatchers() {
  watchFolders.forEach((folder) => {
    const watchPath = path.join(__dirname, folder);

    try {
      fs.watch(watchPath, { recursive: true }, (eventType, filename) => {
        if (!filename) return;

        const filePath = path.join(folder, filename);

        // تجاهل node_modules وغيرها من المجلدات
        if (shouldIgnore(filePath)) {
          return;
        }

        const ext = path.extname(filename);
        if (!watchExtensions.includes(ext)) return;

        console.log(`File ${filePath} changed. Restarting server...`);
        startServer();
      });
      console.log(`Watching ${watchPath} for changes`);
    } catch (err) {
      console.error(`Failed to watch ${watchPath}:`, err);
    }
  });
}

// بدء الخادم وإعداد المراقبة
startServer();
setupWatchers();

console.log(
  "Watcher started. The server will automatically restart when files change."
);
console.log("Press Ctrl+C to stop.");
