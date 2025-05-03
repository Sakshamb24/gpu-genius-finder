
// API service for fetching GPU instances
export interface GPUInstance {
  country: string;
  resource_class: string;
  vcpus: number;
  ram: number;
  price_per_hour: number;
  price_per_month: number;
  price_per_spot: number;
  gpu_description: string;
  region: string;
  storage?: number;
  performance_score?: number;
  recommended_for?: string[];
  is_spot_available?: boolean;
}

interface ApiResponse {
  data: GPUInstance[];
}

// Updated API URL to include a default region parameter
const BASE_API_URL = 'https://customer.acecloudhosting.com/api/v1/pricing';

// Mock data for development and fallback when API is unavailable
const MOCK_DATA: GPUInstance[] = [
  {
    country: "india",
    resource_class: "a100",
    vcpus: 16,
    ram: 96,
    price_per_hour: 3.42,
    price_per_month: 1563,
    price_per_spot: 2.394,
    gpu_description: "1x A100-80GB",
    region: "mumbai",
    storage: 500,
    performance_score: 95,
    recommended_for: ["ml-training", "llm", "transformer"],
    is_spot_available: true
  },
  {
    country: "india",
    resource_class: "a30",
    vcpus: 8,
    ram: 32,
    price_per_hour: 0.9,
    price_per_month: 525,
    price_per_spot: 0.63,
    gpu_description: "1x A30-24GB",
    region: "mumbai",
    storage: 300,
    performance_score: 75,
    recommended_for: ["ml-inference", "vision", "nlp"],
    is_spot_available: true
  },
  {
    country: "india",
    resource_class: "a10",
    vcpus: 4,
    ram: 24,
    price_per_hour: 0.68,
    price_per_month: 394,
    price_per_spot: 0.476,
    gpu_description: "1x A10-24GB",
    region: "mumbai",
    storage: 200,
    performance_score: 60,
    recommended_for: ["ml-inference", "rendering"],
    is_spot_available: true
  },
  {
    country: "usa",
    resource_class: "a100",
    vcpus: 16,
    ram: 96,
    price_per_hour: 3.8,
    price_per_month: 1710,
    price_per_spot: 2.66,
    gpu_description: "1x A100-80GB",
    region: "us-east",
    storage: 500,
    performance_score: 95,
    recommended_for: ["ml-training", "llm", "transformer"],
    is_spot_available: true
  },
  {
    country: "usa",
    resource_class: "a40",
    vcpus: 12,
    ram: 48,
    price_per_hour: 1.42,
    price_per_month: 710,
    price_per_spot: 0.994,
    gpu_description: "1x A40-48GB",
    region: "us-east",
    storage: 350,
    performance_score: 80,
    recommended_for: ["ml-training", "rendering", "vision"],
    is_spot_available: false
  },
  {
    country: "india",
    resource_class: "l40s",
    vcpus: 16,
    ram: 48,
    price_per_hour: 3.34,
    price_per_month: 1625,
    price_per_spot: 2.338,
    gpu_description: "1x L40s - 48 GB",
    region: "mumbai",
    storage: 400,
    performance_score: 88,
    recommended_for: ["ml-training", "diffusion", "rendering"],
    is_spot_available: true
  },
  {
    country: "india",
    resource_class: "l4",
    vcpus: 4,
    ram: 16,
    price_per_hour: 0.78,
    price_per_month: 406,
    price_per_spot: 0.4134,
    gpu_description: "1x L4 - 24 GB",
    region: "mumbai",
    storage: 200,
    performance_score: 65,
    recommended_for: ["ml-inference", "vision"],
    is_spot_available: true
  }
];

export const fetchGPUInstances = async (): Promise<GPUInstance[]> => {
  try {
    // Adding required region parameter to the API URL
    const params = new URLSearchParams({
      is_gpu: 'true',
      resource: 'instances',
      region: 'ap-south-mum-1' // Default to Mumbai region
    });
    
    const response = await fetch(`${BASE_API_URL}?${params.toString()}`, { 
      mode: 'cors',
      cache: 'no-cache'
    });
    
    if (!response.ok) {
      console.warn(`API request failed with status ${response.status}, using mock data instead`);
      return enhanceGPUData(MOCK_DATA);
    }
    
    const data: ApiResponse = await response.json();
    return enhanceGPUData(data.data.length > 0 ? data.data : MOCK_DATA);
  } catch (error) {
    console.error('Error fetching GPU instances:', error);
    console.warn('Using mock data instead');
    return enhanceGPUData(MOCK_DATA);
  }
};

