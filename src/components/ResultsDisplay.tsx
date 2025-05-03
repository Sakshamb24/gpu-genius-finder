
import { useState } from "react";
import { GPUInstance, sortGPUInstances } from "@/services/api";
import GPUCard from "./GPUCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ResultsDisplayProps {
  results: GPUInstance[];
  onSelectGPU: (gpu: GPUInstance) => void;
}

const ResultsDisplay = ({ results, onSelectGPU }: ResultsDisplayProps) => {
  const [sortType, setSortType] = useState<"price" | "performance" | "value">("value");

  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-2xl font-bold text-tech-dark mb-2">No Results Found</h3>
        <p className="text-muted-foreground">
          Try adjusting your search criteria to find available GPU instances.
        </p>
      </div>
    );
  }

  // Sort the results based on selected sort type
  const sortedResults = sortGPUInstances(results, sortType);
  
  // Identify special instances for highlighting
  const cheapestGPU = sortGPUInstances(results, "price")[0];
  const bestPerformanceGPU = sortGPUInstances(results, "performance")[0];
  const bestValueGPU = sortGPUInstances(results, "value")[0];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold">
          {results.length} Available GPU Solutions
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-sm">Sort by:</span>
          <Select value={sortType} onValueChange={(value) => setSortType(value as any)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="price">Lowest Price</SelectItem>
              <SelectItem value="performance">Best Performance</SelectItem>
              <SelectItem value="value">Best Value</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="grid" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="grid">Grid View</TabsTrigger>
          <TabsTrigger value="comparison">Comparison View</TabsTrigger>
        </TabsList>
        
        <TabsContent value="grid">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedResults.map((gpu) => (
              <GPUCard
                key={`${gpu.resource_class}-${gpu.region}-${gpu.price_per_hour}`}
                gpu={gpu}
                isCheapest={gpu === cheapestGPU}
                isBestPerformance={gpu === bestPerformanceGPU}
                isBestValue={gpu === bestValueGPU}
                onSelect={() => onSelectGPU(gpu)}
              />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="comparison">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted">
                  <th className="px-4 py-3 text-left">GPU Type</th>
                  <th className="px-4 py-3 text-left">Description</th>
                  <th className="px-4 py-3 text-left">vCPUs</th>
                  <th className="px-4 py-3 text-left">RAM</th>
                  <th className="px-4 py-3 text-left">Region</th>
                  <th className="px-4 py-3 text-left">Price/Hour</th>
                  <th className="px-4 py-3 text-left">Price/Month</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedResults.map((gpu) => (
                  <tr 
                    key={`${gpu.resource_class}-${gpu.region}-${gpu.price_per_hour}`}
                    className="border-b border-gray-200 hover:bg-muted/50"
                  >
                    <td className="px-4 py-3 font-medium">{gpu.resource_class.toUpperCase()}</td>
                    <td className="px-4 py-3">{gpu.gpu_description}</td>
                    <td className="px-4 py-3">{gpu.vcpus}</td>
                    <td className="px-4 py-3">{gpu.ram} GB</td>
                    <td className="px-4 py-3 capitalize">{gpu.region}, {gpu.country}</td>
                    <td className="px-4 py-3">${gpu.price_per_hour.toFixed(2)}</td>
                    <td className="px-4 py-3 font-bold">${gpu.price_per_month}</td>
                    <td className="px-4 py-3">
                      <button 
                        className="text-primary hover:underline" 
                        onClick={() => onSelectGPU(gpu)}
                      >
                        Select
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ResultsDisplay;
