import { useState, useRef, useEffect } from "react";
import Icon from "@/components/ui/icon";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Message {
  id: number;
  author: string;
  avatar: string;
  avatarColor: string;
  text: string;
  time: string;
  reactions?: { emoji: string; count: number }[];
}

interface Channel {
  id: string;
  name: string;
  type: "text" | "voice";
  unread?: number;
}

interface User {
  id: string;
  name: string;
  status: "online" | "idle" | "dnd" | "offline";
  avatarColor: string;
  activity?: string;
}

// ─── Data ────────────────────────────────────────────────────────────────────

const CHANNELS: Channel[] = [
  { id: "general", name: "общий", type: "text", unread: 0 },
  { id: "random", name: "случайное", type: "text", unread: 3 },
  { id: "design", name: "дизайн", type: "text" },
  { id: "dev", name: "разработка", type: "text" },
  { id: "announce", name: "анонсы", type: "text" },
  { id: "voice1", name: "Голосовой #1", type: "voice" },
  { id: "voice2", name: "Музыка", type: "voice" },
];

const USERS: User[] = [
  { id: "1", name: "Мария", status: "online", avatarColor: "from-purple-500 to-pink-500", activity: "Figma" },
  { id: "2", name: "Антон", status: "online", avatarColor: "from-green-500 to-blue-500" },
  { id: "3", name: "Саша", status: "idle", avatarColor: "from-orange-400 to-red-500" },
  { id: "4", name: "Диана", status: "online", avatarColor: "from-cyan-500 to-blue-500" },
  { id: "5", name: "Кирилл", status: "dnd", avatarColor: "from-yellow-400 to-orange-500", activity: "Spotify" },
  { id: "6", name: "Лена", status: "offline", avatarColor: "from-pink-500 to-rose-500" },
];

const INITIAL_MESSAGES: Record<string, Message[]> = {
  general: [
    {
      id: 1,
      author: "Мария",
      avatar: "М",
      avatarColor: "from-purple-500 to-pink-500",
      text: "Всем привет! 👋",
      time: "10:00",
      reactions: [{ emoji: "👋", count: 3 }],
    },
    {
      id: 2,
      author: "Антон",
      avatar: "А",
      avatarColor: "from-green-500 to-blue-500",
      text: "Привет! Как дела?",
      time: "10:01",
    },
    {
      id: 3,
      author: "Саша",
      avatar: "С",
      avatarColor: "from-orange-400 to-red-500",
      text: "Хорошо! Работаем 🔥",
      time: "10:03",
      reactions: [{ emoji: "🔥", count: 5 }, { emoji: "❤️", count: 2 }],
    },
    {
      id: 4,
      author: "Диана",
      avatar: "Д",
      avatarColor: "from-cyan-500 to-blue-500",
      text: "Сегодня будет созвон в 18:00, не забудьте подключиться!",
      time: "10:15",
    },
    {
      id: 5,
      author: "Мария",
      avatar: "М",
      avatarColor: "from-purple-500 to-pink-500",
      text: "Уже жду! 😄",
      time: "10:17",
    },
  ],
  random: [
    {
      id: 1,
      author: "Кирилл",
      avatar: "К",
      avatarColor: "from-yellow-400 to-orange-500",
      text: "Кто-нибудь смотрел новый сериал? 🎬",
      time: "09:30",
    },
    {
      id: 2,
      author: "Лена",
      avatar: "Л",
      avatarColor: "from-pink-500 to-rose-500",
      text: "Какой именно?",
      time: "09:32",
    },
    {
      id: 3,
      author: "Кирилл",
      avatar: "К",
      avatarColor: "from-yellow-400 to-orange-500",
      text: "Последний сезон Черного зеркала, очень крутой!",
      time: "09:33",
      reactions: [{ emoji: "😮", count: 2 }],
    },
  ],
  design: [
    {
      id: 1,
      author: "Мария",
      avatar: "М",
      avatarColor: "from-purple-500 to-pink-500",
      text: "Обновила макеты главной страницы, посмотрите в Figma 🎨",
      time: "11:00",
      reactions: [{ emoji: "👍", count: 4 }],
    },
  ],
  dev: [
    {
      id: 1,
      author: "Антон",
      avatar: "А",
      avatarColor: "from-green-500 to-blue-500",
      text: "Задеплоил новую версию на прод ✅",
      time: "14:00",
      reactions: [{ emoji: "🚀", count: 6 }],
    },
  ],
  announce: [
    {
      id: 1,
      author: "Администратор",
      avatar: "A",
      avatarColor: "from-[#5865f2] to-[#7c3aed]",
      text: "Добро пожаловать на наш сервер! Пожалуйста, ознакомьтесь с правилами. 📋",
      time: "00:00",
    },
  ],
};

