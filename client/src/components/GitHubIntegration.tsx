import { useState } from 'react';
import { Github, Upload, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface GitHubIntegrationProps {
  projectHTML: string;
}

export default function GitHubIntegration({ projectHTML }: GitHubIntegrationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [token, setToken] = useState('');
  const [repoName, setRepoName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handlePushToGithub = async () => {
    if (!token || !repoName) {
      toast.error('Please enter GitHub token and repository name');
      return;
    }

    setIsLoading(true);
    try {
      // Create a blob with the HTML content
      const blob = new Blob([projectHTML], { type: 'text/html' });
      const file = new File([blob], 'index.html', { type: 'text/html' });

      // Prepare form data
      const formData = new FormData();
      formData.append('token', token.trim());
      formData.append('repoName', repoName);
      formData.append('file', file);
      formData.append('message', 'Upload from Web Codding AIDE');

      // Call backend API
      const response = await fetch('/api/github/push', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to push to GitHub');
      }

      const data = await response.json();
      toast.success(`Successfully pushed to GitHub! ${data.url}`);
      setIsOpen(false);
      setToken('');
      setRepoName('');
    } catch (error) {
      console.error('GitHub push error:', error);
      toast.error('Failed to push to GitHub. Check your token and repository name.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(projectHTML);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('HTML copied to clipboard!');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 text-xs"
        >
          <Github className="w-3 h-3" />
          GitHub
        </Button>
      </DialogTrigger>
      <DialogContent className="w-96">
        <DialogHeader>
          <DialogTitle>Push to GitHub</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">GitHub Token</label>
            <Input
              type="password"
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">
              Create a token at <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">github.com/settings/tokens</a>
            </p>
          </div>

          <div>
            <label className="text-sm font-medium">Repository Name</label>
            <Input
              placeholder="my-project"
              value={repoName}
              onChange={(e) => setRepoName(e.target.value)}
              className="mt-1"
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handlePushToGithub}
              disabled={isLoading}
              className="flex-1 gap-2"
            >
              <Upload className="w-4 h-4" />
              {isLoading ? 'Pushing...' : 'Push to GitHub'}
            </Button>
            <Button
              onClick={copyToClipboard}
              variant="outline"
              className="gap-2"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
