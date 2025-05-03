
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { MessageSquare, Send, Info } from "lucide-react";
import { GPUInstance } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatBotProps {
  selectedGPU?: GPUInstance | null;
  filteredResults?: GPUInstance[];
}

const ChatBot = ({ selectedGPU, filteredResults = [] }: ChatBotProps) => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content:
        "Hi there! I'm your GPU assistant. I can help you choose the right GPU solution for your needs. What type of workload are you planning to run?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  
  const [inputMessage, setInputMessage] = useState("");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [hasShownMultipleOptions, setHasShownMultipleOptions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  // Update messages if a GPU is selected
  useEffect(() => {
    if (selectedGPU && isSheetOpen) {
      addMessage(
        `I notice you've selected the ${selectedGPU.resource_class.toUpperCase()} GPU with ${
          selectedGPU.gpu_description
        }. This has ${selectedGPU.vcpus} vCPUs and ${
          selectedGPU.ram
        }GB RAM. Is there anything specific you'd like to know about this GPU instance?`,
        false
      );
    }
  }, [selectedGPU, isSheetOpen]);

  // Show message when multiple results are found
  useEffect(() => {
    if (filteredResults.length > 1 && isSheetOpen && !hasShownMultipleOptions) {
      const message = `I see you have ${filteredResults.length} GPU options available. Would you prefer to optimize for cost or performance? Or would you like me to recommend the best value option?`;
      addMessage(message, false);
      setHasShownMultipleOptions(true);
    }
  }, [filteredResults, isSheetOpen, hasShownMultipleOptions]);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    
    // Add user message
    addMessage(inputMessage, true);
    
    // Process the message and generate a response
    handleBotResponse(inputMessage);
    
    // Clear input
    setInputMessage("");
  };
  
  const addMessage = (content: string, isUser: boolean) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      isUser,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, newMessage]);
  };
  
  const handleBotResponse = (userMessage: string) => {
    // Simple response logic based on keywords
    const lowerCaseMessage = userMessage.toLowerCase();
    
    // Response for multiple options scenario
    if ((filteredResults.length > 1) && 
        (lowerCaseMessage.includes("cost") || 
        lowerCaseMessage.includes("cheap") || 
        lowerCaseMessage.includes("price") || 
        lowerCaseMessage.includes("budget"))) {
      setTimeout(() => {
        // Find the cheapest option
        const sortedByPrice = [...filteredResults].sort((a, b) => a.price_per_month - b.price_per_month);
        const cheapestOption = sortedByPrice[0];
        
        addMessage(
          `For the most cost-effective option, I recommend the ${cheapestOption.resource_class.toUpperCase()} with ${cheapestOption.gpu_description} at $${cheapestOption.price_per_month}/month. It offers ${cheapestOption.vcpus} vCPUs and ${cheapestOption.ram}GB RAM. Would you like more details about this option?`,
          false
        );
      }, 1000);
    }
    else if ((filteredResults.length > 1) && 
            (lowerCaseMessage.includes("performance") || 
            lowerCaseMessage.includes("power") || 
            lowerCaseMessage.includes("fast") || 
            lowerCaseMessage.includes("strong"))) {
      setTimeout(() => {
        // Calculate a simple performance score based on vCPUs and RAM
        const sortedByPerf = [...filteredResults].sort((a, b) => {
          const perfA = a.vcpus * a.ram;
          const perfB = b.vcpus * b.ram;
          return perfB - perfA; // Highest first
        });
        
        const bestPerformance = sortedByPerf[0];
        
        addMessage(
          `For the highest performance, I recommend the ${bestPerformance.resource_class.toUpperCase()} with ${bestPerformance.gpu_description}. With ${bestPerformance.vcpus} vCPUs and ${bestPerformance.ram}GB RAM, it's our most powerful option at $${bestPerformance.price_per_month}/month. Would you like more details?`,
          false
        );
      }, 1000);
    }
    else if ((filteredResults.length > 1) && 
            (lowerCaseMessage.includes("value") || 
            lowerCaseMessage.includes("recommend") || 
            lowerCaseMessage.includes("best") || 
            lowerCaseMessage.includes("optimal"))) {
      setTimeout(() => {
        // Calculate value (performance per dollar)
        const sortedByValue = [...filteredResults].sort((a, b) => {
          const valueA = (a.vcpus * a.ram) / a.price_per_month;
          const valueB = (b.vcpus * b.ram) / b.price_per_month;
          return valueB - valueA; // Highest first
        });
        
        const bestValue = sortedByValue[0];
        
        addMessage(
          `For the best overall value, I recommend the ${bestValue.resource_class.toUpperCase()} with ${bestValue.gpu_description}. It offers a great balance of performance (${bestValue.vcpus} vCPUs, ${bestValue.ram}GB RAM) for the price ($${bestValue.price_per_month}/month). Would you like to know more about this option?`,
          false
        );
      }, 1000);
    }
    // Response about pricing or cost
    else if (lowerCaseMessage.includes("price") || lowerCaseMessage.includes("cost") || lowerCaseMessage.includes("budget")) {
      setTimeout(() => {
        addMessage(
          "Our GPU instances range from $0.30/hour for entry-level options to $10+/hour for high-end A100 GPUs. " +
          "Monthly pricing typically includes a discount compared to hourly rates. " +
          "What's your approximate budget for GPU computing?",
          false
        );
      }, 1000);
    } 
    // Response about performance
    else if (
      lowerCaseMessage.includes("performance") || 
      lowerCaseMessage.includes("power") || 
      lowerCaseMessage.includes("speed") ||
      lowerCaseMessage.includes("fast")
    ) {
      setTimeout(() => {
        addMessage(
          "Performance varies significantly across our GPU offerings. For highest performance, " +
          "our A100 instances deliver exceptional processing power, ideal for large ML models. " +
          "A30 and A40 GPUs offer a good balance of performance and cost. " +
          "Can you tell me more about your workload so I can recommend the best option?",
          false
        );
      }, 1000);
    }
    // Response about machine learning
    else if (
      lowerCaseMessage.includes("ml") || 
      lowerCaseMessage.includes("ai") || 
      lowerCaseMessage.includes("machine learning") ||
      lowerCaseMessage.includes("deep learning") ||
      lowerCaseMessage.includes("train")
    ) {
      setTimeout(() => {
        addMessage(
          "For machine learning and AI workloads, our NVIDIA A100, A40, and A30 GPUs are excellent choices. " +
          "A100s are best for training large models, while A30s offer good value for smaller models or inference. " +
          "What size are your models, and are you primarily focused on training or inference?",
          false
        );
      }, 1000);
    }
    // Response about 3D rendering
    else if (
      lowerCaseMessage.includes("render") || 
      lowerCaseMessage.includes("3d") || 
      lowerCaseMessage.includes("graphics") ||
      lowerCaseMessage.includes("animation")
    ) {
      setTimeout(() => {
        addMessage(
          "For 3D rendering and graphics workloads, our NVIDIA A40 and A6000 GPUs deliver excellent performance. " +
          "They offer substantial VRAM which is crucial for complex scenes. " +
          "How complex are your rendering tasks, and what software are you using?",
          false
        );
      }, 1000);
    }
    // Response about regions or location
    else if (
      lowerCaseMessage.includes("region") || 
      lowerCaseMessage.includes("location") || 
      lowerCaseMessage.includes("country") ||
      lowerCaseMessage.includes("latency")
    ) {
      setTimeout(() => {
        addMessage(
          "We offer GPU instances in multiple regions including Mumbai and Bangalore in India, Singapore, " +
          "as well as locations in the US and Europe. Choosing a region closest to your users or data " +
          "can help reduce latency. Which region would work best for you?",
          false
        );
      }, 1000);
    }
    // Default response
    else {
      setTimeout(() => {
        addMessage(
          "Thanks for your message. To help you find the perfect GPU solution, " +
          "I'd like to know more about your specific workload requirements. " +
          "Are you working on machine learning, video rendering, scientific computing, or something else? " +
          "Also, what's your approximate budget and performance needs?",
          false
        );
      }, 1000);
    }
  };

  return (
    <>
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>
          <Button 
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-tech-blue"
            onClick={() => setIsSheetOpen(true)}
          >
            <MessageSquare className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent className="w-[380px] sm:w-[540px] p-0" side="right">
          <div className="flex flex-col h-full">
            <SheetHeader className="p-4 border-b">
              <SheetTitle className="flex items-center">
                <MessageSquare className="mr-2 h-5 w-5" />
                GPU Assistant
              </SheetTitle>
              <SheetDescription>
                Ask me anything about GPU instances, pricing, or requirements
              </SheetDescription>
            </SheetHeader>
            
            <div className="flex-1 overflow-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] chat-bubble ${
                      message.isUser ? "chat-bubble-user" : "chat-bubble-bot"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    <div className="text-xs opacity-50 mt-1">
                      {message.timestamp.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            
            <div className="p-4 border-t">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex space-x-2"
              >
                <Textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Type your question here..."
                  className="resize-none"
                  rows={1}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <Button type="submit" size="icon">
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default ChatBot;
