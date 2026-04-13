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

export async function fetchRepoInfo(token: string, repo: string): Promise<GitHubRepo> {
  try {
    const res = await fetch(`https://api.github.com/repos/${repo}`, {
      headers: {
        Authorization: `Bearer ${token.trim()}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `GitHub API error: ${res.status} ${res.statusText}`);
    }
    return res.json();
  } catch (err) {
    console.error('fetchRepoInfo error:', err);
    if (err instanceof TypeError && err.message === 'Failed to fetch') {
      throw new Error('Network error: Could not reach GitHub API. Check your internet or token scopes.');
    }
    throw err;
  }
}

export async function fetchRepoContents(token: string, repo: string, path = ''): Promise<GitHubFile[]> {
  const url = path
    ? `https://api.github.com/repos/${repo}/contents/${path}`
    : `https://api.github.com/repos/${repo}/contents`;
  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token.trim()}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `GitHub API error: ${res.status} ${res.statusText}`);
    }
    return res.json();
  } catch (err) {
    console.error('fetchRepoContents error:', err);
    throw err;
  }
}

export async function fetchFileContent(token: string, downloadUrl: string): Promise<string> {
  const res = await fetch(downloadUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
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
  
  const res = await fetch(`https://api.github.com/repos/${repo}/contents/${filePath}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `GitHub push error: ${res.status}`);
  }
  
  const data = await res.json();
  return {
    success: true,
    url: data.content?.html_url || `https://github.com/${repo}/blob/${branch}/${filePath}`,
  };
}

export async function getFileSha(token: string, repo: string, path: string): Promise<string | undefined> {
  try {
    const res = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });
    if (!res.ok) return undefined;
    const data = await res.json();
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
  if (repoName.toLowerCase() === `${owner.toLowerCase()}.github.io`) {
    return `https://${owner.toLowerCase()}.github.io/`;
  }
  return `https://${owner.toLowerCase()}.github.io/${repoName}/`;
}

export function extractRepoFromUrl(url: string): string | null {
  const match = url.match(/github\.com\/([^/]+\/[^/\s?#]+)/);
  return match ? match[1] : null;
}
