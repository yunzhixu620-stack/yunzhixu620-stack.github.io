import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = fs.readFileSync(path.join(root, "projects.js"), "utf8");
const sandbox = { window: {} };
vm.runInNewContext(source, sandbox, { filename: "projects.js" });
const projects = sandbox.window.PROJECTS;
const allowed = new Set(["可用产品", "MVP", "交互原型", "实验", "已归档"]);
const errors = [];

if (!Array.isArray(projects) || projects.length !== 11) errors.push(`项目数量应为 11，当前为 ${projects?.length ?? "无数据"}`);
const ids = new Set();

for (const project of projects || []) {
  if (!project.id || ids.has(project.id)) errors.push(`项目 id 缺失或重复：${project.id}`);
  ids.add(project.id);
  if (!allowed.has(project.status)) errors.push(`${project.id} 使用了无效状态：${project.status}`);
  for (const field of ["name", "tagline", "category", "summary", "boundary", "repo", "cover"]) {
    if (!project[field]) errors.push(`${project.id} 缺少 ${field}`);
  }
  for (const field of ["capabilities", "working", "next"]) {
    if (!Array.isArray(project[field]) || project[field].length < 3) errors.push(`${project.id} 的 ${field} 至少需要 3 项`);
  }
  if (!/^https:\/\/github\.com\/yunzhixu620-stack\//.test(project.repo || "")) errors.push(`${project.id} 的仓库链接不合法`);
  if (project.demo && !/^https:\/\/yunzhixu620-stack\.github\.io\//.test(project.demo)) errors.push(`${project.id} 的演示链接不合法`);
  if (!fs.existsSync(path.join(root, project.cover))) errors.push(`${project.id} 缺少封面：${project.cover}`);
}

for (const file of ["index.html", "styles.css", "app.js", "README.md", "404.html", "docs/STATUS_MODEL.md", "docs/CONTENT_BOUNDARIES.md"]) {
  if (!fs.existsSync(path.join(root, file))) errors.push(`缺少站点文件：${file}`);
}

if (errors.length) {
  console.error(errors.map((item) => `- ${item}`).join("\n"));
  process.exit(1);
}

const counts = Object.fromEntries([...allowed].map((status) => [status, projects.filter((project) => project.status === status).length]));
console.log(`Validation passed: ${projects.length} projects, ${JSON.stringify(counts)}`);
