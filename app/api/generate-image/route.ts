import Together from "together-ai"

export const runtime = "edge"

const together = new Together({
  apiKey: process.env.TOGETHER_API_KEY!,
})

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json()

    // Enhance the prompt for better food photography results
    const enhancedPrompt = `A professional food photography shot of ${prompt} on a gradient background from vibrant pink to vibrant orange. The dish should look appetizing and be well-lit, styled like a high-end restaurant menu photo. Show the complete dish with garnishes and plating details.`

    const response = await together.images.create({
      model: "black-forest-labs/FLUX.1-schnell-Free",
      prompt: enhancedPrompt,
      width: 1024,
      height: 1024,
      steps: 4,
      n: 1,
      response_format: "url",
    })

    if (!response.data?.[0]?.url) {
      throw new Error("No image URL in response")
    }

    return new Response(JSON.stringify({ imageUrl: response.data[0].url }), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Image generation error:", error)
    return new Response(JSON.stringify({ error: "Failed to generate image" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
