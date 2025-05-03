
import { useState, useEffect } from "react";
import SearchForm from "@/components/SearchForm";
import ResultsDisplay from "@/components/ResultsDisplay";
import ChatBot from "@/components/ChatBot";
import Documentation from "@/components/Documentation";
import PDFDownloadButton from "@/components/PDFDownloadButton";
import { 
  GPUInstance, 
  GPURequirements, 
  fetchGPUInstances, 
  fetchGPUInstancesByRegion, 
  findMatchingGPUs 
} from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { Search, MessageSquare, Info } from "lucide-react";

const Index = () => {
  const { toast } = useToast();
  const [gpuInstances, setGpuInstances] = useState<GPUInstance[]>([]);
  const [filteredResults, setFilteredResults] = useState<GPUInstance[]>([]);
  const [selectedGPU, setSelectedGPU] = useState<GPUInstance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchCriteria, setSearchCriteria] = useState<GPURequirements | undefined>(undefined);
  
  useEffect(() => {
    const loadGPUInstances = async () => {
      try {
        setIsLoading(true);
        // Use the updated fetchGPUInstances function that includes the region parameter
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
  
  const handleSearch = async (criteria: GPURequirements) => {
    try {
      setIsLoading(true);
      setSearchCriteria(criteria); // Store search criteria for PDF generation
      
      // If a preferred region is specified and not "any", fetch data for that region
      let instances = gpuInstances;
      if (criteria.preferredRegion && criteria.preferredRegion !== 'any') {
        // Map the user-friendly region names to API region codes
        const regionMap: Record<string, string> = {
          'mumbai': 'ap-south-mum-1',
          'bangalore': 'ap-south-del-1', // Using Delhi as nearest to Bangalore
          'us': 'us-east-at-1',
          'eu': 'ap-south-noi-1', // Using Noida as placeholder for EU
        };
        
        const regionCode = regionMap[criteria.preferredRegion] || 'ap-south-mum-1';
        const regionSpecificInstances = await fetchGPUInstancesByRegion(regionCode);
        
        if (regionSpecificInstances.length > 0) {
          instances = regionSpecificInstances;
          // Update the main instances array for consistent state
          setGpuInstances(regionSpecificInstances);
        }
      }
      
      // Find matching GPUs based on criteria
      const results = findMatchingGPUs(instances, criteria);
      setFilteredResults(results);
      setHasSearched(true);
      setIsLoading(false);
      
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
        
        // If multiple results, suggest using the chatbot
        if (results.length > 3) {
          setTimeout(() => {
            toast({
              title: "Need Help Choosing?",
              description: "Use the chatbot assistant to help you select the best GPU for your needs.",
            });
          }, 2000);
        }
      }
    } catch (error) {
      console.error("Error during search:", error);
      toast({
        title: "Search Error",
        description: "An error occurred during the search. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
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
              <p className="text-gray-300">Find the perfect GPU cloud instance for your AI/ML workloads</p>
            </div>
            <div className="flex items-center gap-3">
              {hasSearched && filteredResults.length > 0 && (
                <PDFDownloadButton results={filteredResults} searchRequirements={searchCriteria} />
              )}
              <Documentation />
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto py-8 px-4 md:px-8 space-y-8">
        <section className="max-w-5xl mx-auto">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 md:p-8 bg-gradient-to-r from-tech-blue to-tech-purple text-white">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">Find Your Ideal GPU Solution</h2>
              <p className="text-gray-100 max-w-3xl">
                Specify your AI/ML workload characteristics and we'll find the perfect GPU instance for you.
                Whether it's training large language models, running inference, rendering, or general computing, we'll match you with the right resources.
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
            <ResultsDisplay 
              results={filteredResults} 
              onSelectGPU={handleSelectGPU} 
              searchCriteria={searchCriteria}
            />
          </section>
        ) : (
          <section className="text-center py-12">
            <h3 className="text-2xl font-bold mb-4">Ready to Find Your Ideal GPU Solution</h3>
            <p className="text-gray-600 max-w-2xl mx-auto mb-6">
              Tell us about your AI/ML workload, and we'll recommend the right GPU instances.
              You can filter by model type, dataset size, training vs. inference needs, and more.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-tech-blue mb-4 mx-auto">
                  <Search className="h-6 w-6" />
                </div>
                <h4 className="text-lg font-medium mb-2">Specify Workload</h4>
                <p className="text-gray-500 text-sm">
                  Tell us what you need - from model type to dataset size - and we'll find matching GPUs
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-tech-purple mb-4 mx-auto">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <h4 className="text-lg font-medium mb-2">Get Recommendations</h4>
                <p className="text-gray-500 text-sm">
                  Receive personalized GPU recommendations tailored to your specific workload needs
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center text-tech-cyan mb-4 mx-auto">
                  <Info className="h-6 w-6" />
                </div>
                <h4 className="text-lg font-medium mb-2">Compare Options</h4>
                <p className="text-gray-500 text-sm">
                  Compare GPU instances side by side and download detailed reports for decision making
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
      
      <ChatBot selectedGPU={selectedGPU} filteredResults={filteredResults} />
    </div>
  );
};

export default Index;
