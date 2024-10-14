import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

test('should add duplicate word to history with both occurrences in easy mode', () => {
  render(<App />);

  const input = screen.getByPlaceholderText('ป้อนคำของคุณแล้วกด Enter');
  const modeSelect = screen.getByLabelText('Mode:');

  // Switch to "easy" mode for full duplicate detection
  fireEvent.change(modeSelect, { target: { value: 'easy' } });

  // Input a few words in easy mode
  fireEvent.change(input, { target: { value: 'apple' } });
  fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

  fireEvent.change(input, { target: { value: 'banana' } });
  fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

  fireEvent.change(input, { target: { value: 'cherry' } });
  fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

  // Now input a duplicate word 'apple'
  fireEvent.change(input, { target: { value: 'apple' } });
  fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

  // Expect the pop-up to show the duplicate positions
  expect(screen.getByText(/คำ "apple" ถูกป้อนแล้วในตำแหน่ง: 1/i)).toBeInTheDocument();

  // Click "เริ่มเกมส์ใหม่" to clear and save to history
  const clearButton = screen.getByText('เริ่มเกมส์ใหม่');
  fireEvent.click(clearButton);

  // Check that the history contains both 'apple' occurrences
  const historyItems = screen.getAllByText('apple');
  expect(historyItems.length).toBe(2); // Both occurrences of 'apple' should appear in the history
});


test('should detect sub-word duplicate when entering "เรียนหนังสือ" after "การเรียน" in hard mode', () => {
  render(<App />);

  const input = screen.getByPlaceholderText('ป้อนคำของคุณแล้วกด Enter');
  const modeSelect = screen.getByLabelText('Mode:');

  // Switch to "hard" mode for sub-word detection
  fireEvent.change(modeSelect, { target: { value: 'hard' } });

  // Input the first word "การเรียน"
  fireEvent.change(input, { target: { value: 'การเรียน' } });
  fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

  // Now input the second word "เรียนหนังสือ" that shares the sub-word "เรียน"
  fireEvent.change(input, { target: { value: 'เรียนหนังสือ' } });
  fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

  // Expect the pop-up to show the sub-word duplicate
  expect(screen.getByText((content, element) => {
    return content.includes('เรียนหนังสือ') && content.includes('ตำแหน่ง');
  })).toBeInTheDocument();
});

test('should detect sub-word duplicate between first and fourth word in hard mode', () => {
  render(<App />);

  const input = screen.getByPlaceholderText('ป้อนคำของคุณแล้วกด Enter');
  const modeSelect = screen.getByLabelText('Mode:');

  // Switch to "hard" mode for sub-word detection
  fireEvent.change(modeSelect, { target: { value: 'hard' } });

  // Input the first word "การเรียน"
  fireEvent.change(input, { target: { value: 'การเรียน' } });
  fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

  // Input the second word "เขียนโปรแกรม"
  fireEvent.change(input, { target: { value: 'เขียนโปรแกรม' } });
  fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

  // Input the third word "ทดสอบ"
  fireEvent.change(input, { target: { value: 'ทดสอบ' } });
  fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

  // Now input the fourth word "หนังสือเรียน" that shares the sub-word "เรียน" with the first word
  fireEvent.change(input, { target: { value: 'หนังสือเรียน' } });
  fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

  // Expect the pop-up to show the sub-word duplicate between first and fourth word
  expect(screen.getByText((content, element) => {
    return content.includes('หนังสือเรียน') && content.includes('ตำแหน่ง');
  })).toBeInTheDocument();
});
