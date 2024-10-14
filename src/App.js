import React, { useState } from 'react';

import './App.css';
import { v4 as uuidv4 } from 'uuid';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

function App() {
  const [inputText, setInputText] = useState('');
  const [words, setWords] = useState([]);
  const [duplicateWord, setDuplicateWord] = useState('');
  const [duplicateIndex, setDuplicateIndex] = useState(null);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [history, setHistory] = useState([]);
  const [mode, setMode] = useState('easy'); // Mode: easy or hard

  const handleChange = (event) => {
    setInputText(event.target.value);
  };

  const handleModeChange = (event) => {
    setMode(event.target.value); // Switch between easy and hard mode
  };

  const splitIntoSubWords = (word) => {
    // Create a Thai segmenter with word-level granularity
    const segmenter = new Intl.Segmenter('th', { granularity: 'word' });
    
    // Use the segmenter to split the input word into segments and filter out non-word segments (like spaces)
    return Array.from(segmenter.segment(word))
      .filter(segment => segment.isWordLike)  // Only keep word-like segments (exclude spaces or punctuation)
      .map(segment => segment.segment);       // Extract the word segments
  };  

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && inputText.trim()) {
      const inputWord = inputText.trim();
  
      let existingIndexes = [];
  
      // Switch between easy and hard modes
    switch (mode) {
      case 'easy':
        // Easy mode: full word duplicates
        const existingIndex = words.findIndex((word) => word.text === inputWord);
        if (existingIndex !== -1) {
          existingIndexes = [existingIndex];
        }
        break;

        case 'hard':
          // Hard mode: Split the input word and check for sub-word matches
          const inputSubWords = splitIntoSubWords(inputWord); // Split the input word into sub-words
        
          // Combine all previous words' sub-words into one array
          const allPrevSubWords = words
            .flatMap(word => splitIntoSubWords(word.text)); // Flatten all sub-words into a single array
        
          // Check if any sub-word from the input matches any sub-word from all previous words
          const hasDuplicateSubWord = inputSubWords.some(subWord => allPrevSubWords.includes(subWord));
        
          if (hasDuplicateSubWord) {
            // Find the indexes of the previous words that contain matching sub-words
            existingIndexes = words
              .map((word, index) => {
                const prevSubWords = splitIntoSubWords(word.text);
                const isDuplicate = inputSubWords.some(subWord => prevSubWords.includes(subWord));
                return isDuplicate ? index : -1;
              })
              .filter(index => index !== -1); // Keep only valid indexes
          }
        
          break;

      default:
        break;
    }
  
      if (existingIndexes.length > 0) {

        // Add the new word to the stack first
        setWords([...words, { id: uuidv4(), text: inputWord, color: getRandomColor() }]);
  
        // Then show the pop-up
        setDuplicateWord(inputWord);
        setDuplicateIndex(existingIndexes.map((i) => i + 1)); // Store all duplicate indexes (1-based)
        setIsDuplicate(true); // Trigger the pop-up for duplicate detection
        setInputText(''); // Clear the input field
      } else {
        // Add the word to the words array if no duplicate is found
        setWords([...words, { id: uuidv4(), text: inputWord, color: getRandomColor() }]);
        setInputText(''); // Clear the input field
      }
    }
  };
  
  const handleClear = () => {
    if (words.length > 0) {
      const newStack = [...words]; // Copy the words array
  
      // Find the first and last occurrences of the duplicate word
      const firstOccurrenceIndex = newStack.findIndex((w) => w.text === duplicateWord);
      const lastOccurrenceIndex = newStack.length - 1; // The last word is the duplicate
  
      // Capture the color of the first occurrence of the duplicate word
      const firstOccurrenceColor = newStack[firstOccurrenceIndex].color;
  
      // Highlight both occurrences of the duplicate word and set them to the same color
      const updatedStack = newStack.map((word, index) => ({
        ...word,
        highlight: index === firstOccurrenceIndex || index === lastOccurrenceIndex,
        color: index === lastOccurrenceIndex ? firstOccurrenceColor : word.color, // Set the same color for both duplicates
      }));
  
      // Add the updated stack to the history
      const updatedHistory = [updatedStack, ...history].slice(0, 20); // Keep only the last 20 history stacks
  
      setHistory(updatedHistory); // Update the history with the new stack
    }
  
    setWords([]); // Clear the current words
    setInputText(''); // Clear the input field
    setIsDuplicate(false); // Close the pop-up
  };   
    
  const handleContinue = () => {
    // Remove the last word from the words array (pop the duplicate)
    const updatedWords = words.slice(0, -1);
  
    setWords(updatedWords); // Update the words array without the last word
    setIsDuplicate(false); // Close the pop-up
    setInputText(''); // Clear the input field
  };  
  
  const getRandomColor = () => {
    const colors = ['#f28b82', '#fbbc04', '#34a853', '#4285f4', '#ab47bc'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const getDefaultColor = () => '#f1f1f1'; // Default color for non-highlighted words

  return (
    <div className="App">
      <header className="App-header">
        <h1>Thai Text Input</h1>
        {/* Mode selection */}
        <div className="mode-selection" style={{ float: 'right' }}>
          <label htmlFor="mode-select">Mode:</label>
          <select id="mode-select" value={mode} onChange={handleModeChange}>
            <option value="easy">Easy (Full Duplicates)</option>
            <option value="hard">Hard (Partial Duplicates)</option>
          </select>
        </div>
        <label htmlFor="thai-input" className="input-label">
          กรุณาใส่คำทีละคำแล้วกด Enter:
        </label>
        <input
          type="text"
          id="thai-input"
          value={inputText}
          onChange={handleChange}
          onKeyDown={handleKeyPress}
          className="input-field"
          placeholder="ป้อนคำของคุณแล้วกด Enter"
          disabled={isDuplicate}
        />
        <div className="label-container">
          {words.map((word) => (
            <span key={word.id} className="word-label" style={{ backgroundColor: word.color }}>
              {word.text}
            </span>
          ))}
        </div>

        {/* History Table */}
        {history.length > 0 && (
          <div className="history-section">
            <h2>ประวัติการป้อนคำ</h2>
            <table className="history-table">
              <tbody>
                {history.map((stack, index) => (
                  <tr key={index}>
                    <td>{history.length - index}</td>{/* Running number */}
                    {stack.map((word) => (
                      <td
                        key={word.id}
                        style={{ backgroundColor: word.highlight ? word.color : getDefaultColor() }}
                      >
                        {word.text}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </header>

      {/* Pop-up Dialog for Duplicate Word */}
      <Dialog open={isDuplicate} onClose={handleContinue}>
        <DialogTitle>คำซ้ำ</DialogTitle>
        <DialogContent>
        <DialogContentText>
          {Array.isArray(duplicateIndex) && duplicateIndex.length > 0 && (
            <>
              คำ "{duplicateWord}" ถูกป้อนแล้วในตำแหน่ง: {duplicateIndex.join(', ')}. คุณต้องการจะเริ่มเกมส์ใหม่หรือดำเนินการต่อ?
            </>
          )}
        </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleContinue} color="secondary">
            ดำเนินการต่อ
          </Button>
          <Button onClick={handleClear} color="primary">
            เริ่มเกมส์ใหม่
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default App;
