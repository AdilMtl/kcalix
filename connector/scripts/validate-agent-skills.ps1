[CmdletBinding()]
param()

$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$skillNames = @("start-connector", "execute-connector-issue", "end-connector")
$relativeFiles = @("SKILL.md", "agents\openai.yaml")
$errors = [System.Collections.Generic.List[string]]::new()

foreach ($skillName in $skillNames) {
    $codexRoot = Join-Path $repoRoot ".agents\skills\$skillName"
    $claudeRoot = Join-Path $repoRoot ".claude\skills\$skillName"

    foreach ($relativeFile in $relativeFiles) {
        $codexFile = Join-Path $codexRoot $relativeFile
        $claudeFile = Join-Path $claudeRoot $relativeFile

        if (-not (Test-Path -LiteralPath $codexFile)) {
            $errors.Add("Ausente: $($codexFile.Substring($repoRoot.Length + 1))")
            continue
        }
        if (-not (Test-Path -LiteralPath $claudeFile)) {
            $errors.Add("Ausente: $($claudeFile.Substring($repoRoot.Length + 1))")
            continue
        }

        $codexHash = (Get-FileHash -LiteralPath $codexFile -Algorithm SHA256).Hash
        $claudeHash = (Get-FileHash -LiteralPath $claudeFile -Algorithm SHA256).Hash
        if ($codexHash -ne $claudeHash) {
            $errors.Add("Copias divergentes para $skillName/$relativeFile")
        }
    }

    $skillFile = Join-Path $codexRoot "SKILL.md"
    if (Test-Path -LiteralPath $skillFile) {
        $content = Get-Content -LiteralPath $skillFile -Raw -Encoding utf8
        if ($content -notmatch "(?s)^---\r?\nname:\s+$([regex]::Escape($skillName))\r?\ndescription:\s+.+?\r?\n---") {
            $errors.Add("Frontmatter invalido em .agents/skills/$skillName/SKILL.md")
        }
        if ($content -cmatch "\[TODO|TODO:") {
            $errors.Add("Placeholder TODO em .agents/skills/$skillName/SKILL.md")
        }
    }
}

$requiredDocs = @(
    "connector\docs\AGENT_SKILLS.md",
    "connector\docs\agent\ANDROID_ENGINEERING.md",
    "connector\docs\agent\EXPERT_ROUTING.md",
    "connector\docs\agent\TEST_MATRIX.md",
    "connector\scripts\audit-connector-session.ps1"
)

foreach ($relativePath in $requiredDocs) {
    if (-not (Test-Path -LiteralPath (Join-Path $repoRoot $relativePath))) {
        $errors.Add("Referencia compartilhada ausente: $relativePath")
    }
}

if ($errors.Count -gt 0) {
    foreach ($validationError in $errors) {
        Write-Error $validationError
    }
    exit 1
}

Write-Output "Skill mirror validation: PASS"
Write-Output "Validated skills: $($skillNames -join ', ')"
