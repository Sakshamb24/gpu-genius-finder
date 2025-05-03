import { useState, useEffect } from "react";
import SearchForm from "@/components/SearchForm";
import ResultsDisplay from "@/components/ResultsDisplay";
import ChatBot from "@/components/ChatBot";
import { GPUInstance, GPURequirements, fetchGPUInstances, findMatchingGPUs } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { Search, MessageSquare, Info } from "lucide-react";

const Index = () => {
  const { toast } = useToast();
  const [gpuInstances, setGpuInstances] = useState<GPUInstance[]>([]);
  const [filteredResults, setFilteredResults] = useState<GPUInstance[]>([]);
  const [selectedGPU, setSelectedGPU] = useState<GPUInstance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasSearched, setHasSearched] = useState(false);
  
  useEffect(() => {
    const loadGPUInstances = async () => {
      try {
        setIsLoading(true);
        const instances = await fetchGPUInstances();
        setGpuInstances(instances);
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading GPU instances:", error);
        toast({
          title: "Error",
          description: "Failed to load GPU instances. Please try again later.",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    };
    
    loadGPUInstances();
  }, [toast]);
  
  const handleSearch = (criteria: GPURequirements) => {
    // Find matching GPUs based on criteria
    const results = findMatchingGPUs(gpuInstances, criteria);
    setFilteredResults(results);
    setHasSearched(true);
    
    if (results.length === 0) {
      toast({
        title: "No Results",
        description: "No GPU instances match your criteria. Try adjusting your search parameters.",
      });
    } else {
      toast({
        title: "Search Complete",
        description: `Found ${results.length} GPU instances matching your criteria.`,
      });
    }
  };
  
  const handleSelectGPU = (gpu: GPUInstance) => {
    setSelectedGPU(gpu);
    toast({
      title: "GPU Selected",
      description: `You've selected ${gpu.resource_class.toUpperCase()} - ${gpu.gpu_description}`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 bg-gpu-pattern">
      <header className="bg-tech-dark text-white py-6 px-4 md:px-8">
        <div className="container mx-auto">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">GPU Genius Finder</h1>
              <p className="text-gray-300">Find the perfect GPU cloud instance for your needs</p>
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto py-8 px-4 md:px-8 space-y-8">
        <section className="max-w-5xl mx-auto">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 md:p-8 bg-gradient-to-r from-tech-blue to-tech-purple text-white">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">Find Your Ideal GPU Solution</h2>
              <p className="text-gray-100 max-w-2xl">
                Tell us what you need and we'll find the perfect GPU instance for your workload.
                Whether it's AI training, inference, rendering, or general GPU computing, we've got you covered.
              </p>
            </div>
            <div className="p-6">
              <SearchForm onSearch={handleSearch} />
            </div>
          </div>
        </section>
        
        {isLoading ? (
          <section className="text-center py-12">
            <div className="animate-pulse space-y-4">
              <div className="h-8 w-64 bg-gray-200 rounded mx-auto"></div>
              <div className="h-4 w-full max-w-md bg-gray-200 rounded mx-auto"></div>
              <div className="h-4 w-full max-w-sm bg-gray-200 rounded mx-auto"></div>
              <p className="text-gray-500 mt-4">Loading available GPU instances...</p>
            </div>
          </section>
        ) : hasSearched ? (
          <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <ResultsDisplay results={filteredResults} onSelectGPU={handleSelectGPU} />
          </section>
        ) : (
          <section className="text-center py-12">
            <h3 className="text-2xl font-bold mb-4">Ready to Find Your GPU Solution</h3>
            <p className="text-gray-600 max-w-2xl mx-auto mb-6">
              Fill out the form above with your requirements and we'll show you the best matching GPU instances.
              You can filter by vCPUs, RAM, budget, region, and GPU type.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-tech-blue mb-4 mx-auto">
                  <Search className="h-6 w-6" />
                </div>
                <h4 className="text-lg font-medium mb-2">Search</h4>
                <p className="text-gray-500 text-sm">
                  Specify your requirements and find GPU instances that match your needs
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-tech-purple mb-4 mx-auto">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <h4 className="text-lg font-medium mb-2">Chat</h4>
                <p className="text-gray-500 text-sm">
                  Ask our assistant for help with finding the right GPU for your specific workload
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center text-tech-cyan mb-4 mx-auto">
                  <Info className="h-6 w-6" />
                </div>
                <h4 className="text-lg font-medium mb-2">Compare</h4>
                <p className="text-gray-500 text-sm">
                  View detailed comparisons of GPU instances to make an informed decision
                </p>
              </div>
            </div>
          </section>
        )}
      </main>
      
      <footer className="bg-tech-dark text-gray-400 py-8 px-4 mt-8">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p>© 2025 GPU Genius Finder. All rights reserved.</p>
            <div className="mt-4 md:mt-0">
              <ul className="flex space-x-4">
                <li><a href="#" className="hover:text-white">Terms</a></li>
                <li><a href="#" className="hover:text-white">Privacy</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
      
      <ChatBot selectedGPU={selectedGPU} />
    </div>
  );
};

export default Index;