export interface GPURequirements {
  minCPU?: number;
  minRAM?: number;
  maxBudget?: number;
  preferredRegion?: string;
  preferredGPUType?: string;
  useCase?: string;
  modelType?: string;
  datasetSize?: number;
  isTraining?: boolean;
  storageSizeGB?: number;
  isSpotInstance?: boolean;
}

// Function to enhance GPU instances with estimated performance metrics
const enhanceGPUData = (instances: GPUInstance[]): GPUInstance[] => {
  return instances.map(instance => {
    // If performance score is not set, calculate an estimated one
    if (!instance.performance_score) {
      // Simple scoring based on CPU, RAM, and GPU class
      let score = (instance.vcpus * 0.3) + (instance.ram * 0.3);
      
      // Boost score based on GPU class
      if (instance.resource_class.toLowerCase().includes('a100')) {
        score += 50;
      } else if (instance.resource_class.toLowerCase().includes('a40') || 
                instance.resource_class.toLowerCase().includes('l40')) {
        score += 40;
      } else if (instance.resource_class.toLowerCase().includes('a30') || 
                instance.resource_class.toLowerCase().includes('v100')) {
        score += 30;
      } else if (instance.resource_class.toLowerCase().includes('a10') || 
                instance.resource_class.toLowerCase().includes('l4')) {
        score += 20;
      } else {
        score += 10;
      }
      
      instance.performance_score = Math.min(Math.round(score), 100);
    }
    
    // Add recommended use cases if not present
    if (!instance.recommended_for) {
      instance.recommended_for = [];
      
      // High-end GPUs
      if (instance.resource_class.toLowerCase().includes('a100') || 
          instance.resource_class.toLowerCase().includes('l40s')) {
        instance.recommended_for.push('ml-training', 'llm', 'transformer');
      }
      
      // Mid-tier GPUs
      else if (instance.resource_class.toLowerCase().includes('a30') || 
              instance.resource_class.toLowerCase().includes('a40')) {
        instance.recommended_for.push('ml-inference', 'vision', 'rendering');
      }
      
      // Lower-tier GPUs
      else {
        instance.recommended_for.push('ml-inference', 'video-processing');
      }
    }
    
    // Add default storage if not specified
    if (!instance.storage) {
      instance.storage = 100 + (instance.ram * 2);
    }
    
    // Add spot availability info if not present
    if (instance.is_spot_available === undefined) {
      instance.is_spot_available = instance.price_per_spot > 0;
    }
    
    return instance;
  });
};

// Also update fetchGPUInstances to use the preferredRegion when provided
export const fetchGPUInstancesByRegion = async (region: string = 'ap-south-mum-1'): Promise<GPUInstance[]> => {
  try {
    const params = new URLSearchParams({
      is_gpu: 'true',
      resource: 'instances',
      region: region
    });
    
    const response = await fetch(`${BASE_API_URL}?${params.toString()}`, {
      mode: 'cors',
      cache: 'no-cache'
    });
    
    if (!response.ok) {
      console.warn(`API request failed with status ${response.status}, using filtered mock data instead`);
      // Filter mock data by region
      const filteredData = MOCK_DATA.filter(instance => 
        instance.region.toLowerCase().includes(region.toLowerCase()) || 
        instance.country.toLowerCase().includes(region.replace(/^ap-south-|-\d+$/g, '').toLowerCase())
      );
      return enhanceGPUData(filteredData);
    }
    
    const data: ApiResponse = await response.json();
    return enhanceGPUData(data.data.length > 0 ? data.data : MOCK_DATA.filter(instance => 
      instance.region.toLowerCase().includes(region.toLowerCase()) ||
      instance.country.toLowerCase().includes(region.replace(/^ap-south-|-\d+$/g, '').toLowerCase())
    ));
  } catch (error) {
    console.error(`Error fetching GPU instances for region ${region}:`, error);
    console.warn('Using filtered mock data instead');
    return enhanceGPUData(MOCK_DATA.filter(instance => 
      instance.region.toLowerCase().includes(region.toLowerCase()) ||
      instance.country.toLowerCase().includes(region.replace(/^ap-south-|-\d+$/g, '').toLowerCase())
    ));
  }
};

