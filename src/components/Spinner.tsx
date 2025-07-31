// components/Spinner.tsx
import { Loader2 } from 'lucide-react';
const Spinner = ({
  className = 'h-5 w-5 animate-spin'
}) => <Loader2 className={`text-white ${className}`} aria-hidden="true" />;
export default Spinner;