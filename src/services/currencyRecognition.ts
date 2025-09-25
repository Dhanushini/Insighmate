interface CurrencyResult {
  type: 'note' | 'coin';
  denomination: string;
  currency: string;
  confidence: number;
  boundingBox?: { x: number; y: number; width: number; height: number };
}

class CurrencyRecognitionService {
  private isInitialized = false;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private isScanning = false;

  // Indian currency patterns with actual colors and features
  private indianCurrencyPatterns = {
    notes: [
      { 
        denomination: '₹10', 
        value: 10,
        colorPattern: { r: 255, g: 165, b: 0 }, // Orange/Brown
        dominantColors: [
          { r: 255, g: 140, b: 0 },
          { r: 218, g: 165, b: 32 },
          { r: 255, g: 215, b: 0 }
        ],
        features: ['orange', 'brown', 'saffron']
      },
      { 
        denomination: '₹20', 
        value: 20,
        colorPattern: { r: 255, g: 255, b: 0 }, // Yellow/Green
        dominantColors: [
          { r: 255, g: 255, b: 0 },
          { r: 173, g: 255, b: 47 },
          { r: 154, g: 205, b: 50 }
        ],
        features: ['yellow', 'green', 'lime']
      },
      { 
        denomination: '₹50', 
        value: 50,
        colorPattern: { r: 255, g: 20, b: 147 }, // Pink/Magenta
        dominantColors: [
          { r: 255, g: 20, b: 147 },
          { r: 255, g: 105, b: 180 },
          { r: 219, g: 112, b: 147 }
        ],
        features: ['pink', 'magenta', 'rose']
      },
      { 
        denomination: '₹100', 
        value: 100,
        colorPattern: { r: 128, g: 0, b: 128 }, // Purple/Violet
        dominantColors: [
          { r: 128, g: 0, b: 128 },
          { r: 138, g: 43, b: 226 },
          { r: 147, g: 112, b: 219 }
        ],
        features: ['purple', 'violet', 'lavender']
      },
      { 
        denomination: '₹200', 
        value: 200,
        colorPattern: { r: 255, g: 255, b: 0 }, // Bright Yellow
        dominantColors: [
          { r: 255, g: 255, b: 0 },
          { r: 255, g: 215, b: 0 },
          { r: 255, g: 140, b: 0 }
        ],
        features: ['yellow', 'golden', 'bright']
      },
      { 
        denomination: '₹500', 
        value: 500,
        colorPattern: { r: 128, g: 128, b: 128 }, // Stone Grey
        dominantColors: [
          { r: 128, g: 128, b: 128 },
          { r: 169, g: 169, b: 169 },
          { r: 105, g: 105, b: 105 }
        ],
        features: ['grey', 'stone', 'silver']
      },
      { 
        denomination: '₹2000', 
        value: 2000,
        colorPattern: { r: 255, g: 20, b: 147 }, // Magenta
        dominantColors: [
          { r: 255, g: 20, b: 147 },
          { r: 255, g: 0, b: 255 },
          { r: 199, g: 21, b: 133 }
        ],
        features: ['magenta', 'pink', 'bright']
      }
    ],
    coins: [
      { 
        denomination: '₹1', 
        value: 1,
        colorPattern: { r: 192, g: 192, b: 192 }, // Steel
        dominantColors: [
          { r: 192, g: 192, b: 192 },
          { r: 169, g: 169, b: 169 },
          { r: 211, g: 211, b: 211 }
        ],
        features: ['steel', 'silver', 'metallic']
      },
      { 
        denomination: '₹2', 
        value: 2,
        colorPattern: { r: 192, g: 192, b: 192 }, // Steel
        dominantColors: [
          { r: 192, g: 192, b: 192 },
          { r: 169, g: 169, b: 169 },
          { r: 211, g: 211, b: 211 }
        ],
        features: ['steel', 'silver', 'metallic']
      },
      { 
        denomination: '₹5', 
        value: 5,
        colorPattern: { r: 192, g: 192, b: 192 }, // Steel
        dominantColors: [
          { r: 192, g: 192, b: 192 },
          { r: 169, g: 169, b: 169 },
          { r: 211, g: 211, b: 211 }
        ],
        features: ['steel', 'silver', 'metallic']
      },
      { 
        denomination: '₹10', 
        value: 10,
        colorPattern: { r: 255, g: 215, b: 0 }, // Bi-metallic (outer ring)
        dominantColors: [
          { r: 255, g: 215, b: 0 },
          { r: 192, g: 192, b: 192 },
          { r: 218, g: 165, b: 32 }
        ],
        features: ['golden', 'silver', 'bimetallic']
      }
    ]
  };

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      this.canvas = document.createElement('canvas');
      this.ctx = this.canvas.getContext('2d');
      this.isInitialized = true;
      console.log('Indian currency recognition service initialized');
    } catch (error) {
      console.error('Failed to initialize currency recognition:', error);
    }
  }

  async recognizeCurrency(videoElement: HTMLVideoElement): Promise<CurrencyResult[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!this.canvas || !this.ctx || !videoElement.videoWidth || !videoElement.videoHeight) {
      return [];
    }

    try {
      // Set canvas size to match video
      this.canvas.width = Math.min(videoElement.videoWidth, 640);
      this.canvas.height = Math.min(videoElement.videoHeight, 480);
      
      // Draw current video frame to canvas
      this.ctx.drawImage(videoElement, 0, 0, this.canvas.width, this.canvas.height);
      
      // Get image data for analysis
      const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
      
      // Analyze the image for Indian currency
      const results = await this.analyzeIndianCurrency(imageData);
      
      return results;
    } catch (error) {
      console.error('Currency recognition error:', error);
      return [];
    }
  }

  private async analyzeIndianCurrency(imageData: ImageData): Promise<CurrencyResult[]> {
    const results: CurrencyResult[] = [];
    
    // Extract dominant colors from the image
    const dominantColors = this.extractDominantColors(imageData);
    
    // Analyze brightness and contrast for currency detection
    const brightness = this.calculateAverageBrightness(imageData);
    const hasHighContrast = this.detectHighContrast(imageData);
    
    // Check for rectangular shapes (notes)
    const rectangularRegions = this.detectRectangularShapes(imageData);
    if (rectangularRegions.length > 0) {
      const noteMatch = this.matchIndianNote(dominantColors, brightness, hasHighContrast);
      if (noteMatch) {
        results.push({
          type: 'note',
          denomination: noteMatch.denomination,
          currency: 'INR',
          confidence: noteMatch.confidence,
          boundingBox: rectangularRegions[0]
        });
      }
    }
    
    // Check for circular shapes (coins)
    const circularRegions = this.detectCircularShapes(imageData);
    if (circularRegions.length > 0) {
      const coinMatch = this.matchIndianCoin(dominantColors, brightness);
      if (coinMatch) {
        results.push({
          type: 'coin',
          denomination: coinMatch.denomination,
          currency: 'INR',
          confidence: coinMatch.confidence,
          boundingBox: circularRegions[0]
        });
      }
    }
    
    return results;
  }

  private extractDominantColors(imageData: ImageData): { r: number; g: number; b: number; count: number }[] {
    const data = imageData.data;
    const colorMap = new Map<string, number>();
    
    // Sample every 8th pixel for better performance
    for (let i = 0; i < data.length; i += 32) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const alpha = data[i + 3];
      
      // Skip transparent pixels
      if (alpha < 128) continue;
      
      // Group similar colors (reduce precision for better matching)
      const colorKey = `${Math.floor(r/15)*15}-${Math.floor(g/15)*15}-${Math.floor(b/15)*15}`;
      colorMap.set(colorKey, (colorMap.get(colorKey) || 0) + 1);
    }
    
    // Get top 8 dominant colors
    return Array.from(colorMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([colorKey, count]) => {
        const [r, g, b] = colorKey.split('-').map(Number);
        return { r, g, b, count };
      });
  }

  private calculateAverageBrightness(imageData: ImageData): number {
    const data = imageData.data;
    let totalBrightness = 0;
    let pixelCount = 0;
    
    for (let i = 0; i < data.length; i += 16) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const alpha = data[i + 3];
      
      if (alpha > 128) {
        totalBrightness += (r + g + b) / 3;
        pixelCount++;
      }
    }
    
    return pixelCount > 0 ? totalBrightness / pixelCount : 0;
  }

  private detectHighContrast(imageData: ImageData): boolean {
    const data = imageData.data;
    let contrastCount = 0;
    const threshold = 60;
    
    for (let i = 0; i < data.length - 16; i += 16) {
      const r1 = data[i];
      const g1 = data[i + 1];
      const b1 = data[i + 2];
      const brightness1 = (r1 + g1 + b1) / 3;
      
      const r2 = data[i + 16];
      const g2 = data[i + 17];
      const b2 = data[i + 18];
      const brightness2 = (r2 + g2 + b2) / 3;
      
      if (Math.abs(brightness1 - brightness2) > threshold) {
        contrastCount++;
      }
    }
    
    return contrastCount > (data.length / 64); // High contrast threshold
  }

  private detectRectangularShapes(imageData: ImageData): { x: number; y: number; width: number; height: number }[] {
    const regions: { x: number; y: number; width: number; height: number }[] = [];
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    
    // Simple edge detection for rectangular shapes
    let edgePixels = 0;
    const edgeThreshold = 40;
    
    for (let y = 1; y < height - 1; y += 2) {
      for (let x = 1; x < width - 1; x += 2) {
        const idx = (y * width + x) * 4;
        const current = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
        const right = (data[idx + 4] + data[idx + 5] + data[idx + 6]) / 3;
        const bottom = (data[(y + 1) * width * 4 + x * 4] + data[(y + 1) * width * 4 + x * 4 + 1] + data[(y + 1) * width * 4 + x * 4 + 2]) / 3;
        
        if (Math.abs(current - right) > edgeThreshold || Math.abs(current - bottom) > edgeThreshold) {
          edgePixels++;
        }
      }
    }
    
    // If enough edges detected, assume rectangular object present
    if (edgePixels > (width * height * 0.01)) {
      regions.push({
        x: Math.floor(width * 0.2),
        y: Math.floor(height * 0.3),
        width: Math.floor(width * 0.6),
        height: Math.floor(height * 0.4)
      });
    }
    
    return regions;
  }

  private detectCircularShapes(imageData: ImageData): { x: number; y: number; width: number; height: number }[] {
    const regions: { x: number; y: number; width: number; height: number }[] = [];
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Check for circular patterns
    let circularPixels = 0;
    const radius = Math.min(width, height) / 6;
    
    for (let angle = 0; angle < 360; angle += 15) {
      const x = Math.floor(centerX + radius * Math.cos(angle * Math.PI / 180));
      const y = Math.floor(centerY + radius * Math.sin(angle * Math.PI / 180));
      
      if (x >= 0 && x < width && y >= 0 && y < height) {
        const idx = (y * width + x) * 4;
        const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
        
        // Check for metallic-like brightness
        if (brightness > 80 && brightness < 220) {
          circularPixels++;
        }
      }
    }
    
    // If enough circular pattern detected
    if (circularPixels > 8) {
      regions.push({
        x: Math.floor(centerX - radius),
        y: Math.floor(centerY - radius),
        width: Math.floor(radius * 2),
        height: Math.floor(radius * 2)
      });
    }
    
    return regions;
  }

  private matchIndianNote(colors: { r: number; g: number; b: number; count: number }[], brightness: number, hasHighContrast: boolean): any {
    for (const note of this.indianCurrencyPatterns.notes) {
      let bestMatch = 0;
      
      // Check each dominant color against note's color patterns
      for (const noteColor of note.dominantColors) {
        for (const imageColor of colors) {
          const colorDistance = Math.sqrt(
            Math.pow(imageColor.r - noteColor.r, 2) +
            Math.pow(imageColor.g - noteColor.g, 2) +
            Math.pow(imageColor.b - noteColor.b, 2)
          );
          
          // Color similarity score (lower distance = better match)
          if (colorDistance < 80) {
            const similarity = Math.max(0, 100 - colorDistance);
            bestMatch = Math.max(bestMatch, similarity);
          }
        }
      }
      
      // Boost confidence for high contrast (typical of currency)
      if (hasHighContrast) {
        bestMatch += 10;
      }
      
      // Brightness adjustments for different notes
      if (note.value >= 500 && brightness < 120) bestMatch += 5; // Higher denominations often darker
      if (note.value <= 50 && brightness > 140) bestMatch += 5; // Lower denominations often brighter
      
      if (bestMatch > 60) { // Minimum confidence threshold
        return {
          denomination: note.denomination,
          confidence: Math.min(95, Math.floor(bestMatch + Math.random() * 10)),
          value: note.value
        };
      }
    }
    return null;
  }

  private matchIndianCoin(colors: { r: number; g: number; b: number; count: number }[], brightness: number): any {
    for (const coin of this.indianCurrencyPatterns.coins) {
      let bestMatch = 0;
      
      // Check metallic colors
      for (const coinColor of coin.dominantColors) {
        for (const imageColor of colors) {
          const colorDistance = Math.sqrt(
            Math.pow(imageColor.r - coinColor.r, 2) +
            Math.pow(imageColor.g - coinColor.g, 2) +
            Math.pow(imageColor.b - coinColor.b, 2)
          );
          
          if (colorDistance < 60) {
            const similarity = Math.max(0, 100 - colorDistance * 1.5);
            bestMatch = Math.max(bestMatch, similarity);
          }
        }
      }
      
      // Metallic brightness check
      if (brightness > 100 && brightness < 200) {
        bestMatch += 15;
      }
      
      if (bestMatch > 50) {
        return {
          denomination: coin.denomination,
          confidence: Math.min(90, Math.floor(bestMatch + Math.random() * 8)),
          value: coin.value
        };
      }
    }
    return null;
  }
}

export const currencyRecognitionService = new CurrencyRecognitionService();