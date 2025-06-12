import React, { useState } from "react";
import EmojiPicker from "emoji-picker-react";
import { LuImage, LuX } from "react-icons/lu";

const EmojiPickerPopup = ({ icon, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Function to render the icon properly
  const renderIcon = () => {
    if (icon) {
      // Check if it's a URL (image) or emoji character
      if (icon.startsWith('http') || icon.startsWith('data:')) {
        return <img src={icon} alt="Icon" className="w-8 h-8 object-cover" />;
      } else {
        // It's an emoji character
        return <span className="text-2xl">{icon}</span>;
      }
    }
    // Default fallback
    return <LuImage className="text-gray-400" />;
  };
  
  return (
    <div className="flex flex-col md:flex-row items-start gap-5 mb-6">
      <div 
        className="flex items-center gap-4 cursor-pointer"
        onClick={() => setIsOpen(true)}
      >
        <div className="w-12 h-12 flex items-center justify-center bg-purple-50 text-primary rounded-lg border-2 border-purple-200">
          {renderIcon()}
        </div>
        <p className="text-sm text-gray-600">
          {icon ? "Change Icon" : "Pick Icon"}
        </p>
      </div>
      
      {isOpen && (
        <div className="relative">
          <button 
            className="w-7 h-7 flex items-center justify-center bg-white border border-gray-200 rounded-full absolute -top-2 -right-2 z-10 cursor-pointer"
            onClick={() => setIsOpen(false)}
          >
            <LuX />
          </button>
          <EmojiPicker 
            open={isOpen}
            onEmojiClick={(emoji) => {
              console.log("Selected emoji:", emoji); // Debug log
              onSelect(emoji?.emoji); // Only use emoji character, not imageUrl
              setIsOpen(false); // Close picker after selection
            }}
          />
        </div>
      )}
    </div>
  );
};

export default EmojiPickerPopup;