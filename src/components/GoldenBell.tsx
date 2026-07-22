import React, { useState, useEffect, useRef } from 'react';
import { 
  Trophy, 
  Users, 
  Settings, 
  Play, 
  Plus, 
  Trash2, 
  ChevronLeft, 
  QrCode, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  BarChart3,
  Volume2,
  VolumeX,
  Send,
  Sparkles,
  Download,
  Upload,
  User as UserIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
import { Howl } from 'howler';
import Swal from 'sweetalert2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---
interface Question {
  id: string;
  content: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  image?: string;
}

interface Player {
  id: string;
  name: string;
  avatar: string;
  score: number;
  isEliminated: boolean;
  lastAnswer?: number;
  lastAnswerTime?: number;
  correctCount: number;
}

interface GameState {
  status: 'waiting' | 'playing' | 'result' | 'finished';
  currentQuestionIndex: number;
  timer: number;
  players: Player[];
  pin: string;
  questionSet: Question[];
  showAnswer: boolean;
}

// --- Sounds ---
const sounds = {
  correct: new Howl({ src: ['https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3'] }),
  wrong: new Howl({ src: ['https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3'] }),
  tick: new Howl({ src: ['https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3'] }),
  win: new Howl({ src: ['https://assets.mixkit.co/active_storage/sfx/2012/2012-preview.mp3'] }),
};

// --- Mock AI Generation ---
const generateAIQuestions = async (topic: string): Promise<Question[]> => {
  // In a real app, this would call Gemini
  return [
    {
      id: Math.random().toString(),
      content: `Câu hỏi AI về ${topic}: Đâu là thành phần chính của khí quyển Trái Đất?`,
      options: ['Oxy', 'Nitơ', 'Cacbonic', 'Argon'],
      correctAnswer: 1,
      explanation: 'Nitơ chiếm khoảng 78% khí quyển.',
      difficulty: 'medium',
      points: 100
    },
    {
      id: Math.random().toString(),
      content: `Câu hỏi AI về ${topic}: Kim loại nào dẫn điện tốt nhất?`,
      options: ['Vàng', 'Đồng', 'Bạc', 'Nhôm'],
      correctAnswer: 2,
      explanation: 'Bạc là kim loại dẫn điện tốt nhất ở điều kiện thường.',
      difficulty: 'hard',
      points: 200
    }
  ];
};

export const GoldenBellGame = ({ onBack }: { onBack: () => void }) => {
  const [view, setView] = useState<'lobby' | 'host_dash' | 'host_game' | 'player_join' | 'player_game'>('lobby');
  const [isAdmin, setIsAdmin] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Game State
  const [gameState, setGameState] = useState<GameState>({
    status: 'waiting',
    currentQuestionIndex: 0,
    timer: 20,
    players: [],
    pin: Math.floor(100000 + Math.random() * 900000).toString(),
    questionSet: [],
    showAnswer: false
  });

  const [questions, setQuestions] = useState<Question[]>([]);
  const [playerName, setPlayerName] = useState('');
  const [playerAvatar, setPlayerAvatar] = useState('😀');
  const [inputPin, setInputPin] = useState('');
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);

  // Load questions from local storage
  useEffect(() => {
    const saved = localStorage.getItem('gb_questions');
    if (saved) setQuestions(JSON.parse(saved));
    else {
      const initial: Question[] = [
        {
          id: '1',
          content: 'Vị trí địa lí của Việt Nam nằm ở:',
          options: ['Rìa phía đông của bán đảo Đông Dương', 'Trung tâm bán đảo Đông Dương', 'Phía tây bán đảo Đông Dương', 'Phía nam bán đảo Đông Dương'],
          correctAnswer: 0,
          explanation: 'Việt Nam nằm ở rìa phía đông của bán đảo Đông Dương, gần trung tâm khu vực Đông Nam Á.',
          difficulty: 'easy',
          points: 100
        },
        {
          id: '2',
          content: 'Tính chất nhiệt đới của khí hậu nước ta được quy định bởi:',
          options: ['Vị trí nằm trong vùng nội chí tuyến', 'Địa hình có nhiều đồi núi', 'Ảnh hưởng của Biển Đông', 'Hoạt động của gió mùa'],
          correctAnswer: 0,
          explanation: 'Vị trí nằm trong vùng nội chí tuyến Bắc bán cầu quy định tính chất nhiệt đới của khí hậu Việt Nam.',
          difficulty: 'medium',
          points: 150
        },
        {
          id: '3',
          content: 'Vùng nào ở nước ta có thế mạnh nổi bật về khai thác khoáng sản và thủy điện?',
          options: ['Đồng bằng sông Hồng', 'Trung du và miền núi phía Bắc', 'Tây Nguyên', 'Bắc Trung Bộ'],
          correctAnswer: 1,
          explanation: 'Trung du và miền núi phía Bắc là vùng giàu tài nguyên khoáng sản và có tiềm năng thủy điện lớn nhất nước ta.',
          difficulty: 'medium',
          points: 150
        },
        {
          id: '4',
          content: 'Đặc điểm nào sau đây không đúng với dân số nước ta hiện nay?',
          options: ['Dân số đông', 'Nhiều thành phần dân tộc', 'Cơ cấu dân số trẻ', 'Phân bố dân cư rất đồng đều'],
          correctAnswer: 3,
          explanation: 'Dân cư nước ta phân bố không đồng đều giữa đồng bằng và miền núi, giữa thành thị và nông thôn.',
          difficulty: 'easy',
          points: 100
        },
        {
          id: '5',
          content: 'Vùng kinh tế nào dẫn đầu cả nước về giá trị sản xuất công nghiệp?',
          options: ['Đồng bằng sông Hồng', 'Đông Nam Bộ', 'Đồng bằng sông Cửu Long', 'Duyên hải Nam Trung Bộ'],
          correctAnswer: 1,
          explanation: 'Đông Nam Bộ là vùng phát triển công nghiệp mạnh nhất, đóng góp tỷ trọng lớn nhất vào GDP cả nước.',
          difficulty: 'medium',
          points: 150
        },
        {
          id: '6',
          content: 'Biện pháp quan trọng nhất để bảo vệ rừng đặc dụng ở nước ta là:',
          options: ['Trồng rừng mới', 'Bảo vệ cảnh quan, đa dạng sinh học', 'Khai thác hợp lí', 'Giao đất giao rừng cho dân'],
          correctAnswer: 1,
          explanation: 'Rừng đặc dụng được thành lập nhằm bảo vệ hệ sinh thái, đa dạng sinh học và di tích lịch sử.',
          difficulty: 'hard',
          points: 200
        },
        {
          id: '7',
          content: 'Ngành vận tải nào có khối lượng luân chuyển hàng hóa lớn nhất ở nước ta?',
          options: ['Đường bộ', 'Đường sắt', 'Đường biển', 'Đường hàng không'],
          correctAnswer: 2,
          explanation: 'Đường biển có ưu thế vận chuyển hàng hóa đi đường dài nên có khối lượng luân chuyển lớn nhất.',
          difficulty: 'hard',
          points: 200
        }
      ];
      setQuestions(initial);
      localStorage.setItem('gb_questions', JSON.stringify(initial));
    }
  }, []);

  // Timer logic for Host
  useEffect(() => {
    let interval: any;
    if (gameState.status === 'playing' && gameState.timer > 0 && !gameState.showAnswer) {
      interval = setInterval(() => {
        setGameState(prev => ({ ...prev, timer: prev.timer - 1 }));
        if (soundEnabled && gameState.timer <= 5) sounds.tick.play();
      }, 1000);
    } else if (gameState.timer === 0 && !gameState.showAnswer) {
      setGameState(prev => ({ ...prev, showAnswer: true }));
    }
    return () => clearInterval(interval);
  }, [gameState.status, gameState.timer, gameState.showAnswer]);

  // --- Handlers ---

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validTypes = [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/pdf'
    ];

    if (!validTypes.includes(file.type)) {
      Swal.fire('Lỗi', 'Chỉ hỗ trợ file .docx hoặc .pdf', 'error');
      return;
    }

    setIsUploading(true);
    
    // Simulate extraction process
    Swal.fire({
      title: 'Đang trích xuất dữ liệu...',
      html: 'Hệ thống AI đang phân tích nội dung file <b>' + file.name + '</b>',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    // Simulate delay for "AI extraction"
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Mock extracted questions
    const extractedQuestions: Question[] = [
      {
        id: Math.random().toString(),
        content: 'Dựa trên tài liệu: Sông ngòi nước ta có đặc điểm nào sau đây?',
        options: ['Mạng lưới thưa thớt', 'Ít phù sa', 'Nhiều nước, giàu phù sa', 'Chảy theo hướng tây - đông'],
        correctAnswer: 2,
        explanation: 'Sông ngòi nước ta có mạng lưới dày đặc, nhiều nước và giàu phù sa do mưa lớn và địa hình dốc.',
        difficulty: 'medium',
        points: 150
      },
      {
        id: Math.random().toString(),
        content: 'Dựa trên tài liệu: Loại đất chiếm diện tích lớn nhất ở vùng đồi núi nước ta là:',
        options: ['Đất phù sa', 'Đất feralit', 'Đất xám bạc màu', 'Đất mặn'],
        correctAnswer: 1,
        explanation: 'Đất feralit là loại đất chính ở vùng đồi núi thấp nước ta.',
        difficulty: 'easy',
        points: 100
      }
    ];

    setQuestions(prev => {
      const updated = [...prev, ...extractedQuestions];
      localStorage.setItem('gb_questions', JSON.stringify(updated));
      return updated;
    });
    
    setIsUploading(false);
    Swal.close();
    
    Swal.fire({
      title: 'Thành công!',
      text: `Đã trích xuất thành công ${extractedQuestions.length} câu hỏi từ file.`,
      icon: 'success',
      confirmButtonColor: '#0d9488'
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCreateRoom = () => {
    if (questions.length === 0) {
      Swal.fire('Lỗi', 'Vui lòng thêm câu hỏi vào ngân hàng trước!', 'error');
      return;
    }
    setGameState(prev => ({
      ...prev,
      status: 'waiting',
      questionSet: questions,
      players: []
    }));
    setView('host_game');
  };

  const handleJoinRoom = () => {
    if (inputPin !== gameState.pin) {
      Swal.fire('Lỗi', 'Mã PIN không chính xác!', 'error');
      return;
    }
    const newPlayer: Player = {
      id: Math.random().toString(),
      name: playerName,
      avatar: playerAvatar,
      score: 0,
      isEliminated: false,
      correctCount: 0
    };
    setGameState(prev => ({
      ...prev,
      players: [...prev.players, newPlayer]
    }));
    setCurrentPlayer(newPlayer);
    setView('player_game');
  };

  const handlePlayerAnswer = (optionIndex: number) => {
    if (!currentPlayer || currentPlayer.isEliminated || gameState.showAnswer) return;
    
    const timeTaken = 20 - gameState.timer;
    const isCorrect = optionIndex === gameState.questionSet[gameState.currentQuestionIndex].correctAnswer;
    
    setCurrentPlayer(prev => {
      if (!prev) return null;
      return {
        ...prev,
        lastAnswer: optionIndex,
        lastAnswerTime: timeTaken
      };
    });

    // Update player in game state
    setGameState(prev => ({
      ...prev,
      players: prev.players.map(p => p.id === currentPlayer.id ? { ...p, lastAnswer: optionIndex, lastAnswerTime: timeTaken } : p)
    }));
  };

  const handleNextQuestion = () => {
    // Calculate scores before moving
    const currentQ = gameState.questionSet[gameState.currentQuestionIndex];
    const updatedPlayers = gameState.players.map(p => {
      if (p.isEliminated) return p;
      const isCorrect = p.lastAnswer === currentQ.correctAnswer;
      if (isCorrect) {
        const speedBonus = Math.max(0, (20 - (p.lastAnswerTime || 0)) * 10);
        return {
          ...p,
          score: p.score + currentQ.points + speedBonus,
          correctCount: p.correctCount + 1,
          lastAnswer: undefined
        };
      } else {
        return { ...p, isEliminated: true, lastAnswer: undefined };
      }
    });

    if (gameState.currentQuestionIndex + 1 >= gameState.questionSet.length) {
      setGameState(prev => ({ ...prev, status: 'finished', players: updatedPlayers }));
      if (soundEnabled) sounds.win.play();
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 }
      });
    } else {
      setGameState(prev => ({
        ...prev,
        status: 'playing',
        currentQuestionIndex: prev.currentQuestionIndex + 1,
        timer: 20,
        showAnswer: false,
        players: updatedPlayers
      }));
    }
  };

  // --- Renderers ---

  const renderLobby = () => (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-block p-4 bg-amber-100 rounded-3xl mb-6"
        >
          <Trophy className="text-amber-600 w-16 h-16" />
        </motion.div>
        <h1 className="text-5xl font-black text-slate-900 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-orange-600">
          Rung Chuông Vàng
        </h1>
        <p className="text-slate-500 text-lg">Hệ thống thi đấu trực tuyến dành cho giáo viên và học sinh</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col items-center text-center"
        >
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-6">
            <Users size={32} />
          </div>
          <h3 className="text-2xl font-black text-slate-900 mb-4">Dành cho Giáo viên</h3>
          <p className="text-slate-500 mb-8">Tạo phòng chơi, quản lý câu hỏi và điều phối trận đấu.</p>
          <div className="w-full space-y-3">
            <button 
              onClick={() => setView('host_dash')}
              className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all"
            >
              Quản lý Câu hỏi
            </button>
            <button 
              onClick={handleCreateRoom}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-all"
            >
              Tạo Phòng Chơi
            </button>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col items-center text-center"
        >
          <div className="w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center text-teal-600 mb-6">
            <Play size={32} />
          </div>
          <h3 className="text-2xl font-black text-slate-900 mb-4">Dành cho Học sinh</h3>
          <p className="text-slate-500 mb-8">Nhập mã PIN để tham gia thi đấu và rung chuông vàng.</p>
          <button 
            onClick={() => setView('player_join')}
            className="w-full py-4 bg-teal-600 text-white rounded-2xl font-bold shadow-lg shadow-teal-600/20 hover:bg-teal-700 transition-all"
          >
            Tham gia ngay
          </button>
        </motion.div>
      </div>
    </div>
  );

  const renderHostDashboard = () => (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <div className="flex items-center justify-between mb-12">
        <button onClick={() => setView('lobby')} className="flex items-center gap-2 text-slate-500 font-bold hover:text-slate-900">
          <ChevronLeft size={20} /> Quay lại
        </button>
        <h2 className="text-3xl font-black text-slate-900">Ngân hàng Câu hỏi</h2>
        <div className="flex gap-3">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
            accept=".docx,.pdf"
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold flex items-center gap-2 border border-slate-200 hover:bg-slate-200 transition-colors"
          >
            <Upload size={20} /> Tải lên (.docx/PDF)
          </button>
          <button 
            onClick={async () => {
              const res = await generateAIQuestions('Khoa học');
              setQuestions([...questions, ...res]);
              localStorage.setItem('gb_questions', JSON.stringify([...questions, ...res]));
              Swal.fire('Thành công', 'Đã tạo 2 câu hỏi bằng AI!', 'success');
            }}
            className="px-6 py-3 bg-indigo-50 text-indigo-600 rounded-xl font-bold flex items-center gap-2 border border-indigo-100"
          >
            <Sparkles size={20} /> AI Generator
          </button>
          <button className="px-6 py-3 bg-teal-600 text-white rounded-xl font-bold flex items-center gap-2">
            <Plus size={20} /> Thêm câu hỏi
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {questions.map((q, idx) => (
          <div key={q.id} className="bg-white p-6 rounded-3xl border border-slate-200 flex items-start justify-between group">
            <div className="flex gap-6">
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center font-black text-slate-400">
                {idx + 1}
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="font-bold text-slate-900 text-lg">{q.content}</h4>
                  <span className={cn(
                    "px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider",
                    q.difficulty === 'easy' ? "bg-green-100 text-green-600" :
                    q.difficulty === 'medium' ? "bg-amber-100 text-amber-600" :
                    "bg-rose-100 text-rose-600"
                  )}>
                    {q.difficulty}
                  </span>
                  <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                    {q.points} PTS
                  </span>
                </div>
                <div className="flex gap-2 mb-4">
                  {q.options.map((opt, i) => (
                    <span key={i} className={cn(
                      "px-3 py-1 rounded-lg text-xs font-bold",
                      i === q.correctAnswer ? "bg-teal-100 text-teal-600 border border-teal-200" : "bg-slate-50 text-slate-400 border border-slate-100"
                    )}>
                      {String.fromCharCode(65 + i)}. {opt}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-slate-500 italic">Giải thích: {q.explanation}</p>
              </div>
            </div>
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="p-2 text-slate-400 hover:text-blue-600"><Settings size={18} /></button>
              <button 
                onClick={() => {
                  const newQs = questions.filter(item => item.id !== q.id);
                  setQuestions(newQs);
                  localStorage.setItem('gb_questions', JSON.stringify(newQs));
                }}
                className="p-2 text-slate-400 hover:text-rose-600"
              ><Trash2 size={18} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderHostGame = () => {
    const currentQ = gameState.questionSet[gameState.currentQuestionIndex];
    
    if (gameState.status === 'waiting') {
      return (
        <div className="max-w-4xl mx-auto py-12 px-4 text-center">
          <h2 className="text-4xl font-black text-slate-900 mb-8">Đang chờ người chơi...</h2>
          <div className="bg-white p-12 rounded-[3rem] border-4 border-slate-100 shadow-2xl inline-block mb-12">
            <QRCodeSVG value={gameState.pin} size={256} className="mx-auto mb-8" />
            <div className="text-6xl font-black tracking-widest text-blue-600 mb-4">{gameState.pin}</div>
            <p className="text-slate-400 font-bold uppercase tracking-widest">Mã PIN phòng chơi</p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4 mb-12">
            {gameState.players.map(p => (
              <motion.div 
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                key={p.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm"
              >
                <div className="text-3xl mb-2">{p.avatar}</div>
                <div className="font-bold text-slate-700 truncate">{p.name}</div>
              </motion.div>
            ))}
          </div>

          <button 
            onClick={() => setGameState(prev => ({ ...prev, status: 'playing' }))}
            disabled={gameState.players.length === 0}
            className="px-12 py-5 bg-slate-900 text-white rounded-2xl font-black text-xl shadow-2xl shadow-slate-900/40 hover:scale-105 transition-transform disabled:opacity-50"
          >
            Bắt đầu trận đấu
          </button>
        </div>
      );
    }

    if (gameState.status === 'finished') {
      const topPlayers = [...gameState.players].sort((a, b) => b.score - a.score).slice(0, 3);
      return (
        <div className="max-w-4xl mx-auto py-12 px-4 text-center">
          <h2 className="text-5xl font-black text-slate-900 mb-12">🏆 Kết quả chung cuộc</h2>
          <div className="flex items-end justify-center gap-4 mb-16 h-64">
            {topPlayers[1] && (
              <div className="flex flex-col items-center">
                <div className="text-4xl mb-2">🥈</div>
                <div className="w-32 bg-slate-200 rounded-t-3xl flex flex-col items-center justify-end pb-4 h-40">
                   <div className="text-3xl mb-1">{topPlayers[1].avatar}</div>
                   <div className="font-bold text-slate-700">{topPlayers[1].name}</div>
                   <div className="text-xs font-black text-slate-500">{topPlayers[1].score}</div>
                </div>
              </div>
            )}
            {topPlayers[0] && (
              <div className="flex flex-col items-center">
                <div className="text-5xl mb-2">👑</div>
                <div className="w-40 bg-amber-400 rounded-t-3xl flex flex-col items-center justify-end pb-6 h-56 shadow-xl shadow-amber-400/20">
                   <div className="text-4xl mb-2">{topPlayers[0].avatar}</div>
                   <div className="font-bold text-amber-900">{topPlayers[0].name}</div>
                   <div className="text-sm font-black text-amber-800">{topPlayers[0].score}</div>
                </div>
              </div>
            )}
            {topPlayers[2] && (
              <div className="flex flex-col items-center">
                <div className="text-4xl mb-2">🥉</div>
                <div className="w-32 bg-orange-200 rounded-t-3xl flex flex-col items-center justify-end pb-4 h-32">
                   <div className="text-3xl mb-1">{topPlayers[2].avatar}</div>
                   <div className="font-bold text-orange-900">{topPlayers[2].name}</div>
                   <div className="text-xs font-black text-orange-700">{topPlayers[2].score}</div>
                </div>
              </div>
            )}
          </div>
          <button onClick={() => setView('lobby')} className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold">Về trang chủ</button>
        </div>
      );
    }

    return (
      <div className="max-w-5xl mx-auto py-12 px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="px-4 py-2 bg-slate-100 rounded-xl font-black text-slate-500">CÂU {gameState.currentQuestionIndex + 1}/{gameState.questionSet.length}</div>
          <div className={cn(
            "w-20 h-20 rounded-full flex items-center justify-center text-3xl font-black border-4",
            gameState.timer <= 5 ? "border-rose-500 text-rose-500 animate-pulse" : "border-slate-200 text-slate-900"
          )}>
            {gameState.timer}
          </div>
          <div className="px-4 py-2 bg-blue-100 text-blue-600 rounded-xl font-black">PIN: {gameState.pin}</div>
        </div>

        <div className="bg-white p-12 rounded-[3rem] border-2 border-slate-100 shadow-2xl mb-8 text-center">
          <h3 className="text-3xl font-black text-slate-900 mb-12">{currentQ.content}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentQ.options.map((opt, i) => (
              <div key={i} className={cn(
                "p-6 rounded-2xl border-2 text-xl font-bold transition-all flex items-center justify-between",
                gameState.showAnswer && i === currentQ.correctAnswer ? "bg-teal-50 border-teal-500 text-teal-700" : 
                gameState.showAnswer ? "bg-slate-50 border-slate-200 text-slate-400 opacity-50" : "bg-white border-slate-100 text-slate-700"
              )}>
                <span>{String.fromCharCode(65 + i)}. {opt}</span>
                {gameState.showAnswer && i === currentQ.correctAnswer && <CheckCircle2 className="text-teal-500" />}
              </div>
            ))}
          </div>
        </div>

        {gameState.showAnswer && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-6">
            <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl text-amber-800 font-medium max-w-2xl text-center">
              <strong>Giải thích:</strong> {currentQ.explanation}
            </div>
            <button 
              onClick={handleNextQuestion}
              className="px-12 py-5 bg-teal-600 text-white rounded-2xl font-black text-xl shadow-xl shadow-teal-600/20 hover:scale-105 transition-transform"
            >
              Câu tiếp theo
            </button>
          </motion.div>
        )}

        <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
          {gameState.players.map(p => (
            <div key={p.id} className={cn(
              "p-4 rounded-2xl border transition-all text-center",
              p.isEliminated ? "bg-slate-100 border-slate-200 opacity-50" : "bg-white border-slate-200 shadow-sm",
              !gameState.showAnswer && p.lastAnswer !== undefined ? "border-blue-500 ring-2 ring-blue-500/20" : ""
            )}>
              <div className="text-2xl mb-1">{p.avatar}</div>
              <div className="font-bold text-xs truncate">{p.name}</div>
              <div className="text-[10px] font-black text-slate-400">{p.score} pts</div>
              {p.isEliminated && <div className="text-[10px] font-bold text-rose-500 uppercase mt-1">Bị loại</div>}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderPlayerJoin = () => (
    <div className="max-w-md mx-auto py-20 px-4">
      <div className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-2xl">
        <h2 className="text-3xl font-black text-slate-900 mb-8 text-center">Tham gia phòng</h2>
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Mã PIN phòng</label>
            <input 
              type="text" 
              value={inputPin}
              onChange={(e) => setInputPin(e.target.value)}
              className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-2xl font-black tracking-widest text-center outline-none focus:border-teal-500"
              placeholder="000000"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Tên của bạn</label>
            <input 
              type="text" 
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:border-teal-500"
              placeholder="Nhập tên..."
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Chọn Avatar</label>
            <div className="flex justify-between p-4 bg-slate-50 rounded-2xl">
              {['😀', '😎', '🤓', '👻', '🤖', '🐱'].map(emoji => (
                <button 
                  key={emoji}
                  onClick={() => setPlayerAvatar(emoji)}
                  className={cn(
                    "text-3xl p-2 rounded-xl transition-all",
                    playerAvatar === emoji ? "bg-white shadow-md scale-110" : "hover:scale-110"
                  )}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
          <button 
            onClick={handleJoinRoom}
            className="w-full py-5 bg-teal-600 text-white rounded-2xl font-black text-xl shadow-lg shadow-teal-600/20 hover:bg-teal-700 transition-all"
          >
            Vào phòng chơi
          </button>
        </div>
      </div>
    </div>
  );

  const renderPlayerGame = () => {
    if (!currentPlayer) return null;
    const currentQ = gameState.questionSet[gameState.currentQuestionIndex];

    if (gameState.status === 'waiting') {
      return (
        <div className="max-w-md mx-auto py-20 px-4 text-center">
          <div className="text-6xl mb-6 animate-bounce">{currentPlayer.avatar}</div>
          <h2 className="text-3xl font-black text-slate-900 mb-4">Chào {currentPlayer.name}!</h2>
          <p className="text-slate-500 mb-8">Bạn đã vào phòng thành công. Hãy chờ giáo viên bắt đầu trận đấu nhé!</p>
          <div className="inline-block px-6 py-3 bg-blue-50 text-blue-600 rounded-2xl font-black border border-blue-100">
            PIN: {gameState.pin}
          </div>
        </div>
      );
    }

    if (currentPlayer.isEliminated) {
      return (
        <div className="max-w-md mx-auto py-20 px-4 text-center">
          <div className="text-6xl mb-6">💀</div>
          <h2 className="text-3xl font-black text-slate-900 mb-4">Rất tiếc!</h2>
          <p className="text-slate-500 mb-8">Bạn đã trả lời sai và bị loại khỏi cuộc chơi. Hãy tiếp tục theo dõi các bạn khác nhé!</p>
          <div className="text-slate-400 font-bold">Điểm số cuối cùng: {currentPlayer.score}</div>
        </div>
      );
    }

    if (gameState.status === 'finished') {
      return (
        <div className="max-w-md mx-auto py-20 px-4 text-center">
          <div className="text-6xl mb-6">🎉</div>
          <h2 className="text-3xl font-black text-slate-900 mb-4">Chúc mừng!</h2>
          <p className="text-slate-500 mb-8">Bạn đã hoàn thành trận đấu.</p>
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
            <div className="text-xs font-black text-slate-400 uppercase mb-2">Tổng điểm</div>
            <div className="text-5xl font-black text-teal-600">{currentPlayer.score}</div>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-md mx-auto py-12 px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{currentPlayer.avatar}</div>
            <div>
              <div className="font-black text-slate-900">{currentPlayer.name}</div>
              <div className="text-xs font-bold text-teal-600">{currentPlayer.score} pts</div>
            </div>
          </div>
          <div className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center font-black border-2",
            gameState.timer <= 5 ? "border-rose-500 text-rose-500" : "border-slate-200 text-slate-900"
          )}>
            {gameState.timer}
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-xl mb-8">
          <div className="text-xs font-black text-slate-400 uppercase mb-4">Câu {gameState.currentQuestionIndex + 1}</div>
          <h3 className="text-xl font-bold text-slate-900 mb-6">{currentQ.content}</h3>
          
          <div className="grid grid-cols-1 gap-3">
            {currentQ.options.map((opt, i) => (
              <button 
                key={i}
                disabled={gameState.showAnswer || currentPlayer.lastAnswer !== undefined}
                onClick={() => handlePlayerAnswer(i)}
                className={cn(
                  "w-full p-5 rounded-2xl border-2 font-bold text-left transition-all flex items-center justify-between",
                  currentPlayer.lastAnswer === i ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20" : 
                  gameState.showAnswer && i === currentQ.correctAnswer ? "bg-teal-50 border-teal-500 text-teal-700" :
                  "bg-white border-slate-100 text-slate-700 hover:border-blue-200"
                )}
              >
                <span>{String.fromCharCode(65 + i)}. {opt}</span>
                {gameState.showAnswer && i === currentQ.correctAnswer && <CheckCircle2 size={20} />}
                {gameState.showAnswer && currentPlayer.lastAnswer === i && i !== currentQ.correctAnswer && <XCircle size={20} />}
              </button>
            ))}
          </div>
        </div>

        {gameState.showAnswer && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
            {currentPlayer.lastAnswer === currentQ.correctAnswer ? (
              <div className="text-teal-600 font-black text-2xl mb-2 flex items-center justify-center gap-2">
                <CheckCircle2 /> CHÍNH XÁC!
              </div>
            ) : (
              <div className="text-rose-600 font-black text-2xl mb-2 flex items-center justify-center gap-2">
                <XCircle /> SAI RỒI!
              </div>
            )}
            <p className="text-slate-500 text-sm">Chờ giáo viên chuyển câu tiếp theo...</p>
          </motion.div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <header className="sticky top-0 z-50 glass border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center text-white">
            <Trophy size={18} />
          </div>
          <span className="font-black text-slate-900">Rung Chuông Vàng Online</span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 text-slate-400 hover:text-slate-900 transition-colors"
          >
            {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
          <button onClick={onBack} className="text-sm font-bold text-slate-500 hover:text-slate-900">Thoát</button>
        </div>
      </header>

      <main className="pb-20">
        <AnimatePresence mode="wait">
          {view === 'lobby' && renderLobby()}
          {view === 'host_dash' && renderHostDashboard()}
          {view === 'host_game' && renderHostGame()}
          {view === 'player_join' && renderPlayerJoin()}
          {view === 'player_game' && renderPlayerGame()}
        </AnimatePresence>
      </main>
    </div>
  );
};
