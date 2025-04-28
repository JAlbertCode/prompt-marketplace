/**
 * Utilities for downloading prompt outputs
 */

/**
 * Download text output as a file
 * @param content The content to download
 * @param filename The name of the file
 */
export function downloadTextFile(content: string, filename: string): void {
  // Create a blob from the content
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  
  // Create a link element
  const link = document.createElement('a');
  
  // Set link properties
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  
  // Append link to body
  document.body.appendChild(link);
  
  // Click the link
  link.click();
  
  // Clean up
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

/**
 * Generate a filename for downloaded content
 * @param title The base title for the filename
 * @param extension The file extension (without the dot)
 * @returns A formatted filename
 */
export function generateFilename(title: string, extension: string): string {
  // Sanitize the title
  const sanitizedTitle = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  
  // Add timestamp for uniqueness
  const timestamp = Date.now();
  
  // Return formatted filename
  return `${sanitizedTitle}-${timestamp}.${extension}`;
}

/**
 * Download image output as a file
 * @param imageUrl The URL of the image
 * @param filename The name of the file
 */
export async function downloadImage(imageUrl: string, filename: string): Promise<void> {
  try {
    // Fetch the image data
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    
    // Create a link element
    const link = document.createElement('a');
    
    // Set link properties
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    
    // Append link to body
    document.body.appendChild(link);
    
    // Click the link
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  } catch (error) {
    console.error('Error downloading image:', error);
    throw error;
  }
}

/**
 * Download output (backwards compatibility)
 * @param content The content to download
 * @param filename The name of the file
 */
export function downloadOutput(content: string, filename: string): void {
  downloadTextFile(content, filename);
}
