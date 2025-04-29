import { PromptFlow, Prompt, FlowStep, InputMapping } from "@/types";

export interface ExportOptions {
  platform: 'n8n' | 'make';
  webhookBaseUrl?: string;
}

/**
 * Export a flow to n8n or Make.com format
 */
export const exportFlow = (
  flow: PromptFlow,
  promptsMap: Record<string, Prompt>,
  options: ExportOptions
): string => {
  if (options.platform === 'n8n') {
    return exportToN8n(flow, promptsMap, options);
  } else {
    return exportToMake(flow, promptsMap, options);
  }
};

/**
 * Export a flow to n8n format
 */
const exportToN8n = (
  flow: PromptFlow,
  promptsMap: Record<string, Prompt>,
  options: ExportOptions
): string => {
  // Sort steps by order
  const sortedSteps = [...flow.steps].sort((a, b) => a.order - b.order);
  
  // Base workflow structure
  const n8nWorkflow = {
    name: `${flow.title} - PromptFlow`,
    nodes: [] as any[],
    connections: {} as any,
    nodeTypes: {
      webhookTrigger: { color: '#5296d6' },
      httpRequest: { color: '#bb5544' },
      jsonParse: { color: '#aaddcc' },
      jsonStringify: { color: '#ccddaa' },
      set: { color: '#ddaacc' }
    }
  };
  
  // Add webhook trigger node
  const webhookNode = {
    id: 'webhook',
    name: 'Webhook',
    type: 'webhookTrigger',
    position: [250, 300],
    parameters: {
      path: `/flow/${flow.id}`,
      responseMode: 'responseNode',
      responseData: 'json'
    }
  };
  n8nWorkflow.nodes.push(webhookNode);
  
  let lastNodeId = 'webhook';
  let xPos = 500;
  
  // Add nodes for each prompt step
  sortedSteps.forEach((step, index) => {
    const prompt = promptsMap[step.promptId];
    if (!prompt) return;
    
    const stepNodeId = `step_${index}`;
    const outputNodeId = `output_${index}`;
    
    // Step execution node (HTTP request to Sonar API)
    const stepNode = {
      id: stepNodeId,
      name: `${prompt.title} - Step ${index + 1}`,
      type: 'httpRequest',
      position: [xPos, 300],
      parameters: {
        url: 'https://sonar.perplexity.ai/ask',
        method: 'POST',
        authentication: 'headerAuth',
        headerAuthKey: 'Authorization',
        headerAuthValue: '={{ $env.SONAR_API_KEY }}',
        jsonParameters: true,
        bodyParameters: {
          model: prompt.model,
          messages: [
            {
              role: 'system',
              content: prompt.systemPrompt
            },
            {
              role: 'user',
              content: '={{ $json.userInput }}'
            }
          ]
        }
      }
    };
    
    // Output handling node
    const outputNode = {
      id: outputNodeId,
      name: `Process ${prompt.title} Output`,
      type: 'set',
      position: [xPos + 250, 300],
      parameters: {
        values: {
          output: '={{ $json.choices[0].message.content }}',
          stepId: step.id,
          stepTitle: step.title || prompt.title
        }
      }
    };
    
    // Add nodes to workflow
    n8nWorkflow.nodes.push(stepNode, outputNode);
    
    // Add connections
    if (!n8nWorkflow.connections[lastNodeId]) {
      n8nWorkflow.connections[lastNodeId] = {};
    }
    n8nWorkflow.connections[lastNodeId].main = [[{ node: stepNodeId, type: 'main', index: 0 }]];
    
    if (!n8nWorkflow.connections[stepNodeId]) {
      n8nWorkflow.connections[stepNodeId] = {};
    }
    n8nWorkflow.connections[stepNodeId].main = [[{ node: outputNodeId, type: 'main', index: 0 }]];
    
    lastNodeId = outputNodeId;
    xPos += 500; // Move next nodes to the right
  });
  
  // Add final response node
  const responseNodeId = 'response';
  const responseNode = {
    id: responseNodeId,
    name: 'HTTP Response',
    type: 'respondToWebhook',
    position: [xPos, 300],
    parameters: {
      responseCode: 200,
      responseData: 'allResults',
      options: {}
    }
  };
  
  n8nWorkflow.nodes.push(responseNode);
  
  if (!n8nWorkflow.connections[lastNodeId]) {
    n8nWorkflow.connections[lastNodeId] = {};
  }
  n8nWorkflow.connections[lastNodeId].main = [[{ node: responseNodeId, type: 'main', index: 0 }]];
  
  // Convert workflow to JSON string
  return JSON.stringify(n8nWorkflow, null, 2);
};

/**
 * Export a flow to Make.com (Integromat) format
 */
