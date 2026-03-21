import React, { useState } from "react";
import { CreateNewDesignOnLandingPageByAiService } from "../../services/admin/landingPage";
import SpinLoading from "../loadings/spinLoading";

interface AiDesignProps {
  onSuccess?: (json: any) => void;
  landingPageId: string;
}

function AiDesign({ onSuccess, landingPageId }: AiDesignProps) {
  const [context, setContext] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [streamedResponse, setStreamedResponse] = useState("");

  const handleGenerate = async () => {
    if (!context.trim()) return;
    try {
      setIsLoading(true);
      setError("");
      setStreamedResponse("");
      const result = await CreateNewDesignOnLandingPageByAiService({
        context,
        landingPageId,
        onStream: (chunk) => {
          setStreamedResponse((prev) => prev + chunk);
        },
      });

      if (onSuccess) {
        let cleanJsonString = result;
        const jsonMatch = result.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
        if (jsonMatch && jsonMatch[1]) {
          cleanJsonString = jsonMatch[1];
        } else {
          // Fallback: Try to find the first '{' and last '}'
          const startIndex = result.indexOf("{");
          const endIndex = result.lastIndexOf("}");
          if (startIndex !== -1 && endIndex !== -1) {
            cleanJsonString = result.substring(startIndex, endIndex + 1);
          }
        }

        const designJson = JSON.parse(cleanJsonString.trim());
        onSuccess(designJson);
      }
      setContext("");
      setStreamedResponse("");
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto mt-5 flex w-11/12 flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-blue-400 bg-blue-50 p-6 shadow-sm transition-all hover:border-blue-500">
      <div className="flex w-full flex-col gap-2">
        <h3 className="text-xl font-bold text-blue-800">
          ✨ AI Design Generator
        </h3>
        <p className="text-sm text-gray-600">
          Describe the landing page you want to create and let AI design it for
          you.
        </p>
      </div>

      <textarea
        className="w-full resize-none rounded-lg border border-gray-300 p-4 shadow-inner focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        rows={4}
        placeholder="e.g., A modern landing page for a coffee shop with a hero section, about us, and a contact form..."
        value={context}
        onChange={(e) => setContext(e.target.value)}
        disabled={isLoading}
      />

      {error && (
        <div className="w-full text-left text-sm text-red-500">{error}</div>
      )}

      {streamedResponse && (
        <div className="relative w-full overflow-hidden rounded-lg bg-gray-900 p-4 shadow-inner">
          <div className="absolute left-0 top-0 h-1 w-full animate-pulse bg-blue-500"></div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
            AI is thinking...
          </h4>
          <pre className="scrollbar-thin scrollbar-track-gray-800 scrollbar-thumb-gray-600 max-h-[300px] overflow-y-auto whitespace-pre-wrap font-mono text-sm text-green-400">
            {streamedResponse}
          </pre>
        </div>
      )}

      <div className="flex w-full justify-end">
        <button
          onClick={handleGenerate}
          disabled={isLoading || !context.trim()}
          className="flex min-w-[150px] items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-2 font-Poppins text-lg font-medium text-white shadow-md transition duration-150 hover:bg-blue-700 hover:shadow-lg active:scale-95 disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          {isLoading ? <SpinLoading /> : "Generate Design"}
        </button>
      </div>
    </div>
  );
}

export default AiDesign;
