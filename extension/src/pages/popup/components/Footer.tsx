import { PanelRight, Book, MessageSquare, Share2 } from 'lucide-react';
import FooterButton from '../../../components/FooterButton';

export default function Footer() {
  return (
    <div className="flex justify-center gap-8 items-center py-4 border-t border-gray-200">
      <FooterButton icon={<PanelRight size={16} />} />
      <FooterButton icon={<Book size={16} />} />
      <FooterButton icon={<MessageSquare size={16} />}/>
      <FooterButton icon={<Share2 size={16} />} />
    </div>
  );
}
