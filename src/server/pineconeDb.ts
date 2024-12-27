import { Pinecone } from "@pinecone-database/pinecone";
import { downloadAndSavePDF } from "~/lib/download-server";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { string } from "zod";

let pinecone: Pinecone | null = null;
//const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

export const pineconeClient = async () => {
  if (!pinecone) {
    pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY ?? "",
    });
  }
  return pinecone;
};

export const loadFileIntoPinecone = async (url: string) => {
  console.log("downlaoding file");
  const fileName = await downloadAndSavePDF(url);
  if (!fileName) {
    throw new Error("Failed to download file");
  }
  const file = String(fileName);
  const loader = new PDFLoader(file);
  const pages = await loader.load();
  return pages;
};
