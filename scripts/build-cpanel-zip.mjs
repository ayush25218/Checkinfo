import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const rootDir = process.cwd();
const standaloneDir = path.join(rootDir, ".next", "standalone");
const publicDir = path.join(rootDir, "public");
const staticDir = path.join(rootDir, ".next", "static");
const envExample = path.join(rootDir, ".env.example");

if (!fs.existsSync(standaloneDir)) {
  console.error("Error: .next/standalone directory not found. Please run 'npm run build' first.");
  process.exit(1);
}

const timestamp = new Date().toISOString().replace(/[^0-9]/g, "").slice(0, 14);
const deployDirName = `checkinfo-cpanel-deploy-${timestamp}`;
const uploadDir = path.join(rootDir, ".codex-upload");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const targetDir = path.join(uploadDir, deployDirName);
fs.mkdirSync(targetDir, { recursive: true });

console.log(`Copying standalone build to ${targetDir}...`);
fs.cpSync(standaloneDir, targetDir, { dereference: true, recursive: true });

const targetPublic = path.join(targetDir, "public");
if (fs.existsSync(publicDir)) {
  console.log("Copying public directory...");
  fs.cpSync(publicDir, targetPublic, { dereference: true, recursive: true });
}

const targetStatic = path.join(targetDir, ".next", "static");
if (fs.existsSync(staticDir)) {
  console.log("Copying .next/static directory...");
  fs.cpSync(staticDir, targetStatic, { dereference: true, recursive: true });
}

const targetEnv = path.join(targetDir, ".env");
const realEnv = path.join(rootDir, ".env");
if (fs.existsSync(realEnv)) {
  fs.copyFileSync(realEnv, targetEnv);
} else if (fs.existsSync(envExample)) {
  fs.copyFileSync(envExample, targetEnv);
}

const zipFileName = `${deployDirName}.zip`;
const zipFilePath = path.join(uploadDir, zipFileName);

console.log(`Compressing deployment folder to ${zipFilePath}...`);

try {
  const psCmd = `powershell -Command "Compress-Archive -Path '${targetDir}\\*' -DestinationPath '${zipFilePath}' -Force"`;
  execSync(psCmd, { stdio: "inherit" });
  console.log(`\nSUCCESS: cPanel Deployment ZIP created at:\n${zipFilePath}`);
} catch (err) {
  console.error("Compression failed:", err);
}
