[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [ValidateSet("Start", "End")]
    [string]$Mode,

    [Parameter(Mandatory = $true)]
    [ValidatePattern("^KC-[0-9]{2}$")]
    [string]$Issue
)

$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$expectedBranch = "feature/kcalix-connector"
$errors = [System.Collections.Generic.List[string]]::new()
$warnings = [System.Collections.Generic.List[string]]::new()

function Invoke-Git {
    param([Parameter(ValueFromRemainingArguments = $true)][string[]]$GitArgs)

    $excludeFile = Join-Path $repoRoot ".gitignore"
    $output = & git -c "core.excludesfile=$excludeFile" -C $repoRoot @GitArgs 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "git $($GitArgs -join ' ') falhou: $($output -join [Environment]::NewLine)"
    }
    return @($output)
}

$branch = (Invoke-Git branch --show-current | Select-Object -First 1).Trim()
if ($branch -ne $expectedBranch) {
    $errors.Add("Branch atual '$branch'; esperado '$expectedBranch'.")
}

$requiredPaths = @(
    "connector\README.md",
    "connector\docs\SPEC.md",
    "connector\docs\PRD.md",
    "connector\docs\ISSUES.md",
    "connector\docs\AGENT_SKILLS.md",
    "connector\docs\agent\ANDROID_ENGINEERING.md",
    "connector\docs\agent\EXPERT_ROUTING.md",
    "connector\docs\agent\TEST_MATRIX.md"
)

foreach ($relativePath in $requiredPaths) {
    if (-not (Test-Path -LiteralPath (Join-Path $repoRoot $relativePath))) {
        $errors.Add("Documento obrigatorio ausente: $relativePath")
    }
}

$issueRoot = Join-Path $repoRoot "connector\issues"
$issueFiles = @(
    Get-ChildItem -LiteralPath $issueRoot -Recurse -File -Filter "$Issue.md" -ErrorAction SilentlyContinue
)

if ($issueFiles.Count -ne 1) {
    $errors.Add("Esperado exatamente um packet $Issue.md; encontrados: $($issueFiles.Count).")
    $issueFile = $null
} else {
    $issueFile = $issueFiles[0]
    $packet = Get-Content -LiteralPath $issueFile.FullName -Raw -Encoding utf8
    $requiredMarkers = @(
        "**Status:**",
        "**Resultado observ",
        "## Definition of Done",
        "## Handoff"
    )

    foreach ($marker in $requiredMarkers) {
        if (-not $packet.Contains($marker)) {
            $errors.Add("Packet $Issue sem marcador obrigatorio: $marker")
        }
    }

    if ($Mode -eq "End" -and $packet -match "\*\*Status:\*\*\s+pendente") {
        $warnings.Add("O packet ainda esta com status pendente; atualizar para o estado real antes de encerrar.")
    }
}

$status = @(Invoke-Git status --short)
if ($status.Count -eq 0 -or ($status.Count -eq 1 -and [string]::IsNullOrWhiteSpace($status[0]))) {
    $warnings.Add("Working tree limpo; confirmar se a sessao ainda nao produziu alteracoes.")
    $status = @()
}

$sensitivePattern = '(?i)(^|[\\/])((\.env)(\.|$)|local\.properties$|.*\.(jks|keystore|p12|pfx)$)'
$sensitivePaths = @(
    $status |
        ForEach-Object { if ($_.Length -gt 3) { $_.Substring(3).Trim() } } |
        Where-Object { $_ -match $sensitivePattern }
)

if ($sensitivePaths.Count -gt 0) {
    $errors.Add("Arquivo sensivel aparece no status Git: $($sensitivePaths -join ', ')")
}

Write-Output "Kcalix Connector session audit"
Write-Output "Mode: $Mode"
Write-Output "Issue: $Issue"
Write-Output "Branch: $branch"
Write-Output "Packet: $(if ($issueFile) { $issueFile.FullName.Substring($repoRoot.Length + 1) } else { 'not found' })"
Write-Output "Changed entries: $($status.Count)"

foreach ($warning in $warnings) {
    Write-Warning $warning
}

if ($errors.Count -gt 0) {
    foreach ($auditError in $errors) {
        Write-Error $auditError
    }
    exit 1
}

Write-Output "Audit result: PASS"
