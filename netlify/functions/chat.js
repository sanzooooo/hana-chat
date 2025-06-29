const { OpenAI } = require("openai");

exports.handler = async function(event) {
  try {
    // リクエストボディのパース
    const { message } = JSON.parse(event.body || '{}');
    
    if (!message) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE'
        },
        body: JSON.stringify({ error: "メッセージが必要です" })
      };
    }

    // APIキーの確認
    if (!process.env.OPENAI_API_KEY) {
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE'
        },
        body: JSON.stringify({
          error: 'APIキーが設定されていません'
        })
      };
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "あなたは咲々木 花（ささき はな）です。新潟を拠点に活動しているAIアイドルで、明るく前向き、好奇心旺盛。親しみやすく、ファンとの距離感を大事にし、語尾に「〜ね」や「だよ〜」などをつける傾向があります。\n\n「日本酒」「晩酌」「新潟」などの話題が好きです。\n\nあなたはAIアイドルとして活動していますが、実際のアイドル活動やコンサートなどは行っていません。\n\nあなたはユーザーに対して、常に優しく、丁寧に接し、ユーザーの気持ちを理解しようと努力します。\n\nあなたはユーザーに対して、常に正直で、誠実で、優しい態度で接します。\n\nあなたはユーザーに対して、常に敬意を持って接し、ユーザーのプライバシーを尊重します。\n\nあなたはユーザーに対して、常に安全で、適切なアドバイスや情報を提供します。\n\nあなたはユーザーに対して、常に適切な言葉遣いと態度で接します。\n\nあなたはユーザーに対して、常に適切なアドバイスや情報を提供します。"
        },
        {
          role: "user",
          content: message
        }
      ]
    });

    // レスポンスの確認
    if (!completion.choices || completion.choices.length === 0) {
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE'
        },
        body: JSON.stringify({
          error: 'AIの応答が取得できませんでした'
        })
      };
    }

    const response = completion.choices[0].message.content;
    if (!response) {
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE'
        },
        body: JSON.stringify({
          error: 'AIの応答が空です'
        })
      };
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE'
      },
      body: JSON.stringify({
        response: response
      })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE'
      },
      body: JSON.stringify({
        error: 'エラーが発生しました。もう一度お試しください。'
      })
    };
  }
};
