/**
 * Color analysis result with dominant color and complementary sub-color
 */
export interface ColorAnalysis {
  dominant: string;
  sub: string;
  isDark: boolean;
}

/**
 * Calculates the perceived brightness of a color (0-255)
 */
function getColorBrightness(r: number, g: number, b: number): number {
  // Using the relative luminance formula
  return (0.299 * r + 0.587 * g + 0.114 * b);
}

/**
 * Generates a complementary sub-color based on the dominant color's brightness
 */
function generateSubColor(r: number, g: number, b: number): string {
  const brightness = getColorBrightness(r, g, b);
  const isDark = brightness < 128;
  
  if (isDark) {
    // For dark colors, create a lighter complementary color
    const lightR = Math.min(255, r + 100);
    const lightG = Math.min(255, g + 100);
    const lightB = Math.min(255, b + 100);
    return `#${lightR.toString(16).padStart(2, '0')}${lightG.toString(16).padStart(2, '0')}${lightB.toString(16).padStart(2, '0')}`;
  } else {
    // For light colors, create a darker complementary color
    const darkR = Math.max(0, r - 100);
    const darkG = Math.max(0, g - 100);
    const darkB = Math.max(0, b - 100);
    return `#${darkR.toString(16).padStart(2, '0')}${darkG.toString(16).padStart(2, '0')}${darkB.toString(16).padStart(2, '0')}`;
  }
}

/**
 * Extracts the dominant color from an image URL with complementary sub-color
 * @param imageUrl - The URL of the image to analyze
 * @param quality - Sampling quality (1-10, higher = more accurate but slower)
 * @returns Promise that resolves to color analysis with dominant and sub colors
 */
export async function getDominantColor(
  imageUrl: string, 
  quality = 5
): Promise<ColorAnalysis> {
  return new Promise((resolve, reject) => {
    // Create a canvas element
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    // Create an image element
    const img = new Image();
    
    // Handle CORS issues
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      // Set canvas size to image size
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw image to canvas
      ctx.drawImage(img, 0, 0);
      
      try {
        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Color frequency map
        const colorMap = new Map<string, number>();
        
        // Sample pixels based on quality (skip pixels for performance)
        const step = Math.max(1, Math.floor(10 / quality));
        
        for (let i = 0; i < data.length; i += 4 * step) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];
          
          // Skip transparent pixels
          if (a < 128) continue;
          
          // Round colors to reduce noise
          const roundedR = Math.round(r / 5) * 5;
          const roundedG = Math.round(g / 5) * 5;
          const roundedB = Math.round(b / 5) * 5;
          
          const colorKey = `${roundedR},${roundedG},${roundedB}`;
          colorMap.set(colorKey, (colorMap.get(colorKey) || 0) + 1);
        }
        
        // Find the most frequent color
        let dominantColor = '';
        let maxCount = 0;
        
        for (const [color, count] of colorMap.entries()) {
          if (count > maxCount) {
            maxCount = count;
            dominantColor = color;
          }
        }
        
        if (!dominantColor) {
          reject(new Error('Could not determine dominant color'));
          return;
        }
        
        // Convert to hex and generate sub-color
        const [r, g, b] = dominantColor.split(',').map(Number);
        const dominantHex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
        const subHex = generateSubColor(r, g, b);
        const isDark = getColorBrightness(r, g, b) < 128;
        
        resolve({
          dominant: dominantHex,
          sub: subHex,
          isDark
        });
      } catch (error) {
        reject(new Error(`Failed to process image data: ${error}`));
      }
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    // Start loading the image
    img.src = imageUrl;
  });
}

/**
 * Alternative version that returns RGB values for both colors
 */
export async function getDominantColorRGB(
  imageUrl: string, 
  quality = 5
): Promise<{ 
  dominant: { r: number; g: number; b: number };
  sub: { r: number; g: number; b: number };
  isDark: boolean;
}> {
  const analysis = await getDominantColor(imageUrl, quality);
  
  // Convert hex to RGB for dominant color
  const dominantR = parseInt(analysis.dominant.slice(1, 3), 16);
  const dominantG = parseInt(analysis.dominant.slice(3, 5), 16);
  const dominantB = parseInt(analysis.dominant.slice(5, 7), 16);
  
  // Convert hex to RGB for sub color
  const subR = parseInt(analysis.sub.slice(1, 3), 16);
  const subG = parseInt(analysis.sub.slice(3, 5), 16);
  const subB = parseInt(analysis.sub.slice(5, 7), 16);
  
  return { 
    dominant: { r: dominantR, g: dominantG, b: dominantB },
    sub: { r: subR, g: subG, b: subB },
    isDark: analysis.isDark
  };
}

/**
 * Usage example:
 * 
 * try {
 *   const analysis = await getDominantColor('https://example.com/image.jpg');
 *   console.log('Dominant color:', analysis.dominant); // e.g., "#2a3f5f"
 *   console.log('Sub color:', analysis.sub);           // e.g., "#9ab0c5" (lighter)
 *   console.log('Is dark:', analysis.isDark);          // e.g., true
 *   
 *   const rgbAnalysis = await getDominantColorRGB('https://example.com/image.jpg');
 *   console.log('Dominant RGB:', rgbAnalysis.dominant); // e.g., { r: 42, g: 63, b: 95 }
 *   console.log('Sub RGB:', rgbAnalysis.sub);           // e.g., { r: 154, g: 176, b: 197 }
 * } catch (error) {
 *   console.error('Error extracting colors:', error);
 * }
 */