export const findMatchingGPUs = (
  gpuInstances: GPUInstance[],
  requirements: GPURequirements
): GPUInstance[] => {
  // Filter GPU instances based on user requirements
  return gpuInstances.filter(instance => {
    // CPU requirements
    if (requirements.minCPU && instance.vcpus < requirements.minCPU) {
      return false;
    }

    // RAM requirements
    if (requirements.minRAM && instance.ram < requirements.minRAM) {
      return false;
    }

    // Budget constraints (monthly)
    if (requirements.maxBudget && instance.price_per_month > requirements.maxBudget) {
      return false;
    }

    // Storage requirements
    if (requirements.storageSizeGB && instance.storage && 
        instance.storage < requirements.storageSizeGB) {
      return false;
    }

    // Region preference
    if (
      requirements.preferredRegion && 
      requirements.preferredRegion.toLowerCase() !== 'any' &&
      !instance.region.toLowerCase().includes(requirements.preferredRegion.toLowerCase()) &&
      !instance.country.toLowerCase().includes(requirements.preferredRegion.toLowerCase())
    ) {
      return false;
    }

    // GPU type preference
    if (
      requirements.preferredGPUType &&
      requirements.preferredGPUType.toLowerCase() !== 'any' && 
      !instance.gpu_description.toLowerCase().includes(requirements.preferredGPUType.toLowerCase()) &&
      !instance.resource_class.toLowerCase().includes(requirements.preferredGPUType.toLowerCase())
    ) {
      return false;
    }
    
    // Use case matching
    if (
      requirements.useCase && 
      requirements.useCase !== 'general' &&
      instance.recommended_for &&
      !instance.recommended_for.includes(requirements.useCase)
    ) {
      return false;
    }
    
    // Model type matching
    if (
      requirements.modelType && 
      requirements.modelType !== 'any' &&
      instance.recommended_for &&
      !instance.recommended_for.includes(requirements.modelType)
    ) {
      return false;
    }
    
    // Spot instance preference
    if (requirements.isSpotInstance && !instance.is_spot_available) {
      return false;
    }

    // All filters passed
    return true;
  });
};

// Sorts GPU instances based on specific criteria
export const sortGPUInstances = (
  instances: GPUInstance[],
  sortBy: 'price' | 'performance' | 'value' = 'value'
): GPUInstance[] => {
  const sortedInstances = [...instances];

  switch (sortBy) {
    case 'price':
      // Sort by price (lowest first)
      return sortedInstances.sort((a, b) => {
        // If spot instances are available and user prefers them
        const priceA = a.price_per_spot && a.is_spot_available ? a.price_per_spot : a.price_per_month;
        const priceB = b.price_per_spot && b.is_spot_available ? b.price_per_spot : b.price_per_month;
        return priceA - priceB;
      });
    
    case 'performance':
      // Sort by performance score (higher is better)
      return sortedInstances.sort((a, b) => {
        const perfA = a.performance_score || (a.vcpus * a.ram / 10);
        const perfB = b.performance_score || (b.vcpus * b.ram / 10);
        return perfB - perfA; // Descending order
      });
      
    case 'value':
      // Sort by value (performance per dollar - higher is better)
      return sortedInstances.sort((a, b) => {
        const perfA = a.performance_score || (a.vcpus * a.ram / 10);
        const perfB = b.performance_score || (b.vcpus * b.ram / 10);
        const priceA = a.price_per_month;
        const priceB = b.price_per_month;
        const valueA = perfA / priceA;
        const valueB = perfB / priceB;
        return valueB - valueA; // Descending order
      });
      
    default:
      return sortedInstances;
  }
};

// Get workload-based recommendations
export const getWorkloadRecommendation = (requirements: GPURequirements): string => {
  let recommendation = '';
  
  if (requirements.isTraining) {
    if (requirements.modelType === 'llm' || requirements.modelType === 'transformer') {
      recommendation = 'For large language model training, we recommend high-memory GPUs like A100-80GB or similar with at least 32GB VRAM.';
    } else if (requirements.modelType === 'vision' || requirements.modelType === 'diffusion') {
      recommendation = 'For vision model training, we recommend GPUs with good tensor cores like A30 or A100.';
    } else {
      recommendation = 'For model training workloads, we recommend GPUs with higher memory and compute capabilities.';
    }
    
    if (requirements.datasetSize && requirements.datasetSize > 100) {
      recommendation += ' With your large dataset size, consider instances with higher RAM and storage.';
    }
  } else {
    // Inference recommendations
    if (requirements.modelType === 'llm' || requirements.modelType === 'transformer') {
      recommendation = 'For language model inference, A30 or L40s GPUs offer good balance between cost and performance.';
    } else if (requirements.modelType === 'vision') {
      recommendation = 'For vision model inference, L4 GPUs offer excellent performance per dollar.';
    } else {
      recommendation = 'For inference workloads, we recommend balanced GPUs with good cost-performance ratios.';
    }
  }
  
  return recommendation;
};
