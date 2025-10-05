"use client"

import { useState } from "react"
import { PublicLayout } from "@/components/layouts/public-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Star } from "lucide-react"

export default function FeedbackPage() {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold mb-6 text-center">Share Your Feedback</h1>
          <p className="text-lg text-muted-foreground text-center mb-8">
            We value your opinion and would love to hear about your experience
          </p>

          <Card>
            <CardHeader>
              <CardTitle>Rate Your Experience</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Star Rating */}
              <div className="space-y-2">
                <Label>Overall Rating</Label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`h-8 w-8 ${
                          star <= (hoveredRating || rating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Feedback Form */}
              <div className="space-y-2">
                <Label htmlFor="feedback-name">Name</Label>
                <Input id="feedback-name" placeholder="Your name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="feedback-email">Email</Label>
                <Input id="feedback-email" type="email" placeholder="your@email.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="feedback-order">Order Number (Optional)</Label>
                <Input id="feedback-order" placeholder="#1-4" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="feedback-message">Your Feedback</Label>
                <Textarea id="feedback-message" rows={6} placeholder="Tell us about your experience..." />
              </div>
              <Button className="w-full">Submit Feedback</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </PublicLayout>
  )
}
