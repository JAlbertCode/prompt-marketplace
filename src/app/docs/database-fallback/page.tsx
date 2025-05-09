import React from 'react';
import fs from 'fs';
import path from 'path';
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Database, AlertCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Database Fallback - PromptFlow Documentation',
  description: 'Documentation on database fallback mode for PromptFlow',
};

export default function DatabaseFallbackPage() {
  // Get the fallback documentation content
  const docPath = path.join(process.cwd(), 'DATABASE_FALLBACK.md');
  let content = '';
  
  // Read the file if it exists
  try {
    content = fs.readFileSync(docPath, 'utf-8');
  } catch (error) {
    console.error('Error reading DATABASE_FALLBACK.md:', error);
    // Fallback content if file is missing
    content = `# Database Fallback Mode

This documentation file is missing. Please check the repository for DATABASE_FALLBACK.md.`;
  }
  
  // Parse the markdown content for display
  // This is a very basic parser for demonstration
  const lines = content.split('\n');
  const sections = [];
  let currentSection: {title: string; content: string[]} | null = null;
  
  for (const line of lines) {
    if (line.startsWith('# ')) {
      // Main title, skip
      continue;
    } else if (line.startsWith('## ')) {
      // New section
      if (currentSection) {
        sections.push(currentSection);
      }
      currentSection = {
        title: line.replace('## ', ''),
        content: []
      };
    } else if (currentSection) {
      // Add line to current section
      currentSection.content.push(line);
    }
  }
  
  // Add the last section
  if (currentSection) {
    sections.push(currentSection);
  }
  
  // Get the title (first H1)
  const title = lines.find(line => line.startsWith('# '))?.replace('# ', '') || 'Database Fallback Mode';
  
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <Link 
        href="/dev-utils/database-test" 
        className="flex items-center text-blue-600 hover:underline mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Database Test
      </Link>
      
      <div className="bg-white rounded-lg border shadow-sm p-6 mb-8">
        <div className="flex items-center mb-4">
          <Database className="w-6 h-6 text-blue-600 mr-2" />
          <h1 className="text-2xl font-bold">{title}</h1>
        </div>
        
        <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-6">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-amber-600 mr-2 flex-shrink-0" />
            <p className="text-amber-800 text-sm">
              While using fallback mode, PromptFlow will display mock data instead of real database records.
              This allows you to continue development while you resolve database connection issues.
            </p>
          </div>
        </div>
        
        {sections.map((section, index) => (
          <div key={index} className="mb-6">
            <h2 className="text-xl font-bold mb-3">{section.title}</h2>
            
            <div className="space-y-3">
              {section.content.map((line, lineIndex) => {
                // Basic markdown parsing
                if (line.trim() === '') {
                  return <div key={lineIndex} className="h-3"></div>;
                }
                
                if (line.startsWith('### ')) {
                  // H3 heading
                  return <h3 key={lineIndex} className="text-lg font-semibold mt-4 mb-2">{line.replace('### ', '')}</h3>;
                }
                
                if (line.startsWith('- ')) {
                  // List item
                  return <div key={lineIndex} className="flex ml-2">
                    <span className="mr-2">•</span>
                    <span>{line.replace('- ', '')}</span>
                  </div>;
                }
                
                if (line.startsWith('```')) {
                  // Code block (just show as a block)
                  return null; // Skip the backticks
                }
                
                if (line.trim().startsWith('1.') || line.trim().startsWith('2.') || line.trim().startsWith('3.')) {
                  // Numbered list item
                  return <div key={lineIndex} className="flex ml-2">
                    <span className="mr-2">{line.split('.')[0]}.</span>
                    <span>{line.replace(/^\d+\.\s/, '')}</span>
                  </div>;
                }
                
                // Handle code inside code blocks
                if (line.trim() && !line.startsWith('```') && section.content[lineIndex-1]?.startsWith('```')) {
                  return <pre key={lineIndex} className="bg-gray-100 p-2 font-mono text-sm rounded">{line}</pre>;
                }
                
                // Regular paragraph
                return <p key={lineIndex} className="text-gray-800">{line}</p>;
              })}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8">
        <Link 
          href="/dev-utils" 
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
        >
          Back to Dev Utilities
        </Link>
      </div>
    </div>
  );
}
