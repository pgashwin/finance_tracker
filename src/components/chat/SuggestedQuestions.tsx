import { Button } from '@/components/ui/button';

const DEFAULT_SUGGESTIONS = [
  'How healthy is my emergency fund?',
  "What's my biggest monthly expense?",
  'Am I over-concentrated in any asset class?',
  'How does my debt compare to my assets?',
  'What should I focus on improving first?',
];

interface SuggestedQuestionsProps {
  onSelect: (question: string) => void;
  disabled?: boolean;
  suggestions?: string[];
}

export function SuggestedQuestions({
  onSelect,
  disabled,
  suggestions = DEFAULT_SUGGESTIONS,
}: SuggestedQuestionsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {suggestions.map((question) => (
        <Button
          key={question}
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          className="h-auto whitespace-normal px-3 py-2 text-left text-xs"
          onClick={() => onSelect(question)}
        >
          {question}
        </Button>
      ))}
    </div>
  );
}

export { DEFAULT_SUGGESTIONS };
