"""
GitHub OAuth API Routes
Handles GitHub connection, repository listing, and scanning.
"""

from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from db.database import get_db
from db.models import User, GitHubConnection
from auth.dependencies import get_current_user
from services.github import github_oauth, GitHubRepo

router = APIRouter(prefix="/v1/github", tags=["GitHub"])


# =============================================================================
# Request/Response Models
# =============================================================================

class GitHubConnectionStatus(BaseModel):
    connected: bool
    github_username: Optional[str] = None
    github_avatar_url: Optional[str] = None
    connected_at: Optional[str] = None
    scopes: Optional[list] = None


class GitHubRepoResponse(BaseModel):
    id: int
    name: str
    full_name: str
    private: bool
    default_branch: str
    html_url: str
    description: Optional[str]
    language: Optional[str]
    updated_at: str


class StartScanRequest(BaseModel):
    repo_full_name: str
    branch: Optional[str] = None


# =============================================================================
# OAuth Flow Endpoints
# =============================================================================

@router.get("/connect")
async def start_github_oauth(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Start GitHub OAuth flow.
    Returns the authorization URL to redirect the user to.
    """
    # Generate state for CSRF protection
    state = github_oauth.generate_state()
    
    # Store state in session/cache (for now, encode user_id in state)
    # In production, use Redis or database to store state -> user_id mapping
    import base64
    state_with_user = base64.urlsafe_b64encode(
        f"{state}:{user.id}".encode()
    ).decode()
    
    auth_url = github_oauth.get_authorization_url(state_with_user)
    
    return {
        "authorization_url": auth_url,
        "state": state_with_user
    }


@router.get("/callback")
async def github_oauth_callback(
    code: str = Query(...),
    state: str = Query(...),
    db: AsyncSession = Depends(get_db)
):
    """
    GitHub OAuth callback endpoint.
    Exchanges code for token and stores the connection.
    """
    import base64
    
    try:
        # Decode state to get user_id
        decoded = base64.urlsafe_b64decode(state.encode()).decode()
        _, user_id = decoded.rsplit(":", 1)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid state parameter"
        )
    
    # Exchange code for token
    try:
        token_data = await github_oauth.exchange_code_for_token(code)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to exchange code: {str(e)}"
        )
    
    access_token = token_data.get("access_token")
    if not access_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No access token received"
        )
    
    # Get GitHub user info
    try:
        gh_user = await github_oauth.get_user(access_token)
        gh_email = await github_oauth.get_user_email(access_token)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to get GitHub user info: {str(e)}"
        )
    
    # Check if connection already exists
    import uuid as uuid_module
    user_uuid = uuid_module.UUID(user_id)
    
    result = await db.execute(
        select(GitHubConnection).where(GitHubConnection.user_id == user_uuid)
    )
    existing = result.scalar_one_or_none()
    
    if existing:
        # Update existing connection
        existing.github_user_id = gh_user.id
        existing.github_username = gh_user.login
        existing.github_email = gh_email or gh_user.email
        existing.github_avatar_url = gh_user.avatar_url
        existing.access_token = access_token
        existing.token_type = token_data.get("token_type", "bearer")
        existing.scope = token_data.get("scope", "")
        existing.is_active = True
    else:
        # Create new connection
        connection = GitHubConnection(
            user_id=user_uuid,
            github_user_id=gh_user.id,
            github_username=gh_user.login,
            github_email=gh_email or gh_user.email,
            github_avatar_url=gh_user.avatar_url,
            access_token=access_token,
            token_type=token_data.get("token_type", "bearer"),
            scope=token_data.get("scope", ""),
        )
        db.add(connection)
    
    await db.commit()
    
    # Redirect to frontend dashboard with success
    frontend_url = "https://openframe.co/dashboard/audit?github=connected"
    return RedirectResponse(
        url=frontend_url,
        status_code=status.HTTP_302_FOUND
    )


@router.get("/status", response_model=GitHubConnectionStatus)
async def get_github_status(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Check if user has GitHub connected."""
    result = await db.execute(
        select(GitHubConnection).where(
            GitHubConnection.user_id == user.id,
            GitHubConnection.is_active == True
        )
    )
    connection = result.scalar_one_or_none()
    
    if not connection:
        return GitHubConnectionStatus(connected=False)
    
    return GitHubConnectionStatus(
        connected=True,
        github_username=connection.github_username,
        github_avatar_url=connection.github_avatar_url,
        connected_at=connection.connected_at.isoformat() if connection.connected_at else None,
        scopes=connection.scope.split(",") if connection.scope else []
    )


@router.delete("/disconnect")
async def disconnect_github(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Disconnect GitHub account."""
    result = await db.execute(
        select(GitHubConnection).where(GitHubConnection.user_id == user.id)
    )
    connection = result.scalar_one_or_none()
    
    if connection:
        connection.is_active = False
        connection.access_token = ""  # Clear token
        await db.commit()
    
    return {"status": "disconnected"}


# =============================================================================
# Repository Endpoints
# =============================================================================

@router.get("/repos")
async def list_repositories(
    page: int = Query(1, ge=1),
    per_page: int = Query(30, ge=1, le=100),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List user's GitHub repositories."""
    result = await db.execute(
        select(GitHubConnection).where(
            GitHubConnection.user_id == user.id,
            GitHubConnection.is_active == True
        )
    )
    connection = result.scalar_one_or_none()
    
    if not connection:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="GitHub not connected. Please connect your GitHub account first."
        )
    
    try:
        repos = await github_oauth.list_repos(
            connection.access_token,
            page=page,
            per_page=per_page
        )
        
        # Update last used
        connection.last_used_at = datetime.utcnow()
        await db.commit()
        
        return {
            "repos": [
                {
                    "id": repo.id,
                    "name": repo.name,
                    "full_name": repo.full_name,
                    "private": repo.private,
                    "default_branch": repo.default_branch,
                    "html_url": repo.html_url,
                    "description": repo.description,
                    "language": repo.language,
                    "updated_at": repo.updated_at,
                }
                for repo in repos
            ],
            "page": page,
            "per_page": per_page,
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch repositories: {str(e)}"
        )


@router.get("/repo/{owner}/{repo}/files")
async def get_repo_files(
    owner: str,
    repo: str,
    branch: Optional[str] = None,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get list of files in a repository for scanning."""
    result = await db.execute(
        select(GitHubConnection).where(
            GitHubConnection.user_id == user.id,
            GitHubConnection.is_active == True
        )
    )
    connection = result.scalar_one_or_none()
    
    if not connection:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="GitHub not connected"
        )
    
    try:
        # Get full repo tree
        tree = await github_oauth.get_repo_tree(
            connection.access_token,
            owner,
            repo,
            ref=branch or "main",
            recursive=True
        )
        
        # Filter to code files only
        code_extensions = {
            '.py', '.js', '.ts', '.jsx', '.tsx', '.go', '.rs', '.java',
            '.rb', '.php', '.sol', '.c', '.cpp', '.h', '.cs', '.swift',
            '.kt', '.scala', '.vue', '.svelte'
        }
        
        code_files = [
            {
                "path": item["path"],
                "size": item.get("size", 0),
                "type": item["type"],
            }
            for item in tree
            if item["type"] == "blob" and any(item["path"].endswith(ext) for ext in code_extensions)
        ]
        
        return {
            "owner": owner,
            "repo": repo,
            "branch": branch or "main",
            "files": code_files,
            "total_files": len(code_files),
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch repository files: {str(e)}"
        )
