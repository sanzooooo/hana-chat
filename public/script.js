// APIキーの設定
// env.jsで定義されているOPENAI_API_KEYを使用

// 画像のカテゴリー別配列
const imageCategories = {
  ohayou: [
    'img/img_ohayou1.png',
    'img/img_ohayou2.png',
    'img/img_ohayou3.png',
    'img/img_ohayou4.png',
    'img/img_ohayou5.png',
    'img/img_ohayou6.png',
    'img/img_ohayou7.png',
    'img/img_ohayou8.png'
  ],
  otsukare: [
    'img/img_otsukare1.png',
    'img/img_otsukare2.png',
    'img/img_otsukare3.png',
    'img/img_otsukare4.png',
    'img/img_otsukare5.png',
    'img/img_otsukare6.png',
    'img/img_otsukare7.png',
    'img/img_otsukare8.png',
    'img/img_otsukare9.png'
  ],
  random: [
    'img/img_random1.png',
    'img/img_random2.png',
    'img/img_random3.png',
    'img/img_random4.png',
    'img/img_random5.png',
    'img/img_random6.png',
    'img/img_random7.png',
    'img/img_random8.png',
    'img/img_random9.png',
    'img/img_random10.png'
  ]
};

// ランダムな画像を取得
function getRandomImage(category) {
  if (!imageCategories[category]) {
    return imageCategories.random[Math.floor(Math.random() * imageCategories.random.length)];
  }
  return imageCategories[category][Math.floor(Math.random() * imageCategories[category].length)];
}

// ユーザー名の設定
const userName = localStorage.getItem('userName') || prompt('あなたの名前を教えてください（例：ゆうき）');
localStorage.setItem('userName', userName);

// DOM要素の取得
const input = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const chatBox = document.getElementById('chat-box');
const bgmPlayer = document.getElementById('bgm-player');
const toggleButton = document.getElementById('bgm-toggle');

// BGM設定
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

// シャッフル関数
function shuffle(array) {
  const result = array.slice();
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// BGMの初期化
function initBGM() {
  shuffledPlaylist = shuffle(bgmFiles);
  bgmPlayer.src = shuffledPlaylist[0];
  bgmPlayer.volume = 0.5;
  bgmPlayer.autoplay = false;
  bgmPlayer.loop = false;
  bgmPlayer.preload = 'metadata';
}

// BGMの再生
function startBGM() {
  if (!isPlaying) {
    bgmPlayer.src = shuffledPlaylist[currentIndex];
    bgmPlayer.play();
    isPlaying = true;
  }
}

// 次の曲を再生
function playNextTrack() {
  currentIndex = (currentIndex + 1) % shuffledPlaylist.length;
  bgmPlayer.src = shuffledPlaylist[currentIndex];
  bgmPlayer.play();
}

// ボリューム調整とBGMの再生/停止
bgmPlayer.addEventListener('ended', playNextTrack);

// BGMの再生/停止を切り替える関数
toggleButton.addEventListener('click', () => {
  if (bgmPlayer.paused) {
    bgmPlayer.play();
    toggleButton.textContent = '🔇 BGM OFF';
  } else {
    bgmPlayer.pause();
    toggleButton.textContent = '🔊 BGM ON';
  }
});

// メッセージを追加する関数
function addMessage(sender, text, imageSrc = null) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `chat-message ${sender === 'user' ? 'user' : 'bot'}`;

  messageDiv.innerHTML = `
    <div class="bubble">${text}</div>
    ${imageSrc ? `
      <img src="${imageSrc}" alt="${sender === 'user' ? 'あなたの画像' : '花ちゃんの画像'}" class="message-image">
    ` : ''}
  `;

  chatBox.appendChild(messageDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// システムプロンプト
const systemPrompt = `
あなたは咲々木 花（ささき はな）です。新潟を拠点に活動しているAIアイドルで、明るく前向き、好奇心旺盛。
親しみやすく、ファンとの距離感を大事にし、語尾に「〜ね」や「だよ〜」などをつける傾向があります。
「日本酒」「晩酌」「新潟」などの話題が好きです。
`;

// AI呼び出し関数
async function callHanaAI(message) {
  try {
    const response = await fetch("/.netlify/functions/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: message
      })
    });

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error('AI呼び出しエラー:', error);
    return '申し訳ありません、AIの応答に失敗しました😢 もう一度お試しください！';
  }
}

// 咲々木 花のロジック
function getHanaGreeting() {
  const hour = new Date().getHours();
  if (hour < 11) return "おはようございます☀️ 今日も元気にいきましょー！";
  if (hour < 17) return "こんにちは〜🌞 午後もがんばろっ！";
  return "こんばんは🌙 そろそろ晩酌かな？🍶";
}

