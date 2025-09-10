import { GoogleGenerativeAI } from '@google/generative-ai';
import { createLlmSummary, updateSession } from './database';
import { listRecordingChunks } from './blob';
import type { RrwebChunk, RrwebEvent } from './types';

// Validate required environment variables
if (!process.env.GEMINI_API_KEY) {
  console.error('GEMINI_API_KEY environment variable is required');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const generateLlmSummary = async (sessionId: string): Promise<void> => {
  try {
    console.log(`Generating LLM summary for session ${sessionId}`);

    // Get all recording chunks for this session
    const blobs = await listRecordingChunks(sessionId);

    if (blobs.length === 0) {
      console.log('No recording chunks found for session', sessionId);
      return;
    }

    // Fetch and combine all chunks
    const allEvents: RrwebEvent[] = [];
    
    for (const blob of blobs) {
      try {
        const response = await fetch(blob.url);
        const chunk: RrwebChunk = await response.json();
        allEvents.push(...chunk.events);
      } catch (error) {
        console.error(`Failed to fetch chunk ${blob.pathname}:`, error);
      }
    }

    if (allEvents.length === 0) {
      console.log('No events found in recording chunks');
      return;
    }

    // Analyze events for patterns
    const analysis = analyzeRecordingEvents(allEvents);
    
    // Generate summary using Gemini
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const prompt = `
Analyze this technical interview recording data and provide a concise summary. Look specifically for signs of AI-assisted coding patterns:

RECORDING ANALYSIS:
- Total events: ${allEvents.length}
- Recording duration: ${analysis.duration} minutes
- Files opened: ${analysis.filesOpened.length}
- Text edits: ${analysis.textEdits}
- Tab switches: ${analysis.tabSwitches}
- Rapid text insertions: ${analysis.rapidInsertions}
- Copy-paste patterns: ${analysis.copyPastePatterns}
- High-frequency edits: ${analysis.highFrequencyEdits}

FILES WORKED ON:
${analysis.filesOpened.map(f => `- ${f}`).join('\n')}

POTENTIAL AI-ASSISTANCE INDICATORS:
- Rapid consecutive text insertions (${analysis.rapidInsertions} detected)
- Frequent context switching between files (${analysis.tabSwitches} tab changes)
- High-frequency text modifications (${analysis.highFrequencyEdits} rapid edits)
- Copy-paste patterns detected: ${analysis.copyPastePatterns}

Please provide a bulleted summary focusing on:
1. Overall coding activity and patterns
2. Potential signs of AI assistance (be specific about detected patterns)
3. Interview quality assessment
4. Recommendations for the interviewer

Keep the summary concise and professional.
`;

    const result = await model.generateContent(prompt);
    const summary = result.response.text();

    // Save summary to database
    const llmSummary = await createLlmSummary({
      sessionId,
      summary
    });

    // Update session with summary ID
    await updateSession(sessionId, {
      llmSummaryId: llmSummary.id
    });

    console.log(`LLM summary generated for session ${sessionId}`);

  } catch (error) {
    console.error('Error generating LLM summary:', error);
  }
};

type RecordingAnalysis = {
  duration: number;
  filesOpened: string[];
  textEdits: number;
  tabSwitches: number;
  rapidInsertions: number;
  copyPastePatterns: number;
  highFrequencyEdits: number;
};

const analyzeRecordingEvents = (events: RrwebEvent[]): RecordingAnalysis => {
  const filesOpened = new Set<string>();
  let textEdits = 0;
  let tabSwitches = 0;
  let rapidInsertions = 0;
  let copyPastePatterns = 0;
  let highFrequencyEdits = 0;

  const startTime = events[0]?.timestamp || 0;
  const endTime = events[events.length - 1]?.timestamp || 0;
  const duration = Math.round((endTime - startTime) / (1000 * 60)); // minutes

  let lastEditTime = 0;
  let consecutiveRapidEdits = 0;
  const RAPID_EDIT_THRESHOLD = 100; // ms
  const HIGH_FREQUENCY_THRESHOLD = 5; // consecutive rapid edits

  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    
    switch (event.type) {
      case 100: // fileOpen
        if (event.data?.fileName) {
          filesOpened.add(event.data.fileName);
        }
        break;
        
      case 103: // tabChange
        tabSwitches++;
        break;
        
      case 104: // textEdit
        textEdits++;
        
        // Check for rapid insertions
        if (lastEditTime > 0 && event.timestamp - lastEditTime < RAPID_EDIT_THRESHOLD) {
          consecutiveRapidEdits++;
          if (consecutiveRapidEdits >= HIGH_FREQUENCY_THRESHOLD) {
            highFrequencyEdits++;
            consecutiveRapidEdits = 0; // Reset counter
          }
        } else {
          consecutiveRapidEdits = 0;
        }
        
        // Check for potential copy-paste (large text insertions)
        if (event.data?.text && event.data.text.length > 100) {
          rapidInsertions++;
          
          // Look for code-like patterns that suggest AI assistance
          if (event.data.text.includes('function') || 
              event.data.text.includes('class') ||
              event.data.text.includes('import') ||
              event.data.text.match(/\w+\s*\(/)) {
            copyPastePatterns++;
          }
        }
        
        lastEditTime = event.timestamp;
        break;
    }
  }

  return {
    duration,
    filesOpened: Array.from(filesOpened),
    textEdits,
    tabSwitches,
    rapidInsertions,
    copyPastePatterns,
    highFrequencyEdits
  };
};