/**
 * Client-side file and image processing utility.
 * Optimizes image uploads for lightning-fast transmission to Gemini API,
 * and extracts text from documents, PDFs, and text files.
 */

export async function processUploadFile(file: File): Promise<{
  id: string;
  name: string;
  mimeType: string;
  data: string; // base64
  previewUrl?: string;
  fileCategory: "image" | "pdf" | "document" | "text";
  size: number;
  extractedText?: string;
}> {
  const fileName = (file?.name || "").toLowerCase();
  const fileType = (file?.type || "").toLowerCase();
  const isPdf = fileType === "application/pdf" || fileName.endsWith(".pdf");
  const isImage = fileType.startsWith("image/") || /\.(png|jpe?g|webp|gif|bmp|heic)$/.test(fileName);
  const isText =
    fileType.startsWith("text/") ||
    fileName.endsWith(".txt") ||
    fileName.endsWith(".md") ||
    fileName.endsWith(".csv") ||
    fileName.endsWith(".json") ||
    fileName.endsWith(".html") ||
    fileName.endsWith(".xml");

  const id = `file_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

  // 1. Handle Text Files
  if (isText) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const text = String(reader.result || "");
        const base64 = btoa(unescape(encodeURIComponent(text)));
        resolve({
          id,
          name: file.name,
          mimeType: file.type || "text/plain",
          data: `data:${file.type || "text/plain"};base64,${base64}`,
          fileCategory: "text",
          size: file.size,
          extractedText: text,
        });
      };
      reader.onerror = () => {
        resolve({
          id,
          name: file.name,
          mimeType: "text/plain",
          data: "",
          fileCategory: "text",
          size: file.size,
        });
      };
      reader.readAsText(file, "utf-8");
    });
  }

  // 2. Handle PDF Documents
  if (isPdf) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          id,
          name: file.name,
          mimeType: "application/pdf",
          data: reader.result as string,
          fileCategory: "pdf",
          size: file.size,
        });
      };
      reader.onerror = () => {
        resolve({
          id,
          name: file.name,
          mimeType: "application/pdf",
          data: "",
          fileCategory: "pdf",
          size: file.size,
        });
      };
      reader.readAsDataURL(file);
    });
  }

  // 3. Handle Images with Auto-Optimization (Compression)
  if (isImage) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const rawDataUrl = reader.result as string;

        // If image is small (< 1.5MB), keep as is
        if (file.size < 1.5 * 1024 * 1024 && !file.name.endsWith(".bmp")) {
          return resolve({
            id,
            name: file.name,
            mimeType: file.type || "image/jpeg",
            data: rawDataUrl,
            previewUrl: rawDataUrl,
            fileCategory: "image",
            size: file.size,
          });
        }

        // Compress large photos to max 1920px dimensions & 0.85 quality
        const img = new Image();
        img.onload = () => {
          try {
            const MAX_DIM = 1920;
            let width = img.width;
            let height = img.height;

            if (width > MAX_DIM || height > MAX_DIM) {
              if (width > height) {
                height = Math.round((height * MAX_DIM) / width);
                width = MAX_DIM;
              } else {
                width = Math.round((width * MAX_DIM) / height);
                height = MAX_DIM;
              }
            }

            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);
              const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.85);
              return resolve({
                id,
                name: file.name,
                mimeType: "image/jpeg",
                data: compressedDataUrl,
                previewUrl: compressedDataUrl,
                fileCategory: "image",
                size: Math.round((compressedDataUrl.length * 3) / 4),
              });
            }
          } catch (e) {
            console.warn("Canvas compression failed, using original:", e);
          }
          // Fallback to original
          resolve({
            id,
            name: file.name,
            mimeType: file.type || "image/jpeg",
            data: rawDataUrl,
            previewUrl: rawDataUrl,
            fileCategory: "image",
            size: file.size,
          });
        };
        img.onerror = () => {
          resolve({
            id,
            name: file.name,
            mimeType: file.type || "image/jpeg",
            data: rawDataUrl,
            previewUrl: rawDataUrl,
            fileCategory: "image",
            size: file.size,
          });
        };
        img.src = rawDataUrl;
      };
      reader.readAsDataURL(file);
    });
  }

  // 4. Other Documents (e.g. DOCX or binary)
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        id,
        name: file.name,
        mimeType: file.type || "application/octet-stream",
        data: reader.result as string,
        fileCategory: "document",
        size: file.size,
      });
    };
    reader.readAsDataURL(file);
  });
}
