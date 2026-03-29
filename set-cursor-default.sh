#!/bin/bash
# Configura Cursor como app default para .md en macOS

# Instala duti si no está (requiere Homebrew)
if ! command -v duti &> /dev/null; then
  echo "Instalando duti via Homebrew..."
  brew install duti
fi

# Obtener el Bundle ID de Cursor
CURSOR_BUNDLE=$(defaults read /Applications/Cursor.app/Contents/Info.plist CFBundleIdentifier 2>/dev/null)

if [ -z "$CURSOR_BUNDLE" ]; then
  echo "No se encontró Cursor en /Applications. Buscando..."
  CURSOR_PATH=$(mdfind "kMDItemCFBundleIdentifier == 'com.todesktop.230313mzl4w4u92'" 2>/dev/null | head -1)
  CURSOR_BUNDLE="com.todesktop.230313mzl4w4u92"
fi

echo "Bundle ID de Cursor: $CURSOR_BUNDLE"

# Setear Cursor como default para .md
duti -s "$CURSOR_BUNDLE" .md all
duti -s "$CURSOR_BUNDLE" public.plain-text all

echo "✅ Cursor configurado como app default para archivos .md"
echo "Cierra y reabre Finder para ver el cambio."
