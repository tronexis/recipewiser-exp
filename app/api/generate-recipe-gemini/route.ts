import { GoogleGenerativeAI } from "@google/generative-ai"
import { GoogleGenerativeAIStream, StreamingTextResponse } from "ai"

export const runtime = "edge"

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "")

export async function POST(req: Request) {
  // Extract the prompt from the body of the request
  const { prompt } = await req.json()

  // Initialize the model
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" })

  // Start the generation
  const response = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }],
      },
      {
        role: "model",
        parts: [
          {
            text: "You are an expert culinary chef. Respond only with valid JSON.",
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.6,
    },
  })

  const result = await response.response.text()

  try {
    // Parse and stringify to ensure valid JSON string format
    const jsonResult = JSON.stringify(
      JSON.parse(
        result
          .trim()
          .replace(/^```json\s*\n/, "")
          .replace(/\n```$/, "")
          .trim()
      )
    )

    // Return the JSON response
    return new Response(jsonResult, {
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    // Return an error response if JSON parsing fails
    return new Response(
      JSON.stringify({
        error: "Failed to generate valid recipe data",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    )
  }
}
