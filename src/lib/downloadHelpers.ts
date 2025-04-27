/**
 * Downloads text content as a .txt file
 */
export function downloadTextFile(content: string, filename = 'output.txt'): void {
  // Create a blob with the text content
  const blob = new Blob([content], { type: 'text/plain' });
  
  // Create a download link
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  // Set link properties
  link.href = url;
  link.download = filename;
  
  // Append to body, click, and clean up
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Downloads an image from a URL as a .jpg file
 */
export async function downloadImage(imageUrl: string, filename = 'output.jpg'): Promise<void> {
  try {
    // Fetch the image
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    
    // Create a download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    // Set link properties
    link.href = url;
    link.download = filename;
    
    // Append to body, click, and clean up
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading image:', error);
    throw error;
  }
}

/**
 * Helper to generate a filename based on prompt title and current date
 */
export function generateFilename(promptTitle: string, extension: string): string {
  // Format the date
  const date = new Date();
  const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  
  // Clean the title to make it filename-friendly
  const cleanTitle = promptTitle
    .replace(/[^\w\s-]/g, '')  // Remove special characters
    .trim()
    .replace(/\s+/g, '-')      // Replace spaces with hyphens
    .toLowerCase();
  
  return `${cleanTitle}-${dateStr}.${extension}`;
}
