import * as pdfjs from 'pdfjs-dist';
import mammoth from 'mammoth';

// Set worker source for pdfjs - use local bundled worker to avoid CDN fetch failures
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).href;

export async function extractTextFromPdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  let fullText = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item: any) => item.str).join(' ');
    fullText += pageText + '\n';
  }

  return fullText;
}

export async function extractTextFromDocx(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

export async function extractTextFromFile(file: File): Promise<string> {
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (extension === 'pdf') {
    return extractTextFromPdf(file);
  } else if (extension === 'docx') {
    return extractTextFromDocx(file);
  } else if (extension === 'txt') {
    return file.text();
  } else if (extension === 'html' || extension === 'htm') {
    const html = await file.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.innerText || '';
  }
  throw new Error('Định dạng file không được hỗ trợ. Vui lòng sử dụng PDF, DOCX, WORD (docx), TXT hoặc HTML.');
}
