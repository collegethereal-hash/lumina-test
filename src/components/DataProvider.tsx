'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

const CATEGORY_COLORS = [
  { bg: 'bg-[#ff7e7e]', text: 'text-white', border: 'border-[#ff7e7e]', name: 'Красный' },
  { bg: 'bg-[#7eafff]', text: 'text-white', border: 'border-[#7eafff]', name: 'Синий' },
  { bg: 'bg-[#7eff9e]', text: 'text-[#2d5a3a]', border: 'border-[#7eff9e]', name: 'Зеленый' },
  { bg: 'bg-[#ffde7e]', text: 'text-[#5a4a2d]', border: 'border-[#ffde7e]', name: 'Желтый' },
  { bg: 'bg-[#ff7eb6]', text: 'text-white', border: 'border-[#ff7eb6]', name: 'Розовый' },
  { bg: 'bg-[#bc7eff]', text: 'text-white', border: 'border-[#bc7eff]', name: 'Фиолетовый' },
];

interface SpaceConfig {
  id: string;
  name: string;
  partner1_name: string;
  partner2_name: string;
  active_era: string;
  password_p1: string;
  password_p2: string;
}

interface ArchiveMonth {
  id: string;
  name: string;
  year: number;
  month: number;
  moments_count: number;
}

interface DataContextType {
  currentUser: 'Grinch' | 'Cindy' | null;
  spaceConfig: SpaceConfig | null;
  profiles: any;
  notes: any[];
  moments: any[];
  quests: any[];
  archiState: any;
  capsules: any[];
  whispers: any[];
  archiveMonths: ArchiveMonth[];
  archiveMoments: any[];
  isLoading: boolean;
  isNotesLoading: boolean;
  isMomentsLoading: boolean;
  isQuestsLoading: boolean;
  isCapsulesLoading: boolean;
  isWhispersLoading: boolean;
  setNotes: React.Dispatch<React.SetStateAction<any[]>>;
  setMoments: React.Dispatch<React.SetStateAction<any[]>>;
  setQuests: React.Dispatch<React.SetStateAction<any[]>>;
  setCapsules: React.Dispatch<React.SetStateAction<any[]>>;
  setWhispers: React.Dispatch<React.SetStateAction<any[]>>;
  setArchiState: React.Dispatch<React.SetStateAction<any>>;
  setArchiveMonths: React.Dispatch<React.SetStateAction<ArchiveMonth[]>>;
  setArchiveMoments: React.Dispatch<React.SetStateAction<any[]>>;
  refreshAll: () => Promise<void>;
  refreshSpace: () => Promise<void>;
  refreshProfiles: () => Promise<void>;
  refreshNotes: () => Promise<void>;
  refreshMoments: () => Promise<void>;
  refreshQuests: () => Promise<void>;
  refreshCapsules: () => Promise<void>;
  refreshArchi: () => Promise<void>;
  refreshWhispers: () => Promise<void>;
  refreshArchiveMonths: () => Promise<void>;
  loadArchiveMonth: (year: number, month: number) => Promise<void>;
  logout: () => void;
  getCurrentMonthMoments: () => any[];
  getCurrentMonthNotes: () => any[];
  galleryCategories: string[];
  setGalleryCategories: React.Dispatch<React.SetStateAction<string[]>>;
  bucketListCategories: string[];
  setBucketListCategories: React.Dispatch<React.SetStateAction<string[]>>;
  dailyFact: string;
  dailyCookie: string;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const INTERESTING_FACTS = [
  "На Венере день длится дольше, чем год — планета вращается вокруг своей оси медленнее, чем облетает Солнце !!",
  "Грибы технически ближе к животным, чем к растениям. У них даже есть свой аналог иммунной системы ))",
  "В мире существует библиотека, где книги напечатаны на тончайших листах золота, чтобы они хранились вечно !!",
  "У Сатурна есть луна Япет, которая наполовину черная как уголь, а наполовину белая как свежий снег ))",
  "Мед никогда не портится. Археологи находили в египетских гробницах горшки с медом, которому 3000 лет, и он всё еще съедобен !!",
  "Сердце синего кита размером с автомобиль, а его язык весит столько же, сколько целый слон ))",
  "На Нептуне и Уране идут дожди из настоящих алмазов из-за огромного давления в атмосфере !!",
  "Деревья умеют общаться друг с другом через подземную сеть грибницы, передавая питательные вещества и предупреждая об опасности ))",
  "Человеческий мозг генерирует больше электрических импульсов за один день, чем все телефоны мира вместе взятые !!",
  "Осьминоги могут пролезть в любое отверстие, которое больше их единственной твердой части тела — клюва ))",
  "В Антарктиде есть 'Кровавый водопад', вода в котором ярко-красного цвета из-за высокого содержания железа !!",
  "Колибри — единственные птицы в мире, которые умеют летать задом наперед и зависать в воздухе на месте ))",
  "Звук извержения вулкана Кракатау в 1883 году был настолько мощным, что его слышали за 5000 километров от него !!",
  "На Марсе находится самый высокий вулкан в Солнечной системе — Олимп, он в три раза выше Эвереста ))",
  "У жирафов и людей одинаковое количество шейных позвонков — ровно семь, просто у жирафов они огромные !!",
  "Свету требуется 8 минут и 20 секунд, чтобы долететь от Солнца до Земли. Мы всегда видим Солнце в прошлом ))",
  "Морские коньки — единственные существа на планете, у которых потомство вынашивают и рожают самцы !!",
  "В Тихом океане есть точка Немо — это самое удаленное место от любой суши, ближе всего к ней находятся космонавты с МКС ))",
  "Если убрать всё пустое пространство из атомов, из которых состоит человечество, все люди поместятся в объем яблока !!",
  "У кошек есть более 100 различных звуков для общения, в то время как у собак их всего около десяти ))",
  "В мире больше звезд в видимой вселенной, чем песчинок на всех пляжах нашей планеты Земля !!",
  "Скорпионы могут обходиться без еды целый год и при этом оставаться полностью активными и опасными ))",
  "Самый длинный полет курицы в истории длился всего 13 секунд, но это официально зафиксированный рекорд !!",
  "У бабочек нет желудков, они питаются только жидким нектаром, который сразу превращается в энергию ))",
  "Каждый раз, когда вы перемешиваете колоду карт, вы создаете комбинацию, которой, скорее всего, никогда не существовало во вселенной !!",
  "Белые медведи на самом деле черные под своей белой шерстью, а их шерстинки прозрачные и полые внутри ))",
  "Во время грозы на Земле каждую секунду происходит около 100 ударов молнии в разные точки планеты !!",
  "Улитки могут восстанавливать свои глаза, если они были повреждены, и у них более 25 000 зубов на языке ))",
  "В космосе металлы могут 'свариваться' сами по себе без нагрева, если два чистых куска соприкоснутся — это холодная сварка !!",
  "Твои отпечатки пальцев уникальны, но у коал они настолько похожи на человеческие, что их путали даже эксперты ))"
];

const FORTUNES = [
  "Полинка, помни, что я всегда рядом с тобой, в любую минуту и в любой ситуации, ты никогда не будешь одна !!",
  "Кис, у тебя обязательно всё получится, ты гораздо сильнее и способнее, чем сама иногда думаешь ))",
  "Полинка, ты самая потрясающая подруга на свете, твоя поддержка и доброта делают этот мир намного лучше !!",
  "Просто хочу напомнить, что ты невероятно красивая, и твоя улыбка освещает даже самый пасмурный день ))",
  "Ты замечательная дочь, и твои близкие очень гордятся тем, каким человеком ты выросла !!",
  "Полинка, ты умничка, твоё трудолюбие и ум всегда ведут тебя к правильным решениям, я в тебя верю !!",
  "Кис, никогда не сомневайся в себе, потому что ты — настоящее сокровище, и я бесконечно ценю тебя ))",
  "Твоё доброе сердце — это твоя суперсила, спасибо тебе за то, что ты именно такая, какая есть !!",
  "Полинка, ты заслуживаешь всего самого лучшего в этом мире, и я сделаю всё, чтобы ты была счастлива ))",
  "Ты обладаешь удивительным талантом находить красоту в мелочах и дарить радость окружающим тебя людям !!",
  "Кис, помни, что любая трудность временна, а моя вера в тебя и твои силы — бесконечна ))",
  "Ты самая заботливая и искренняя, и я каждый день благодарю судьбу за то, что ты есть в моей жизни !!",
  "Полинка, твоя целеустремленность восхищает меня, ты идешь к своим мечтам, и я всегда поддержу тебя ))",
  "Ты — воплонение нежности и мудрости, в тебе сочетается столько прекрасных качеств одновременно !!",
  "Кис, даже если день не задался, помни, что вечером тебя всегда ждет моя поддержка и тепло ))",
  "Твои глаза светятся добротой, и в них можно увидеть целую вселенную, ты просто волшебная !!",
  "Полинка, ты очень талантливая, не бойся проявлять себя и показывать миру свои способности ))",
  "Ты умеешь слушать и понимать как никто другой, это редкий и очень ценный дар, спасибо тебе !!",
  "Кис, ты моя маленькая победа каждый день, просто знай, что ты — самое дорогое, что у меня есть ))",
  "Твоя энергия заряжает всех вокруг позитивом, ты как маленькое солнышко, которое греет всех близких !!",
  "Полинка, ты удивительная личность с невероятно глубоким внутренним миром, я горжусь тобой ))",
  "Ты всегда находишь правильные слова, чтобы утешить или подбодрить, ты настоящая волшебница !!",
  "Кис, ты очень сильная духом, и никакие преграды не смогут остановить тебя на пути к счастью ))",
  "Твоё чувство юмора и твой смех — это лучшее лекарство от любой грусти, никогда не переставай улыбаться !!",
  "Полинка, ты пример того, какой должна быть идеальная подруга: верной, честной и бесконечно доброй ))",
  "Ты очень мудрая не по годам, и твои советы всегда помогают найти выход из сложных ситуаций !!",
  "Кис, ты заслуживаешь того, чтобы каждый твой день был наполнен любовью, заботой и радостью ))",
  "Твоя открытость и честность — это то, за что я и все твои близкие тебя так сильно любим !!",
  "Полинка, ты просто умничка, и я не перестану повторять, как сильно я восхищаюсь твоими успехами ))",
  "Помни, Кис, что для меня ты — целый мир, и я всегда буду оберегать твоё спокойствие и счастье !!"
];

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<'Grinch' | 'Cindy' | null>(null);
  const [spaceConfig, setSpaceConfig] = useState<SpaceConfig | null>(null);
  const [profiles, setProfiles] = useState<any>({});
  const [notes, setNotes] = useState<any[]>([]);
  const [moments, setMoments] = useState<any[]>([]);
  const [quests, setQuests] = useState<any[]>([]);
  const [capsules, setCapsules] = useState<any[]>([]);
  const [whispers, setWhispers] = useState<any[]>([]);
  const [archiState, setArchiState] = useState<any>(null);
  const [archiveMonths, setArchiveMonths] = useState<ArchiveMonth[]>([]);
  const [archiveMoments, setArchiveMoments] = useState<any[]>([]);
  const [galleryCategories, setGalleryCategories] = useState<string[]>(['Все', 'Свидания', 'Прогулки', 'Дом', 'Путешествия']);
  const [bucketListCategories, setBucketListCategories] = useState<string[]>(['Все', 'Общее', 'Путешествие', 'Дом', 'Приключение']);
  const [dailyFact, setDailyFact] = useState("");
  const [dailyCookie, setDailyCookie] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isNotesLoading, setIsNotesLoading] = useState(false);
  const [isMomentsLoading, setIsMomentsLoading] = useState(false);
  const [isQuestsLoading, setIsQuestsLoading] = useState(false);
  const [isCapsulesLoading, setIsCapsulesLoading] = useState(false);
  const [isWhispersLoading, setIsWhispersLoading] = useState(false);

  // Initialize Auth
  useEffect(() => {
    const auth = localStorage.getItem('lumina_auth');
    if (auth) {
      setCurrentUser(auth === 'grinch' ? 'Grinch' : 'Cindy');
    }
  }, []);

  // Update last_active status
  useEffect(() => {
    if (!currentUser || !profiles[currentUser]?.realId) return;

    const updatePresence = async () => {
      const profileId = profiles[currentUser].realId;
      await supabase
        .from('profiles')
        .update({ last_active: new Date().toISOString() })
        .eq('id', profileId);
    };

    // Initial update
    updatePresence();

    // Periodic update every 30 seconds
    const interval = setInterval(updatePresence, 30000);
    
    // Also update on activity
    const handleActivity = () => {
      // Throttled update could be better, but for now simple interval is fine
    };
    window.addEventListener('mousedown', handleActivity);
    window.addEventListener('keydown', handleActivity);

    return () => {
      clearInterval(interval);
      window.removeEventListener('mousedown', handleActivity);
      window.removeEventListener('keydown', handleActivity);
    };
  }, [currentUser, currentUser ? profiles[currentUser]?.realId : null]);

  const refreshSpace = useCallback(async () => {
    const { data, error } = await supabase
      .from('spaces')
      .select('*')
      .limit(1)
      .maybeSingle(); // Better than single() if table might be empty
    
    if (data) {
      setSpaceConfig(data);
    }
  }, []);

  const refreshProfiles = useCallback(async () => {
    const { data } = await supabase.from('profiles').select('*');
    
    // Default fallback profiles using space config if available
    const p1Name = spaceConfig?.partner1_name || 'Гринч';
    const p2Name = spaceConfig?.partner2_name || 'Синди Лу';

    const defaultProfiles: any = {
      Grinch: { id: 'Grinch', name: p1Name, status: 'В сети', mood: '🌿', pref: 'Твое описание...', avatarColor: 'bg-talia-lavender', categories: [], custom_rewards: [] },
      Cindy: { id: 'Cindy', name: p2Name, status: 'Отдыхает', mood: '✨', pref: 'Её описание...', avatarColor: 'bg-talia-peach', categories: [], custom_rewards: [] }
    };

    if (data && data.length > 0) {
      data.forEach((p: any) => { 
        // Map any existing ID to either Grinch or Cindy
        const isGrinch = p.id === 'me' || p.id === 'Grinch' || p.id?.toLowerCase() === 'grinch' || p.name === p1Name;
        const id = isGrinch ? 'Grinch' : 'Cindy';
        
        defaultProfiles[id] = {
          ...p,
          realId: p.id,
          id,
          lastActive: p.last_active,
          categories: p.categories || [],
          custom_rewards: p.custom_rewards || [],
          avatarColor: p.avatar_color || (id === 'Grinch' ? 'bg-talia-lavender' : 'bg-talia-peach')
        }; 
      });
    }
    setProfiles(defaultProfiles);
  }, [spaceConfig?.partner1_name, spaceConfig?.partner2_name]);

  const logout = useCallback(async () => {
    if (currentUser && profiles[currentUser]?.realId) {
      const profileId = profiles[currentUser].realId;
      await supabase
        .from('profiles')
        .update({ last_active: new Date(0).toISOString() })
        .eq('id', profileId);
    }
    localStorage.removeItem('lumina_auth');
    document.cookie = 'lumina_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    window.location.href = '/';
  }, [currentUser, profiles]);

  const refreshNotes = useCallback(async () => {
    if (!spaceConfig?.id) return;
    setIsNotesLoading(true);
    try {
      const { data } = await supabase
        .from('journal_notes')
        .select('*')
        .eq('space_id', spaceConfig.id)
        .order('created_at', { ascending: false });
      if (data) {
        setNotes(data.map((n: any) => ({
          ...n,
          isLiked: n.is_liked
        })));
      }
    } finally {
      setIsNotesLoading(false);
    }
  }, [spaceConfig?.id]);

  const refreshMoments = useCallback(async () => {
    if (!spaceConfig?.id) return;
    setIsMomentsLoading(true);
    try {
      const { data } = await supabase
        .from('gallery_moments')
        .select('*')
        .eq('space_id', spaceConfig.id);
      
      if (data) {
        setMoments(data.map((m: any) => ({
          ...m,
          src: m.image_url,
          // Гарантируем наличие даты для фильтрации
          date: m.date || m.created_at 
        })));
      }
    } finally {
      setIsMomentsLoading(false);
    }
  }, [spaceConfig?.id]);

  const refreshQuests = useCallback(async () => {
    if (!spaceConfig?.id) return;
    setIsQuestsLoading(true);
    try {
      const { data } = await supabase
        .from('bucket_list')
        .select('*')
        .eq('space_id', spaceConfig.id)
        .order('created_at', { ascending: false });
      if (data) {
        const p1Name = spaceConfig.partner1_name;
        const p2Name = spaceConfig.partner2_name;
        setQuests(data.map((q: any) => ({
          id: q.id,
          title: q.title,
          description: q.description || '',
          completed: q.is_completed,
          completedByGrinch: q.completed_by_p1 || false,
          completedByCindy: q.completed_by_p2 || false,
          points: q.points,
          category: q.category,
          categoryColor: q.category_color || CATEGORY_COLORS[0],
          proposedBy: q.proposed_by,
          approvedByPartner: q.approved_by_partner,
          deleteRequestedBy: q.delete_requested_by,
          location: q.location,
          isChecklist: q.is_checklist,
          checklistItems: q.checklist_items,
          completedAt: q.completed_at
        })));
      }
    } finally {
      setIsQuestsLoading(false);
    }
  }, [spaceConfig?.id, spaceConfig?.partner1_name, spaceConfig?.partner2_name]);

  const refreshArchi = useCallback(async () => {
    if (!spaceConfig?.id) return;
    const { data } = await supabase
      .from('global_state')
      .select('value')
      .eq('space_id', spaceConfig.id)
      .eq('key', 'archi_state')
      .maybeSingle(); // Use maybeSingle to avoid 406 error if empty
    if (data) setArchiState(data.value);
  }, [spaceConfig?.id]);

  const refreshWhispers = useCallback(async () => {
    if (!spaceConfig?.id) return;
    setIsWhispersLoading(true);
    try {
      const { data } = await supabase
        .from('whisper_history')
        .select('*')
        .eq('space_id', spaceConfig.id)
        .order('created_at', { ascending: false });
      if (data) setWhispers(data);
    } finally {
      setIsWhispersLoading(false);
    }
  }, [spaceConfig?.id]);

  const refreshArchiveMonths = useCallback(async () => {
    if (!spaceConfig?.id) return;
    const { data } = await supabase
      .from('gallery_moments')
      .select('date, created_at')
      .eq('space_id', spaceConfig.id);
    
    if (data) {
      const months = new Map<string, { year: number; month: number; count: number }>();
      
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      const currentDay = now.getDate();
      
      let currentPeriodStart;
      if (currentDay >= 20) {
        currentPeriodStart = new Date(currentYear, currentMonth, 20);
      } else {
        currentPeriodStart = new Date(currentYear, currentMonth - 1, 20);
      }
      
      const currentPeriodStartUTC = Date.UTC(currentPeriodStart.getFullYear(), currentPeriodStart.getMonth(), currentPeriodStart.getDate(), 0, 0, 0);

      data.forEach(moment => {
        const rawDate = moment.date || moment.created_at;
        if (!rawDate) return;

        const date = new Date(rawDate);
        const dateUTC = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
        
        // Пропускаем фото из текущего 30-дневного периода (они в основной ленте)
        if (dateUTC >= currentPeriodStartUTC) return;

        const year = date.getFullYear();
        const month = date.getMonth();
        const key = `${year}-${month}`;
        
        const current = months.get(key);
        if (current) {
          current.count++;
        } else {
          months.set(key, { year, month, count: 1 });
        }
      });
      
      const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
      
      const archiveMonthsList: ArchiveMonth[] = Array.from(months.values())
        .sort((a, b) => {
          if (a.year !== b.year) return b.year - a.year;
          return b.month - a.month;
        })
        .map((m, index) => ({
          id: `${m.year}-${m.month}`,
          name: `${monthNames[m.month]} ${m.year}`,
          year: m.year,
          month: m.month,
          moments_count: m.count
        }));
      
      setArchiveMonths(archiveMonthsList);
    }
  }, [spaceConfig?.id]);

  const loadArchiveMonth = useCallback(async (year: number, month: number) => {
    if (!spaceConfig?.id) return;
    
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 1);
    
    const { data } = await supabase
      .from('gallery_moments')
      .select('*')
      .eq('space_id', spaceConfig.id)
      .or(`date.gte.${startDate.toISOString()},created_at.gte.${startDate.toISOString()}`)
      .order('created_at', { ascending: false });
    
    if (data) {
      // Дополнительная фильтрация на клиенте для точности месяца
      const filteredData = data.filter(m => {
        const d = new Date(m.date || m.created_at);
        return d >= startDate && d < endDate;
      });

      setArchiveMoments(filteredData.map((m: any) => ({
        ...m,
        src: m.image_url
      })));
    }
  }, [spaceConfig?.id]);

  const getCurrentMonthMoments = useCallback(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const currentDay = now.getDate();
    
    let startDate;
    if (currentDay >= 20) {
      startDate = new Date(currentYear, currentMonth, 20);
    } else {
      startDate = new Date(currentYear, currentMonth - 1, 20);
    }
    
    const startDateUTC = Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), 0, 0, 0);
    
    return moments.filter(m => {
      const rawDate = m.date || m.created_at;
      const momentDate = new Date(rawDate);
      const momentDateUTC = Date.UTC(momentDate.getFullYear(), momentDate.getMonth(), momentDate.getDate(), 0, 0, 0);
      
      return momentDateUTC >= startDateUTC;
    });
  }, [moments]);

  const getCurrentMonthNotes = useCallback(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const currentDay = now.getDate();
    
    let startDate;
    if (currentDay >= 20) {
      startDate = new Date(currentYear, currentMonth, 20);
    } else {
      startDate = new Date(currentYear, currentMonth - 1, 20);
    }
    
    const startDateUTC = Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), 0, 0, 0);
    
    return notes.filter(n => {
       // Для заметок используем локальную дату или created_at
       const rawDate = n.date || n.created_at;
       if (!rawDate) return false;

       // Если это строка YYYY-MM-DD, создаем дату. 
       // Если это ISO из Supabase, JS тоже поймет.
       const momentDate = new Date(rawDate);
       
       // Сбрасываем в UTC для честного сравнения с startDateUTC
       const momentDateUTC = Date.UTC(momentDate.getFullYear(), momentDate.getMonth(), momentDate.getDate(), 0, 0, 0);
       
       return momentDateUTC >= startDateUTC;
     });
  }, [notes]);

  const refreshCapsules = useCallback(async () => {
    if (!spaceConfig?.id) return;
    setIsCapsulesLoading(true);
    try {
      const { data } = await supabase
        .from('time_capsules')
        .select('*')
        .eq('space_id', spaceConfig.id)
        .order('created_at', { ascending: false });
      if (data) {
        setCapsules(data.map((c: any) => ({
          id: c.id,
          title: c.title,
          description: c.description,
          unlockDate: c.unlock_date,
          isLocked: c.is_sealed,
          content: c.content,
          author: c.author
        })));
      }
    } finally {
      setIsCapsulesLoading(false);
    }
  }, [spaceConfig?.id]);

  const refreshGalleryCategories = useCallback(async () => {
    if (!spaceConfig?.id) return;
    const { data } = await supabase
      .from('global_state')
      .select('value')
      .eq('space_id', spaceConfig.id)
      .eq('key', 'gallery_categories')
      .maybeSingle(); // Use maybeSingle to avoid 406 error if empty
    if (data && data.value) {
      setGalleryCategories(data.value as string[]);
    }
  }, [spaceConfig?.id]);

  const refreshBucketListCategories = useCallback(async () => {
    if (!spaceConfig?.id) return;
    const { data } = await supabase
      .from('global_state')
      .select('value')
      .eq('space_id', spaceConfig.id)
      .eq('key', 'bucket_list_categories')
      .maybeSingle();
    if (data && data.value) {
      setBucketListCategories(data.value as string[]);
    }
  }, [spaceConfig?.id]);

  // Initialize Data
  useEffect(() => {
    // Set initial fact and cookie
    const hour = new Date().getHours();
    const day = new Date().getDate();
    setDailyFact(INTERESTING_FACTS[hour % INTERESTING_FACTS.length]);
    setDailyCookie(FORTUNES[day % FORTUNES.length]);

    refreshSpace();
    refreshProfiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch all data when space is ready
  useEffect(() => {
    if (spaceConfig?.id) {
      refreshNotes();
      refreshMoments();
      refreshQuests();
      refreshCapsules();
      refreshArchi();
      refreshGalleryCategories();
      refreshBucketListCategories();
      refreshWhispers();
      refreshArchiveMonths(); // Добавляем вызов обновления архива
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spaceConfig?.id]);

  const refreshAll = useCallback(async () => {
    // Меняем факт каждый час
    const hour = new Date().getHours();
    setDailyFact(INTERESTING_FACTS[hour % INTERESTING_FACTS.length]);
    
    const day = new Date().getDate();
    setDailyCookie(FORTUNES[day % FORTUNES.length]);

    // Manual refresh
    await refreshSpace();
    await refreshProfiles();
    refreshNotes();
    refreshMoments();
    refreshQuests();
    refreshCapsules();
    refreshArchi();
    refreshGalleryCategories();
    refreshBucketListCategories();
    refreshWhispers();
    refreshArchiveMonths(); // И здесь тоже
  }, [refreshSpace, refreshProfiles, refreshNotes, refreshMoments, refreshQuests, refreshCapsules, refreshArchi, refreshGalleryCategories, refreshBucketListCategories, refreshWhispers, refreshArchiveMonths]);

  useEffect(() => {
    if (!currentUser) return;

    const updatePresence = async () => {
      if (!spaceConfig?.id || !currentUser) return;
      
      const id = currentUser.toLowerCase() === 'grinch' ? 'Grinch' : 'Cindy';
      
      // Синхронизируем куки для Middleware, если их нет
      if (!document.cookie.includes('lumina_auth')) {
        document.cookie = `lumina_auth=${currentUser.toLowerCase()}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;
      }
      
      try {
        await supabase
          .from('profiles')
          .upsert({ 
            id: id, 
            space_id: spaceConfig.id,
            last_active: new Date().toISOString(),
            name: id === 'Grinch' ? (spaceConfig.partner1_name || 'Гринч') : (spaceConfig.partner2_name || 'Синди Лу')
          }, { onConflict: 'id' });
      } catch (e) {
        console.error('Presence Update Error:', e);
      }
    };

    updatePresence();
    const presenceInterval = setInterval(updatePresence, 30000); 
    const refreshInterval = setInterval(refreshProfiles, 30000); 
    
    return () => {
      clearInterval(presenceInterval);
      clearInterval(refreshInterval);
    };
  }, [currentUser, refreshProfiles]);

  const value = {
    currentUser,
    spaceConfig,
    profiles,
    notes,
    moments,
    quests,
    archiState,
    capsules,
    whispers,
    archiveMonths,
    archiveMoments,
    isLoading,
    isNotesLoading,
    isMomentsLoading,
    isQuestsLoading,
    isCapsulesLoading,
    isWhispersLoading,
    setNotes,
    setMoments,
    setQuests,
    setCapsules,
    setWhispers,
    setArchiState,
    setArchiveMonths,
    setArchiveMoments,
    refreshAll,
    refreshSpace,
    refreshProfiles,
    refreshNotes,
    refreshMoments,
    refreshQuests,
    refreshCapsules,
    refreshArchi,
    refreshWhispers,
    refreshArchiveMonths,
    loadArchiveMonth,
    logout,
    getCurrentMonthMoments,
    getCurrentMonthNotes,
    galleryCategories,
    setGalleryCategories,
    bucketListCategories,
    setBucketListCategories,
    dailyFact,
    dailyCookie,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
