# Claude Code CLI with AWS Bedrock Setup Guide

This guide helps team members set up Claude Code CLI to use Amazon Bedrock through AWS SSO.

## Prerequisites

- AWS account with Bedrock access
- Access to Federal Reserve AWS SSO (https://stlfrb.awsapps.com/start)
- Node.js 18+ installed
- AWS CLI v2 installed

## Step 1: Install AWS CLI v2

### Windows
Download and install from: https://awscli.amazonaws.com/AWSCLIV2.msi

### Verify Installation
```powershell
aws --version
# Should show: aws-cli/2.x.x or higher
```

## Step 2: Install Claude Code CLI

```powershell
npm install -g @anthropic-ai/claude-code
```

### Verify Installation
```powershell
claude --version
# Should show: 2.1.17 (Claude Code) or higher
```

## Step 3: Configure AWS SSO Profile

### Option A: Automatic Configuration (Recommended)

Run this PowerShell script to create the AWS config:

```powershell
# Create .aws directory if it doesn't exist
$awsDir = "$env:USERPROFILE\.aws"
if (!(Test-Path $awsDir)) {
    New-Item -ItemType Directory -Path $awsDir -Force
}

# Create or update AWS config file
$configPath = "$awsDir\config"
$bedrockProfile = @"

[profile bedrock]
sso_start_url = https://stlfrb.awsapps.com/start
sso_region = us-east-1
sso_account_id = 622957194063
sso_role_name = AWSAdministratorAccess
region = us-east-1
output = json
"@

# Check if bedrock profile already exists
if (Test-Path $configPath) {
    $content = Get-Content $configPath -Raw
    if ($content -notmatch "\[profile bedrock\]") {
        Add-Content -Path $configPath -Value $bedrockProfile
        Write-Host "✅ Added bedrock profile to existing config"
    } else {
        Write-Host "ℹ️  bedrock profile already exists"
    }
} else {
    Set-Content -Path $configPath -Value $bedrockProfile.TrimStart()
    Write-Host "✅ Created new AWS config with bedrock profile"
}

Write-Host "`n📋 AWS Config location: $configPath"
```

### Option B: Manual Configuration

1. Open or create `~/.aws/config` (Windows: `C:\Users\<YourUsername>\.aws\config`)
2. Add this profile:

```ini
[profile bedrock]
sso_start_url = https://stlfrb.awsapps.com/start
sso_region = us-east-1
sso_account_id = 622957194063
sso_role_name = AWSAdministratorAccess
region = us-east-1
output = json
```

**Note:** Replace `622957194063` with your AWS account ID if different.

## Step 4: Configure PowerShell Profile for Claude Code

### Automatic Setup (Recommended)

Run this PowerShell script:

```powershell
# Get PowerShell profile path
$profilePath = $PROFILE.CurrentUserAllHosts
$profileDir = Split-Path $profilePath -Parent

# Create profile directory if it doesn't exist
if (!(Test-Path $profileDir)) {
    New-Item -ItemType Directory -Path $profileDir -Force
}

# Claude Code Bedrock configuration
$claudeSettings = @"

# Claude Code with Amazon Bedrock settings
`$env:CLAUDE_CODE_USE_BEDROCK = "1"
`$env:AWS_PROFILE = "bedrock"
`$env:Path += ";$env:APPDATA\npm"
"@

# Add to profile if not already present
if (Test-Path $profilePath) {
    $content = Get-Content $profilePath -Raw
    if ($content -notmatch "CLAUDE_CODE_USE_BEDROCK") {
        Add-Content -Path $profilePath -Value $claudeSettings
        Write-Host "✅ Added Claude Code Bedrock settings to profile"
    } else {
        Write-Host "ℹ️  Claude Code settings already exist"
    }
} else {
    Set-Content -Path $profilePath -Value $claudeSettings
    Write-Host "✅ Created new PowerShell profile with Claude Code settings"
}

Write-Host "`n📋 PowerShell profile location: $profilePath"
Write-Host "⚠️  Restart your terminal for changes to take effect"
```

### Manual Setup

1. Find your PowerShell profile path:
   ```powershell
   $PROFILE.CurrentUserAllHosts
   ```

2. Open the file in a text editor (create if it doesn't exist)

3. Add these lines:
   ```powershell
   # Claude Code with Amazon Bedrock settings
   $env:CLAUDE_CODE_USE_BEDROCK = "1"
   $env:AWS_PROFILE = "bedrock"
   $env:Path += ";$env:APPDATA\npm"
   ```

4. Save and restart your terminal

## Step 5: Login to AWS SSO

```powershell
aws sso login --profile bedrock
```

This will:
1. Open your browser to https://stlfrb.awsapps.com/start
2. Display a device code (e.g., ABCD-EFGH)
3. Prompt you to authenticate with your Federal Reserve credentials
4. Store temporary credentials (valid for 8-12 hours)

### Verify SSO Login

```powershell
aws sts get-caller-identity --profile bedrock
```

You should see your AWS account details.

## Step 6: Test Claude Code with Bedrock

Open a **new** PowerShell terminal and run:

```powershell
claude --version
```

Then start Claude Code:

```powershell
claude
```

You should see Claude Code start and connect to Amazon Bedrock.

## Daily Usage

### Starting Claude Code

```powershell
# If credentials are still valid (within 8-12 hours)
claude

# If credentials expired, login first
aws sso login --profile bedrock
claude
```

### Check Credential Status

```powershell
aws sts get-caller-identity --profile bedrock
```

If you see an error, your credentials have expired - run `aws sso login --profile bedrock` again.

## Troubleshooting

### Issue: "claude: command not found"

**Solution:** Restart your terminal or manually add npm to PATH:
```powershell
$env:Path += ";$env:APPDATA\npm"
```

### Issue: "Unable to locate credentials"

**Solution:** Run SSO login:
```powershell
aws sso login --profile bedrock
```

### Issue: "Access Denied" or "Not Authorized"

**Solutions:**
1. Verify you have Bedrock access in your AWS account
2. Check your IAM permissions include:
   - `bedrock:InvokeModel`
   - `bedrock:InvokeModelWithResponseStream`
   - `bedrock:ListInferenceProfiles`
3. Contact your AWS administrator

### Issue: Claude Code not using Bedrock

**Solution:** Verify environment variables are set:
```powershell
$env:CLAUDE_CODE_USE_BEDROCK
$env:AWS_PROFILE
# Should show: "1" and "bedrock"
```

If not set, restart your terminal or manually set them:
```powershell
$env:CLAUDE_CODE_USE_BEDROCK = "1"
$env:AWS_PROFILE = "bedrock"
```

### Issue: SSO session expired

**Solution:** SSO sessions expire after 8-12 hours. Simply re-run:
```powershell
aws sso login --profile bedrock
```

## Additional Configuration

### Change AWS Region

Edit `~/.aws/config` and change the `region` value:
```ini
[profile bedrock]
region = us-west-2  # Change to your preferred region
```

### Use Different AWS Account

Update the `sso_account_id` in `~/.aws/config`:
```ini
[profile bedrock]
sso_account_id = YOUR_ACCOUNT_ID
```

### Multiple Profiles

You can create multiple profiles for different accounts/roles:
```ini
[profile bedrock-dev]
sso_start_url = https://stlfrb.awsapps.com/start
sso_region = us-east-1
sso_account_id = 111111111111
sso_role_name = Developer
region = us-east-1

[profile bedrock-prod]
sso_start_url = https://stlfrb.awsapps.com/start
sso_region = us-east-1
sso_account_id = 222222222222
sso_role_name = AWSAdministratorAccess
region = us-east-1
```

Then switch profiles:
```powershell
$env:AWS_PROFILE = "bedrock-prod"
```

## Security Best Practices

1. **Never commit AWS credentials** to version control
2. **Use SSO** instead of long-term access keys
3. **Rotate credentials regularly** by re-running SSO login
4. **Use least-privilege IAM roles** - only request Bedrock permissions you need
5. **Monitor usage** through AWS CloudTrail and Cost Explorer

## Support

For issues or questions:
- AWS SSO access: Contact Federal Reserve IT
- Bedrock permissions: Contact AWS administrator
- Claude Code issues: Check https://docs.claude.com/claude-code

## Quick Reference

```powershell
# Login to AWS SSO
aws sso login --profile bedrock

# Check credentials
aws sts get-caller-identity --profile bedrock

# Start Claude Code
claude

# Check Claude Code version
claude --version

# View AWS config
cat ~/.aws/config

# View PowerShell profile
cat $PROFILE.CurrentUserAllHosts
```
