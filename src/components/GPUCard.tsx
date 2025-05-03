
import { GPUInstance } from "@/services/api";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, HardDrive, Database, ChartBar, DollarSign } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface GPUCardProps {
  gpu: GPUInstance;
  isBestValue?: boolean;
  isBestPerformance?: boolean;
  isCheapest?: boolean;
  onSelect: () => void;
}

const GPUCard = ({ 
  gpu, 
  isBestValue = false, 
  isBestPerformance = false, 
  isCheapest = false, 
  onSelect 
}: GPUCardProps) => {
  // Determine badge type
  const getBadgeLabel = () => {
    if (isBestValue) return "Best Value";
    if (isBestPerformance) return "Best Performance";
    if (isCheapest) return "Most Affordable";
    return null;
  };
  
  const badgeLabel = getBadgeLabel();
  
  const getBadgeClass = () => {
    if (isBestValue) return "bg-green-600";
    if (isBestPerformance) return "bg-blue-600";
    if (isCheapest) return "bg-orange-500";
    return "bg-gray-600";
  };
  
  // Calculate the savings percentage if spot instance is available
  const spotSavings = gpu.price_per_spot && gpu.price_per_hour 
    ? Math.round((1 - (gpu.price_per_spot / gpu.price_per_hour)) * 100) 
    : 0;

  return (
    <Card className="w-full transition-all hover:shadow-lg relative overflow-hidden">
      {badgeLabel && (
        <div className={`absolute top-0 right-0 ${getBadgeClass()} text-white py-1 px-4 text-xs font-bold rounded-bl-lg`}>
          {badgeLabel}
        </div>
      )}
      
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">
              {gpu.resource_class.toUpperCase()}
            </CardTitle>
            <CardDescription className="font-medium">
              {gpu.gpu_description}
            </CardDescription>
          </div>
          {gpu.performance_score && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="bg-blue-100 text-blue-800 text-xs font-semibold p-1 rounded flex items-center">
                    <ChartBar className="h-3 w-3 mr-1" />
                    <span>{gpu.performance_score}/100</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  Performance score based on benchmarks and specifications
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pb-2">
        <div className="grid grid-cols-2 gap-2 text-sm mb-3">
          <div className="flex flex-col">
            <span className="text-muted-foreground flex items-center">
              <Database className="h-3 w-3 mr-1" /> vCPUs
            </span>
            <span className="font-medium">{gpu.vcpus} Cores</span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground">Memory</span>
            <span className="font-medium">{gpu.ram} GB</span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground">Region</span>
            <span className="font-medium capitalize">{gpu.region}, {gpu.country}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground flex items-center">
              <HardDrive className="h-3 w-3 mr-1" /> Storage
            </span>
            <span className="font-medium">{gpu.storage || 100} GB</span>
          </div>
        </div>
        
        {gpu.recommended_for && gpu.recommended_for.length > 0 && (
          <div className="mb-2">
            <span className="text-xs text-muted-foreground">Recommended for:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {gpu.recommended_for.map((useCase) => (
                <span 
                  key={useCase}
                  className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded"
                >
                  {useCase === 'ml-training' ? 'ML Training' : 
                    useCase === 'ml-inference' ? 'ML Inference' :
                    useCase === 'llm' ? 'LLM' :
                    useCase === 'transformer' ? 'Transformer' :
                    useCase === 'vision' ? 'Vision' :
                    useCase === 'diffusion' ? 'Diffusion' :
                    useCase === 'nlp' ? 'NLP' :
                    useCase === 'rendering' ? 'Rendering' :
                    useCase === 'video-processing' ? 'Video Processing' :
                    useCase}
                </span>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex flex-col pt-2 border-t">
        <div className="flex justify-between items-center w-full mb-2">
          <div className="text-2xl font-bold text-tech-blue">
            ${gpu.price_per_month}
            <span className="text-xs text-muted-foreground font-normal">/month</span>
          </div>
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">${gpu.price_per_hour.toFixed(2)}</span>/hour
          </div>
        </div>
        
        {gpu.is_spot_available && (
          <div className="flex justify-between items-center w-full mb-3">
            <div className="text-sm">
              <span className="font-medium text-green-600">${gpu.price_per_spot.toFixed(2)}</span>
              <span className="text-muted-foreground">/hour (spot)</span>
            </div>
            {spotSavings > 0 && (
              <div className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded flex items-center">
                <DollarSign className="h-3 w-3 mr-1" />
                Save up to {spotSavings}%
              </div>
            )}
          </div>
        )}
        
        <Button onClick={onSelect} className="w-full">
          <Check className="mr-2 h-4 w-4" /> Select this GPU
        </Button>
      </CardFooter>
    </Card>
  );
};

export default GPUCard;
