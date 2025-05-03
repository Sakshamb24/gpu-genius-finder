
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { Checkbox } from "@/components/ui/checkbox";
import { GPURequirements } from "@/services/api";
import { HardDrive, Database, Info } from "lucide-react";

interface SearchFormProps {
  onSearch: (criteria: GPURequirements) => void;
}

const formSchema = z.object({
  minCPU: z.number().min(0).optional(),
  minRAM: z.number().min(0).optional(),
  maxBudget: z.number().min(0).optional(),
  preferredRegion: z.string().optional(),
  preferredGPUType: z.string().optional(),
  useCase: z.string().optional(),
  modelType: z.string().optional(),
  datasetSize: z.number().min(0).optional(),
  isTraining: z.boolean().default(false),
  storageSizeGB: z.number().min(0).optional(),
  isSpotInstance: z.boolean().default(false),
});

const useCases = [
  { value: "ml-training", label: "Machine Learning Training" },
  { value: "ml-inference", label: "ML Model Inference" },
  { value: "rendering", label: "3D Rendering" },
  { value: "video-processing", label: "Video Processing" },
  { value: "gaming", label: "Game Streaming" },
  { value: "general", label: "General GPU Computing" },
];

const gpuTypes = [
  { value: "any", label: "Any GPU" },
  { value: "a100", label: "NVIDIA A100" },
  { value: "a30", label: "NVIDIA A30" },
  { value: "a40", label: "NVIDIA A40" },
  { value: "a6000", label: "NVIDIA A6000" },
  { value: "v100", label: "NVIDIA V100" },
  { value: "t4", label: "NVIDIA T4" },
  { value: "l4", label: "NVIDIA L4" },
  { value: "l40s", label: "NVIDIA L40s" },
];

const regions = [
  { value: "any", label: "Any Region" },
  { value: "mumbai", label: "Mumbai, India" },
  { value: "bangalore", label: "Bangalore, India" },
  { value: "singapore", label: "Singapore" },
  { value: "us", label: "United States" },
  { value: "eu", label: "Europe" },
];

const modelTypes = [
  { value: "any", label: "Any Model Type" },
  { value: "llm", label: "Large Language Model (LLM)" },
  { value: "vision", label: "Computer Vision" },
  { value: "nlp", label: "Natural Language Processing" },
  { value: "diffusion", label: "Diffusion Model" },
  { value: "transformer", label: "Transformer Model" },
];

const SearchForm = ({ onSearch }: SearchFormProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      minCPU: 0,
      minRAM: 0,
      maxBudget: 2000,
      preferredRegion: "any",
      preferredGPUType: "any",
      useCase: "general",
      modelType: "any",
      datasetSize: 0,
      isTraining: false,
      storageSizeGB: 100,
      isSpotInstance: false,
    },
  });

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSearch(values);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-6 bg-white p-6 rounded-xl shadow-sm"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="useCase"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Primary Use Case</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select use case" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {useCases.map((useCase) => (
                        <SelectItem key={useCase.value} value={useCase.value}>
                          {useCase.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="modelType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Model Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select model type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {modelTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isTraining"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Training Workload</FormLabel>
                    <FormDescription>
                      Check if you're training models rather than running inference
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="datasetSize"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dataset Size (GB)</FormLabel>
                  <div className="flex items-center space-x-4">
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          Approximate size of your dataset in GB
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-4">
            <FormField
              control={form.control}
              name="minCPU"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Minimum vCPUs</FormLabel>
                  <div className="flex items-center space-x-4">
                    <FormControl>
                      <Slider
                        min={0}
                        max={128}
                        step={4}
                        defaultValue={[field.value || 0]}
                        onValueChange={(value) => field.onChange(value[0])}
                      />
                    </FormControl>
                    <span className="w-16 text-right font-medium">
                      {field.value || 0} vCPUs
                    </span>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="minRAM"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Minimum RAM (GB)</FormLabel>
                  <div className="flex items-center space-x-4">
                    <FormControl>
                      <Slider
                        min={0}
                        max={512}
                        step={8}
                        defaultValue={[field.value || 0]}
                        onValueChange={(value) => field.onChange(value[0])}
                      />
                    </FormControl>
                    <span className="w-16 text-right font-medium">
                      {field.value || 0} GB
                    </span>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="storageSizeGB"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    <HardDrive className="mr-2 h-4 w-4" />
                    Storage Size (GB)
                  </FormLabel>
                  <div className="flex items-center space-x-4">
                    <FormControl>
                      <Slider
                        min={50}
                        max={2000}
                        step={50}
                        defaultValue={[field.value || 100]}
                        onValueChange={(value) => field.onChange(value[0])}
                      />
                    </FormControl>
                    <span className="w-16 text-right font-medium">
                      {field.value || 100} GB
                    </span>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="maxBudget"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maximum Monthly Budget ($)</FormLabel>
                  <div className="flex items-center gap-2">
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="2000"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="preferredRegion"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preferred Region</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a region" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {regions.map((region) => (
                      <SelectItem key={region.value} value={region.value}>
                        {region.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="preferredGPUType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preferred GPU Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select GPU type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {gpuTypes.map((gpu) => (
                      <SelectItem key={gpu.value} value={gpu.value}>
                        {gpu.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isSpotInstance"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 mt-6">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Consider Spot Instances</FormLabel>
                  <FormDescription>
                    Lower cost but may be reclaimed
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end">
          <Button type="submit" className="bg-tech-blue hover:bg-blue-700">
            Find GPU Solutions
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default SearchForm;