const exportToMake = (
  flow: PromptFlow,
  promptsMap: Record<string, Prompt>,
  options: ExportOptions
): string => {
  // Sort steps by order
  const sortedSteps = [...flow.steps].sort((a, b) => a.order - b.order);
  
  // Base scenario structure
  const makeScenario = {
    name: `${flow.title} - PromptFlow`,
    blueprint: {
      modules: [] as any[],
      connections: [] as any[],
      canvas: {
        version: 2,
        connections: [] as any[],
        modules: [] as any[]
      },
      metadata: {
        version: 1,
        scenario: {
          roundtrips: 1,
          maxErrors: 3,
          autoCommit: true,
          autoCommitTriggerLast: true,
          sequential: false,
          restartOnFailure: false,
          restartOnFailureLimit: 3
        }
      }
    }
  };
  
  // Add webhook trigger module
  const webhookModule = {
    id: 1,
    name: 'Flow Trigger',
    type: 'webhook',
    parameters: {
      hook: `flow-${flow.id}`,
      outputFields: {
        userInput: {
          type: 'text',
          label: 'User Input'
        }
      }
    },
    position: {
      x: 100,
      y: 300
    }
  };
  
  makeScenario.blueprint.modules.push(webhookModule);
  
  let lastModuleId = 1;
  let moduleId = 2;
  let xPos = 300;
  
  // Add modules for each prompt step
  sortedSteps.forEach((step, index) => {
    const prompt = promptsMap[step.promptId];
    if (!prompt) return;
    
    // HTTP Request to Sonar API
    const httpModule = {
      id: moduleId,
      name: `${prompt.title} - Step ${index + 1}`,
      type: 'http',
      parameters: {
        url: 'https://sonar.perplexity.ai/ask',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': '{{env.SONAR_API_KEY}}'
        },
        body: JSON.stringify({
          model: prompt.model,
          messages: [
            {
              role: 'system',
              content: prompt.systemPrompt
            },
            {
              role: 'user',
              content: '{{1.userInput}}'
            }
          ]
        })
      },
      position: {
        x: xPos,
        y: 300
      }
    };
    
    // Add connection to previous module
    const connection = {
      sourceModuleId: lastModuleId,
      targetModuleId: moduleId
    };
    
    makeScenario.blueprint.modules.push(httpModule);
    makeScenario.blueprint.connections.push(connection);
    
    lastModuleId = moduleId;
    moduleId++;
    xPos += 200;
  });
  
  // Add final response module
  const responseModule = {
    id: moduleId,
    name: 'Response',
    type: 'webhookResponse',
    parameters: {
      code: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        result: '{{' + lastModuleId + '.response.choices[0].message.content}}',
        flowId: flow.id,
        status: 'success'
      })
    },
    position: {
      x: xPos,
      y: 300
    }
  };
  
  // Add connection to previous module
  const finalConnection = {
    sourceModuleId: lastModuleId,
    targetModuleId: moduleId
  };
  
  makeScenario.blueprint.modules.push(responseModule);
  makeScenario.blueprint.connections.push(finalConnection);
  
  // Convert scenario to JSON string
  return JSON.stringify(makeScenario, null, 2);
};

/**
 * Generate a webhook URL for a flow
 */
export const generateWebhookUrl = (flowId: string, options?: { baseUrl?: string }): string => {
  const baseUrl = options?.baseUrl || 'https://api.promptflow.io';
  return `${baseUrl}/webhook/flow/${flowId}`;
};

/**
 * Generate documentation for a flow
 */
export const generateFlowDocumentation = (
  flow: PromptFlow,
  promptsMap: Record<string, Prompt>
): string => {
  // Sort steps by order
  const sortedSteps = [...flow.steps].sort((a, b) => a.order - b.order);
  
  let documentation = `# ${flow.title}\n\n${flow.description}\n\n## Overview\n\nThis flow contains ${sortedSteps.length} steps and costs a total of ${flow.totalCreditCost} credits to run.\n\n## Steps\n\n`;
  
  sortedSteps.forEach((step, index) => {
    const prompt = promptsMap[step.promptId];
    if (!prompt) return;
    
    documentation += `### Step ${index + 1}: ${step.title || prompt.title}\n\n`;
    documentation += `- **Model**: ${prompt.model}\n`;
    documentation += `- **Credit Cost**: ${prompt.creditCost}\n`;
    documentation += `- **Capabilities**: ${prompt.capabilities?.join(', ') || 'text'}\n\n`;
    
    if (index < sortedSteps.length - 1) {
      documentation += `This step feeds into Step ${index + 2}.\n\n`;
    } else {
      documentation += `This is the final step in the flow.\n\n`;
    }
  });
  
  documentation += `## Webhook Integration\n\nTo trigger this flow via API, use the following endpoint:\n\n\`\`\`\nPOST https://api.promptflow.io/webhook/flow/${flow.id}\n\`\`\`\n\nExample request body:\n\n\`\`\`json\n{\n  \"inputs\": {\n    // Your input fields here\n  }\n}\n\`\`\`\n\n`;
  
  return documentation;
};
