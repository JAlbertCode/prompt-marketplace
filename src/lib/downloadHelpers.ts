/**
 * Utilities for downloading prompt outputs
 */

/**
 * Download output text as a file
 * @param content The content to download
 * @param filename The name of the file
 */
export function downloadOutput(content: string, filename: string): void {
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
