/**
 * Safely copies text to the clipboard.
 * Uses navigator.clipboard if available (secure context),
 * otherwise falls back to the legacy document.execCommand('copy') method.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  // Try modern Async Clipboard API first (requires HTTPS/Secure Context)
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.warn('Async Clipboard API failed, falling back to execCommand', err);
    }
  }

  // Fallback to legacy execCommand approach
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;

    // Avoid scrolling to bottom
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.position = 'fixed';
    
    // Hide the element
    textArea.style.opacity = '0';

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    
    return successful;
  } catch (err) {
    console.error('Legacy clipboard copy failed', err);
    return false;
  }
}
