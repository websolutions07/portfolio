# Minimal static file server for local preview.
#   powershell -ExecutionPolicy Bypass -File serve.ps1 [-Port 4321]

param(
  [int]$Port = 4321,
  [string]$Root = $PSScriptRoot
)

$ErrorActionPreference = 'Stop'

$mime = @{
  '.html' = 'text/html; charset=utf-8'
  '.css'  = 'text/css; charset=utf-8'
  '.js'   = 'text/javascript; charset=utf-8'
  '.svg'  = 'image/svg+xml'
  '.json' = 'application/json; charset=utf-8'
  '.png'  = 'image/png'
  '.jpg'  = 'image/jpeg'
  '.ico'  = 'image/x-icon'
  '.woff2' = 'font/woff2'
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()
Write-Output "serving $Root on http://localhost:$Port/"

try {
  while ($listener.IsListening) {
    $context = $listener.GetContext()
    $request = $context.Request
    $response = $context.Response

    try {
      $rel = [System.Uri]::UnescapeDataString($request.Url.AbsolutePath).TrimStart('/')
      if ([string]::IsNullOrWhiteSpace($rel)) { $rel = 'index.html' }

      $full = Join-Path $Root $rel
      $resolvedRoot = [System.IO.Path]::GetFullPath($Root)
      $resolved = [System.IO.Path]::GetFullPath($full)

      # Refuse anything that escapes the served directory.
      if (-not $resolved.StartsWith($resolvedRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
        $response.StatusCode = 403
        $body = [System.Text.Encoding]::UTF8.GetBytes('403 forbidden')
      }
      elseif (Test-Path -LiteralPath $resolved -PathType Leaf) {
        $ext = [System.IO.Path]::GetExtension($resolved).ToLowerInvariant()
        $type = $mime[$ext]
        if (-not $type) { $type = 'application/octet-stream' }
        $response.ContentType = $type
        $response.Headers.Add('Cache-Control', 'no-store')
        $body = [System.IO.File]::ReadAllBytes($resolved)
        Write-Output "200 $rel"
      }
      else {
        $response.StatusCode = 404
        $body = [System.Text.Encoding]::UTF8.GetBytes('404 not found')
        Write-Output "404 $rel"
      }

      $response.ContentLength64 = $body.Length
      $response.OutputStream.Write($body, 0, $body.Length)
    }
    catch {
      Write-Output "error: $($_.Exception.Message)"
    }
    finally {
      $response.Close()
    }
  }
}
finally {
  $listener.Stop()
  $listener.Close()
}
