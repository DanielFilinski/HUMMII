# GitHub Setup Guide

This guide will help you configure GitHub repository settings for Hummy project.

## 1. Enable GitHub Features

### Repository Settings

Navigate to: `Settings` → `Code security and analysis`

✅ **Enable these features:**
- [x] Dependency graph
- [x] Dependabot alerts
- [x] Dependabot security updates
- [x] Grouped security updates
- [x] Code scanning (CodeQL)
- [x] Secret scanning
- [x] Push protection

### Branch Protection

Navigate to: `Settings` → `Branches` → `Add rule`

**Branch name pattern:** `main`

✅ **Configure:**
- [x] Require a pull request before merging
  - [x] Require approvals (at least 1)
  - [x] Dismiss stale pull request approvals when new commits are pushed
- [x] Require status checks to pass before merging
  - [x] Require branches to be up to date before merging
  - Status checks to require:
    - `lint (api)`
    - `lint (frontend)`
    - `lint (admin)`
    - `test (api)`
    - `build (api)`
    - `build (frontend)`
    - `build (admin)`
- [x] Require conversation resolution before merging
- [x] Do not allow bypassing the above settings

## 2. Configure GitHub Secrets

Navigate to: `Settings` → `Secrets and variables` → `Actions`

### Required Secrets

```bash
# Docker Hub (for Docker image publishing)
DOCKER_USERNAME=your-dockerhub-username
DOCKER_PASSWORD=your-dockerhub-password-or-token

# Snyk (for security scanning)
SNYK_TOKEN=your-snyk-api-token

# Notifications (optional)
SLACK_WEBHOOK=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
SLACK_WEBHOOK_SECURITY=https://hooks.slack.com/services/YOUR/SECURITY/WEBHOOK/URL

# Email notifications (optional)
EMAIL_USERNAME=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password
SECURITY_EMAIL=security-team@hummy.ca

# GitLeaks (optional, for private repos)
GITLEAKS_LICENSE=your-gitleaks-license-key
```

### How to Get These Tokens

#### Docker Hub
1. Go to https://hub.docker.com/
2. Sign up or log in
3. Go to `Account Settings` → `Security`
4. Click `New Access Token`
5. Copy token and add to GitHub secrets

#### Snyk
1. Go to https://snyk.io/
2. Sign up (free for open source)
3. Go to `Account Settings`
4. Copy API token
5. Add to GitHub secrets

#### Slack Webhook
1. Go to https://api.slack.com/apps
2. Create new app or select existing
3. Enable Incoming Webhooks
4. Add webhook to workspace
5. Copy webhook URL

#### Gmail App Password
1. Enable 2FA on Gmail account
2. Go to Google Account settings
3. Security → 2-Step Verification → App passwords
4. Generate app password
5. Copy and add to GitHub secrets

## 3. Configure Environment Variables

For GitHub Actions, add these as **variables** (not secrets):

Navigate to: `Settings` → `Secrets and variables` → `Actions` → `Variables`

```bash
NODE_VERSION=20
PNPM_VERSION=8
```

## 4. Enable GitHub Actions

Navigate to: `Settings` → `Actions` → `General`

✅ **Configure:**
- [x] Allow all actions and reusable workflows
- Workflow permissions:
  - [x] Read and write permissions
  - [x] Allow GitHub Actions to create and approve pull requests

## 5. Set Up Code Scanning

Navigate to: `Security` → `Code scanning` → `Set up code scanning`

- Select **CodeQL Analysis**
- Use the workflow we created (`.github/workflows/security.yml`)
- CodeQL will scan on every push and PR

## 6. Dependabot Configuration

The `.github/dependabot.yml` file is already configured.

To verify it's working:
1. Navigate to: `Insights` → `Dependency graph` → `Dependabot`
2. Check if updates are scheduled
3. You should see PRs from Dependabot within a week

## 7. Enable Discussions (Optional)

Navigate to: `Settings` → `General` → `Features`

- [x] Discussions

This allows community discussions about the project.

## 8. Set Up Labels

Create these labels for better PR organization:

Navigate to: `Issues` → `Labels` → `New label`

```
dependencies (color: #0366d6)
security (color: #d73a4a)
api (color: #fbca04)
frontend (color: #0e8a16)
admin (color: #5319e7)
docker (color: #0075ca)
ci-cd (color: #1d76db)
github-actions (color: #bfd4f2)
documentation (color: #0075ca)
bug (color: #d73a4a)
enhancement (color: #a2eeef)
```

These labels are used by Dependabot and CI/CD workflows.

## 9. Configure Notifications

### For Security Alerts

Navigate to: `Settings` → `Code security and analysis`

Each feature has notification settings. Ensure:
- Email notifications are enabled
- Critical alerts notify immediately

### For CI/CD

Workflow failures will:
- Appear in GitHub notifications
- Send Slack messages (if configured)
- Send email alerts (if configured)

## 10. Verify Setup

After configuration, test by:

1. **Create a test PR**:
   ```bash
   git checkout -b test/github-setup
   echo "test" >> test.txt
   git add test.txt
   git commit -m "test: verify GitHub Actions"
   git push origin test/github-setup
   ```

2. **Check Actions tab**:
   - CI/CD pipeline should run
   - Security checks should run
   - All checks should pass or show expected failures

3. **Check Security tab**:
   - CodeQL analysis should be scheduled
   - Dependabot alerts should be visible
   - Secret scanning should be active

## 11. Security Best Practices

✅ **Do:**
- Rotate secrets regularly (every 90 days)
- Use principle of least privilege for tokens
- Review Dependabot PRs within 72 hours
- Respond to security alerts within 24 hours
- Keep GitHub Actions up to date

❌ **Don't:**
- Share secrets in code or commits
- Disable security features without reason
- Ignore Dependabot security updates
- Use personal access tokens in production
- Commit `.env` files

## 12. Monitoring

### Regular Checks

**Weekly:**
- Review Dependabot PRs
- Check security alerts
- Monitor CI/CD failures

**Monthly:**
- Audit access permissions
- Review branch protection rules
- Update documentation

**Quarterly:**
- Rotate secrets and tokens
- Security audit of dependencies
- Review and update GitHub Actions

## Troubleshooting

### CI/CD Fails

1. Check workflow logs in Actions tab
2. Verify secrets are correctly set
3. Check if node_modules or package-lock.json are committed (they shouldn't be)
4. Ensure `.env.example` is committed but `.env` is not

### Dependabot Not Working

1. Verify `dependabot.yml` syntax
2. Check if dependencies are outdated
3. Look for Dependabot alerts in Security tab
4. Enable Dependabot in repository settings

### Security Scans Failing

1. Check if tokens (SNYK_TOKEN) are valid
2. Review security scan logs
3. Some scans may require paid plans for private repos
4. CodeQL is free for public repos

## Support

If you encounter issues:
1. Check GitHub Actions logs
2. Review [GitHub Docs](https://docs.github.com/)
3. Check service status: https://www.githubstatus.com/
4. Open an issue in the repository

---

**Last Updated**: October 2025

