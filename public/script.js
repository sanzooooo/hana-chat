const chatBox = document.getElementById('chat-box');
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const bgmPlayer = document.getElementById('bgm-player');

// XSS対策のescapeHtml関数
function escapeHtml(str) {
  return str.replace(/[&<>"]'/g, function (match) {
    return ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[match];
  });
}

// ===== BGM設定 =====
const bgmFiles = [
  "/bgm/bgm_chill.mp3",
  "/bgm/bgm_future.mp3",
  "/bgm/bgm_happy.mp3",
  "/bgm/bgm_hero.mp3",
  "/bgm/bgm_hitroad.mp3",
  "/bgm/bgm_nomonomo.mp3",
  "/bgm/bgm_notdone.mp3",
  "/bgm/bgm_tiara.mp3"
];

let playlist = [];
let currentIndex = 0;
let bgmInitialized = false;

// シャッフル関数（同じ曲が連続しないよう制御）
function shuffleNoRepeat(array, previous) {
  let shuffled = array.slice();
  do {
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
  } while (shuffled[0] === previous); // 先頭が前回と同じなら再シャッフル
  return shuffled;
}

// 再生初期化
function initBGM() {
  playlist = shuffleNoRepeat(bgmFiles, null);
  currentIndex = 0;
  bgmPlayer.src = playlist[currentIndex];
  bgmPlayer.volume = 0.5;
  bgmPlayer.play().catch(e => console.warn('自動再生ブロック:', e));
}

// 次の曲へ（終わったら自動で次へ）
function playNextTrack() {
  const lastTrack = playlist[currentIndex];
  currentIndex++;
  if (currentIndex >= playlist.length) {
    playlist = shuffleNoRepeat(bgmFiles, lastTrack);
    currentIndex = 0;
  }
  bgmPlayer.src = playlist[currentIndex];
  bgmPlayer.play().catch(e => console.warn('再生できなかった理由:', e));
}

bgmPlayer.addEventListener('ended', playNextTrack);
bgmPlayer.loop = false;

// ユーザー操作トリガーの設定
function handleUserInteraction() {
  console.log("✅ BGM 初期化イベント発火");
  if (!bgmInitialized) {
    initBGM();
    bgmInitialized = true;
  }
}

window.addEventListener('click', handleUserInteraction, { once: true });
window.addEventListener('touchstart', handleUserInteraction, { once: true });

// ========== チャット送信 ==========
chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const message = userInput.value.trim();
  if (message === '') return;

  // ユーザーのメッセージを追加
  addMessage('user', message);
  userInput.value = '';
  sendButton.disabled = true;

  // ローディングメッセージを追加
  addMessage('bot', '…考え中…');

  try {
    const response = await fetch('/.netlify/functions/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });

    if (!response.ok) throw new Error('サーバーエラー');

    const data = await response.json();
    console.log("Botの応答データ:", data);

    // 最後のbotメッセージ（考え中…）を削除
    const lastBot = chatBox.querySelector('.chat-message.bot:last-child');
    if (lastBot) chatBox.removeChild(lastBot);

    // 本応答を追加
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

  // 改行とXSS対策済みHTML出力
  const escapedText = escapeHtml(text || '[⚠️応答がありません]');
  const formattedText = escapedText.replace(/\n/g, '<br>');

  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  bubble.innerHTML = formattedText;
  messageEl.appendChild(bubble);

  if (imageUrl) {
    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = 'image';
    img.className = 'message-image';
    messageEl.appendChild(img);
  }

  chatBox.appendChild(messageEl);
  chatBox.scrollTop = chatBox.scrollHeight;
}

