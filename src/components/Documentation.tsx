import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Info, MessageSquare, Search, FileDown } from "lucide-react";

const Documentation = () => {
  const [tab, setTab] = useState("overview");

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-2"
        >
          <Info className="w-4 h-4" />
          <span>Documentation</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>GPU Genius Finder Documentation</DialogTitle>
          <DialogDescription>
            Everything you need to know about using this application
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={tab} onValueChange={setTab} className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="workflow">Workflow</TabsTrigger>
            <TabsTrigger value="api">API Documentation</TabsTrigger>
            <TabsTrigger value="components">Components</TabsTrigger>
            <TabsTrigger value="chatbot">Chatbot Guide</TabsTrigger>
            <TabsTrigger value="pdf">PDF Reports</TabsTrigger>
          </TabsList>
          
          <div className="flex-1 overflow-y-auto pr-2">
            <TabsContent value="overview" className="mt-0">
              <div className="prose max-w-none">
                <h3>GPU Genius Finder</h3>
                <p>
                  GPU Genius Finder is a web application designed to help users find the optimal GPU cloud instances
                  for their specific needs. The application fetches real-time data from the AceCloudHosting API
                  and provides search, filtering, and comparison tools to help users make informed decisions.
                </p>
                <h4>Key Features</h4>
                <ul>
                  <li>Advanced search with multiple filtering options</li>
                  <li>Interactive results comparison in both grid and table view</li>
                  <li>AI-powered chatbot assistant for personalized recommendations</li>
                  <li>Region-specific GPU instance data</li>
                  <li>Highlighting of best value, performance, and budget options</li>
                </ul>
                <p>
                  The application is built with React, TypeScript, and Tailwind CSS, with the UI components 
                  from the shadcn/ui library for a consistent and modern look and feel.
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="workflow" className="mt-0">
              <div className="prose max-w-none">
                <h3>Application Workflow</h3>
                <p>The GPU Genius Finder follows this general workflow:</p>
                <ol>
                  <li>
                    <strong>Search Form Submission:</strong> Users specify their GPU requirements (vCPUs, RAM, budget, region, etc.)
                    through the search form.
                  </li>
                  <li>
                    <strong>API Data Fetching:</strong> The application fetches GPU instance data from the AceCloudHosting API,
                    with optional region filtering if specified by the user.
                  </li>
                  <li>
                    <strong>Results Filtering:</strong> The backend services filter the GPU instances based on the user's
                    requirements.
                  </li>
                  <li>
                    <strong>Results Display:</strong> Matching GPU instances are displayed in either grid or table format,
                    with options to sort by price, performance, or value.
                  </li>
                  <li>
                    <strong>Interactive Selection:</strong> Users can select specific GPU instances to get more details.
                  </li>
                  <li>
                    <strong>Chatbot Assistance:</strong> If multiple results are found, the chatbot offers to help users
                    narrow down their choices based on their preferences for cost, performance, or value.
                  </li>
                </ol>
                <h4>Data Flow</h4>
                <p>
                  1. User input → 2. API request → 3. Data filtering → 4. Results display → 5. Interactive selection → 6. Chatbot recommendations
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="api" className="mt-0">
              <div className="prose max-w-none">
                <h3>API Documentation</h3>
                <p>
                  The application connects to the AceCloudHosting API to fetch GPU instance data.
                </p>
                <h4>API Endpoint</h4>
                <pre className="bg-gray-100 p-2 rounded">
                  {`https://customer.acecloudhosting.com/api/v1/pricing?is_gpu=true&resource=instances&region={region}`}
                </pre>
                <h4>Required Parameters</h4>
                <ul>
                  <li><code>is_gpu=true</code> - Filters for GPU instances only</li>
                  <li><code>resource=instances</code> - Specifies we want instance data</li>
                  <li><code>region</code> - Region code (e.g., "ap-south-mum-1" for Mumbai)</li>
                </ul>
                <h4>Response Format</h4>
                <pre className="bg-gray-100 p-2 rounded overflow-x-auto text-xs">
{`{
  "data": [
    {
      "country": "india",
      "resource_class": "a100",
      "vcpus": 16,
      "ram": 96,
      "price_per_hour": 3.42,
      "price_per_month": 1563,
      "price_per_spot": 2.394,
      "gpu_description": "1x A100-80GB",
      "region": "mumbai"
    },
    // More instances...
  ]
}`}
                </pre>
                <h4>Region Codes</h4>
                <ul>
                  <li><code>ap-south-mum-1</code> - Mumbai, India</li>
                  <li><code>ap-south-del-1</code> - Delhi, India (Used as nearest to Bangalore)</li>
                  <li><code>us-east-at-1</code> - US East</li>
                  <li><code>ap-south-noi-1</code> - Noida, India (Used as placeholder for EU)</li>
                </ul>
                <h4>Error Handling</h4>
                <p>
                  The API service includes error handling for failed requests, timeouts, and invalid responses.
                  If an API request fails, the application will display an appropriate error message and allow
                  the user to retry.
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="components" className="mt-0">
              <div className="prose max-w-none">
                <h3>Component Structure</h3>
                <p>
                  The GPU Genius Finder is built with a modular component architecture:
                </p>
                <h4>Main Components</h4>
                <ul>
                  <li>
                    <strong>Index.tsx</strong> - The main page component that orchestrates the application flow,
                    handling state management, API calls, and rendering the main UI components.
                  </li>
                  <li>
                    <strong>SearchForm.tsx</strong> - A form component for collecting user requirements,
                    with fields for vCPUs, RAM, budget, region, and GPU type preferences.
                  </li>
                  <li>
                    <strong>ResultsDisplay.tsx</strong> - Displays the filtered GPU instances in either grid
                    or table view, with sorting options and instance highlights.
                  </li>
                  <li>
                    <strong>GPUCard.tsx</strong> - A card component for displaying individual GPU instance details
                    in the grid view, with visual indicators for best value, performance, or price.
                  </li>
                  <li>
                    <strong>ChatBot.tsx</strong> - An interactive assistant that helps users choose between
                    multiple GPU options based on their preferences for cost, performance, or value.
                  </li>
                  <li>
                    <strong>Documentation.tsx</strong> - This component, providing comprehensive documentation
                    about the application.
                  </li>
                </ul>
                <h4>Service Layer</h4>
                <ul>
                  <li>
                    <strong>api.ts</strong> - Contains API service functions for fetching GPU instance data,
                    filtering based on requirements, and sorting the results.
                  </li>
                </ul>
                <p>
                  All components use Tailwind CSS for styling and shadcn/ui components for UI elements like
                  buttons, tabs, and dialogs.
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="chatbot" className="mt-0">
              <div className="prose max-w-none">
                <h3>Chatbot Assistant Guide</h3>
                <p>
                  The GPU Genius Finder includes an AI-powered chatbot assistant to help users
                  make informed decisions when choosing GPU instances.
                </p>
                <h4>When is the Chatbot Most Helpful?</h4>
                <ul>
                  <li>
                    <strong>Multiple Results:</strong> When your search returns multiple GPU options,
                    the chatbot will automatically offer to help you narrow down your choices based on
                    your preferences for cost, performance, or value.
                  </li>
                  <li>
                    <strong>Specific Questions:</strong> You can ask the chatbot specific questions about
                    GPU types, pricing, performance characteristics, or regional availability.
                  </li>
                  <li>
                    <strong>Use Case Advice:</strong> The chatbot can provide recommendations based on your
                    specific use case (ML/AI, 3D rendering, scientific computing, etc.).
                  </li>
                  <li>
                    <strong>Cost vs. Performance Tradeoffs:</strong> If you're undecided between GPU options,
                    the chatbot can help you understand the tradeoffs between cost and performance.
                  </li>
                </ul>
                <h4>How to Use the Chatbot</h4>
                <ol>
                  <li>Click on the chat icon in the bottom right corner to open the chatbot panel.</li>
                  <li>If you have multiple search results, the chatbot will offer to help you choose.</li>
                  <li>
                    You can respond with keywords like "cost", "performance", or "best value" to get
                    specific recommendations.
                  </li>
                  <li>
                    You can also ask specific questions about GPU specifications, pricing, or availability.
                  </li>
                  <li>
                    The chatbot will provide tailored recommendations based on your inputs and the
                    available GPU instances.
                  </li>
                </ol>
                <h4>Example Queries</h4>
                <ul>
                  <li>"Which GPU is best for machine learning?"</li>
                  <li>"I want the cheapest option"</li>
                  <li>"Show me the best performance option"</li>
                  <li>"What's the best value for money?"</li>
                  <li>"Which regions are available?"</li>
                  <li>"Tell me more about A100 GPUs"</li>
                </ul>
              </div>
            </TabsContent>
            
            <TabsContent value="pdf" className="mt-0">
              <div className="prose max-w-none">
                <h3>PDF Reports</h3>
                <p>
                  The GPU Genius Finder allows you to generate detailed PDF reports of your GPU search results
                  for presentations, documentation, or sharing with your team.
                </p>
                <h4>PDF Report Features</h4>
                <ul>
                  <li>
                    <strong>Search Criteria Summary:</strong> The PDF includes all the search parameters you used
                    to find GPU instances, making it easy to reference your requirements.
                  </li>
                  <li>
                    <strong>Results Table:</strong> A detailed table of all matching GPU instances with key 
                    specifications including GPU type, region, vCPUs, RAM, and pricing details.
                  </li>
                  <li>
                    <strong>Recommendations:</strong> Intelligent recommendations highlighting the best value,
                    best performance, and best budget options from your search results.
                  </li>
                  <li>
                    <strong>Professional Formatting:</strong> Clean, well-organized layout suitable for
                    business presentations and technical documentation.
                  </li>
                </ul>
                
                <h4>How to Generate a PDF Report</h4>
                <ol>
                  <li>Perform a search using the search form to find GPU instances that match your needs.</li>
                  <li>Once the results are displayed, look for the "Download PDF" button in the header.</li>
                  <li>Click the button to generate and download the PDF report.</li>
                  <li>The file will be automatically saved to your downloads folder with a dated filename.</li>
                </ol>
                
                <div className="bg-gray-100 p-4 rounded-md my-4">
                  <h5 className="font-medium">Pro Tip</h5>
                  <p className="text-sm">
                    The PDF report is especially useful for:
                  </p>
                  <ul className="text-sm">
                    <li>Sharing options with team members who need to approve GPU instance purchases</li>
                    <li>Including in project proposals to justify cloud computing costs</li>
                    <li>Keeping records of available GPU options for future reference</li>
                    <li>Comparing options from different regions or across different search criteria</li>
                  </ul>
                </div>
                
                <h4>PDF Content Structure</h4>
                <ol>
                  <li><strong>Header</strong> - Document title and generation date</li>
                  <li><strong>Search Requirements</strong> - Summary of your search criteria</li>
                  <li><strong>GPU Options Table</strong> - Detailed specifications of matching GPU instances</li>
                  <li><strong>Recommendations</strong> - Best options based on value, performance, and budget</li>
                  <li><strong>Footer</strong> - Copyright information</li>
                </ol>
              </div>
            </TabsContent>
          </div>
        </Tabs>
        
        <DialogFooter>
          <Button onClick={() => document.querySelector("[data-state='open'] button[aria-label='Close']")?.dispatchEvent(new MouseEvent("click", { bubbles: true }))}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default Documentation;