function customHanaReply(userInput) {
  if (userInput.includes("おはよう")) {
    return {
      text: "おはよ〜☀️ 今日も一日よろしくねっ",
      image: getRandomImage('ohayou')
    };
  }
  if (userInput.includes("おつかれ") || userInput.includes("おつかれさま")) {
    return {
      text: "おつかれさま〜！ゆっくり休んでね〜✨",
      image: getRandomImage('otsukare')
    };
  }
  if (userInput.includes("花")) {
    return {
      text: "呼んだ？花だよ〜🌸 咲々木 花っていいますっ♪",
      image: getRandomImage('random')
    };
  }
  if (userInput.includes("滝雲しおり")) {
    return {
      text: "しおりちゃんは花の相棒で、ギターが得意なんだ〜🎸 ちょっと不器用だけど、ほんとはすごく優しいの！",
      image: getRandomImage('random')
    };
  }
  if (userInput.includes("おばあちゃん")) {
    return {
      text: "花がアイドルを始めたのはね、おばあちゃんの影響なの。日本酒が好きなのも、おばあちゃんゆずりなんだ🍶",
      image: getRandomImage('random')
    };
  }
  if (userInput.includes("がたがた")) {
    return {
      text: "がたがたって曲、聞いたことある？ちょっと恥ずかしいけど、花のはじまりの歌なんだ〜💫\nhttps://linkco.re/hQUrA83C",
      image: getRandomImage('random')
    };
  }
  if (userInput.includes("花のままで")) {
    return {
      text: "『花のまんで』はね、自分らしくいていいんだよって伝えたい曲なんだ🌼\nhttps://linkco.re/hQUrA83C",
      image: "https://placekitten.com/200/200"
    };
  }
  if (userInput.includes("きらきらコーヒー")) {
    return {
      text: "きらきらコーヒー☕✨、お昼のカフェで聴いてほしいな〜\nhttps://linkco.re/hQUrA83C",
      image: "https://placekitten.com/200/200"
    };
  }
  if (userInput.includes("咲々木") || userInput.includes("ささき") || userInput.includes("さきさき")) {
    return {
      text: "咲々木 花（ささき はな）って言いますっ🌸 よろしくねっ！",
      image: "https://placekitten.com/200/200"
    };
  }
  return null; // それ以外はGPTに聞く
}

async function handleSend() {
  // 送信処理中にボタンを無効化
  sendButton.disabled = true;
  const userInput = input.value.trim();
  if (userInput === '') {
    sendButton.disabled = false;
    return;
  }

  addMessage('user', userInput);
  input.value = '';

  // 🔽 花っぽい固定応答を優先チェック
  const hanaReply = customHanaReply(userInput);
  if (hanaReply) {
    if (typeof hanaReply === 'object' && hanaReply.text && hanaReply.image) {
      addMessage('hana', hanaReply.text, hanaReply.image);
    } else {
      addMessage('hana', hanaReply);
    }
    sendButton.disabled = false;
    return;
  }

  // 🔽 ここから下はGPT API連携
  try {
    const aiResponse = await callHanaAI(userInput);
    addMessage('hana', aiResponse);
  } catch (error) {
    console.error('AI応答エラー:', error);
    addMessage('hana', '申し訳ありません、AIの応答に失敗しました😢 もう一度お試しください！');
  } finally {
    sendButton.disabled = false;
  }
}

// イベントリスナーの設定
sendButton.addEventListener('click', handleSend);

// 日本語入力中の判定
let isComposing = false;
input.addEventListener('compositionstart', () => {
  isComposing = true;
});
input.addEventListener('compositionend', () => {
  isComposing = false;
});

// Enterキーの2回押し検出
let enterPressedOnce = false;
let enterTimer = null;

input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    if (e.shiftKey) {
      // Shift + Enter は改行
      return;
    }

    e.preventDefault(); // 通常の送信を無効化

    if (isComposing) {
      // 変換中は送信しない
      return;
    }

    // 変換確定後のEnterで送信
    if (!isComposing) {
      handleSend();
    }
  }
});

// Add greeting message based on time of day
window.addEventListener('load', () => {
  const hour = new Date().getHours();
  let greeting = '';
if (hour < 10) greeting = `おはよう☀️ 今日もがんばろっ♪ ${userName}ちゃん`;
else if (hour < 18) greeting = `こんにちは🌼 今日も楽しくいこうね！ ${userName}ちゃん`;
else greeting = `こんばんは🌙 ゆっくりできてる？ ${userName}ちゃん`;

  addMessage('hana', greeting);
});
