import { PublicLayout } from "@/components/layouts/public-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Award, Heart, Users } from "lucide-react"

export default function AboutPage() {
  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-6 text-center">About FastFood</h1>
          <p className="text-lg text-muted-foreground text-center mb-12">
            Serving delicious fast food with passion since 2020
          </p>

          <div className="prose prose-lg max-w-none mb-12">
            <p>
              FastFood is a leading fast-food chain dedicated to bringing you the best fried chicken, burgers, pasta,
              and more. Our commitment to quality ingredients and exceptional service has made us a favorite among food
              lovers.
            </p>
            <p>
              With multiple locations across the city, we're always nearby to satisfy your cravings. Whether you're
              dining in, taking away, or ordering delivery, we ensure every meal is prepared fresh and served with care.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Quality First</h3>
                <p className="text-muted-foreground text-sm">
                  We use only the finest ingredients to ensure every bite is delicious.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Made with Love</h3>
                <p className="text-muted-foreground text-sm">
                  Every dish is prepared with care and attention to detail.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Customer Focused</h3>
                <p className="text-muted-foreground text-sm">Your satisfaction is our top priority, always.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
