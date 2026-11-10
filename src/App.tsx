/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Maximize2, 
  BookOpen, 
  Download, 
  Users, 
  User, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Eye, 
  EyeOff,
  Sparkles,
  Trophy,
  Plus,
  Trash2,
  Undo2
} from 'lucide-react';

interface VocabItem {
  id: number;
  kanji: string;
  reading: string;
  english: string;
  icon: string;
  furigana: { text: string; rt?: string }[];
  isCustom?: boolean;
}

const DEFAULT_VOCABULARY: VocabItem[] = [
  { 
    id: 1,  
    kanji: "旅行に行く", 
    reading: "りょこうにいく", 
    english: "to go on a trip", 
    icon: "✈️", 
    furigana: [{ text: "旅行", rt: "りょこう" }, { text: "に" }, { text: "行", rt: "い" }, { text: "く" }] 
  },
  { 
    id: 2,  
    kanji: "海に行く",   
    reading: "うみにいく",     
    english: "to go to the beach", 
    icon: "🏖️", 
    furigana: [{ text: "海", rt: "うみ" }, { text: "に" }, { text: "行", rt: "い" }, { text: "く" }] 
  },
  { 
    id: 3,  
    kanji: "山に登る",   
    reading: "やまにのぼる",   
    english: "to climb a mountain", 
    icon: "⛰️", 
    furigana: [{ text: "山", rt: "やま" }, { text: "に" }, { text: "登", rt: "のぼ" }, { text: "る" }] 
  },
  { 
    id: 4,  
    kanji: "写真を撮る", 
    reading: "しゃしんをとる", 
    english: "to take photos",     
    icon: "📷", 
    furigana: [{ text: "写真", rt: "しゃしん" }, { text: "を" }, { text: "撮", rt: "と" }, { text: "る" }] 
  },
  { 
    id: 5,  
    kanji: "友達に会う", 
    reading: "ともだちにあう", 
    english: "to meet friends",    
    icon: "👥", 
    furigana: [{ text: "友達", rt: "ともだち" }, { text: "に" }, { text: "会", rt: "あ" }, { text: "う" }] 
  },
  { 
    id: 6,  
    kanji: "映画を見る", 
    reading: "えいがをみる",   
    english: "to watch a movie",   
    icon: "🎬", 
    furigana: [{ text: "映画", rt: "えいが" }, { text: "を" }, { text: "見", rt: "み" }, { text: "る" }] 
  },
  { 
    id: 7,  
    kanji: "買い物をする", 
    reading: "かいものをする", 
    english: "to go shopping",  
    icon: "🛍️", 
    furigana: [{ text: "買", rt: "か" }, { text: "い" }, { text: "物", rt: "もの" }, { text: "をする" }] 
  },
  { 
    id: 8,  
    kanji: "温泉に入る", 
    reading: "おんせんにはいる", 
    english: "to go to a hot spring", 
    icon: "♨️", 
    furigana: [{ text: "温泉", rt: "おんせん" }, { text: "に" }, { text: "入", rt: "はい" }, { text: "る" }] 
  },
  { 
    id: 9,  
    kanji: "お祭りに行く", 
    reading: "おまつりにいく", 
    english: "to go to a festival", 
    icon: "🏮", 
    furigana: [{ text: "お" }, { text: "祭", rt: "まつ" }, { text: "りに" }, { text: "行", rt: "い" }, { text: "く" }] 
  },
  { 
    id: 10, 
    kanji: "料理を作る", 
    reading: "りょうりをつくる", 
    english: "to cook",           
    icon: "🍳", 
    furigana: [{ text: "料理", rt: "りょうり" }, { text: "を" }, { text: "作", rt: "つく" }, { text: "る" }] 
  },
  { 
    id: 11, 
    kanji: "ゲームをする", 
    reading: "ゲームをする",   
    english: "to play games",      
    icon: "🎮", 
    furigana: [{ text: "ゲームをする" }] 
  },
  { 
    id: 12, 
    kanji: "家族と過ごす", 
    reading: "かぞくとすごす", 
    english: "to spend time with family", 
    icon: "👨‍👩‍👧", 
    furigana: [{ text: "家族", rt: "かぞく" }, { text: "と" }, { text: "過", rt: "す" }, { text: "ごす" }] 
  }
];

const TOTAL_ROUNDS = 10;
const TIMER_SECONDS = 15;
const STORAGE_KEY = 'yasumi_holiday_quiz_vocab_v1';

