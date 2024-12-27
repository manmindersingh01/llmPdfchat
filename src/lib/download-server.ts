import fs from "fs";
import https from "https";
import path from "path";

export async function downloadAndSavePDF(url: string) {
  const fileName = `/tmp/pdf-${Date.now()}.pdf`;
  const filePath = path.resolve(fileName); // Ensure the file path is valid
  const fileStream = fs.createWriteStream(filePath);

  return new Promise((resolve, reject) => {
    https
      .get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to fetch PDF: ${response.statusCode}`));
          return;
        }

        response.pipe(fileStream);

        fileStream.on("finish", () => {
          fileStream.close();
          resolve(filePath);
        });

        fileStream.on("error", (error) => {
          fs.unlink(filePath, () => {}); // Cleanup the file on error
          reject(error);
        });
      })
      .on("error", (error) => {
        fs.unlink(filePath, () => {}); // Cleanup the file on error
        reject(error);
      });
  });
}
