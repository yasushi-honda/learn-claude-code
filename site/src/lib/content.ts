import fs from "fs";
import path from "path";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeHighlight from "rehype-highlight";
import rehypeStringify from "rehype-stringify";

const CONTENT_DIR = path.join(process.cwd(), "..");

export interface WeekInfo {
  id: string;
  number: number;
  slug: string;
  title: string;
  dirName: string;
  lessons: LessonInfo[];
}

export interface LessonInfo {
  id: string;
  slug: string;
  fileName: string;
  title: string;
  order: number;
}

export interface AppendixInfo {
  id: string;
  slug: string;
  fileName: string;
  title: string;
}

const WEEK_TITLES: Record<string, string> = {
  "01": "入門・セットアップ",
  "02": "基本操作・CLI",
  "03": "開発環境統合",
  "04": "プロジェクト設定・メモリ",
  "05": "カスタマイズ・拡張",
  "06": "MCP・外部ツール連携",
  "07": "チーム開発・CI/CD",
  "08": "上級・エンタープライズ",
};

function extractTitle(content: string): string {
  const match = content.match(/^#\s+(.+)/m);
  return match ? match[1].trim() : "Untitled";
}

export function getWeeks(): WeekInfo[] {
  const dirs = fs
    .readdirSync(CONTENT_DIR)
    .filter((d) => d.startsWith("week-") && fs.statSync(path.join(CONTENT_DIR, d)).isDirectory())
    .sort();

  return dirs.map((dirName) => {
    const num = dirName.match(/week-(\d+)/)?.[1] ?? "00";
    const lessons = getLessonsForWeek(dirName);
    return {
      id: num,
      number: parseInt(num, 10),
      slug: num,
      title: WEEK_TITLES[num] ?? `Week ${num}`,
      dirName,
      lessons,
    };
  });
}

function getLessonsForWeek(dirName: string): LessonInfo[] {
  const weekDir = path.join(CONTENT_DIR, dirName);
  const files = fs
    .readdirSync(weekDir)
    .filter((f) => f.endsWith(".md") && f !== "README.md" && f !== "references.md")
    .sort();

  return files.map((fileName) => {
    const slug = fileName.replace(/\.md$/, "");
    const orderMatch = slug.match(/^(\d+)/);
    const order = orderMatch ? parseInt(orderMatch[1], 10) : 99;
    const content = fs.readFileSync(path.join(weekDir, fileName), "utf-8");
    return {
      id: slug,
      slug,
      fileName,
      title: extractTitle(content),
      order,
    };
  });
}

export function getWeekReadme(weekId: string): string | null {
  const week = getWeeks().find((w) => w.id === weekId);
  if (!week) return null;
  const readmePath = path.join(CONTENT_DIR, week.dirName, "README.md");
  if (!fs.existsSync(readmePath)) return null;
  return fs.readFileSync(readmePath, "utf-8");
}

export function getWeekReferences(weekId: string): string | null {
  const week = getWeeks().find((w) => w.id === weekId);
  if (!week) return null;
  const refPath = path.join(CONTENT_DIR, week.dirName, "references.md");
  if (!fs.existsSync(refPath)) return null;
  return fs.readFileSync(refPath, "utf-8");
}

export function getLessonContent(weekId: string, lessonSlug: string): string | null {
  const week = getWeeks().find((w) => w.id === weekId);
  if (!week) return null;
  const filePath = path.join(CONTENT_DIR, week.dirName, `${lessonSlug}.md`);
  if (!fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath, "utf-8");
}

export function getAppendices(): AppendixInfo[] {
  const appendixDir = path.join(CONTENT_DIR, "appendix");
  if (!fs.existsSync(appendixDir)) return [];
  const files = fs
    .readdirSync(appendixDir)
    .filter((f) => f.endsWith(".md"))
    .sort();

  return files.map((fileName) => {
    const slug = fileName.replace(/\.md$/, "");
    const content = fs.readFileSync(path.join(appendixDir, fileName), "utf-8");
    return {
      id: slug,
      slug,
      fileName,
      title: extractTitle(content),
    };
  });
}

export function getAppendixContent(slug: string): string | null {
  const filePath = path.join(CONTENT_DIR, "appendix", `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath, "utf-8");
}

export async function markdownToHtml(markdown: string): Promise<string> {
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeHighlight, { detect: true })
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(markdown);

  return result.toString();
}
