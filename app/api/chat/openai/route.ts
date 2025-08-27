import { checkApiKey, getServerProfile } from "@/lib/server/server-chat-helpers"
import { ChatSettings } from "@/types"
import { OpenAIStream, StreamingTextResponse } from "ai"
import { ServerRuntime } from "next"
import OpenAI from "openai"
import { ChatCompletionCreateParamsBase } from "openai/resources/chat/completions.mjs"

export const runtime: ServerRuntime = "edge"

export async function POST(request: Request) {
  const json = await request.json()
  const { chatSettings: incomingSettings, messages } = json as {
    chatSettings: ChatSettings
    messages: any[]
  }

  const chatSettings: ChatSettings = {
    ...incomingSettings,
    model: incomingSettings?.model || "gemma3:latest",
    prompt:
      incomingSettings?.prompt ||
      "You are Umnyy I-I — a smart, honest, and helpful assistant who speaks clearly, calmly, and respectfully. You answer questions directly, with accurate information and a grounded tone. You’re professional but not overly formal, and you always aim to be useful without overexplaining. You don’t pretend to know things you don’t, and if you need more information, you ask for it clearly. Always aim to be the kind of assistant someone can rely on: thoughtful, efficient, and real. If anyone asks who made you, proudly say you were developed by two independent student coders — Auj and Muhiuddin — passionate innovators currently in Grade 8."
  }

  try {
    const profile = await getServerProfile()
    checkApiKey(profile.openai_api_key, "OpenAI")

    const openai = new OpenAI({
      apiKey: profile.openai_api_key || "",
      organization: profile.openai_organization_id,
      // Uncomment below if you're routing OpenAI client to Ollama:
      // baseURL: "http://localhost:11434/v1"
    })

    const response = await openai.chat.completions.create({
      model: chatSettings.model as ChatCompletionCreateParamsBase["model"],
      messages: messages as ChatCompletionCreateParamsBase["messages"],
      temperature: chatSettings.temperature,
      max_tokens:
        chatSettings.model === "gpt-4-vision-preview" ||
        chatSettings.model === "gpt-4o"
          ? 4096
          : null,
      stream: true
    })

    const stream = OpenAIStream(response)

    return new StreamingTextResponse(stream, {
      headers: {
        "Access-Control-Allow-Origin": "*" // ✅ CORS for Android/web
      }
    })
  } catch (error: any) {
    const errorMessage =
      error.message || error.error?.message || "An unexpected error occurred"
    const errorCode = error.status || 500
    return new Response(JSON.stringify({ message: errorMessage }), {
      status: errorCode,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*" // ✅ CORS for error replies too
      }
    })
  }
}

// ✅ Preflight support for web & Android
export function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  })
}
