
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
    region: "mumbai"
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
    region: "mumbai"
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
    region: "mumbai"
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
    region: "us-east"
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
    region: "us-east"
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
      return MOCK_DATA;
    }
    
    const data: ApiResponse = await response.json();
    return data.data.length > 0 ? data.data : MOCK_DATA;
  } catch (error) {
    console.error('Error fetching GPU instances:', error);
    console.warn('Using mock data instead');
    return MOCK_DATA;
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
      return MOCK_DATA.filter(instance => 
        instance.region.toLowerCase().includes(region.toLowerCase()) || 
        instance.country.toLowerCase().includes(region.replace(/^ap-south-|-\d+$/g, '').toLowerCase())
      );
    }
    
    const data: ApiResponse = await response.json();
    return data.data.length > 0 ? data.data : MOCK_DATA.filter(instance => 
      instance.region.toLowerCase().includes(region.toLowerCase()) ||
      instance.country.toLowerCase().includes(region.replace(/^ap-south-|-\d+$/g, '').toLowerCase())
    );
  } catch (error) {
    console.error(`Error fetching GPU instances for region ${region}:`, error);
    console.warn('Using filtered mock data instead');
    return MOCK_DATA.filter(instance => 
      instance.region.toLowerCase().includes(region.toLowerCase()) ||
      instance.country.toLowerCase().includes(region.replace(/^ap-south-|-\d+$/g, '').toLowerCase())
    );
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
