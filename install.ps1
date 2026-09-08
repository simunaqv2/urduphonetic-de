<#
  Installs the UrduWeb Urdu Phonetic keyboard layout (German QWERTZ).
  Run:  powershell -ExecutionPolicy Bypass -File .\install.ps1
  Prompts for elevation to write the DLLs and HKLM key, then registers the
  language for the *calling* (unelevated) user.
#>
[CmdletBinding()]
param([switch]$SystemPartOnly)
$ErrorActionPreference = 'Stop'

$KLID='a0000420'; $DllName='UrduWeb.dll'; $LayoutText='UrduWeb Urdu Phonetic'
$LangTag='ur-PK'; $Tip='0420:A0000420'
$Root = $PSScriptRoot

function Test-Admin {
  [Security.Principal.WindowsPrincipal]::new(
    [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole('Administrators')
}

function Install-System {
  if($env:PROCESSOR_ARCHITECTURE -eq 'ARM64'){
    throw 'ARM64 Windows is not supported: kbdutool cannot produce ARM64 layout DLLs.'
  }
  if([Environment]::Is64BitOperatingSystem){
    Copy-Item "$Root\bin\amd64\$DllName" "$env:SystemRoot\System32\$DllName" -Force
    Copy-Item "$Root\bin\wow64\$DllName" "$env:SystemRoot\SysWOW64\$DllName" -Force
    Write-Host "  copied x64 -> System32, x86 -> SysWOW64"
  } else {
    Copy-Item "$Root\bin\i386\$DllName" "$env:SystemRoot\System32\$DllName" -Force
    Write-Host "  copied x86 -> System32"
  }
  $base = 'HKLM:\SYSTEM\CurrentControlSet\Control\Keyboard Layouts'
  $used = Get-ChildItem $base | ForEach-Object { (Get-ItemProperty $_.PSPath).'Layout Id' } |
          Where-Object { $_ } | ForEach-Object { $_.ToString().Trim() }
  $id = if(Test-Path "$base\$KLID"){ (Get-ItemProperty "$base\$KLID").'Layout Id' } else { $null }
  if(-not $id){
    $id = 1..500 | ForEach-Object { '{0:x4}' -f $_ } |
          Where-Object { $used -notcontains $_ } | Select-Object -First 1
  }
  if(-not $id){ throw 'No free Layout Id available.' }
  New-Item "$base\$KLID" -Force | Out-Null
  foreach($kv in @{'Layout File'=$DllName;'Layout Text'=$LayoutText;'Layout Id'=$id}.GetEnumerator()){
    New-ItemProperty "$base\$KLID" -Name $kv.Key -Value $kv.Value -PropertyType String -Force | Out-Null
  }
  Write-Host "  registered KLID $KLID with Layout Id $id"
}

function Register-Language {
  $l = Get-WinUserLanguageList
  if(-not ($l | Where-Object { $_.LanguageTag -like 'ur*' })){ $l.Add($LangTag) }
  $ur = $l | Where-Object { $_.LanguageTag -like 'ur*' } | Select-Object -First 1
  if($ur.InputMethodTips -notcontains $Tip){ $ur.InputMethodTips.Clear(); $ur.InputMethodTips.Add($Tip) }
  Set-WinUserLanguageList $l -Force
  Write-Host "  registered $($ur.LanguageTag) with $Tip"
}

if($SystemPartOnly){ Install-System; exit 0 }

Write-Host "Installing $LayoutText ..."
if(Test-Admin){ Install-System }
else {
  Write-Host "  requesting elevation for System32 + HKLM (accept the UAC prompt)"
  $p = Start-Process powershell.exe -Verb RunAs -Wait -PassThru -ArgumentList @(
        '-NoProfile','-ExecutionPolicy','Bypass','-File',"`"$PSCommandPath`"",'-SystemPartOnly')
  if($p.ExitCode -ne 0){ throw "Elevated step failed (exit $($p.ExitCode)). Nothing was changed." }
}
Register-Language
Write-Host ""
Write-Host "Done. Switch layouts with Win+Space."
Write-Host "Already-running apps may need a restart before they see the new layout."
