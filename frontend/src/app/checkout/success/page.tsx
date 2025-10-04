import { PublicLayout } from "@/components/layouts/public-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { CheckCircle, Home, Receipt } from "lucide-react"

export default function PaymentSuccessPage() {
  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="pt-12 pb-8 text-center space-y-6">
              <div className="flex justify-center">
                <div className="h-20 w-20 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                  <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-500" />
                </div>
              </div>

              <div className="space-y-2">
                <h1 className="text-3xl font-bold">Payment Successful!</h1>
                <p className="text-muted-foreground text-lg">
                  Thank you for your order. Your payment has been processed successfully.
                </p>
              </div>

              <div className="bg-muted/50 rounded-lg p-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Order Number:</span>
                  <span className="font-semibold">#ORD-2025-001</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Payment Method:</span>
                  <span className="font-semibold">Cash</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Amount:</span>
                  <span className="font-semibold text-lg">50,000 VND</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Estimated Delivery:</span>
                  <span className="font-semibold">30-45 minutes</span>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                A confirmation email has been sent to your email address. You can track your order status in real-time.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                <Link href="/tracking-order/ORD-2025-001">
                  <Button size="lg" className="w-full sm:w-auto">
                    <Receipt className="h-5 w-5 mr-2" />
                    Track Order
                  </Button>
                </Link>
                <Link href="/">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent">
                    <Home className="h-5 w-5 mr-2" />
                    Back to Home
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PublicLayout>
  )
}
