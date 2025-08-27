"use client"

import Link from "next/link"
import { FC } from "react"
import { ChatbotUISVG } from "../icons/chatbotui-svg"

export const Brand: FC = () => {
  return (
    <Link href="/" className="flex cursor-pointer flex-col items-center hover:opacity-50">
      <div className="mb-2">
        <ChatbotUISVG scale={0.3} />
      </div>

      <div className="text-4xl font-bold tracking-wide">Umnyy I-I</div>
    </Link>
  )
}
