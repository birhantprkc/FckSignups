import re
from urllib.parse import urlparse

import requests


class GitHubBridge:
    def toAPIURL(self, url):
        parsed = urlparse(url)

        path_parts = parsed.path.strip("/").split("/")
        if len(path_parts) < 2:
            raise ValueError("Invalid GitHub repository URL")

        owner, repo = path_parts[0], path_parts[1]

        api_url = f"https://api.github.com/repos/{owner}/{repo}"

        return api_url


class GitHubRepoBridge(GitHubBridge):
    def __init__(self, github_repo_link):
        self._stars = 0
        self._license = ""
        self._url = github_repo_link
        self._queryRepo()

    def _queryRepo(self):
        api_url = self.toAPIURL(self._url)

        response = requests.get(api_url, timeout=10)
        response.raise_for_status()

        data = response.json()

        self._stars = data.get("stargazers_count", 0)

        license_info = data.get("license")
        self._license = license_info.get("spdx_id", "") if license_info else ""

    def getStars(self):
        return self._stars

    def getLicense(self):
        return self._license

    def getURL(self):
        return self._url


class GitHubIssueBridge(GitHubBridge):
    _submission_automation_string = None

    def __init__(self, github_repo_link):
        self._getAutomationString(github_repo_link)

    def _getAutomationString(self, github_repo_link):
        api_url = f"{self.toAPIURL(github_repo_link)}/issues/{github_repo_link.split('/')[-1]}"

        response = requests.get(api_url, timeout=10)
        response.raise_for_status()

        data = response.json()

        match = re.search(r"<SUBMISSION>(.*?)</SUBMISSION>", data["body"], re.DOTALL)

        if match:
            self._submission_automation_string = match.group(1)

    def getAutomationString(self):
        return self._submission_automation_string
