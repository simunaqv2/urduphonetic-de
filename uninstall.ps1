<#
  Removes the UrduWeb Urdu Phonetic keyboard layout.
  Run:  powershell -ExecutionPolicy Bypass -File .\uninstall.ps1
#>
[CmdletBinding()]
param([switch]$SystemPartOnly)
$ErrorActionPreference = 'Stop'
$KLID='a0000420'; $DllName='UrduWeb.dll'

function Test-Admin {
  [Security.Principal.WindowsPrincipal]::new(
    [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole('Administrators')
}
function Remove-System {
  foreach($p in "$env:SystemRoot\System32\$DllName","$env:SystemRoot\SysWOW64\$DllName"){
    if(Test-Path $p){ Remove-Item $p -Force; Write-Host "  removed $p" }
  }
  $k = "HKLM:\SYSTEM\CurrentControlSet\Control\Keyboard Layouts\$KLID"
  if(Test-Path $k){ Remove-Item $k -Recurse -Force; Write-Host "  removed $k" }
}

if($SystemPartOnly){ Remove-System; exit 0 }

Write-Host "Removing the layout from your language list ..."
$l = Get-WinUserLanguageList
$ur = $l | Where-Object { $_.LanguageTag -like 'ur*' }
if($ur){ [void]$l.Remove($ur); Set-WinUserLanguageList $l -Force; Write-Host "  removed $($ur.LanguageTag)" }
else { Write-Host "  no Urdu entry present" }

if(Test-Admin){ Remove-System }
else {
  Write-Host "  requesting elevation to remove DLLs and registry key"
  $p = Start-Process powershell.exe -Verb RunAs -Wait -PassThru -ArgumentList @(
        '-NoProfile','-ExecutionPolicy','Bypass','-File',"`"$PSCommandPath`"",'-SystemPartOnly')
  if($p.ExitCode -ne 0){ Write-Warning "Elevated step failed; DLLs may remain." }
}
Write-Host "Done."