const STATUS_COLORS: Record<string, string> = {
  online: "#3ba55c",
  idle: "#faa61a",
  dnd: "#ed4245",
  offline: "#747f8d",
};

const STATUS_LABEL: Record<string, string> = {
  online: "В сети",
  idle: "Отошёл",
  dnd: "Не беспокоить",
  offline: "Не в сети",
};

const EMOJI_LIST = ["👍", "❤️", "😂", "😮", "🔥", "🎉", "👎", "😢"];

// ─── Component ────────────────────────────────────────────────────────────────

const Index = () => {
  const [activeChannel, setActiveChannel] = useState("general");
  const [messages, setMessages] = useState<Record<string, Message[]>>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState<number | null>(null);
  const [showMembersPanel, setShowMembersPanel] = useState(true);
  const [showChannelsSidebar, setShowChannelsSidebar] = useState(false);
  const [editingMessage, setEditingMessage] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [hoveredMessage, setHoveredMessage] = useState<number | null>(null);
  const [activeContextMenu, setActiveContextMenu] = useState<{ id: number; x: number; y: number } | null>(null);
  const [currentUser] = useState({
    name: "Вы",
    avatar: "В",
    avatarColor: "from-[#5865f2] to-[#7c3aed]",
    status: "online" as const,
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentMessages = messages[activeChannel] || [];
  const currentChannel = CHANNELS.find((c) => c.id === activeChannel);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeChannel]);

  useEffect(() => {
    const handleClick = () => {
      setActiveContextMenu(null);
      setShowEmojiPicker(null);
    };
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  const sendMessage = () => {
    const text = inputValue.trim();
    if (!text) return;

    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

    const newMsg: Message = {
      id: Date.now(),
      author: currentUser.name,
      avatar: currentUser.avatar,
      avatarColor: currentUser.avatarColor,
      text,
      time,
    };

    setMessages((prev) => ({
      ...prev,
      [activeChannel]: [...(prev[activeChannel] || []), newMsg],
    }));
    setInputValue("");
    inputRef.current?.focus();
  };

  const deleteMessage = (id: number) => {
    setMessages((prev) => ({
      ...prev,
      [activeChannel]: prev[activeChannel].filter((m) => m.id !== id),
    }));
    setActiveContextMenu(null);
  };

  const startEdit = (msg: Message) => {
    setEditingMessage(msg.id);
    setEditValue(msg.text);
    setActiveContextMenu(null);
  };

  const saveEdit = () => {
    if (!editValue.trim()) return;
    setMessages((prev) => ({
      ...prev,
      [activeChannel]: prev[activeChannel].map((m) =>
        m.id === editingMessage ? { ...m, text: editValue } : m
      ),
    }));
    setEditingMessage(null);
    setEditValue("");
  };

  const addReaction = (msgId: number, emoji: string) => {
    setMessages((prev) => ({
      ...prev,
      [activeChannel]: prev[activeChannel].map((m) => {
        if (m.id !== msgId) return m;
        const existing = m.reactions?.find((r) => r.emoji === emoji);
        if (existing) {
          return {
            ...m,
            reactions: m.reactions?.map((r) =>
              r.emoji === emoji ? { ...r, count: r.count + 1 } : r
            ),
          };
        }
        return {
          ...m,
          reactions: [...(m.reactions || []), { emoji, count: 1 }],
        };
      }),
    }));
    setShowEmojiPicker(null);
  };

  const onlineUsers = USERS.filter((u) => u.status !== "offline");
  const offlineUsers = USERS.filter((u) => u.status === "offline");

  return (
    <div className="h-screen bg-[#36393f] text-white flex overflow-hidden select-none">
      {/* ── Сервер-иконки ── */}
      <div className="w-[72px] bg-[#202225] flex-shrink-0 flex flex-col items-center py-3 gap-2 overflow-y-auto">
        <div className="w-12 h-12 bg-[#5865f2] rounded-2xl hover:rounded-xl transition-all duration-200 flex items-center justify-center cursor-pointer">
          <Icon name="MessageCircle" size={24} className="text-white" />
        </div>
        <div className="w-8 h-[2px] bg-[#36393f] rounded-full my-1" />
        {["🎮", "🎨", "🛠️", "🎵", "📚", "🌍"].map((emoji, i) => (
          <div
            key={i}
            className="w-12 h-12 bg-[#36393f] rounded-3xl hover:rounded-xl transition-all duration-200 flex items-center justify-center cursor-pointer hover:bg-[#5865f2] text-xl relative group"
          >
            {emoji}
            <div className="absolute left-14 bg-[#18191c] text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
              Сервер {i + 1}
            </div>
          </div>
        ))}
        <div className="w-12 h-12 bg-[#36393f] rounded-3xl hover:rounded-xl transition-all duration-200 flex items-center justify-center cursor-pointer hover:bg-[#3ba55c] mt-1 group relative">
          <Icon name="Plus" size={20} className="text-[#3ba55c] group-hover:text-white" />
          <div className="absolute left-14 bg-[#18191c] text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
            Добавить сервер
          </div>
        </div>
        <div className="w-12 h-12 bg-[#36393f] rounded-3xl hover:rounded-xl transition-all duration-200 flex items-center justify-center cursor-pointer hover:bg-[#5865f2] group relative">
          <Icon name="Compass" size={20} className="text-[#b9bbbe] group-hover:text-white" />
          <div className="absolute left-14 bg-[#18191c] text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
            Обзор серверов
          </div>
        </div>
      </div>

      {/* ── Каналы ── */}
      <div
        className={`${
          showChannelsSidebar ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 fixed md:relative z-40 top-0 left-[72px] h-full w-60 bg-[#2f3136] flex flex-col flex-shrink-0 transition-transform duration-200`}
      >
        {/* Шапка сервера */}
        <div className="h-12 flex items-center px-4 border-b border-[#202225] shadow-md cursor-pointer hover:bg-[#35383d] transition-colors">
          <span className="text-white font-semibold flex-1 truncate">💬 Мой Сервер</span>
          <Icon name="ChevronDown" size={18} className="text-white flex-shrink-0" />
        </div>

        {/* Поиск */}
        <div className="px-3 pt-3 pb-1">
          <div className="bg-[#202225] rounded flex items-center px-2 py-1 gap-2">
            <Icon name="Search" size={14} className="text-[#8e9297]" />
            <span className="text-[#8e9297] text-sm">Поиск</span>
          </div>
        </div>

        {/* Список каналов */}
        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {/* Текстовые */}
          <div className="flex items-center gap-1 px-2 py-1 text-[#8e9297] text-xs font-semibold uppercase tracking-wide mb-1 cursor-pointer hover:text-[#dcddde]">
            <Icon name="ChevronDown" size={12} />
            <span>Текстовые каналы</span>
            <Icon name="Plus" size={14} className="ml-auto" />
          </div>
          {CHANNELS.filter((c) => c.type === "text").map((ch) => (
            <button
              key={ch.id}
              onClick={() => {
                setActiveChannel(ch.id);
                setShowChannelsSidebar(false);
              }}
              className={`w-full flex items-center gap-1.5 px-2 py-1.5 rounded transition-colors group ${
                activeChannel === ch.id
                  ? "bg-[#393c43] text-white"
                  : "text-[#8e9297] hover:text-[#dcddde] hover:bg-[#35383d]"
              }`}
            >
              <Icon name="Hash" size={16} className="flex-shrink-0" />
              <span className="text-sm flex-1 text-left truncate">{ch.name}</span>
              {ch.unread ? (
                <span className="bg-[#ed4245] text-white text-xs rounded-full w-4 h-4 flex items-center justify-center flex-shrink-0">
                  {ch.unread}
                </span>
              ) : null}
            </button>
          ))}

          {/* Голосовые */}
          <div className="flex items-center gap-1 px-2 py-1 text-[#8e9297] text-xs font-semibold uppercase tracking-wide mt-3 mb-1 cursor-pointer hover:text-[#dcddde]">
            <Icon name="ChevronDown" size={12} />
            <span>Голосовые каналы</span>
            <Icon name="Plus" size={14} className="ml-auto" />
          </div>
          {CHANNELS.filter((c) => c.type === "voice").map((ch) => (
            <button
              key={ch.id}
              className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded text-[#8e9297] hover:text-[#dcddde] hover:bg-[#35383d] transition-colors"
            >
              <Icon name="Volume2" size={16} className="flex-shrink-0" />
              <span className="text-sm flex-1 text-left truncate">{ch.name}</span>
            </button>
          ))}
        </div>

        {/* Пользователь внизу */}
        <div className="h-[52px] bg-[#292b2f] flex items-center px-2 gap-2 flex-shrink-0">
          <div className="relative flex-shrink-0">
            <div
              className={`w-8 h-8 rounded-full bg-gradient-to-br ${currentUser.avatarColor} flex items-center justify-center`}
            >
              <span className="text-white text-xs font-bold">{currentUser.avatar}</span>
            </div>
            <span
              className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#292b2f]"
              style={{ background: STATUS_COLORS[currentUser.status] }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white text-sm font-medium truncate">{currentUser.name}</div>
            <div className="text-[#b9bbbe] text-xs">#{String(1234).padStart(4, "0")}</div>
          </div>
          <div className="flex items-center gap-0.5">
            <button className="w-8 h-8 rounded hover:bg-[#40444b] flex items-center justify-center text-[#b9bbbe] hover:text-white transition-colors">
              <Icon name="Mic" size={16} />
            </button>
            <button className="w-8 h-8 rounded hover:bg-[#40444b] flex items-center justify-center text-[#b9bbbe] hover:text-white transition-colors">
              <Icon name="Headphones" size={16} />
            </button>
            <button className="w-8 h-8 rounded hover:bg-[#40444b] flex items-center justify-center text-[#b9bbbe] hover:text-white transition-colors">
              <Icon name="Settings" size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Overlay для каналов на мобилке */}
      {showChannelsSidebar && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 z-30"
          onClick={() => setShowChannelsSidebar(false)}
        />
      )}

      {/* ── Основная область ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Шапка канала */}
        <div className="h-12 bg-[#36393f] border-b border-[#202225] flex items-center px-4 gap-3 flex-shrink-0 shadow-sm">
          <button
            className="md:hidden text-[#8e9297] hover:text-white mr-1"
            onClick={() => setShowChannelsSidebar(true)}
          >
            <Icon name="Menu" size={20} />
          </button>
          <Icon name="Hash" size={20} className="text-[#8e9297] flex-shrink-0" />
          <span className="text-white font-semibold">{currentChannel?.name || activeChannel}</span>
          <div className="w-px h-6 bg-[#40444b] mx-1 hidden sm:block" />
          <span className="text-[#8e9297] text-sm hidden sm:block truncate">
            Добро пожаловать в #{currentChannel?.name}!
          </span>
          <div className="ml-auto flex items-center gap-2">
            <button
              className="w-8 h-8 rounded hover:bg-[#40444b] flex items-center justify-center text-[#b9bbbe] hover:text-white transition-colors"
              title="Уведомления"
            >
              <Icon name="Bell" size={18} />
            </button>
            <button
              className="w-8 h-8 rounded hover:bg-[#40444b] flex items-center justify-center text-[#b9bbbe] hover:text-white transition-colors"
              title="Закреплённые сообщения"
            >
              <Icon name="Pin" size={18} />
            </button>
            <button
              onClick={() => setShowMembersPanel((v) => !v)}
              className={`w-8 h-8 rounded flex items-center justify-center transition-colors ${
                showMembersPanel
                  ? "bg-[#40444b] text-white"
                  : "text-[#b9bbbe] hover:bg-[#40444b] hover:text-white"
              }`}
              title="Список участников"
            >
              <Icon name="Users" size={18} />
            </button>
            <div className="bg-[#202225] rounded flex items-center gap-2 px-2 py-1 hidden sm:flex">
              <Icon name="Search" size={14} className="text-[#8e9297]" />
              <input
                placeholder="Поиск"
                className="bg-transparent text-[#dcddde] text-sm outline-none w-24 placeholder-[#8e9297]"
              />
            </div>
          </div>
        </div>

        {/* Контент */}
        <div className="flex-1 flex min-h-0">
          {/* Сообщения */}
          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
              {/* Начало канала */}
              <div className="mb-6">
                <div className="w-16 h-16 bg-[#40444b] rounded-full flex items-center justify-center mb-4">
                  <Icon name="Hash" size={32} className="text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-1">Добро пожаловать в #{currentChannel?.name}!</h2>
                <p className="text-[#b9bbbe] text-sm">Это начало канала #{currentChannel?.name}.</p>
              </div>

              {/* Список сообщений */}
              {currentMessages.map((msg, idx) => {
                const isFirst =
                  idx === 0 || currentMessages[idx - 1].author !== msg.author;
                const isOwn = msg.author === currentUser.name;

                return (
                  <div
                    key={msg.id}
                    className={`flex gap-4 group relative rounded px-2 py-0.5 hover:bg-[#32353b] ${
                      isFirst ? "mt-4" : ""
                    }`}
                    onMouseEnter={() => setHoveredMessage(msg.id)}
                    onMouseLeave={() => setHoveredMessage(null)}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      setActiveContextMenu({ id: msg.id, x: e.clientX, y: e.clientY });
                    }}
                  >
                    {isFirst ? (
                      <div
                        className={`w-10 h-10 rounded-full bg-gradient-to-br ${msg.avatarColor} flex items-center justify-center flex-shrink-0 mt-0.5 cursor-pointer hover:opacity-90`}
                      >
                        <span className="text-white text-sm font-bold">{msg.avatar}</span>
                      </div>
                    ) : (
                      <div className="w-10 flex-shrink-0 flex items-center justify-end">
                        <span className="text-[#72767d] text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">
                          {msg.time}
                        </span>
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      {isFirst && (
                        <div className="flex items-baseline gap-2 mb-0.5">
                          <span className="text-white font-medium text-sm hover:underline cursor-pointer">
                            {msg.author}
                          </span>
                          <span className="text-[#72767d] text-xs">{msg.time}</span>
                        </div>
                      )}

                      {editingMessage === msg.id ? (
                        <div className="flex flex-col gap-1">
                          <input
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveEdit();
                              if (e.key === "Escape") setEditingMessage(null);
                            }}
                            autoFocus
                            className="bg-[#40444b] text-[#dcddde] text-sm px-3 py-1.5 rounded outline-none w-full"
                          />
                          <span className="text-[#b9bbbe] text-xs">
                            Enter — сохранить · Esc — отмена
                          </span>
                        </div>
                      ) : (
                        <p className="text-[#dcddde] text-sm leading-relaxed break-words whitespace-pre-wrap">
                          {msg.text}
                        </p>
                      )}

                      {/* Реакции */}
                      {msg.reactions && msg.reactions.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {msg.reactions.map((r) => (
                            <button
                              key={r.emoji}
                              onClick={() => addReaction(msg.id, r.emoji)}
                              className="flex items-center gap-1 bg-[#2f3136] hover:bg-[#40444b] border border-[#40444b] rounded px-2 py-0.5 text-xs transition-colors"
                            >
                              <span>{r.emoji}</span>
                              <span className="text-[#b9bbbe]">{r.count}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Действия над сообщением */}
                    {hoveredMessage === msg.id && editingMessage !== msg.id && (
                      <div className="absolute top-0 right-2 flex items-center gap-0.5 bg-[#2f3136] border border-[#202225] rounded-md shadow-lg overflow-hidden z-10">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowEmojiPicker(showEmojiPicker === msg.id ? null : msg.id);
                          }}
                          className="w-8 h-8 flex items-center justify-center hover:bg-[#40444b] text-[#b9bbbe] hover:text-white transition-colors text-base"
                          title="Добавить реакцию"
                        >
                          😀
                        </button>
                        {isOwn && (
                          <button
                            onClick={() => startEdit(msg)}
                            className="w-8 h-8 flex items-center justify-center hover:bg-[#40444b] text-[#b9bbbe] hover:text-white transition-colors"
                            title="Редактировать"
                          >
                            <Icon name="Pencil" size={14} />
                          </button>
                        )}
                        {isOwn && (
                          <button
                            onClick={() => deleteMessage(msg.id)}
                            className="w-8 h-8 flex items-center justify-center hover:bg-[#40444b] text-[#ed4245] hover:text-[#f66] transition-colors"
                            title="Удалить"
                          >
                            <Icon name="Trash2" size={14} />
                          </button>
                        )}
                        <button
                          className="w-8 h-8 flex items-center justify-center hover:bg-[#40444b] text-[#b9bbbe] hover:text-white transition-colors"
                          title="Ещё"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveContextMenu({ id: msg.id, x: e.clientX, y: e.clientY });
                          }}
                        >
                          <Icon name="MoreHorizontal" size={14} />
                        </button>

                        {/* Emoji picker */}
                        {showEmojiPicker === msg.id && (
                          <div
                            className="absolute top-full right-0 mt-1 bg-[#18191c] border border-[#202225] rounded-lg p-2 flex gap-1 shadow-xl z-50"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {EMOJI_LIST.map((emoji) => (
                              <button
                                key={emoji}
                                onClick={() => addReaction(msg.id, emoji)}
                                className="w-8 h-8 flex items-center justify-center text-lg hover:bg-[#40444b] rounded transition-colors"
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Поле ввода */}
            <div className="px-4 pb-6 pt-2 flex-shrink-0">
              <div className="bg-[#40444b] rounded-lg flex items-center gap-2 px-4 py-2.5">
                <button className="text-[#b9bbbe] hover:text-white transition-colors flex-shrink-0">
                  <Icon name="Plus" size={20} />
                </button>
                <input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder={`Сообщение в #${currentChannel?.name || activeChannel}`}
                  className="flex-1 bg-transparent text-[#dcddde] text-sm outline-none placeholder-[#72767d]"
                />
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button className="text-[#b9bbbe] hover:text-white transition-colors p-1 rounded hover:bg-[#32353b]">
                    <Icon name="Gift" size={18} />
                  </button>
                  <button className="text-[#b9bbbe] hover:text-white transition-colors p-1 rounded hover:bg-[#32353b]">
                    <Icon name="ImagePlus" size={18} />
                  </button>
                  <button className="text-[#b9bbbe] hover:text-white transition-colors p-1 rounded hover:bg-[#32353b] text-base">
                    😊
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ── Участники ── */}
          {showMembersPanel && (
            <div className="w-60 bg-[#2f3136] flex-shrink-0 overflow-y-auto py-4 hidden lg:block">
              {/* Онлайн */}
              <div className="px-4 mb-2">
                <span className="text-[#8e9297] text-xs font-semibold uppercase tracking-wide">
                  В сети — {onlineUsers.length}
                </span>
              </div>
              {onlineUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-3 px-4 py-1.5 hover:bg-[#35383d] cursor-pointer rounded mx-2 group"
                >
                  <div className="relative flex-shrink-0">
                    <div
                      className={`w-8 h-8 rounded-full bg-gradient-to-br ${user.avatarColor} flex items-center justify-center`}
                    >
                      <span className="text-white text-xs font-bold">{user.name[0]}</span>
                    </div>
                    <span
                      className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#2f3136]"
                      style={{ background: STATUS_COLORS[user.status] }}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[#b9bbbe] text-sm group-hover:text-white truncate transition-colors">
                      {user.name}
                    </div>
                    {user.activity && (
                      <div className="text-[#72767d] text-xs truncate">{user.activity}</div>
                    )}
                  </div>
                </div>
              ))}

              {/* Офлайн */}
              <div className="px-4 mt-4 mb-2">
                <span className="text-[#8e9297] text-xs font-semibold uppercase tracking-wide">
                  Не в сети — {offlineUsers.length}
                </span>
              </div>
              {offlineUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-3 px-4 py-1.5 hover:bg-[#35383d] cursor-pointer rounded mx-2 group"
                >
                  <div className="relative flex-shrink-0">
                    <div
                      className={`w-8 h-8 rounded-full bg-gradient-to-br ${user.avatarColor} flex items-center justify-center opacity-40`}
                    >
                      <span className="text-white text-xs font-bold">{user.name[0]}</span>
                    </div>
                    <span
                      className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#2f3136]"
                      style={{ background: STATUS_COLORS[user.status] }}
                    />
                  </div>
                  <div className="text-[#72767d] text-sm group-hover:text-[#b9bbbe] truncate transition-colors">
                    {user.name}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Контекстное меню ── */}
      {activeContextMenu && (
        <div
          className="fixed bg-[#18191c] border border-[#202225] rounded-md shadow-2xl py-1 z-50 w-48"
          style={{ left: activeContextMenu.x, top: activeContextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          {[
            {
              label: "Ответить",
              icon: "Reply",
              action: () => setActiveContextMenu(null),
            },
            {
              label: "Добавить реакцию",
              icon: "SmilePlus",
              action: () => setActiveContextMenu(null),
            },
            {
              label: "Редактировать",
              icon: "Pencil",
              action: () => {
                const msg = currentMessages.find((m) => m.id === activeContextMenu.id);
                if (msg && msg.author === currentUser.name) startEdit(msg);
                else setActiveContextMenu(null);
              },
              danger: false,
            },
            {
              label: "Копировать текст",
              icon: "Copy",
              action: () => {
                const msg = currentMessages.find((m) => m.id === activeContextMenu.id);
                if (msg) navigator.clipboard.writeText(msg.text);
                setActiveContextMenu(null);
              },
            },
            {
              label: "Удалить сообщение",
              icon: "Trash2",
              action: () => deleteMessage(activeContextMenu.id),
              danger: true,
            },
          ].map((item) => (
            <button
              key={item.label}
              onClick={item.action}
              className={`w-full flex items-center gap-3 px-3 py-1.5 text-sm transition-colors ${
                item.danger
                  ? "text-[#ed4245] hover:bg-[#ed4245] hover:text-white"
                  : "text-[#dcddde] hover:bg-[#5865f2] hover:text-white"
              }`}
            >
              <Icon name={item.icon} size={16} />
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Index;