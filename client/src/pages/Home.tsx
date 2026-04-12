import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Code, Zap, Download, Github, Smartphone, Layers } from "lucide-react";
import { useLocation } from "wouter";

export default function Home() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();

  const features = [
    {
      icon: Code,
      title: "Live Code Editor",
      description: "Write HTML, CSS, and JavaScript with real-time syntax highlighting",
    },
    {
      icon: Zap,
      title: "Instant Preview",
      description: "See your changes instantly in the live preview panel",
    },
    {
      icon: Download,
      title: "Download Projects",
      description: "Export your complete projects as self-contained HTML files",
    },
    {
      icon: Github,
      title: "GitHub Integration",
      description: "Push your code directly to GitHub repositories",
    },
    {
      icon: Layers,
      title: "Backend Support",
      description: "Configure Firebase, Supabase, and Cloudinary",
    },
    {
      icon: Smartphone,
      title: "Mobile Optimized",
      description: "Full IDE experience on your phone in landscape mode",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-gray-950/80 backdrop-blur border-b border-gray-800 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code className="w-6 h-6 text-blue-500" />
            <h1 className="text-xl font-bold">Web Codding AIDE</h1>
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-gray-400">{user?.name}</span>
                <Button
                  onClick={() => logout()}
                  variant="outline"
                  size="sm"
                  className="text-gray-300 border-gray-700 hover:bg-gray-800"
                >
                  Logout
                </Button>
              </>
            ) : null}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Web Codding AIDE
          </h2>
          <p className="text-xl text-gray-300 mb-8 leading-relaxed">
            A powerful, mobile-first web IDE for serious developers. Code, preview, and deploy directly from your phone.
          </p>
          <Button
            onClick={() => setLocation("/ide")}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg font-semibold rounded-lg"
          >
            Launch IDE
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-gray-900/50">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-center mb-16">Powerful Features</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 hover:border-blue-500/50 transition-colors"
                >
                  <Icon className="w-8 h-8 text-blue-400 mb-4" />
                  <h4 className="text-lg font-semibold mb-2">{feature.title}</h4>
                  <p className="text-gray-400 text-sm">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h3 className="text-3xl font-bold mb-6">Ready to Start Coding?</h3>
          <p className="text-gray-400 mb-8">
            Web Codding AIDE is designed for serious developers who want a powerful IDE on their mobile device.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => setLocation("/ide")}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Launch IDE
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 px-4 text-center text-gray-500 text-sm">
        <p>Web Codding AIDE © 2026. Built for mobile developers.</p>
      </footer>
    </div>
  );
}
