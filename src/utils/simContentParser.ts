/**
 * Utility to parse simulation parameters, quiz questions, and narration
 * directly from the editor's HTML/text content in real time.
 */

export interface ParsedSimData {
  params: Record<string, any>;
  quiz: Array<{ q: string; opts: string[]; a: string }>;
  narration: string;
}

export function parseSimDataFromContent(htmlContent: string, previewType: string): ParsedSimData {
  // Strip HTML to get plain text for processing
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlContent;
  const text = tempDiv.textContent || tempDiv.innerText || '';

  const data: ParsedSimData = {
    params: {},
    quiz: [],
    narration: '',
  };

  // 1. Parse Narration / Guide Text
  // Search for keywords like "Kịch bản lời giảng:", "Lời dẫn:", "Lời giảng:", "Thuyết minh AI:", "Thuyết minh:"
  const narrationRegex = /(?:kịch bản lời giảng|lời dẫn giáo viên|lời dẫn|lời giảng|thuyết minh ai|thuyết minh)\s*[:：]\s*(.*?)(?=\n\n|\n[0-9]+\.|\n[A-Z]|$)/i;
  const narrationMatch = text.match(narrationRegex);
  if (narrationMatch && narrationMatch[1].trim()) {
    data.narration = narrationMatch[1].trim().replace(/^["']|["']$/g, '');
  }

  // 2. Parse Customized Quiz Questions from document text
  // Looks for patterns like:
  // Câu 1: Trái đất quay hướng nào?
  // A. Tây sang Đông
  // B. Đông sang Tây
  // C. ...
  // Đáp án: A
  const quizBlocks = text.split(/(?=câu\s*\d+\s*[:：])/i);
  if (quizBlocks.length > 1) {
    const parsedQuestions: Array<{ q: string; opts: string[]; a: string }> = [];
    
    // Skip index 0 as it's the intro content before the first question
    for (let i = 1; i < quizBlocks.length; i++) {
      const block = quizBlocks[i];
      const qLineMatch = block.match(/câu\s*\d+\s*[:：]\s*(.*?)(?=\n|\r|[A-D]\.|$)/i);
      if (!qLineMatch) continue;

      const questionText = qLineMatch[1].trim();
      
      // Extract options A, B, C, D
      const options: string[] = [];
      const optAMatch = block.match(/A\.\s*(.*?)(?=\n|\r|B\.)/i);
      const optBMatch = block.match(/B\.\s*(.*?)(?=\n|\r|C\.)/i);
      const optCMatch = block.match(/C\.\s*(.*?)(?=\n|\r|D\.)/i);
      const optDMatch = block.match(/D\.\s*(.*?)(?=\n|\r|đáp án|câu|$)/i);

      if (optAMatch) options.push(optAMatch[1].trim());
      if (optBMatch) options.push(optBMatch[1].trim());
      if (optCMatch) options.push(optCMatch[1].trim());
      if (optDMatch) options.push(optDMatch[1].trim());

      // Try to find the correct answer
      let answer = '';
      const ansMatch = block.match(/(?:đáp án|chọn|đúng)\s*[:：]?\s*([A-D])/i);
      if (ansMatch && options.length > 0) {
        const letter = ansMatch[1].toUpperCase();
        const index = letter.charCodeAt(0) - 65; // A=0, B=1, C=2, D=3
        if (options[index]) {
          answer = options[index];
        }
      } else if (options.length > 0) {
        // Fallback: search if option has marker like (*) or (Đúng)
        const starredIndex = options.findIndex(opt => opt.includes('(*)') || opt.toLowerCase().includes('(đúng)'));
        if (starredIndex !== -1) {
          answer = options[starredIndex].replace(/\(\*\)/g, '').replace(/\(đúng\)/gi, '').trim();
          options[starredIndex] = answer;
        } else {
          // If no answer specified, use the first option as default correct answer
          answer = options[0];
        }
      }

      if (questionText && options.length >= 2) {
        parsedQuestions.push({
          q: questionText,
          opts: options,
          a: answer || options[0],
        });
      }
    }

    if (parsedQuestions.length > 0) {
      data.quiz = parsedQuestions;
    }
  }

  // 3. Parse specific simulation parameters
  if (previewType === 'orographicrain') {
    // Extract temperatures for windward base, peak, and leeward base
    // Example: "Chân núi 28°C", "đỉnh núi 2000m còn 16°C", "Việt Nam sẽ là 36°C"
    const tempBaseWindwardMatch = text.match(/(?:chân núi|nhiệt độ ban đầu)\s*(?:sườn đón gió)?\s*(?:là)?\s*(\d+)\s*°/i);
    const tempPeakMatch = text.match(/(?:đỉnh núi|lên đỉnh)\s*(?:2000m)?\s*(?:còn|là)?\s*(\d+)\s*°/i);
    const tempBaseLeewardMatch = text.match(/(?:sườn khuất gió|xuống chân núi|Việt Nam sẽ là)\s*(\d+)\s*°/i);
    const mountainNameMatch = text.match(/(?:dãy|dãy núi)\s*([A-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚÝàáâãèéêìíòóôõùúýĂăÂâĐđÊêÔôƠơƯưỨứỨuỨy\s]+?)(?=\s+và|\s+chắn|\s+bị|\.|\n|$)/);

    if (tempBaseWindwardMatch) data.params.tempBaseWindward = parseInt(tempBaseWindwardMatch[1], 10);
    if (tempPeakMatch) data.params.tempPeak = parseInt(tempPeakMatch[1], 10);
    if (tempBaseLeewardMatch) data.params.tempBaseLeeward = parseInt(tempBaseLeewardMatch[1], 10);
    if (mountainNameMatch && mountainNameMatch[1].trim().length < 30) {
      data.params.mountainName = mountainNameMatch[1].trim();
    }
  } 
  else if (previewType === 'sunray') {
    // Example: "góc nhập xạ 45 độ" or "góc chiếu 60°"
    const angleMatch = text.match(/(?:góc nhập xạ|góc chiếu)\s*(?:là)?\s*(\d+)\s*(?:°|độ)/i);
    if (angleMatch) {
      data.params.sunAngle = Math.max(10, Math.min(90, parseInt(angleMatch[1], 10)));
    }
  }
  else if (previewType === 'earth') {
    // Example: "Vỏ Trái Đất dày 70 km" or "Manti trên dày 400 km"
    const crustMatch = text.match(/(?:vỏ trái đất|lớp vỏ)\s*(?:dày|khoảng)?\s*(\d+)\s*(?:km|kilômét)/i);
    if (crustMatch) data.params.crustThickness = parseInt(crustMatch[1], 10);
  }
  else if (previewType === 'timezone') {
    // Check if customized cities are mentioned with UTC offsets
    // Example: "Hà Nội (UTC+7)", "London (UTC+0)", "Tokyo (UTC+9)"
    const cityMatches = [...text.matchAll(/([A-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚÝ][a-zàáâãèéêìíòóôõùúýĂăÂâĐđÊêÔôƠơƯư\s]{1,15})\s*\(\s*UTC\s*([+-]\d+)\s*\)/g)];
    if (cityMatches.length > 0) {
      data.params.cities = cityMatches.map(m => ({
        name: m[1].trim(),
        offset: parseInt(m[2], 10)
      }));
    }
  }

  return data;
}
