"use client"

import React, { useCallback, useEffect, useState } from "react"
import { useCompletion } from "ai/react"
import { toast } from "sonner"

import { defaultValues, type FormData, type Recipe } from "@/types/types"
import { saveGeneration } from "@/lib/actions"
import { generatePrompt } from "@/lib/generate-prompt"
import { cn } from "@/lib/utils"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { RecipeForm } from "@/components/form/recipe-form"
import { RecipeCard } from "@/components/recipe/recipe-card"
import { RecipeCardSkeleton } from "@/components/recipe/recipe-card-skeleton"

export function GenerateRecipe() {
  const [isRecipeVisible, setIsRecipeVisible] = useState<boolean>(false)
  const [formValues, setFormValues] = useState<FormData>(defaultValues)
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [recipeImage, setRecipeImage] = useState<string | null>(null)
  const [isGeneratingImage, setIsGeneratingImage] = useState<boolean>(false)

  const { complete, isLoading } = useCompletion({
    api: "/api/generate-recipe-gemini",
    onFinish: () => {
      setIsRecipeVisible(true)
    },
  })

  useEffect(() => {
    if (recipe) {
      saveGeneration(recipe)
    }
  }, [recipe])

  const onSubmit = useCallback(
    async (values: FormData, e: React.FormEvent) => {
      const prompt = generatePrompt(values)
      const completion = await complete(prompt)
      console.log({ completion })
      setFormValues(values)
      if (!completion) throw new Error("Failed to generate recipe. Try again.")
      try {
        const result = JSON.parse(completion)
        setRecipe(result)

        // Generate image for the recipe
        setIsGeneratingImage(true)
        try {
          const imageResponse = await fetch("/api/generate-image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt: result.title }),
          })

          if (!imageResponse.ok) {
            throw new Error("Failed to generate image")
          }

          const imageData = await imageResponse.json()
          setRecipeImage(imageData.imageUrl)
        } catch (error) {
          console.error("Error generating image:", error)
          toast.error("Failed to generate recipe image")
        } finally {
          setIsGeneratingImage(false)
        }
      } catch (error) {
        console.error("Error parsing JSON:", error)
        toast.error("Uh oh! Failed to generate recipe. Try again.")
      }
    },
    [complete]
  )

  return (
    <div className="pb-24">
      <div
        className={cn("mx-auto space-y-6 md:space-x-6 md:space-y-0", {
          "md:flex": isLoading || isRecipeVisible,
          "max-w-2xl": !isLoading && !isRecipeVisible,
        })}
      >
        <div
          className={cn({
            "md:flex md:w-1/3": isLoading || isRecipeVisible,
          })}
        >
          <RecipeForm onSubmit={onSubmit} isLoading={isLoading} />
        </div>
        <div
          className={cn({
            "md:flex md:flex-col md:w-2/3": isLoading || isRecipeVisible,
          })}
        >
          <div className="md:flex flex-col">
            {(isLoading || isGeneratingImage) && (
              <div className="mb-6">
                <Skeleton className="size-full w-full mx-auto aspect-[4/3] rounded-lg" />
              </div>
            )}{" "}
            {!isLoading && !isGeneratingImage && recipe && recipeImage && (
              <div className="mb-6">
                <Avatar className="size-full w-full mx-auto aspect-[4/3] rounded-lg">
                  <AvatarImage
                    src={recipeImage}
                    alt="Generated recipe"
                    className="object-cover"
                  />
                </Avatar>
              </div>
            )}
            {!isLoading && recipe && !isGeneratingImage && (
              <RecipeCard recipe={recipe} />
            )}
            {(isLoading || isGeneratingImage) && <RecipeCardSkeleton />}
          </div>
        </div>
      </div>
    </div>
  )
}
