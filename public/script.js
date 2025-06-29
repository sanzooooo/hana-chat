// ===== DOM要素の取得 =====
const chatBox = document.getElementById('chat-box');
const input = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const bgmToggle = document.getElementById('bgm-toggle');
const bgmPlayer = document.getElementById('bgm-player');
const chatForm = document.getElementById('chat-form');

// ===== ユーザー名の保存 =====
const userName = localStorage.getItem('userName') || prompt('あなたの名前を教えてください（例：ゆうき）');
localStorage.setItem('userName', userName);

// ===== BGM設定 =====
const bgmFiles = [
  "bgm/bgm_nomonomo.mp3",
  "bgm/bgm_hero.mp3",
  "bgm/bgm_notdone.mp3",
  "bgm/bgm_future.mp3",
  "bgm/bgm_hitroad.mp3",
  "bgm/bgm_chill.mp3",
  "bgm/bgm_tiara.mp3",
  "bgm/bgm_happy.mp3"
];

let shuffledPlaylist = [];
let currentIndex = 0;
let isPlaying = false;

function shuffle(array) {
  const result = array.slice();
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function initBGM() {
  shuffledPlaylist = shuffle(bgmFiles);
  currentIndex = 0;
  bgmPlayer.src = shuffledPlaylist[currentIndex];
  bgmPlayer.volume = 0.5;
  bgmPlayer.loop = false;

  const playPromise = bgmPlayer.play();
  if (playPromise !== undefined) {
    playPromise
      .then(() => {
        isPlaying = true;
        bgmToggle.textContent = '🔇 BGM OFF';
      })
      .catch((error) => {
        console.warn('自動再生ブロック：ユーザー操作が必要です');
        bgmToggle.textContent = '🔊 BGM ON';
        isPlaying = false;
      });
  }
}

function playNextTrack() {
  currentIndex++;
  if (currentIndex >= shuffledPlaylist.length) {
    shuffledPlaylist = shuffle(bgmFiles);
    currentIndex = 0;
  }
  bgmPlayer.src = shuffledPlaylist[currentIndex];
  bgmPlayer.play();
}

bgmPlayer.addEventListener('ended', playNextTrack);

bgmToggle.addEventListener('click', () => {
  if (bgmPlayer.paused) {
    bgmPlayer.play();
    bgmToggle.textContent = '🔇 BGM OFF';
    isPlaying = true;
  } else {
    bgmPlayer.pause();
    bgmToggle.textContent = '🔊 BGM ON';
    isPlaying = false;
  }
});

// ===== 初期化 =====
window.addEventListener('load', () => {
  initBGM();

  const hour = new Date().getHours();
  let greeting = '';
  if (hour < 10) greeting = `おはよう☀️ 今日もがんばろっ♪ ${userName}ちゃん`;
  else if (hour < 18) greeting = `こんにちは🌼 今日も楽しくいこうね！ ${userName}ちゃん`;
  else greeting = `こんばんは🌙 ゆっくりできてる？ ${userName}ちゃん`;

  addMessage('hana', greeting);
});

// ===== メッセージ表示関数 =====
function addMessage(sender, text, imageSrc = null) {
  const message = text || '[⚠️応答がありません]';
  const messageDiv = document.createElement('div');
  messageDiv.className = `chat-message ${sender === 'user' ? 'user' : 'bot'}`;
  messageDiv.innerHTML = `
    <div class="bubble">${message}</div>
    ${imageSrc ? `<img src="${imageSrc}" class="message-image">` : ''}
  `;
  chatBox.appendChild(messageDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// ===== カテゴリ画像設定 =====
const imageCategories = {
  ohayou: ['img/img_ohayou1.png', 'img/img_ohayou2.png'],
  otsukare: ['img/img_otsukare1.png', 'img/img_otsukare2.png'],
  random: ['img/img_random1.png', 'img/img_random2.png']
};

function getRandomImage(category) {
  const list = imageCategories[category] || imageCategories.random;
  return list[Math.floor(Math.random() * list.length)];
}

// ===== 入力・送信管理 =====
sendButton.disabled = true;
input.addEventListener('input', () => {
  sendButton.disabled = input.value.trim() === '';
});

input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
    e.preventDefault();
    handleSend();
  }
});

let isComposing = false;
input.addEventListener('compositionstart', () => { isComposing = true; });
input.addEventListener('compositionend', () => { isComposing = false; });

// ===== チャット送信ロジック =====
async function handleSend() {
  sendButton.disabled = true;
  const userInput = input.value.trim();
  if (!userInput) return;

  addMessage('user', userInput);
  input.value = '';

  const hanaReply = customHanaReply(userInput);
  if (hanaReply) {
    addMessage('hana', hanaReply.text, hanaReply.image);
    sendButton.disabled = false;
    return;
  }

  try {
    const response = await fetch('/.netlify/functions/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userInput })
    });

    if (!response.ok) {
      throw new Error(`HTTPエラー: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error);
    }

    if (data.response) {
      addMessage('hana', data.response);
    } else {
      addMessage('hana', '応答が取得できませんでした');
    }
  } catch (error) {
    console.error('通信エラー:', error);
    addMessage('hana', '通信エラーが発生しました。もう一度試してみてください。');
  } finally {
    sendButton.disabled = false;
  }
}

// ===== 固定応答ロジック（花ちゃんらしさ） =====
function customHanaReply(input) {
  if (input.includes("おはよう")) {
    return { text: "おはよ〜☀️ 今日もよろしくね〜", image: getRandomImage('ohayou') };
  }
  if (input.includes("おつかれ")) {
    return { text: "おつかれさまっ！ゆっくり休んでね〜", image: getRandomImage('otsukare') };
  }
  if (input.includes("花")) {
    return { text: "呼んだ？咲々木 花だよ〜🌸", image: getRandomImage('random') };
  }
  return null;
}

// ===== イベント =====
sendButton.addEventListener('click', (e) => {
  e.preventDefault();
  handleSend();
});

if (chatForm) {
  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    handleSend();
  });
}
