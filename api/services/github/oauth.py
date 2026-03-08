"""
GitHub OAuth Integration for FORGE Audit
Handles OAuth flow, token management, and repository access.
"""

import httpx
import secrets
from typing import Optional, Dict, List
from dataclasses import dataclass
from datetime import datetime, timedelta

from config import settings


@dataclass
class GitHubUser:
    """GitHub user profile."""
    id: int
    login: str
    name: Optional[str]
    email: Optional[str]
    avatar_url: str


@dataclass
class GitHubRepo:
    """GitHub repository info."""
    id: int
    name: str
    full_name: str
    private: bool
    default_branch: str
    clone_url: str
    html_url: str
    description: Optional[str]
    language: Optional[str]
    updated_at: str


class GitHubOAuth:
    """
    GitHub OAuth 2.0 integration.
    
    Flow:
    1. User clicks "Connect GitHub" → redirect to GitHub authorization URL
    2. GitHub redirects back with code → exchange for access token
    3. Store encrypted token in database linked to user
    4. Use token to list repos, clone code, create webhooks
    """
    
    AUTHORIZE_URL = "https://github.com/login/oauth/authorize"
    TOKEN_URL = "https://github.com/login/oauth/access_token"
    API_BASE = "https://api.github.com"
    
    # Scopes needed for audit functionality
    SCOPES = [
        "repo",           # Full access to private repos (needed for cloning)
        "read:user",      # Read user profile
        "user:email",     # Read user email
    ]
    
    def __init__(self):
        self.client_id = getattr(settings, 'github_client_id', '')
        self.client_secret = getattr(settings, 'github_client_secret', '')
        self.redirect_uri = getattr(settings, 'github_redirect_uri', '')
    
    def get_authorization_url(self, state: str) -> str:
        """
        Generate GitHub OAuth authorization URL.
        
        Args:
            state: Random string to prevent CSRF (store in session/DB)
            
        Returns:
            URL to redirect user to for GitHub authorization
        """
        params = {
            "client_id": self.client_id,
            "redirect_uri": self.redirect_uri,
            "scope": " ".join(self.SCOPES),
            "state": state,
            "allow_signup": "true",
        }
        query = "&".join(f"{k}={v}" for k, v in params.items())
        return f"{self.AUTHORIZE_URL}?{query}"
    
    async def exchange_code_for_token(self, code: str) -> Dict:
        """
        Exchange authorization code for access token.
        
        Args:
            code: Authorization code from GitHub callback
            
        Returns:
            Dict with access_token, token_type, scope
        """
        async with httpx.AsyncClient() as client:
            response = await client.post(
                self.TOKEN_URL,
                data={
                    "client_id": self.client_id,
                    "client_secret": self.client_secret,
                    "code": code,
                    "redirect_uri": self.redirect_uri,
                },
                headers={"Accept": "application/json"},
            )
            response.raise_for_status()
            return response.json()
    
    async def get_user(self, access_token: str) -> GitHubUser:
        """Get authenticated user's profile."""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.API_BASE}/user",
                headers={
                    "Authorization": f"Bearer {access_token}",
                    "Accept": "application/vnd.github+json",
                },
            )
            response.raise_for_status()
            data = response.json()
            
            return GitHubUser(
                id=data["id"],
                login=data["login"],
                name=data.get("name"),
                email=data.get("email"),
                avatar_url=data["avatar_url"],
            )
    
    async def get_user_email(self, access_token: str) -> Optional[str]:
        """Get user's primary email (may be private)."""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.API_BASE}/user/emails",
                headers={
                    "Authorization": f"Bearer {access_token}",
                    "Accept": "application/vnd.github+json",
                },
            )
            response.raise_for_status()
            emails = response.json()
            
            # Find primary email
            for email in emails:
                if email.get("primary"):
                    return email["email"]
            
            # Fall back to first verified email
            for email in emails:
                if email.get("verified"):
                    return email["email"]
            
            return None
    
    async def list_repos(
        self, 
        access_token: str, 
        page: int = 1, 
        per_page: int = 30,
        sort: str = "updated"
    ) -> List[GitHubRepo]:
        """
        List user's repositories (including private ones).
        
        Args:
            access_token: GitHub access token
            page: Page number for pagination
            per_page: Results per page (max 100)
            sort: Sort by 'created', 'updated', 'pushed', 'full_name'
        """
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.API_BASE}/user/repos",
                params={
                    "page": page,
                    "per_page": per_page,
                    "sort": sort,
                    "direction": "desc",
                    "affiliation": "owner,collaborator,organization_member",
                },
                headers={
                    "Authorization": f"Bearer {access_token}",
                    "Accept": "application/vnd.github+json",
                },
            )
            response.raise_for_status()
            repos = response.json()
            
            return [
                GitHubRepo(
                    id=repo["id"],
                    name=repo["name"],
                    full_name=repo["full_name"],
                    private=repo["private"],
                    default_branch=repo.get("default_branch", "main"),
                    clone_url=repo["clone_url"],
                    html_url=repo["html_url"],
                    description=repo.get("description"),
                    language=repo.get("language"),
                    updated_at=repo["updated_at"],
                )
                for repo in repos
            ]
    
    async def get_repo_contents(
        self, 
        access_token: str, 
        owner: str, 
        repo: str, 
        path: str = "",
        ref: str = "main"
    ) -> List[Dict]:
        """
        Get contents of a repository directory.
        
        Returns list of files/directories with metadata.
        """
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.API_BASE}/repos/{owner}/{repo}/contents/{path}",
                params={"ref": ref},
                headers={
                    "Authorization": f"Bearer {access_token}",
                    "Accept": "application/vnd.github+json",
                },
            )
            response.raise_for_status()
            return response.json()
    
    async def get_file_content(
        self, 
        access_token: str, 
        owner: str, 
        repo: str, 
        path: str,
        ref: str = "main"
    ) -> str:
        """
        Get raw content of a file.
        """
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.API_BASE}/repos/{owner}/{repo}/contents/{path}",
                params={"ref": ref},
                headers={
                    "Authorization": f"Bearer {access_token}",
                    "Accept": "application/vnd.github.raw+json",
                },
            )
            response.raise_for_status()
            return response.text
    
    async def get_repo_tree(
        self, 
        access_token: str, 
        owner: str, 
        repo: str,
        ref: str = "main",
        recursive: bool = True
    ) -> List[Dict]:
        """
        Get full repository tree (all files).
        More efficient than walking directories.
        """
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.API_BASE}/repos/{owner}/{repo}/git/trees/{ref}",
                params={"recursive": "1" if recursive else "0"},
                headers={
                    "Authorization": f"Bearer {access_token}",
                    "Accept": "application/vnd.github+json",
                },
            )
            response.raise_for_status()
            data = response.json()
            return data.get("tree", [])
    
    @staticmethod
    def generate_state() -> str:
        """Generate a secure random state string for CSRF protection."""
        return secrets.token_urlsafe(32)


# Singleton instance
github_oauth = GitHubOAuth()
