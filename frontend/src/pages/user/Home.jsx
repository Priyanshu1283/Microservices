import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { ArrowRight, ShieldCheck, Zap, Star } from "lucide-react"
import { Button } from "../../components/ui/Button"
import { PageTransition } from "../../components/animations/PageTransition"

const features = [
  {
    icon: <Zap className="h-6 w-6 text-yellow-500" />,
    title: "Lightning Fast Delivery",
    description: "Get your digital products instantly after secure payment confirmation."
  },
  {
    icon: <ShieldCheck className="h-6 w-6 text-green-500" />,
    title: "Secure Payments",
    description: "Your transactions are protected by industry-leading encryption and fraud prevention."
  },
  {
    icon: <Star className="h-6 w-6 text-purple-500" />,
    title: "Premium Quality",
    description: "All products are verified by our team to ensure the highest quality standards."
  }
]

export function Home() {
  return (
    <PageTransition>
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent dark:from-primary/10 pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60 dark:from-white dark:to-white/60">
              The Premium Digital <br className="hidden md:block" /> Marketplace
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Discover high-quality software, courses, and digital assets crafted by top creators worldwide.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/products">
                <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg rounded-full">
                  Explore Products
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="outline" size="lg" className="w-full sm:w-auto h-14 px-8 text-lg rounded-full">
                  Become a Seller
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-secondary/50 dark:bg-secondary/20 rounded-3xl my-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="bg-card p-8 rounded-2xl shadow-sm border border-border/50 hover:shadow-md transition-shadow"
              >
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to elevate your workflow?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of professionals who trust StoreFront for their digital needs.
          </p>
          <Link to="/products">
            <Button size="lg" variant="secondary" className="rounded-full">
              View Trending Products
            </Button>
          </Link>
        </div>
      </section>
    </PageTransition>
  )
}
