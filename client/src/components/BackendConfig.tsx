import { useState } from 'react';
import { Database, Cloud, Image, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface BackendConfig {
  firebase?: {
    apiKey: string;
    projectId: string;
    databaseURL: string;
  };
  supabase?: {
    url: string;
    anonKey: string;
  };
  cloudinary?: {
    cloudName: string;
    uploadPreset: string;
  };
}

export default function BackendConfig() {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<BackendConfig>({});
  const [expandedService, setExpandedService] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const generateConfigCode = () => {
    let code = '// Backend Configuration\n\n';

    if (config.firebase?.apiKey) {
      code += `// Firebase Configuration\nconst firebaseConfig = {\n`;
      code += `  apiKey: "${config.firebase.apiKey}",\n`;
      code += `  projectId: "${config.firebase.projectId}",\n`;
      code += `  databaseURL: "${config.firebase.databaseURL}",\n`;
      code += `};\n\n`;
    }

    if (config.supabase?.url) {
      code += `// Supabase Configuration\nconst supabaseConfig = {\n`;
      code += `  url: "${config.supabase.url}",\n`;
      code += `  anonKey: "${config.supabase.anonKey}",\n`;
      code += `};\n\n`;
    }

    if (config.cloudinary?.cloudName) {
      code += `// Cloudinary Configuration\nconst cloudinaryConfig = {\n`;
      code += `  cloudName: "${config.cloudinary.cloudName}",\n`;
      code += `  uploadPreset: "${config.cloudinary.uploadPreset}",\n`;
      code += `};\n`;
    }

    return code;
  };

  const copyConfigCode = () => {
    navigator.clipboard.writeText(generateConfigCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Configuration code copied!');
  };

  const services = [
    {
      id: 'firebase',
      name: 'Firebase',
      icon: Database,
      color: 'text-orange-500',
      fields: [
        { key: 'apiKey', label: 'API Key', placeholder: 'AIzaSyD...' },
        { key: 'projectId', label: 'Project ID', placeholder: 'my-project' },
        { key: 'databaseURL', label: 'Database URL', placeholder: 'https://my-project.firebaseio.com' },
      ],
    },
    {
      id: 'supabase',
      name: 'Supabase',
      icon: Cloud,
      color: 'text-green-500',
      fields: [
        { key: 'url', label: 'Project URL', placeholder: 'https://xxx.supabase.co' },
        { key: 'anonKey', label: 'Anon Key', placeholder: 'eyJhbGc...' },
      ],
    },
    {
      id: 'cloudinary',
      name: 'Cloudinary',
      icon: Image,
      color: 'text-blue-500',
      fields: [
        { key: 'cloudName', label: 'Cloud Name', placeholder: 'my-cloud' },
        { key: 'uploadPreset', label: 'Upload Preset', placeholder: 'my-preset' },
      ],
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 text-xs"
        >
          <Cloud className="w-3 h-3" />
          Backend
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full max-w-2xl max-h-96 overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Backend Configuration</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {services.map(service => {
            const Icon = service.icon;
            const isExpanded = expandedService === service.id;
            const serviceConfig = config[service.id as keyof BackendConfig] || {};

            return (
              <div key={service.id} className="border border-gray-700 rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpandedService(isExpanded ? null : service.id)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-gray-800 transition-colors"
                >
                  <Icon className={`w-4 h-4 ${service.color}`} />
                  <span className="font-medium flex-1 text-left">{service.name}</span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>

                {isExpanded && (
                  <div className="p-3 bg-gray-900 border-t border-gray-700 space-y-3">
                    {service.fields.map(field => (
                      <div key={field.key}>
                        <label className="text-xs font-medium">{field.label}</label>
                        <Input
                          type="password"
                          placeholder={field.placeholder}
                          value={(serviceConfig as any)?.[field.key] || ''}
                          onChange={(e) => {
                            setConfig({
                              ...config,
                              [service.id]: {
                                ...serviceConfig,
                                [field.key]: e.target.value,
                              },
                            });
                          }}
                          className="mt-1 text-xs"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          <div className="mt-6 p-3 bg-gray-900 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium">Generated Code</span>
              <Button
                onClick={copyConfigCode}
                variant="ghost"
                size="sm"
                className="gap-1 h-6 text-xs"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              </Button>
            </div>
            <pre className="text-xs bg-gray-950 p-2 rounded overflow-x-auto text-gray-300">
              {generateConfigCode()}
            </pre>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
