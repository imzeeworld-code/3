export interface GitHubFile {
  name: string;
  path: string;
  type: 'file' | 'dir';
  download_url: string | null;
  sha: string;
}

export interface GitHubRepo {
  full_name: string;
  html_url: string;
  default_branch: string;
  description: string | null;
}

async function githubProxy(token: string, endpoint: string, method = 'GET', body?: any) {
  const res = await fetch('/api/github/proxy', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      token: token.trim(),
      endpoint,
      method,
      body
    }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `GitHub Proxy error: ${res.status}`);
  }

  return res.json();
}

export async function fetchRepoInfo(token: string, repo: string): Promise<GitHubRepo> {
  return githubProxy(token, `/repos/${repo}`);
}

export async function fetchRepoContents(token: string, repo: string, path = ''): Promise<GitHubFile[]> {
  const endpoint = path ? `/repos/${repo}/contents/${path}` : `/repos/${repo}/contents`;
  return githubProxy(token, endpoint);
}

export async function fetchFileContent(token: string, downloadUrl: string): Promise<string> {
  // downloadUrl is usually a direct link to raw.githubusercontent.com
  // but it can also be a GitHub API URL for contents.
  // If it's a raw URL, we might still face CORS, so let's try to fetch it via proxy if it's a github URL.
  if (downloadUrl.includes('api.github.com')) {
    const endpoint = downloadUrl.split('api.github.com')[1];
    const data = await githubProxy(token, endpoint);
    if (data.content && data.encoding === 'base64') {
      return decodeURIComponent(escape(atob(data.content.replace(/\n/g, ''))));
    }
    throw new Error('Unexpected file content format');
  }
  
  // Fallback for non-API URLs
  const res = await fetch(downloadUrl);
  if (!res.ok) throw new Error(`Failed to fetch file: ${res.status}`);
  return res.text();
}

export async function pushFileToGitHub(
  token: string,
  repo: string,
  branch: string,
  filePath: string,
  content: string,
  message: string,
  existingSha?: string
): Promise<{ success: boolean; url: string }> {
  const encoded = btoa(unescape(encodeURIComponent(content)));
  
  const body: Record<string, unknown> = {
    message,
    content: encoded,
    branch,
  };
  
  if (existingSha) body.sha = existingSha;
  
  const data = await githubProxy(token, `/repos/${repo}/contents/${filePath}`, 'PUT', body);
  
  return {
    success: true,
    url: data.content?.html_url || `https://github.com/${repo}/blob/${branch}/${filePath}`,
  };
}

export async function getFileSha(token: string, repo: string, path: string): Promise<string | undefined> {
  try {
    const data = await githubProxy(token, `/repos/${repo}/contents/${path}`);
    return data.sha;
  } catch {
    return undefined;
  }
}

export async function getRawFileUrl(token: string, repo: string, branch: string, filePath: string): Promise<string> {
  const repoInfo = await fetchRepoInfo(token, repo);
  const b = branch || repoInfo.default_branch;
  return `https://raw.githubusercontent.com/${repo}/${b}/${filePath}`;
}

export function getGitHubPagesUrl(repo: string): string {
  const [owner, repoName] = repo.split('/');
  if (!owner || !repoName) return '';
  
  const lowerOwner = owner.toLowerCase();
  const lowerRepo = repoName.toLowerCase();
  
  if (lowerRepo === `${lowerOwner}.github.io`) {
    return `https://${lowerOwner}.github.io/`;
  }
  return `https://${lowerOwner}.github.io/${repoName}/`;
}

export function extractRepoFromUrl(url: string): string | null {
  const match = url.match(/github\.com\/([^/]+\/[^/\s?#]+)/);
  return match ? match[1] : null;
}
