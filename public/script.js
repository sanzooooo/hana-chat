const chatBox = document.getElementById('chat-box');
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const bgmPlayer = document.getElementById('bgm-player');
const bgmToggle = document.getElementById('bgm-toggle');

// ========== BGM関連 ==========
const bgmList = [
  'bgm/bgm_chill.mp3',
  'bgm/bgm_future.mp3',
  'bgm/bgm_happy.mp3',
  'bgm/bgm_hero.mp3',
  'bgm/bgm_hitroad.mp3',
  'bgm/bgm_nomonomo.mp3',
  'bgm/bgm_notdone.mp3',
  'bgm/bgm_tiara.mp3',
];

let isBgmPlaying = false;
let currentIndex = 0;
let shuffledBgm = [];

function shuffleBgmList() {
  const array = [...bgmList];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function playNextBgm() {
  if (shuffledBgm.length === 0) {
    shuffledBgm = shuffleBgmList();
  }

  const track = shuffledBgm[currentIndex % shuffledBgm.length];
  bgmPlayer.src = track;
  bgmPlayer.volume = 0.5;
  bgmPlayer.play().catch(e => console.warn('BGM再生エラー:', e));
  currentIndex++;
}

bgmPlayer.addEventListener('ended', playNextBgm);

bgmToggle.addEventListener('click', () => {
  if (isBgmPlaying) {
    bgmPlayer.pause();
    isBgmPlaying = false;
    bgmToggle.textContent = '🔊 BGM ON';
  } else {
    shuffledBgm = shuffleBgmList();
    currentIndex = 0;
    playNextBgm();
    isBgmPlaying = true;
    bgmToggle.textContent = '🔇 BGM OFF';
  }
});

// 初回ロード時に自動ON
window.addEventListener('DOMContentLoaded', () => {
  bgmToggle.click(); // 自動でONに切り替える
});

// ========== チャット送信 ==========
chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const message = userInput.value.trim();
  if (message === '') return;

  addMessage('user', message);
  userInput.value = '';
  sendButton.disabled = true;

  try {
    const response = await fetch('/.netlify/functions/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });

    if (!response.ok) throw new Error('サーバーエラー');

    const data = await response.json();
    addMessage('bot', data.reply, data.imageUrl);
  } catch (error) {
    addMessage('bot', '通信エラーが発生しました。もう一度試してください。');
  } finally {
    sendButton.disabled = false;
  }
});

// ========== メッセージ表示 ==========
function addMessage(sender, text, imageUrl = null) {
  const messageEl = document.createElement('div');
  messageEl.className = `chat-message ${sender}`;

  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  bubble.textContent = text;
  messageEl.appendChild(bubble);

  if (imageUrl) {
    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = 'image';
    messageEl.appendChild(img);
  }

  chatBox.appendChild(messageEl);
  chatBox.scrollTop = chatBox.scrollHeight;
}
