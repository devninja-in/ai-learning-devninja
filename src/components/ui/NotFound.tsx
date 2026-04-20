import { SearchX, ArrowLeft, Home } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from './Button';
import { Card } from './Card';

interface NotFoundProps {
  title?: string;
  message?: string;
  showSearch?: boolean;
}

export function NotFound({
  title = "Content Not Found",
  message = "The content you're looking for doesn't exist or has been moved.",
  showSearch = true
}: NotFoundProps) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <Card className="max-w-md w-full p-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="mb-6">
            <SearchX className="h-16 w-16 text-foreground/40 mx-auto mb-4" />
            <h1 className="text-h2 font-bold text-foreground mb-2">{title}</h1>
            <p className="text-foreground/70">{message}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => window.history.back()} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
            <Link href="/">
              <Button>
                <Home className="mr-2 h-4 w-4" />
                Home
              </Button>
            </Link>
          </div>

          {showSearch && (
            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-sm text-foreground/60 mb-3">
                Looking for something specific?
              </p>
              <Link href="/search" className="text-primary hover:text-primary/80 text-sm">
                Search our content library
              </Link>
            </div>
          )}
        </motion.div>
      </Card>
    </div>
  );
}