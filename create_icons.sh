#!/bin/bash

# Створюємо SVG іконку
cat > icon.svg << 'SVGEOF'
<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#4facfe;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="64" fill="url(#grad)"/>
  <circle cx="256" cy="180" r="40" fill="white" opacity="0.9"/>
  <rect x="200" y="220" width="112" height="8" rx="4" fill="white" opacity="0.9"/>
  <rect x="220" y="240" width="72" height="60" rx="8" fill="white" opacity="0.9"/>
  <circle cx="236" cy="270" r="12" fill="#667eea"/>
  <circle cx="276" cy="270" r="12" fill="#667eea"/>
  <path d="M 200 310 Q 256 330 312 310" stroke="white" stroke-width="6" fill="none" opacity="0.9"/>
  <text x="256" y="400" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="white" text-anchor="middle">ДРОН</text>
</svg>
SVGEOF

echo "SVG іконка створена"
