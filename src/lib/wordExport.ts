import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from "docx";
import { saveAs } from "file-saver";

export const exportBlocksToWord = async (blocks: any[], lessonTitle: string) => {
  const children: Paragraph[] = [];

  // Thêm Tiêu đề bài học
  children.push(
    new Paragraph({
      text: lessonTitle || "Kế hoạch bài dạy",
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    })
  );

  // Xử lý từng block (markdown content)
  for (const block of blocks) {
    if (!block.content) continue;
    
    const lines = block.content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      if (!line.trim()) {
        children.push(new Paragraph({ text: "" }));
        continue;
      }

      let headingLevel = null;
      let bullet = null;

      // Phân tích thẻ Heading
      if (line.startsWith('### ')) {
        headingLevel = HeadingLevel.HEADING_3;
        line = line.replace('### ', '');
      } else if (line.startsWith('## ')) {
        headingLevel = HeadingLevel.HEADING_2;
        line = line.replace('## ', '');
      } else if (line.startsWith('# ')) {
        headingLevel = HeadingLevel.HEADING_1;
        line = line.replace('# ', '');
      } 
      // Phân tích thẻ Bullet (Danh sách)
      else if (line.startsWith('- ')) {
        bullet = { level: 0 };
        line = line.replace('- ', '');
      } else if (line.startsWith('  - ') || line.startsWith('  + ')) {
        bullet = { level: 1 };
        line = line.replace(/^(  - |  \+ )/, '');
      } else if (line.startsWith('> ')) {
        line = line.replace('> ', ''); // Blockquote fallback
      } else if (line.startsWith('|') && line.endsWith('|')) {
        // Bỏ qua dòng kẻ bảng ---|---
        if (line.includes('---|')) continue;
        // Tạm thời coi dòng bảng như văn bản bình thường (sẽ đẹp hơn nếu render Table của docx, nhưng tốn chi phí)
      }

      // Xử lý bôi đậm (Bold) và in nghiêng (Italic)
      const runs: TextRun[] = [];
      const parts = line.split(/(\*\*.*?\*\*|\*.*?\*)/g);
      
      for (const part of parts) {
        if (part.startsWith('**') && part.endsWith('**')) {
          runs.push(new TextRun({ text: part.substring(2, part.length - 2), bold: true }));
        } else if (part.startsWith('*') && part.endsWith('*')) {
          runs.push(new TextRun({ text: part.substring(1, part.length - 1), italics: true }));
        } else if (part) {
          runs.push(new TextRun({ text: part }));
        }
      }

      const paraConfig: any = { children: runs };
      if (headingLevel) {
        paraConfig.heading = headingLevel;
        paraConfig.spacing = { before: 240, after: 120 };
      } else {
        paraConfig.spacing = { after: 120 };
      }
      
      if (bullet) {
        paraConfig.bullet = bullet;
      }

      children.push(new Paragraph(paraConfig));
    }
    
    // Thêm khoảng trống sau mỗi block
    children.push(new Paragraph({ text: "", spacing: { after: 200 } }));
  }

  const doc = new Document({
    sections: [{
      properties: {},
      children: children,
    }],
  });

  const blob = await Packer.toBlob(doc);
  const safeTitle = (lessonTitle || 'Giao_an').replace(/[^a-z0-9]/gi, '_').toLowerCase();
  saveAs(blob, `${safeTitle}.docx`);
};
