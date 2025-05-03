
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
}

interface ApiResponse {
  data: GPUInstance[];
}

const API_URL = 'https://customer.acecloudhosting.com/api/v1/pricing?is_gpu=true&resource=instances';

export const fetchGPUInstances = async (): Promise<GPUInstance[]> => {
  try {
    const response = await fetch(API_URL);
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data: ApiResponse = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching GPU instances:', error);
    return [];
  }
};

export interface GPURequirements {
  minCPU?: number;
  minRAM?: number;
  maxBudget?: number;
  preferredRegion?: string;
  preferredGPUType?: string;
  useCase?: string;
}

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
      return sortedInstances.sort((a, b) => a.price_per_month - b.price_per_month);
    
    case 'performance':
      // Sort by a performance metric (higher is better)
      // Here we use a simple calculation of CPU * RAM as a performance indicator
      return sortedInstances.sort((a, b) => {
        const perfA = a.vcpus * a.ram;
        const perfB = b.vcpus * b.ram;
        return perfB - perfA; // Descending order
      });
      
    case 'value':
      // Sort by value (performance per dollar - higher is better)
      return sortedInstances.sort((a, b) => {
        const valueA = (a.vcpus * a.ram) / a.price_per_month;
        const valueB = (b.vcpus * b.ram) / b.price_per_month;
        return valueB - valueA; // Descending order
      });
      
    default:
      return sortedInstances;
  }
};
