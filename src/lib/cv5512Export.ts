import {
  AlignmentType,
  Document,
  Footer,
  HeadingLevel,
  Packer,
  PageNumber,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";

import { saveAs } from "file-saver";

type LessonDocument = {
  documentInfo: {
    schoolName: string;
    departmentName: string;
    teacherName: string;
    lessonTitle: string;
    subject: string;
    grade: string;
    textbook: string;
    numberOfPeriods: number;
    implementationDate: string;
    academicYear: string;
  };
  objectives: Record<string, string[]>;
  equipmentAndMaterials: Record<string, string[]>;
  periods: Array<any>;
  appendices?: Record<string, any[]>;
  postLessonAdjustment?: {
    strengths?: string;
    limitations?: string;
    adjustments?: string;
  };
};

function createBulletParagraph(text: string): Paragraph {
  return new Paragraph({
    text,
    bullet: { level: 0 },
    alignment: AlignmentType.JUSTIFIED,
    spacing: {
      line: 276,
      after: 120,
    },
  });
}

function createHeading(text: string, level: any): Paragraph {
  return new Paragraph({
    heading: level,
    children: [
      new TextRun({
        text,
        bold: true,
        font: "Times New Roman",
      }),
    ],
    spacing: {
      before: 120,
      after: 120,
    },
  });
}

export async function exportLessonToWord(
  lesson: LessonDocument,
): Promise<void> {
  if (!lesson?.documentInfo?.lessonTitle) {
    throw new Error("Thiếu tên bài dạy.");
  }

  const children: Array<Paragraph | Table> = [];

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: "KẾ HOẠCH BÀI DẠY",
          bold: true,
          size: 32,
          font: "Times New Roman",
        }),
      ],
      spacing: { after: 120 },
    }),
  );

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: lesson.documentInfo.lessonTitle.toUpperCase(),
          bold: true,
          size: 30,
          font: "Times New Roman",
        }),
      ],
      spacing: { after: 240 },
    }),
  );

  const infoLines = [
    `Trường: ${lesson.documentInfo.schoolName || "[Giáo viên bổ sung]"}`,
    `Tổ chuyên môn: ${lesson.documentInfo.departmentName || "[Giáo viên bổ sung]"}`,
    `Giáo viên: ${lesson.documentInfo.teacherName || "[Giáo viên bổ sung]"}`,
    `Môn: ${lesson.documentInfo.subject || "Địa lí"} – Lớp: ${lesson.documentInfo.grade}`,
    `Bộ sách: ${lesson.documentInfo.textbook || "[Giáo viên bổ sung]"}`,
    `Số tiết: ${lesson.documentInfo.numberOfPeriods}`,
    `Thời gian thực hiện: ${lesson.documentInfo.implementationDate || "[Giáo viên bổ sung]"}`,
  ];

  infoLines.forEach((line) => {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: line,
            font: "Times New Roman",
            size: 26,
          }),
        ],
        spacing: { after: 80 },
      }),
    );
  });

  children.push(createHeading("I. MỤC TIÊU", HeadingLevel.HEADING_1));

  const objectiveLabels: Record<string, string> = {
    knowledge: "1. Kiến thức",
    generalCompetencies: "2. Năng lực chung",
    geographyCompetencies: "3. Năng lực đặc thù môn Địa lí",
    digitalCompetencies: "4. Năng lực số",
    aiCompetencies: "5. Năng lực sử dụng AI",
    qualities: "6. Phẩm chất",
  };

  Object.entries(objectiveLabels).forEach(([key, label]) => {
    children.push(createHeading(label, HeadingLevel.HEADING_2));

    const items = lesson.objectives?.[key] || [];
    items.forEach((item) => {
      children.push(createBulletParagraph(String(item)));
    });
  });

  children.push(
    createHeading(
      "II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU",
      HeadingLevel.HEADING_1,
    ),
  );

  Object.entries(lesson.equipmentAndMaterials || {}).forEach(
    ([key, items]) => {
      children.push(
        createHeading(
          key === "teacher"
            ? "1. Giáo viên"
            : key === "students"
              ? "2. Học sinh"
              : key === "digitalTools"
                ? "3. Công cụ và học liệu số"
                : "4. Phương án dự phòng",
          HeadingLevel.HEADING_2,
        ),
      );

      (items || []).forEach((item) => {
        children.push(createBulletParagraph(String(item)));
      });
    },
  );

  children.push(
    createHeading(
      "III. TIẾN TRÌNH DẠY HỌC",
      HeadingLevel.HEADING_1,
    ),
  );

  for (const period of lesson.periods || []) {
    children.push(
      createHeading(
        `TIẾT ${period.periodNumber}: ${period.periodTitle || ""}`,
        HeadingLevel.HEADING_2,
      ),
    );

    const headerRow = new TableRow({
      tableHeader: true,
      children: [
        "Hoạt động",
        "Mục tiêu",
        "Nội dung và nhiệm vụ",
        "Sản phẩm",
        "Tổ chức thực hiện",
        "Công cụ số/AI",
        "Đánh giá",
      ].map(
        (text) =>
          new TableCell({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text,
                    bold: true,
                    font: "Times New Roman",
                    size: 22,
                  }),
                ],
              }),
            ],
          }),
      ),
    });

    const activityRows = (period.activities || []).map((activity: any) => {
      const steps = activity.steps || {};

      const organization = [
        `Bước 1: ${JSON.stringify(steps.taskAssignment || {})}`,
        `Bước 2: ${JSON.stringify(steps.taskPerformance || {})}`,
        `Bước 3: ${JSON.stringify(steps.reportAndDiscussion || {})}`,
        `Bước 4: ${JSON.stringify(steps.conclusion || {})}`,
      ].join("\n");

      return new TableRow({
        cantSplit: true,
        children: [
          `${activity.activityName || ""}\n${activity.duration || ""}`,
          activity.objective || "",
          activity.content || "",
          activity.product || "",
          organization,
          activity.digitalIntegration?.tool || "",
          activity.assessment?.method || "",
        ].map(
          (text) =>
            new TableCell({
              width: {
                size: 14,
                type: WidthType.PERCENTAGE,
              },
              children: [
                new Paragraph({
                  alignment: AlignmentType.JUSTIFIED,
                  children: [
                    new TextRun({
                      text: String(text),
                      font: "Times New Roman",
                      size: 22,
                    }),
                  ],
                }),
              ],
            }),
        ),
      });
    });

    children.push(
      new Table({
        width: {
          size: 100,
          type: WidthType.PERCENTAGE,
        },
        rows: [headerRow, ...activityRows],
      }),
    );
  }

  children.push(
    createHeading(
      "IV. HỒ SƠ, PHỤ LỤC VÀ CÔNG CỤ ĐÁNH GIÁ",
      HeadingLevel.HEADING_1,
    ),
  );

  Object.entries(lesson.appendices || {}).forEach(([key, items]) => {
    if (!Array.isArray(items) || items.length === 0) return;

    children.push(
      createHeading(key, HeadingLevel.HEADING_2),
    );

    items.forEach((item) => {
      children.push(
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          children: [
            new TextRun({
              text:
                typeof item === "string"
                  ? item
                  : JSON.stringify(item, null, 2),
              font: "Times New Roman",
              size: 26,
            }),
          ],
          spacing: {
            line: 276,
            after: 120,
          },
        }),
      );
    });
  });

  children.push(
    createHeading(
      "V. ĐIỀU CHỈNH SAU BÀI DẠY",
      HeadingLevel.HEADING_1,
    ),
  );

  children.push(
    new Paragraph({
      text: `Ưu điểm: ${lesson.postLessonAdjustment?.strengths || ""}`,
    }),
    new Paragraph({
      text: `Hạn chế: ${lesson.postLessonAdjustment?.limitations || ""}`,
    }),
    new Paragraph({
      text: `Điều chỉnh: ${lesson.postLessonAdjustment?.adjustments || ""}`,
    }),
  );

  const document = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: "Times New Roman",
            size: 26,
          },
          paragraph: {
            spacing: {
              line: 276,
              after: 120,
            },
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1134,
              bottom: 1134,
              left: 1417,
              right: 1134,
            },
          },
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    font: "Times New Roman",
                    size: 20,
                  }),
                ],
              }),
            ],
          }),
        },
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(document);

  const safeName = lesson.documentInfo.lessonTitle
    .replace(/[\\/:*?"<>|]/g, "")
    .replace(/\s+/g, "_");

  saveAs(blob, `Giao_an_${safeName}.docx`);
}
