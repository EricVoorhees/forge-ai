"""
FORGE Smoke Test Script
Run this to verify all components are working correctly.

Usage:
    python -m tests.smoke_test
    
Or with pytest:
    pytest tests/smoke_test.py -v
"""

import asyncio
import httpx
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

BASE_URL = os.getenv("API_URL", "http://localhost:8000")

# Test data
TEST_USER = {
    "email": f"test_{os.urandom(4).hex()}@forge.ai",
    "password": "TestPassword123!",
    "name": "Test User"
}


class SmokeTest:
    """Smoke test runner for FORGE API."""
    
    def __init__(self):
        self.client = httpx.AsyncClient(base_url=BASE_URL, timeout=30.0)
        self.access_token = None
        self.api_key = None
        self.results = []
    
    async def close(self):
        await self.client.aclose()
    
    def log(self, test_name: str, passed: bool, message: str = ""):
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status} | {test_name}: {message}")
        self.results.append({"test": test_name, "passed": passed, "message": message})
    
    async def test_health(self):
        """Test health endpoint."""
        try:
            response = await self.client.get("/health")
            passed = response.status_code == 200 and response.json().get("status") == "healthy"
            self.log("Health Check", passed, f"Status: {response.status_code}")
        except Exception as e:
            self.log("Health Check", False, str(e))
    
    async def test_health_ready(self):
        """Test readiness endpoint."""
        try:
            response = await self.client.get("/health/ready")
            data = response.json()
            passed = response.status_code == 200
            checks = data.get("checks", {})
            self.log("Readiness Check", passed, f"DB: {checks.get('database', 'N/A')}, Redis: {checks.get('redis', 'N/A')}")
        except Exception as e:
            self.log("Readiness Check", False, str(e))
    
    async def test_register(self):
        """Test user registration."""
        try:
            response = await self.client.post("/auth/register", json=TEST_USER)
            passed = response.status_code == 200
            if passed:
                data = response.json()
                self.log("User Registration", True, f"User ID: {data.get('id', 'N/A')[:8]}...")
            else:
                self.log("User Registration", False, f"Status: {response.status_code}, {response.text[:100]}")
        except Exception as e:
            self.log("User Registration", False, str(e))
    
    async def test_login(self):
        """Test user login."""
        try:
            response = await self.client.post("/auth/login", json={
                "email": TEST_USER["email"],
                "password": TEST_USER["password"]
            })
            passed = response.status_code == 200
            if passed:
                data = response.json()
                self.access_token = data.get("access_token")
                self.log("User Login", True, f"Token received: {self.access_token[:20]}...")
            else:
                self.log("User Login", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log("User Login", False, str(e))
    
    async def test_get_me(self):
        """Test get current user."""
        if not self.access_token:
            self.log("Get Current User", False, "No access token")
            return
        
        try:
            response = await self.client.get(
                "/auth/me",
                headers={"Authorization": f"Bearer {self.access_token}"}
            )
            passed = response.status_code == 200
            if passed:
                data = response.json()
                self.log("Get Current User", True, f"Email: {data.get('email')}")
            else:
                self.log("Get Current User", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log("Get Current User", False, str(e))
    
    async def test_create_api_key(self):
        """Test API key creation."""
        if not self.access_token:
            self.log("Create API Key", False, "No access token")
            return
        
        try:
            response = await self.client.post(
                "/v1/api-keys",
                json={"name": "Smoke Test Key"},
                headers={"Authorization": f"Bearer {self.access_token}"}
            )
            passed = response.status_code == 200
            if passed:
                data = response.json()
                self.api_key = data.get("key")
                self.log("Create API Key", True, f"Key: {data.get('prefix')}...")
            else:
                self.log("Create API Key", False, f"Status: {response.status_code}, {response.text[:100]}")
        except Exception as e:
            self.log("Create API Key", False, str(e))
    
    async def test_list_api_keys(self):
        """Test listing API keys."""
        if not self.access_token:
            self.log("List API Keys", False, "No access token")
            return
        
        try:
            response = await self.client.get(
                "/v1/api-keys",
                headers={"Authorization": f"Bearer {self.access_token}"}
            )
            passed = response.status_code == 200
            if passed:
                data = response.json()
                self.log("List API Keys", True, f"Found {len(data)} key(s)")
            else:
                self.log("List API Keys", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log("List API Keys", False, str(e))
    
    async def test_list_models(self):
        """Test listing models."""
        try:
            response = await self.client.get("/v1/models")
            passed = response.status_code == 200
            if passed:
                data = response.json()
                models = data.get("data", [])
                self.log("List Models", True, f"Found {len(models)} model(s)")
            else:
                self.log("List Models", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log("List Models", False, str(e))
    
    async def test_get_usage(self):
        """Test getting usage stats."""
        if not self.access_token:
            self.log("Get Usage", False, "No access token")
            return
        
        try:
            response = await self.client.get(
                "/v1/usage",
                headers={"Authorization": f"Bearer {self.access_token}"}
            )
            passed = response.status_code == 200
            if passed:
                data = response.json()
                self.log("Get Usage", True, f"Total tokens: {data.get('total_tokens', 0)}")
            else:
                self.log("Get Usage", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log("Get Usage", False, str(e))
    
    async def test_get_rate_limits(self):
        """Test getting rate limits."""
        if not self.access_token:
            self.log("Get Rate Limits", False, "No access token")
            return
        
        try:
            response = await self.client.get(
                "/v1/usage/limits",
                headers={"Authorization": f"Bearer {self.access_token}"}
            )
            passed = response.status_code == 200
            if passed:
                data = response.json()
                tpm = data.get("tokens_per_minute", {})
                self.log("Get Rate Limits", True, f"TPM: {tpm.get('used', 0)}/{tpm.get('limit', 0)}")
            else:
                self.log("Get Rate Limits", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log("Get Rate Limits", False, str(e))
    
    async def test_get_subscription(self):
        """Test getting subscription status."""
        if not self.access_token:
            self.log("Get Subscription", False, "No access token")
            return
        
        try:
            response = await self.client.get(
                "/v1/billing/subscription",
                headers={"Authorization": f"Bearer {self.access_token}"}
            )
            passed = response.status_code == 200
            if passed:
                data = response.json()
                self.log("Get Subscription", True, f"Plan: {data.get('plan')}, Status: {data.get('status')}")
            else:
                self.log("Get Subscription", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log("Get Subscription", False, str(e))
    
    async def test_chat_completion_with_api_key(self):
        """Test chat completion endpoint with API key (will fail without inference server)."""
        if not self.api_key:
            self.log("Chat Completion (API Key)", False, "No API key")
            return
        
        try:
            response = await self.client.post(
                "/v1/chat/completions",
                json={
                    "model": "forge-coder",
                    "messages": [{"role": "user", "content": "Hello"}],
                    "max_tokens": 10
                },
                headers={"Authorization": f"Bearer {self.api_key}"}
            )
            # 502 is expected if inference server is not running
            if response.status_code == 502:
                self.log("Chat Completion (API Key)", True, "Auth works, inference server not available (expected)")
            elif response.status_code == 200:
                self.log("Chat Completion (API Key)", True, "Full completion successful!")
            elif response.status_code == 429:
                self.log("Chat Completion (API Key)", True, "Rate limited (auth works)")
            else:
                self.log("Chat Completion (API Key)", False, f"Status: {response.status_code}, {response.text[:100]}")
        except Exception as e:
            self.log("Chat Completion (API Key)", False, str(e))
    
    async def run_all(self):
        """Run all smoke tests."""
        print("\n" + "="*60)
        print("FORGE API Smoke Tests")
        print(f"Target: {BASE_URL}")
        print("="*60 + "\n")
        
        # Health checks
        await self.test_health()
        await self.test_health_ready()
        
        # Auth flow
        await self.test_register()
        await self.test_login()
        await self.test_get_me()
        
        # API Keys
        await self.test_create_api_key()
        await self.test_list_api_keys()
        
        # Models
        await self.test_list_models()
        
        # Usage & Billing
        await self.test_get_usage()
        await self.test_get_rate_limits()
        await self.test_get_subscription()
        
        # Completions
        await self.test_chat_completion_with_api_key()
        
        # Summary
        print("\n" + "="*60)
        passed = sum(1 for r in self.results if r["passed"])
        total = len(self.results)
        print(f"Results: {passed}/{total} tests passed")
        print("="*60 + "\n")
        
        return passed == total


async def main():
    """Main entry point."""
    test = SmokeTest()
    try:
        success = await test.run_all()
        sys.exit(0 if success else 1)
    finally:
        await test.close()


if __name__ == "__main__":
    asyncio.run(main())
