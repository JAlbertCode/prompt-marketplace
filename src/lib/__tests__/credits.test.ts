import { getPromptLengthCategory, calculatePromptCost, getModelById } from '@/lib/models';

// Mock the models data
jest.mock('@/lib/models', () => {
  // Define the original implementation
  const original = jest.requireActual('@/lib/models');
  
  // Override specific functions with test implementations
  return {
    ...original,
    getModelById: jest.fn((id) => {
      // Mock model data for testing
      const mockModels = {
        'gpt-4o': {
          id: 'gpt-4o',
          provider: 'openai',
          name: 'GPT-4o',
          inputType: 'text',
          outputType: 'text',
          cost: {
            short: 8500,
            medium: 15000,
            long: 23500
          },
          endpoint: '/api/run/openai/gpt4o',
        },
        'sonar-pro-low': {
          id: 'sonar-pro-low',
          provider: 'sonar',
          name: 'Sonar Pro Low',
          inputType: 'text',
          outputType: 'text',
          cost: {
            short: 3400,
            medium: 6000,
            long: 9400
          },
          endpoint: '/api/run/sonar/pro-low',
        }
      };
      
      return mockModels[id];
    }),
    // Use original implementation for non-mocked functions
    getPromptLengthCategory: original.getPromptLengthCategory,
    calculatePromptCost: original.calculatePromptCost,
  };
});

describe('Credit System Core Functions', () => {
  // Reset mocks between tests
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('getPromptLengthCategory', () => {
    test('should correctly categorize OpenAI prompt lengths', () => {
      expect(getPromptLengthCategory(500, 'openai')).toBe('short');
      expect(getPromptLengthCategory(1000, 'openai')).toBe('short');
      expect(getPromptLengthCategory(1001, 'openai')).toBe('medium');
      expect(getPromptLengthCategory(3000, 'openai')).toBe('medium');
      expect(getPromptLengthCategory(4000, 'openai')).toBe('medium');
      expect(getPromptLengthCategory(4001, 'openai')).toBe('long');
      expect(getPromptLengthCategory(8000, 'openai')).toBe('long');
    });
    
    test('should correctly categorize Sonar prompt lengths', () => {
      expect(getPromptLengthCategory(500, 'sonar')).toBe('short');
      expect(getPromptLengthCategory(800, 'sonar')).toBe('short');
      expect(getPromptLengthCategory(801, 'sonar')).toBe('medium');
      expect(getPromptLengthCategory(2000, 'sonar')).toBe('medium');
      expect(getPromptLengthCategory(3000, 'sonar')).toBe('medium');
      expect(getPromptLengthCategory(3001, 'sonar')).toBe('long');
      expect(getPromptLengthCategory(5000, 'sonar')).toBe('long');
    });
    
    test('should use default thresholds for unknown providers', () => {
      expect(getPromptLengthCategory(500, 'unknown-provider')).toBe('short');
      expect(getPromptLengthCategory(1000, 'unknown-provider')).toBe('short');
      expect(getPromptLengthCategory(1001, 'unknown-provider')).toBe('medium');
      expect(getPromptLengthCategory(3500, 'unknown-provider')).toBe('medium');
      expect(getPromptLengthCategory(3501, 'unknown-provider')).toBe('long');
    });
  });
  
  describe('calculatePromptCost', () => {
    test('should calculate correct cost for GPT-4o without creator fee', () => {
      expect(calculatePromptCost('gpt-4o', 'short')).toBe(8500);
      expect(calculatePromptCost('gpt-4o', 'medium')).toBe(15000);
      expect(calculatePromptCost('gpt-4o', 'long')).toBe(23500);
      
      // Verify getModelById was called correctly
      expect(getModelById).toHaveBeenCalledWith('gpt-4o');
    });
    
    test('should calculate correct cost for Sonar without creator fee', () => {
      expect(calculatePromptCost('sonar-pro-low', 'short')).toBe(3400);
      expect(calculatePromptCost('sonar-pro-low', 'medium')).toBe(6000);
      expect(calculatePromptCost('sonar-pro-low', 'long')).toBe(9400);
      
      // Verify getModelById was called correctly
      expect(getModelById).toHaveBeenCalledWith('sonar-pro-low');
    });
    
    test('should add creator fee when provided', () => {
      // 10% creator fee on short prompt
      expect(calculatePromptCost('gpt-4o', 'short', 850)).toBe(9350);
      
      // 5% creator fee on medium prompt
      expect(calculatePromptCost('sonar-pro-low', 'medium', 300)).toBe(6300);
    });
    
    test('should throw error for unknown model', () => {
      // Mock getModelById to return undefined for unknown model
      (getModelById as jest.Mock).mockReturnValueOnce(undefined);
      
      expect(() => {
        calculatePromptCost('non-existent-model', 'short');
      }).toThrow("Model with ID 'non-existent-model' not found");
    });
  });
});
