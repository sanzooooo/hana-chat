# 咲々木 花とのチャットアプリ

咲々木 花（ささき はな）とのチャットアプリケーションです。

## 機能

- LINE風チャットインターフェース
- AIによる自然な会話応答
- BGM再生機能
- 日本語対応

## デプロイ

このアプリケーションはNetlifyでホストされています。

## 環境変数

Netlifyの環境変数として以下のキーを設定してください：

- `OPENAI_API_KEY`: OpenAI APIのキー

## ローカル開発

```bash
# パッケージのインストール
npm install

# Netlify CLIのインストール
npm install -g netlify-cli

# ローカル開発
netlify dev
```
