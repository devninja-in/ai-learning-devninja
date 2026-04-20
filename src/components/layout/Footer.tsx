import Link from 'next/link';
import { Brain, Github, Twitter, Mail } from 'lucide-react';

const footerLinks = {
  curriculum: [
    { name: 'NLP Foundations', href: '/curriculum/nlp-foundations' },
    { name: 'Transformers', href: '/curriculum/transformers' },
    { name: 'Language Models', href: '/curriculum/language-models' },
    { name: 'Advanced Topics', href: '/curriculum/advanced' },
  ],
  resources: [
    { name: 'Interactive Demos', href: '/interactive' },
    { name: 'Code Examples', href: '/examples' },
    { name: 'Research Papers', href: '/resources/papers' },
    { name: 'Glossary', href: '/glossary' },
  ],
  about: [
    { name: 'About DevNinja', href: '/about' },
    { name: 'Contact Us', href: '/contact' },
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-muted/30 border-t">
      <div className="container mx-auto px-4">
        <div className="py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <Brain className="h-6 w-6 text-primary-600" />
              <span className="text-lg font-bold font-display">DevNinja AI</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              Master AI concepts through interactive learning, from foundations to
              cutting-edge techniques.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://github.com/devninja"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com/devninja"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="mailto:hello@devninja.in"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Curriculum Links */}
          <div>
            <h3 className="text-sm font-semibold mb-4">Curriculum</h3>
            <ul className="space-y-2">
              {footerLinks.curriculum.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="text-sm font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About Links */}
          <div>
            <h3 className="text-sm font-semibold mb-4">About</h3>
            <ul className="space-y-2">
              {footerLinks.about.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="py-6 border-t flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-xs text-muted-foreground">
            © 2024 DevNinja.in. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Built with Next.js, TypeScript, and TailwindCSS
          </p>
        </div>
      </div>
    </footer>
  );
}