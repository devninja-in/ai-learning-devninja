import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Brain, Code2, Zap } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

const features = [
  {
    icon: Brain,
    title: 'Interactive Learning',
    description: 'Hands-on simulations and visualizations to understand AI concepts deeply.',
  },
  {
    icon: BookOpen,
    title: 'Structured Curriculum',
    description: 'From NLP foundations to advanced LLMs, follow a clear learning path.',
  },
  {
    icon: Code2,
    title: 'Practical Examples',
    description: 'Real-world code examples and implementations you can experiment with.',
  },
  {
    icon: Zap,
    title: 'Modern Approach',
    description: 'Learn the latest techniques and best practices in AI development.',
  },
];

const learningPhases = [
  { phase: 1, title: 'NLP Foundations', description: 'Basic concepts and preprocessing' },
  { phase: 2, title: 'Transformers', description: 'Architecture and attention mechanisms' },
  { phase: 3, title: 'Language Models', description: 'GPT, BERT, and model variants' },
  { phase: 4, title: 'LLMs & RLHF', description: 'Large models and human feedback' },
  { phase: 5, title: 'Attention Deep Dive', description: 'Advanced attention patterns' },
  { phase: 6, title: 'Model Internals', description: 'Understanding model behavior' },
];

export default function Home() {
  return (
    <Layout>
      <Head>
        <title>DevNinja AI Learning - Interactive AI Education Platform</title>
        <meta
          name="description"
          content="Master AI from foundations to advanced topics with interactive simulations, visualizations, and hands-on exercises."
        />
      </Head>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20">
        <div className="container mx-auto px-4 py-16 lg:py-24">
          <div className="text-center">
            <motion.h1
              className="text-4xl lg:text-6xl font-bold font-display text-primary-900 dark:text-primary-100 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Master AI from
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-accent-500">
                Foundations to Frontiers
              </span>
            </motion.h1>

            <motion.p
              className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Interactive learning platform for AI concepts, from NLP basics to advanced
              language models. Learn through simulations, visualizations, and hands-on practice.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Button size="lg" className="group">
                Start Learning
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button variant="outline" size="lg">
                Explore Curriculum
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold font-display mb-4">
              Why Choose DevNinja AI Learning?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our platform combines theory with practice, providing an immersive
              learning experience that prepares you for real-world AI development.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="p-6 h-full">
                  <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Learning Path Section */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold font-display mb-4">
              Structured Learning Path
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Progress through carefully designed phases that build upon each other,
              ensuring you develop a solid foundation before tackling advanced topics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {learningPhases.map((phase, index) => (
              <motion.div
                key={phase.phase}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer group">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-3">
                      {phase.phase}
                    </div>
                    <h3 className="text-lg font-semibold">{phase.title}</h3>
                  </div>
                  <p className="text-muted-foreground mb-4">{phase.description}</p>
                  <div className="flex items-center text-primary-600 dark:text-primary-400 text-sm font-medium group-hover:translate-x-1 transition-transform">
                    <span>Start Phase {phase.phase}</span>
                    <ArrowRight className="ml-1 h-3 w-3" />
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button size="lg" variant="outline">
              View Complete Curriculum
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <Card className="p-8 lg:p-12 text-center bg-gradient-to-r from-primary-500 to-accent-500 text-white border-0">
            <h2 className="text-3xl lg:text-4xl font-bold font-display mb-4">
              Ready to Start Your AI Journey?
            </h2>
            <p className="text-lg mb-8 text-primary-100 max-w-2xl mx-auto">
              Join thousands of learners who are mastering AI concepts through our
              interactive platform. Start with the fundamentals and progress to
              cutting-edge techniques.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-primary-600 hover:bg-primary-50">
                Begin Learning Now
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Browse Content
              </Button>
            </div>
          </Card>
        </div>
      </section>
    </Layout>
  );
}