const PRESET_EMOJIS = ['📚', '🏊', '🚴', '🎨', '🎵', '⚽', '🏕️', '🍣', '🍰', '🐶', '💤', '🛒', '🛹', '🎤', '☕', '🏃'];

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function App() {
  // Vocabulary List State with LocalStorage Persistence
  const [vocabulary, setVocabulary] = useState<VocabItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length >= 4) {
          return parsed;
        }
      }
    } catch {
      // Fallback
    }
    return DEFAULT_VOCABULARY;
  });

  // Game Modes & Preferences
  const [isTeamMode, setIsTeamMode] = useState<boolean>(false);
  const [showReadings, setShowReadings] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [timerEnabled, setTimerEnabled] = useState<boolean>(false);
  const [isVocabModalOpen, setIsVocabModalOpen] = useState<boolean>(false);
  const [isAddFormOpen, setIsAddFormOpen] = useState<boolean>(false);

  // New Word Form State
  const [newKanji, setNewKanji] = useState<string>('');
  const [newReading, setNewReading] = useState<string>('');
  const [newEnglish, setNewEnglish] = useState<string>('');
  const [newIcon, setNewIcon] = useState<string>('📚');
  const [formError, setFormError] = useState<string>('');

  // Play Session State
  const [currentRound, setCurrentRound] = useState<number>(0);
  const [soloScore, setSoloScore] = useState<number>(0);
  const [teamAScore, setTeamAScore] = useState<number>(0);
  const [teamBScore, setTeamBScore] = useState<number>(0);
  const [currentTeam, setCurrentTeam] = useState<'A' | 'B'>('A');

  // Round specific state
  const [roundQuestions, setRoundQuestions] = useState<VocabItem[]>([]);
  const [currentChoices, setCurrentChoices] = useState<VocabItem[]>([]);
  const [selectedChoiceIdx, setSelectedChoiceIdx] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [timerSecondsLeft, setTimerSecondsLeft] = useState<number>(TIMER_SECONDS);

  // Web Audio Context Reference
  const audioCtxRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  const playSynthesizedSound = useCallback((type: 'correct' | 'wrong' | 'victory') => {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      if (type === 'correct') {
        // High bright two-tone chime (C5 523Hz -> G5 784Hz)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(783.99, now + 0.12);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
      } else if (type === 'wrong') {
        // Soft low buzz (220Hz -> 174Hz)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.setValueAtTime(174.61, now + 0.12);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
        osc.start(now);
        osc.stop(now + 0.45);
      } else if (type === 'victory') {
        // Arpeggiated Fanfare
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + i * 0.12);
          gain.gain.setValueAtTime(0.2, now + i * 0.12);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.6);
          osc.start(now + i * 0.12);
          osc.stop(now + i * 0.12 + 0.6);
        });
      }
    } catch {
      // Audio autoplay policy fallback
    }
  }, [soundEnabled, getAudioContext]);

  // Save to localStorage whenever vocabulary changes
  const updateVocabularyAndStore = (newList: VocabItem[]) => {
    setVocabulary(newList);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newList));
    } catch {
      // Storage unavailable
    }
  };

  // Add new word handler
  const handleAddNewWord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKanji.trim() || !newReading.trim() || !newEnglish.trim()) {
      setFormError('日本語・よみ・英語のすべてを入力してください (Please fill out all fields).');
      return;
    }

    const trimmedKanji = newKanji.trim();
    const trimmedReading = newReading.trim();
    const trimmedEnglish = newEnglish.trim();
    const trimmedIcon = newIcon.trim() || '📝';

    const newItem: VocabItem = {
      id: Date.now(),
      kanji: trimmedKanji,
      reading: trimmedReading,
      english: trimmedEnglish,
      icon: trimmedIcon,
      isCustom: true,
      furigana: trimmedKanji === trimmedReading 
        ? [{ text: trimmedKanji }]
        : [{ text: trimmedKanji, rt: trimmedReading }]
    };

    const updated = [newItem, ...vocabulary];
    updateVocabularyAndStore(updated);

    // Reset Form
    setNewKanji('');
    setNewReading('');
    setNewEnglish('');
    setNewIcon('📚');
    setFormError('');
    setIsAddFormOpen(false);
  };

  // Delete word handler
  const handleDeleteWord = (id: number) => {
    if (vocabulary.length <= 4) {
      alert('クイズには最低4つの単語が必要です (At least 4 words are required for the quiz).');
      return;
    }
    const updated = vocabulary.filter(item => item.id !== id);
    updateVocabularyAndStore(updated);
  };

  // Reset to default 12 activities
  const handleResetToDefault = () => {
    if (window.confirm('初期の12単語にリセットしますか？ (Reset to original 12 vocabulary items?)')) {
      updateVocabularyAndStore(DEFAULT_VOCABULARY);
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // Ignored
      }
    }
  };

  // Restart or initialize new game
  const startNewGame = useCallback(() => {
    const roundsCount = Math.min(TOTAL_ROUNDS, vocabulary.length);
    const shuffledDeck = shuffleArray(vocabulary).slice(0, roundsCount);
    setRoundQuestions(shuffledDeck);
    setCurrentRound(0);
    setSoloScore(0);
    setTeamAScore(0);
    setTeamBScore(0);
    setCurrentTeam('A');
    setIsGameOver(false);
    setIsAnswered(false);
    setSelectedChoiceIdx(null);
    setTimerSecondsLeft(TIMER_SECONDS);

    // Setup choices for first round
    if (shuffledDeck.length > 0) {
      const target = shuffledDeck[0];
      const distractors = shuffleArray(vocabulary.filter(v => v.id !== target.id)).slice(0, 3);
      setCurrentChoices(shuffleArray([target, ...distractors]));
    }
  }, [vocabulary]);

  // Re-start game when vocabulary changes if needed
  useEffect(() => {
    startNewGame();
  }, [vocabulary, startNewGame]);

  // Current active question
  const currentTarget = roundQuestions[currentRound];

  // Timer Countdown Effect
  useEffect(() => {
    if (!timerEnabled || isAnswered || isGameOver) return;

    const timer = setInterval(() => {
      setTimerSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Time expired, handle as timeout
          handleChoiceSelection(-1);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timerEnabled, isAnswered, isGameOver, currentRound]);

  // Handle Answer Click
  const handleChoiceSelection = (choiceIndex: number) => {
    if (isAnswered || isGameOver || !currentTarget) return;

    setIsAnswered(true);
    setSelectedChoiceIdx(choiceIndex);

    const isCorrect = choiceIndex >= 0 && currentChoices[choiceIndex]?.id === currentTarget.id;

    if (isCorrect) {
      playSynthesizedSound('correct');
      if (isTeamMode) {
        if (currentTeam === 'A') setTeamAScore(s => s + 1);
        else setTeamBScore(s => s + 1);
      } else {
        setSoloScore(s => s + 1);
      }
    } else {
      playSynthesizedSound('wrong');
    }
  };

  // Advance to next question
  const handleNextQuestion = () => {
    if (currentRound + 1 >= TOTAL_ROUNDS) {
      setIsGameOver(true);
      playSynthesizedSound('victory');
      return;
    }

    const nextRound = currentRound + 1;
    setCurrentRound(nextRound);
    setIsAnswered(false);
    setSelectedChoiceIdx(null);
    setTimerSecondsLeft(TIMER_SECONDS);

    if (isTeamMode) {
      setCurrentTeam(prev => prev === 'A' ? 'B' : 'A');
    }

    // Set next choices
    const nextTarget = roundQuestions[nextRound];
    if (nextTarget) {
      const distractors = shuffleArray(vocabulary.filter((v: VocabItem) => v.id !== nextTarget.id)).slice(0, 3);
      setCurrentChoices(shuffleArray([nextTarget, ...distractors]));
    }
  };

  // Keyboard Shortcuts (1-4, Space, Enter, R, M, F)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if modal open
      if (isVocabModalOpen) {
        if (e.key === 'Escape') setIsVocabModalOpen(false);
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        if (isGameOver) {
          startNewGame();
        } else if (isAnswered) {
          handleNextQuestion();
        }
      } else if (e.key === 'Enter') {
        if (isGameOver) {
          startNewGame();
        } else if (isAnswered) {
          handleNextQuestion();
        }
      } else if (e.key === '1' && !isAnswered && !isGameOver) {
        handleChoiceSelection(0);
      } else if (e.key === '2' && !isAnswered && !isGameOver) {
        handleChoiceSelection(1);
      } else if (e.key === '3' && !isAnswered && !isGameOver) {
        handleChoiceSelection(2);
      } else if (e.key === '4' && !isAnswered && !isGameOver) {
        handleChoiceSelection(3);
      } else if (e.key === 'r' || e.key === 'R') {
        setShowReadings(prev => !prev);
      } else if (e.key === 'm' || e.key === 'M') {
        setSoundEnabled(prev => !prev);
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAnswered, isGameOver, isVocabModalOpen, currentRound, currentChoices, currentTarget, startNewGame]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const handleDownloadOfflineHtml = async () => {
    try {
      // Fetch the standalone HTML template
      const res = await fetch('/holiday_activity_quiz.html');
      const htmlText = await res.text();

      // Format current vocabulary as valid JS array
      const vocabJs = JSON.stringify(vocabulary.map(v => ({
        id: v.id,
        kanji: v.kanji,
        reading: v.reading,
        english: v.english,
        icon: v.icon,
        isCustom: v.isCustom,
        furiganaHtml: v.furigana && v.furigana.length > 0
          ? v.furigana.map(f => f.rt ? `<ruby>${f.text}<rt>${f.rt}</rt></ruby>` : f.text).join('')
          : v.kanji
      })), null, 2);

      // Replace VOCABULARY constant
      const updatedHtml = htmlText.replace(
        /const VOCABULARY = \[[\s\S]*?\];/,
        `const VOCABULARY = ${vocabJs};`
      );

      const blob = new Blob([updatedHtml], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'holiday_activity_quiz.html';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      // Fallback direct download
      const link = document.createElement('a');
      link.href = '/holiday_activity_quiz.html';
      link.download = 'holiday_activity_quiz.html';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Results messages
  const getRankMessage = () => {
    if (soloScore === 10) return { badge: "💮", title: "パーフェクト達成！", msg: "たいへんよくできました！ 完璧です！" };
    if (soloScore >= 8) return { badge: "🌸", title: "すばらしいスコア！", msg: "よくできました！ 休みの表現はバッチリです！" };
    if (soloScore >= 6) return { badge: "👍", title: "よくがんばりました！", msg: "もう少しでマスター！ もう一度復習しよう！" };
    return { badge: "💪", title: "ナイスチャレンジ！", msg: "もう一度練習して満点をめざそう！" };
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between p-3 md:p-6 select-none touch-manipulation">
      
      {/* Pure CSS Confetti when Game Over */}
      {isGameOver && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
          {Array.from({ length: 48 }).map((_, i) => (
            <div
              key={i}
              className="confetti-piece"
              style={{
                left: `${(i * 2.1) % 100}vw`,
                backgroundColor: ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'][i % 6],
                animationDelay: `${(i * 0.15) % 2.5}s`,
                animationDuration: `${2.8 + ((i * 0.1) % 1.5)}s`
              }}
            />
          ))}
        </div>
      )}

      {/* Main Container constrained for 16:9 widescreen displays */}
      <div className="w-full max-w-7xl mx-auto flex flex-col flex-1 justify-between gap-3 min-h-[calc(100vh-2rem)]">

        {/* ================= HEADER BAR ================= */}
        <header className="bg-white border border-slate-200 rounded-2xl px-5 py-3.5 shadow-sm flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
                  休みの活動クイズ
                </h1>
                <span className="text-xs md:text-sm font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                  JLPT N5
                </span>
              </div>
              <div className="text-xs md:text-sm font-medium text-slate-500">
                Holiday Activity Quiz · Beginner Japanese
              </div>
            </div>
          </div>

          {/* Central Score Area */}
          <div className="flex items-center gap-6">
            {!isTeamMode ? (
              <div className="flex items-center gap-4 text-xl md:text-2xl font-bold">
                <div className="flex flex-col items-center">
                  <span className="text-slate-700">第 {currentRound + 1} / {TOTAL_ROUNDS} 問</span>
                  <span className="text-xs text-slate-400 font-normal">Round {currentRound + 1} of {TOTAL_ROUNDS}</span>
                </div>
                <span className="text-slate-300">·</span>
                <div className="flex flex-col items-center">
                  <span className="text-slate-900 flex items-center gap-2">
                    正解: <span className="font-mono text-3xl text-blue-600">{soloScore}</span>
                  </span>
                  <span className="text-xs text-slate-400 font-normal">Score</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 text-lg md:text-xl font-bold">
                <div className={`px-4 py-1.5 rounded-xl border-2 flex flex-col items-center transition-all duration-200 ${
                  currentTeam === 'A'
                    ? 'bg-red-50 text-red-600 border-red-500 shadow-md scale-105 ring-2 ring-red-200' 
                    : 'bg-red-50/50 text-red-700/70 border-red-200'
                }`}>
                  <div className="flex items-center gap-2">
                    <span>🔴 チームA:</span>
                    <span className="font-mono text-2xl">{teamAScore}</span>
                  </div>
                  <span className="text-[11px] font-semibold text-red-500">Team Red</span>
                </div>
                <div className={`px-4 py-1.5 rounded-xl border-2 flex flex-col items-center transition-all duration-200 ${
                  currentTeam === 'B' 
                    ? 'bg-blue-50 text-blue-600 border-blue-500 shadow-md scale-105 ring-2 ring-blue-200' 
                    : 'bg-blue-50/50 text-blue-700/70 border-blue-200'
                }`}>
                  <div className="flex items-center gap-2">
                    <span>🔵 チームB:</span>
                    <span className="font-mono text-2xl">{teamBScore}</span>
                  </div>
                  <span className="text-[11px] font-semibold text-blue-500">Team Blue</span>
                </div>
              </div>
            )}
          </div>

          {/* Teacher Quick Tools Menu */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsVocabModalOpen(true)}
              className="px-3.5 py-2 text-base font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 active:scale-95 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer min-h-[48px]"
              title="単語一覧を表示 / Vocabulary List"
            >
              <BookOpen className="w-5 h-5 text-blue-600" />
              <div className="text-left hidden sm:block">
                <div className="leading-tight">単語帳</div>
                <div className="text-[10px] text-slate-500 font-normal">Vocab List</div>
              </div>
            </button>

            <button
              onClick={handleDownloadOfflineHtml}
              className="px-3.5 py-2 text-base font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 active:scale-95 border border-emerald-200 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer min-h-[48px]"
              title="教室のタッチスクリーン用 単一HTMLファイルを保存 / Save Standalone Offline HTML"
            >
              <Download className="w-5 h-5" />
              <div className="text-left hidden sm:block">
                <div className="leading-tight">HTML保存</div>
                <div className="text-[10px] text-emerald-600 font-normal">Save File</div>
              </div>
            </button>

            <button
              onClick={startNewGame}
              className="px-3.5 py-2 text-base font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 active:scale-95 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer min-h-[48px]"
              title="最初からやり直す / Restart Quiz (Space)"
            >
              <RotateCcw className="w-5 h-5" />
              <div className="text-left hidden sm:block">
                <div className="leading-tight">もう一度</div>
                <div className="text-[10px] text-slate-500 font-normal">Restart</div>
              </div>
            </button>

            <button
              onClick={toggleFullscreen}
              className="p-2.5 text-slate-700 bg-slate-100 hover:bg-slate-200 active:scale-95 rounded-xl transition-all flex flex-col items-center justify-center cursor-pointer min-h-[48px] min-w-[48px]"
              title="全画面表示 / Fullscreen (F)"
            >
              <Maximize2 className="w-5 h-5" />
              <span className="text-[9px] text-slate-500 mt-0.5 hidden sm:inline">Screen</span>
            </button>
          </div>
        </header>

        {/* ================= MAIN INTERACTIVE STAGE ================= */}
        <main className="flex-1 flex flex-col justify-center gap-4 my-auto relative">

          {!isGameOver && currentTarget && (
            <>
              {/* Question Card */}
              <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 md:p-8 text-center shadow-sm relative overflow-hidden flex flex-col items-center">
                
                {/* Team Indicator Banner */}
                {isTeamMode ? (
                  <div className={`inline-block px-5 py-1.5 rounded-full text-base font-bold mb-3 ${
                    currentTeam === 'A' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {currentTeam === 'A' ? '🔴 チームA (赤組) の番！ · Team Red\'s Turn' : '🔵 チームB (青組) の番！ · Team Blue\'s Turn'}
                  </div>
                ) : (
                  <div className="text-sm md:text-base font-bold text-slate-500 uppercase tracking-wider mb-2">
                    英語に合う日本語をえらぼう！ <span className="text-slate-400 font-normal">/ Match the English to Japanese</span>
                  </div>
                )}

                {/* Big Emoji Icon */}
                <div className="text-7xl md:text-8xl my-1 filter drop-shadow-md transition-transform duration-200 hover:scale-105">
                  {currentTarget.icon}
                </div>

                {/* English Prompt */}
                <h2 className="text-3xl md:text-5xl font-black text-slate-900 mt-2 tracking-tight">
                  {currentTarget.english}
                </h2>
                <p className="text-lg md:text-xl text-slate-500 mt-2 font-medium">
                  第 {currentRound + 1} 問 / 全 {TOTAL_ROUNDS} 問 <span className="text-slate-400 text-base">· Question {currentRound + 1} of {TOTAL_ROUNDS}</span>
                </p>

                {/* Timer Bar if Enabled */}
                {timerEnabled && (
                  <div className="w-full h-2 bg-slate-100 rounded-full mt-4 overflow-hidden max-w-xl">
                    <div 
                      className={`h-full transition-all duration-1000 ${
                        timerSecondsLeft <= 4 ? 'bg-red-500' : timerSecondsLeft <= 8 ? 'bg-amber-500' : 'bg-blue-600'
                      }`}
                      style={{ width: `${(timerSecondsLeft / TIMER_SECONDS) * 100}%` }}
                    />
                  </div>
                )}
              </div>

              {/* 2x2 Answer Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                {currentChoices.map((choice, index) => {
                  const isThisSelected = selectedChoiceIdx === index;
                  const isCorrectChoice = choice.id === currentTarget.id;

                  let buttonStyles = "bg-white border-slate-200 hover:border-slate-300 shadow-sm text-slate-900";
                  
                  if (isAnswered) {
                    if (isCorrectChoice) {
                      buttonStyles = "bg-green-50 border-green-500 text-green-800 ring-4 ring-green-100 shadow-md";
                    } else if (isThisSelected && !isCorrectChoice) {
                      buttonStyles = "bg-red-50 border-red-500 text-red-800 animate-shake";
                    } else {
                      buttonStyles = "bg-slate-50/60 border-slate-200 text-slate-400 opacity-60";
                    }
                  }

                  return (
                    <button
                      key={choice.id}
                      onClick={() => handleChoiceSelection(index)}
                      disabled={isAnswered}
                      className={`relative flex flex-col items-center justify-center min-h-[105px] md:min-h-[125px] p-4 rounded-2xl border-3 transition-all duration-150 cursor-pointer active:scale-98 ${buttonStyles}`}
                    >
                      {/* Keyboard shortcut hint */}
                      <span className="absolute top-3 left-3 w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 text-base font-bold flex items-center justify-center">
                        {index + 1}
                      </span>

                      {/* Correct / Wrong Badge */}
                      {isAnswered && isCorrectChoice && (
                        <CheckCircle2 className="absolute top-3 right-3 w-7 h-7 text-green-600" />
                      )}
                      {isAnswered && isThisSelected && !isCorrectChoice && (
                        <XCircle className="absolute top-3 right-3 w-7 h-7 text-red-600" />
                      )}

                      {/* Japanese Text */}
                      <span className="text-3xl md:text-4xl font-extrabold tracking-tight">
                        {choice.kanji}
                      </span>

                      {/* Hiragana Reading (Toggleable) */}
                      {showReadings && (
                        <span className="text-xl md:text-2xl font-medium text-slate-600 mt-1">
                          {choice.reading}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Feedback Area Banner */}
              {isAnswered && (
                <div className={`p-5 rounded-2xl border-2 flex items-center justify-between gap-4 shadow-md animate-pop ${
                  selectedChoiceIdx !== null && currentChoices[selectedChoiceIdx]?.id === currentTarget.id
                    ? 'bg-green-50/90 border-green-400 text-green-900'
                    : 'bg-red-50/90 border-red-400 text-red-900'
                }`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white text-3xl font-black shrink-0 ${
                      selectedChoiceIdx !== null && currentChoices[selectedChoiceIdx]?.id === currentTarget.id
                        ? 'bg-green-600'
                        : 'bg-red-600'
                    }`}>
                      {selectedChoiceIdx !== null && currentChoices[selectedChoiceIdx]?.id === currentTarget.id ? '✓' : '✗'}
                    </div>

                    <div>
                      <h3 className="text-2xl md:text-3xl font-black">
                        {selectedChoiceIdx !== null && currentChoices[selectedChoiceIdx]?.id === currentTarget.id
                          ? 'せいかい！ · Correct!'
                          : 'ざんねん… · Too bad…'}
                      </h3>
                      <div className="text-xl md:text-2xl text-slate-700 mt-1 flex items-center gap-2 flex-wrap">
                        <span>正解は (Answer):</span>
                        <ruby className="font-bold text-slate-900 text-2xl">
                          {currentTarget.furigana.map((segment, idx) => (
                            <React.Fragment key={idx}>
                              {segment.text}
                              {segment.rt && <rt className="text-base text-slate-600">{segment.rt}</rt>}
                            </React.Fragment>
                          ))}
                        </ruby>
                        <span className="text-slate-600 font-medium">【{currentTarget.english}】</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleNextQuestion}
                    className="px-8 py-4 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-extrabold text-2xl rounded-2xl flex items-center gap-3 shadow-lg shadow-blue-500/30 cursor-pointer min-h-[64px]"
                  >
                    <div className="text-left">
                      <div className="leading-tight">つぎへ</div>
                      <div className="text-xs text-blue-200 font-normal">Next Question</div>
                    </div>
                    <ArrowRight className="w-6 h-6" />
                  </button>
                </div>
              )}
            </>
          )}

          {/* ================= RESULTS CELEBRATION SCREEN ================= */}
          {isGameOver && (
            <div className="bg-white border-2 border-slate-200 rounded-3xl p-8 md:p-12 text-center shadow-lg relative overflow-hidden flex flex-col items-center animate-pop">
              
              {!isTeamMode ? (
                <>
                  <div className="text-7xl md:text-8xl mb-2">
                    {getRankMessage().badge}
                  </div>
                  <h2 className="text-4xl md:text-5xl font-black text-slate-900">
                    {getRankMessage().title}
                  </h2>
                  <p className="text-2xl md:text-3xl font-bold text-blue-600 mt-2">
                    {getRankMessage().msg}
                  </p>

                  <div className="my-6 px-10 py-3 bg-slate-100 rounded-2xl border-2 border-slate-200 flex flex-col items-center">
                    <span className="font-mono text-5xl md:text-6xl font-black text-slate-900">
                      {soloScore} / {TOTAL_ROUNDS} 点
                    </span>
                    <span className="text-sm font-semibold text-slate-500">Final Score: {Math.round((soloScore / TOTAL_ROUNDS) * 100)}%</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-7xl md:text-8xl mb-2">
                    {teamAScore === teamBScore ? '🤝' : '🏆'}
                  </div>
                  <h2 className="text-4xl md:text-5xl font-black text-slate-900">
                    {teamAScore > teamBScore 
                      ? 'チームA (赤組) の勝利！ · Team Red Wins!' 
                      : teamBScore > teamAScore 
                      ? 'チームB (青組) の勝利！ · Team Blue Wins!' 
                      : 'ひきわけ！ · Tie Game!'}
                  </h2>
                  <p className="text-2xl md:text-3xl font-bold text-blue-600 mt-2">
                    {teamAScore === teamBScore ? '両チームともよく頑張りました！ · Great teamwork!' : 'おめでとうございます！ · Congratulations!'}
                  </p>

                  <div className="my-6 px-10 py-3 bg-slate-100 rounded-2xl border-2 border-slate-200 flex items-center gap-6">
                    <span className="text-3xl font-bold text-red-600">🔴 赤組 (Team Red): {teamAScore}</span>
                    <span className="text-3xl text-slate-400">vs</span>
                    <span className="text-3xl font-bold text-blue-600">🔵 青組 (Team Blue): {teamBScore}</span>
                  </div>
                </>
              )}

              {/* Review summary of all holiday activities */}
              <div className="w-full max-w-4xl my-4 text-left">
                <h3 className="text-xl font-bold text-slate-700 mb-3 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  休みの活動 単語の復習 · Vocabulary Review ({vocabulary.length} Words):
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto p-2 bg-slate-50 border border-slate-200 rounded-xl">
                  {vocabulary.map(item => (
                    <div key={item.id} className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center gap-3">
                      <span className="text-2xl">{item.icon}</span>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-slate-900 truncate">{item.kanji}</div>
                        <div className="text-xs text-slate-500">{item.reading}</div>
                      </div>
                      <span className="text-xs text-blue-700 font-semibold">{item.english}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 mt-4">
                <button
                  onClick={startNewGame}
                  className="px-10 py-4 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-black text-2xl rounded-2xl flex items-center gap-3 shadow-lg shadow-blue-500/30 cursor-pointer min-h-[64px]"
                >
                  <RotateCcw className="w-6 h-6" />
                  <div className="text-left">
                    <div className="leading-tight">もう一度あそぶ</div>
                    <div className="text-xs text-blue-200 font-normal">Play Again</div>
                  </div>
                </button>
              </div>
            </div>
          )}

        </main>

        {/* ================= FOOTER / SETTINGS & TOGGLES ================= */}
        <footer className="bg-white border border-slate-200 rounded-2xl px-5 py-3 shadow-sm flex items-center justify-between gap-4 flex-wrap">
          
          <div className="flex items-center gap-3 flex-wrap">
            {/* Furigana Toggle */}
            <button
              onClick={() => setShowReadings(prev => !prev)}
              className={`px-3 py-2 text-base font-semibold rounded-xl border flex items-center gap-2 cursor-pointer transition-all min-h-[44px] ${
                showReadings 
                  ? 'bg-blue-50 text-blue-700 border-blue-200' 
                  : 'bg-slate-50 text-slate-600 border-slate-200'
              }`}
              title="選択肢のふりがな読みを表示/非表示 · Toggle Furigana Readings (R)"
            >
              {showReadings ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              <span>ふりがな (Furigana): {showReadings ? 'ON' : 'OFF'}</span>
            </button>

            {/* Team Mode Toggle */}
            <button
              onClick={() => {
                setIsTeamMode(prev => !prev);
                startNewGame();
              }}
              className={`px-3 py-2 text-base font-semibold rounded-xl border flex items-center gap-2 cursor-pointer transition-all min-h-[44px] ${
                isTeamMode 
                  ? 'bg-purple-50 text-purple-700 border-purple-200' 
                  : 'bg-slate-50 text-slate-600 border-slate-200'
              }`}
              title="2チーム交互対戦モード · Two-Team Mode (Red vs Blue)"
            >
              {isTeamMode ? <Users className="w-4 h-4" /> : <User className="w-4 h-4" />}
              <span>{isTeamMode ? 'チーム対戦 (Team Mode: 2 Teams)' : '全体モード (Solo / Class)'}</span>
            </button>

            {/* Sound Toggle */}
            <button
              onClick={() => setSoundEnabled(prev => !prev)}
              className={`px-3 py-2 text-base font-semibold rounded-xl border flex items-center gap-2 cursor-pointer transition-all min-h-[44px] ${
                soundEnabled 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                  : 'bg-slate-50 text-slate-600 border-slate-200'
              }`}
              title="効果音のON/OFF · Sound FX (M)"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span>効果音 (Sound): {soundEnabled ? 'ON' : 'OFF'}</span>
            </button>

            {/* Timer Toggle */}
            <button
              onClick={() => {
                setTimerEnabled(prev => !prev);
                setTimerSecondsLeft(TIMER_SECONDS);
              }}
              className={`px-3 py-2 text-base font-semibold rounded-xl border flex items-center gap-2 cursor-pointer transition-all min-h-[44px] ${
                timerEnabled 
                  ? 'bg-amber-50 text-amber-700 border-amber-200' 
                  : 'bg-slate-50 text-slate-600 border-slate-200'
              }`}
              title="1問あたり15秒のタイマー · 15s Question Timer"
            >
              <Clock className="w-4 h-4" />
              <span>タイマー (Timer): {timerEnabled ? '15s' : 'OFF'}</span>
            </button>
          </div>

          {/* Keyboard shortcut tips */}
          <div className="text-sm font-medium text-slate-500 hidden lg:flex items-center gap-1.5">
            <span>ショートカット (Keys):</span>
            <kbd className="px-2 py-0.5 bg-slate-100 rounded border border-slate-300 font-mono text-xs">1</kbd>~
            <kbd className="px-2 py-0.5 bg-slate-100 rounded border border-slate-300 font-mono text-xs">4</kbd> Answer /
            <kbd className="px-2 py-0.5 bg-slate-100 rounded border border-slate-300 font-mono text-xs">Space</kbd> Next /
            <kbd className="px-2 py-0.5 bg-slate-100 rounded border border-slate-300 font-mono text-xs">R</kbd> Furigana /
            <kbd className="px-2 py-0.5 bg-slate-100 rounded border border-slate-300 font-mono text-xs">F</kbd> Fullscreen
          </div>

        </footer>

      </div>

      {/* ================= TEACHER VOCABULARY MANAGEMENT MODAL ================= */}
      {isVocabModalOpen && (
        <div 
          onClick={() => {
            setIsVocabModalOpen(false);
            setIsAddFormOpen(false);
          }}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 md:p-6 animate-pop"
        >
          <div 
            onClick={e => e.stopPropagation()} 
            className="bg-white rounded-3xl max-w-4xl w-full p-5 md:p-7 shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <BookOpen className="w-7 h-7 text-blue-600 shrink-0" />
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 leading-tight">
                      休みの活動 単語管理
                    </h2>
                    <span className="text-sm font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                      全 {vocabulary.length} 語 ({vocabulary.length} Items)
                    </span>
                  </div>
                  <div className="text-xs md:text-sm text-slate-500 font-medium">
                    Vocabulary List & Teacher Customizer
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddFormOpen(prev => !prev)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm md:text-base rounded-xl transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer min-h-[44px]"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isAddFormOpen ? 'フォームを閉じる' : '＋ 単語を追加 (Add Word)'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleResetToDefault}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs md:text-sm rounded-xl transition-all flex items-center gap-1 active:scale-95 cursor-pointer min-h-[44px]"
                  title="初期の12単語にリセット / Reset to Default 12"
                >
                  <Undo2 className="w-4 h-4" />
                  <span className="hidden sm:inline">初期化</span>
                </button>

                <button
                  onClick={() => {
                    setIsVocabModalOpen(false);
                    setIsAddFormOpen(false);
                  }}
                  className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xl cursor-pointer"
                  title="閉じる / Close (Esc)"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Expandable Add Word Drawer */}
            {isAddFormOpen && (
              <form onSubmit={handleAddNewWord} className="my-4 p-4 md:p-5 bg-blue-50/70 border border-blue-200 rounded-2xl animate-pop">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg md:text-xl font-extrabold text-blue-900 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-blue-600" />
                    新しい単語の追加 · Add New Word
                  </h3>
                  <span className="text-xs text-blue-600 font-medium">即座にクイズに反映されます (Saved instantly)</span>
                </div>

                {formError && (
                  <div className="p-2.5 mb-3 bg-red-100 border border-red-300 text-red-800 text-sm font-semibold rounded-lg">
                    {formError}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Japanese Expression */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      日本語表記 (Japanese Kanji/Kana) *
                    </label>
                    <input
                      type="text"
                      value={newKanji}
                      onChange={e => setNewKanji(e.target.value)}
                      placeholder="例: 本を読む / 散歩する"
                      className="w-full px-3 py-2 text-base font-bold text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-blue-600"
                    />
                  </div>

                  {/* Reading in Hiragana */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      ひらがな読み (Hiragana Reading) *
                    </label>
                    <input
                      type="text"
                      value={newReading}
                      onChange={e => setNewReading(e.target.value)}
                      placeholder="例: ほんをよむ / さんぽする"
                      className="w-full px-3 py-2 text-base font-medium text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-blue-600"
                    />
                  </div>

                  {/* English Meaning */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      英語の意味 (English Meaning) *
                    </label>
                    <input
                      type="text"
                      value={newEnglish}
                      onChange={e => setNewEnglish(e.target.value)}
                      placeholder="例: to read books / to take a walk"
                      className="w-full px-3 py-2 text-base text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-blue-600"
                    />
                  </div>
                </div>

                {/* Emoji Selection */}
                <div className="mt-3">
                  <div className="flex items-center gap-2 mb-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      アイコン (Icon / Emoji):
                    </label>
                    <input
                      type="text"
                      value={newIcon}
                      onChange={e => setNewIcon(e.target.value)}
                      className="w-12 text-center text-xl py-0.5 bg-white border border-slate-300 rounded-lg"
                      maxLength={4}
                    />
                    <span className="text-xs text-slate-500">下のパレットからワンタップで選択可能:</span>
                  </div>

                  <div className="flex gap-1.5 flex-wrap">
                    {PRESET_EMOJIS.map(emoji => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setNewIcon(emoji)}
                        className={`text-xl p-1.5 rounded-lg border transition-all cursor-pointer ${
                          newIcon === emoji 
                            ? 'bg-blue-200 border-blue-500 scale-110 shadow-xs' 
                            : 'bg-white border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddFormOpen(false);
                      setFormError('');
                    }}
                    className="px-4 py-2 text-slate-600 font-bold text-sm bg-white border border-slate-300 hover:bg-slate-100 rounded-xl cursor-pointer"
                  >
                    キャンセル / Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-base rounded-xl shadow-md cursor-pointer flex items-center gap-1.5 active:scale-95"
                  >
                    <span>✓ クイズに追加する (Add to Quiz)</span>
                  </button>
                </div>
              </form>
            )}

            {/* Vocabulary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 overflow-y-auto py-4 flex-1 pr-1">
              {vocabulary.map(item => (
                <div 
                  key={item.id} 
                  className={`p-3 bg-slate-50 border rounded-2xl flex items-center gap-3 transition-colors ${
                    item.isCustom ? 'border-blue-300 bg-blue-50/40' : 'border-slate-200'
                  }`}
                >
                  <span className="text-3xl shrink-0">{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="text-xl font-black text-slate-900 truncate">
                        <ruby>
                          {item.furigana && item.furigana.length > 0 ? (
                            item.furigana.map((segment, idx) => (
                              <React.Fragment key={idx}>
                                {segment.text}
                                {segment.rt && <rt className="text-xs text-slate-500">{segment.rt}</rt>}
                              </React.Fragment>
                            ))
                          ) : (
                            item.kanji
                          )}
                        </ruby>
                      </div>
                      {item.isCustom && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 shrink-0">
                          カスタム
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-slate-500 font-medium truncate">{item.reading}</div>
                    <div className="text-sm font-semibold text-blue-700 truncate">{item.english}</div>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDeleteWord(item.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer shrink-0"
                    title={`「${item.kanji}」を削除 / Delete word`}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs text-slate-500">
                💡 単語を追加・削除すると、ブラウザに保存され次回以降も引き継がれます。
              </span>
              <button
                onClick={() => {
                  setIsVocabModalOpen(false);
                  setIsAddFormOpen(false);
                }}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-base rounded-xl cursor-pointer"
              >
                閉じる / Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
