import { Pinecone } from "@pinecone-database/pinecone";

import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

import { downloadAndSavePDFs } from "~/lib/download-server";
import {
  Document,
  RecursiveCharacterTextSplitter,
} from "@pinecone-database/doc-splitter";
import exp from "constants";
import { promise } from "zod";

let pinecone: Pinecone | null = null;
//const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
type PDFPage = {
  pageContent: string;
  metadata: {
    source: string;
    pdf: object;
    loc: object;
  };
  id: undefined;
};
export const pineconeClient = async () => {
  if (!pinecone) {
    pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY ?? "",
    });
  }
  return pinecone;
};

export const loadFileIntoPinecone = async (url: string[]) => {
  console.log("downlaoding file");
  const fileName = await downloadAndSavePDFs(url);
  if (!fileName) {
    throw new Error("Failed to download file");
  }
  console.log("file name from atfer downloaded file", fileName);

  //const file = fileName[0];
  const allPages = [];
  for (let i = 1; i < fileName.length; i++) {
    const loader = new PDFLoader(fileName[i]);
    const pages = (await loader.load()) as PDFPage[];
    allPages.push(...pages);
  }
  // const loader = new PDFLoader(file);
  // const pages = await loader.load();
  const docs = await Promise.all(allPages.map(prepareDocs));
  return docs;
};

export function turncateStringByBytes(str: string, bytes: number) {
  const enc = new TextEncoder();
  return new TextDecoder("utf8").decode(enc.encode(str).slice(0, bytes));
}
async function prepareDocs(pages: PDFPage) {
  let { pageContent, metadata } = pages;
  pageContent = pageContent.replace(/\n/g, "");
  const textSplitter = new RecursiveCharacterTextSplitter();
  const docs = await textSplitter.splitDocuments([
    new Document({
      pageContent,
      metadata: {
        text: turncateStringByBytes(pageContent, 36000),
      },
    }),
  ]);
  return docs;
}
